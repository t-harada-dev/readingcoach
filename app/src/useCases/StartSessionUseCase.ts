import { persistenceBridge } from '../bridge/PersistenceBridge';
import { liveActivityBridge } from '../bridge/LiveActivityBridge';
import { cancelScheduledForPlan } from '../notifications';
import {
  DURATION_SECONDS,
  fromSessionMode,
  toNativeSessionMode,
  type NativeSessionMode,
  type SessionMode,
} from '../domain/sessionMode';
export type { SessionMode, NativeSessionMode } from '../domain/sessionMode';

/** JS 側の執行モード。ネイティブの文字列とは必要に応じてマッピングする。 */
export type EntryPoint = 'notification' | 'widget' | 'app';

export type StartSessionParams = {
  planId: string;
  mode: SessionMode;
  entryPoint: EntryPoint;
};

export type StartSessionResult = {
  planId: string;
  sessionId: string;
  startedAt: string;
  endTimeISO: string;
  durationSeconds: number;
  bookTitle: string;
};

const startSessionInFlightByPlan = new Map<string, Promise<StartSessionResult>>();

async function buildStartResult(params: {
  planId: string;
  sessionId: string;
  startedAt: string;
  bookTitle: string;
  mode: SessionMode;
  durationSecondsOverride?: number;
}): Promise<StartSessionResult> {
  const durationSeconds = params.durationSecondsOverride ?? DURATION_SECONDS[params.mode];
  const startDate = new Date(params.startedAt);
  const endDate = new Date(startDate.getTime() + durationSeconds * 1000);
  return {
    planId: params.planId,
    sessionId: params.sessionId,
    startedAt: params.startedAt,
    endTimeISO: endDate.toISOString(),
    durationSeconds,
    bookTitle: params.bookTitle,
  };
}

async function tryReuseActiveSession(planId: string, requestedMode: SessionMode): Promise<StartSessionResult | null> {
  const active = await persistenceBridge.getActiveSession();
  if (!active || active.plan.planId !== planId) return null;

  const activeMode = fromSessionMode(active.session.mode) ?? requestedMode;
  const book = await persistenceBridge.getBook(active.plan.bookId);
  const bookTitle = book?.title ?? 'Reading Session';

  return buildStartResult({
    planId,
    sessionId: active.session.sessionId,
    startedAt: active.session.startedAt,
    bookTitle,
    mode: activeMode,
  });
}

/**
 * 論理仕様 11.4 session_start_*: SessionLog 永続化 → plan を active に → Live Activity 開始。
 * 既に active の場合は no-op（永続化はスキップ、Live Activity も既存なら開始しない）。
 */
export async function runStartSessionUseCase(
  params: StartSessionParams
): Promise<StartSessionResult> {
  const { planId, mode, entryPoint } = params;

  const inFlight = startSessionInFlightByPlan.get(planId);
  if (inFlight) return inFlight;

  const startPromise = (async () => {
    const existing = await tryReuseActiveSession(planId, mode);
    if (existing) return existing;

    // Expo 通知経路で予約されている当該 plan の通知を先に消す（開始後の誤通知防止）。
    await cancelScheduledForPlan(planId).catch(() => {});

    const started = await persistenceBridge.startSession(
      planId,
      toNativeSessionMode(mode),
      entryPoint
    );
    const { sessionId, startedAt, bookTitle } = started;

    const result = await buildStartResult({
      planId,
      sessionId,
      startedAt,
      bookTitle,
      mode,
      durationSecondsOverride: started.e2eSessionSeconds,
    });

    await liveActivityBridge.startSession({
      planId,
      bookTitle: result.bookTitle,
      endTimeISO: result.endTimeISO,
      durationSeconds: result.durationSeconds,
    });

    return result;
  })();

  startSessionInFlightByPlan.set(planId, startPromise);
  try {
    return await startPromise;
  } finally {
    startSessionInFlightByPlan.delete(planId);
  }
}
