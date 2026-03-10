import { persistenceBridge } from '../bridge/PersistenceBridge';
import { runFindPlanByIdUseCase } from './FindPlanUseCase';

export async function runSnoozePlanUseCase(planId: string, minutes = 30): Promise<void> {
  const plan = await runFindPlanByIdUseCase(planId);
  if (!plan) return;

  const base = Number.isNaN(new Date(plan.scheduledAt).getTime()) ? new Date() : new Date(plan.scheduledAt);
  const next = new Date(base.getTime() + minutes * 60 * 1000).toISOString();

  await persistenceBridge.upsertPlan({
    planId: plan.planId,
    planDate: plan.planDate,
    bookId: plan.bookId,
    state: 'scheduled',
    result: plan.result,
    retryCount: plan.retryCount,
    snoozeCount: (plan.snoozeCount ?? 0) + 1,
    scheduledAt: next,
    consistencyCredit: plan.consistencyCredit,
    continuousMissedDaysSnapshot: plan.continuousMissedDaysSnapshot,
    startedAt: plan.startedAt,
  });
}
