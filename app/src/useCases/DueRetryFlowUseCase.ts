import { persistenceBridge } from '../bridge/PersistenceBridge';
import type { DailyExecutionPlanDTO } from '../bridge/PersistenceBridge';
import { runFindPlanByIdUseCase } from './FindPlanUseCase';
import { getCurrentClock, getCurrentNotificationScheduler } from '../testHarness/runtimeOverrides';

const RETRY_DELAY_MINUTES = 15;
const RETRY_LIMIT = 1;

function addMinutes(base: Date, minutes: number): Date {
  return new Date(base.getTime() + minutes * 60_000);
}

function parseDateMaybe(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function updatePlan(plan: DailyExecutionPlanDTO, patch: Partial<DailyExecutionPlanDTO>): Promise<void> {
  await persistenceBridge.upsertPlan({
    planId: plan.planId,
    planDate: plan.planDate,
    bookId: patch.bookId ?? plan.bookId,
    state: patch.state ?? plan.state,
    result: patch.result ?? plan.result,
    scheduledAt: patch.scheduledAt ?? plan.scheduledAt,
    retryCount: patch.retryCount ?? plan.retryCount,
    snoozeCount: patch.snoozeCount ?? plan.snoozeCount,
    consistencyCredit: patch.consistencyCredit ?? plan.consistencyCredit,
    continuousMissedDaysSnapshot: patch.continuousMissedDaysSnapshot ?? plan.continuousMissedDaysSnapshot,
    startedAt: patch.startedAt ?? plan.startedAt,
  });
}

export async function runEvaluateDueResponseTimeoutUseCase(
  planId: string
): Promise<'deferred' | 'finalized' | 'ignored'> {
  const plan = await runFindPlanByIdUseCase(planId);
  if (!plan) return 'ignored';
  if (plan.state !== 'due') return 'ignored';

  const scheduler = getCurrentNotificationScheduler();
  if ((plan.retryCount ?? 0) >= RETRY_LIMIT) {
    await updatePlan(plan, {
      state: 'finalized',
      result: 'missed',
      startedAt: undefined,
    });
    await scheduler.cancelForPlan(plan.planId);
    return 'finalized';
  }

  const now = getCurrentClock().now();
  const fireAtISO = addMinutes(now, RETRY_DELAY_MINUTES).toISOString();

  await updatePlan(plan, {
    state: 'deferred',
    scheduledAt: fireAtISO,
    retryCount: (plan.retryCount ?? 0) + 1,
    startedAt: undefined,
  });
  await scheduler.scheduleRetryDue({
    planId: plan.planId,
    fireAtISO,
    retryCount: (plan.retryCount ?? 0) + 1,
  });
  return 'deferred';
}

export async function runEvaluateRetryTimerFiredUseCase(planId: string): Promise<'due' | 'ignored'> {
  const plan = await runFindPlanByIdUseCase(planId);
  if (!plan) return 'ignored';
  if (plan.state !== 'deferred') return 'ignored';

  const now = getCurrentClock().now();
  const scheduled = parseDateMaybe(plan.scheduledAt);
  if (!scheduled || scheduled.getTime() > now.getTime()) return 'ignored';

  await updatePlan(plan, {
    state: 'due',
    result: 'attempted',
    startedAt: undefined,
  });
  return 'due';
}

export async function runCleanupDueNotificationsUseCase(planId: string): Promise<void> {
  const plan = await runFindPlanByIdUseCase(planId);
  if (!plan) return;

  const keepPending = plan.state === 'due' || plan.state === 'deferred';
  if (!keepPending) {
    await getCurrentNotificationScheduler().cancelForPlan(planId);
  }
}
