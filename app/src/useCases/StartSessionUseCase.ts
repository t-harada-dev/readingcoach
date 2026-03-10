import { persistenceBridge } from '../bridge/PersistenceBridge';
import { liveActivityBridge } from '../bridge/LiveActivityBridge';

/** JS 側の執行モード。ネイティブの文字列とは必要に応じてマッピングする。 */
export type SessionMode = 'normal_15m' | 'rescue_5m' | 'rehab_3m' | 'ignition_1m';
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

const DURATION_SECONDS: Record<SessionMode, number> = {
  normal_15m: 15 * 60,
  rescue_5m: 5 * 60,
  rehab_3m: 3 * 60,
  ignition_1m: 1 * 60,
};

type NativeSessionMode = 'normal_15m' | 'rescue_5m' | 'rescue_3m' | 'book_fetch_1m';

function toNativeSessionMode(mode: SessionMode): NativeSessionMode {
  if (mode === 'ignition_1m') return 'book_fetch_1m';
  if (mode === 'rehab_3m') return 'rescue_3m';
  return mode;
}

/**
 * 論理仕様 11.4 session_start_*: SessionLog 永続化 → plan を active に → Live Activity 開始。
 * 既に active の場合は no-op（永続化はスキップ、Live Activity も既存なら開始しない）。
 */
export async function runStartSessionUseCase(
  params: StartSessionParams
): Promise<StartSessionResult> {
  const { planId, mode, entryPoint } = params;
  const durationSeconds = DURATION_SECONDS[mode];

  const { sessionId, startedAt, bookTitle } = await persistenceBridge.startSession(
    planId,
    toNativeSessionMode(mode),
    entryPoint
  );

  const startDate = new Date(startedAt);
  const endDate = new Date(startDate.getTime() + durationSeconds * 1000);
  const endTimeISO = endDate.toISOString();

  await liveActivityBridge.startSession({
    planId,
    bookTitle,
    endTimeISO,
    durationSeconds,
  });

  return {
    planId,
    sessionId,
    startedAt,
    endTimeISO,
    durationSeconds,
    bookTitle,
  };
}
