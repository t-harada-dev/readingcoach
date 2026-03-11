import { persistenceBridge, type DailyExecutionPlanDTO } from '../bridge/PersistenceBridge';
import { toLocalISODateString } from '../date';
import { getCurrentClock } from '../testHarness/runtimeOverrides';

const DEFAULT_ROLLOVER_HOUR = 4;

function shiftDate(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(base.getDate() + days);
  return next;
}

function resolveBusinessDate(now: Date, rolloverHour: number): string {
  const base = now.getHours() < rolloverHour ? shiftDate(now, -1) : now;
  return toLocalISODateString(base);
}

async function finalizeAsMissed(plan: DailyExecutionPlanDTO): Promise<void> {
  await persistenceBridge.upsertPlan({
    planId: plan.planId,
    planDate: plan.planDate,
    bookId: plan.bookId,
    state: 'finalized',
    result: 'missed',
    scheduledAt: plan.scheduledAt,
    retryCount: plan.retryCount,
    snoozeCount: plan.snoozeCount,
    consistencyCredit: plan.consistencyCredit,
    continuousMissedDaysSnapshot: plan.continuousMissedDaysSnapshot,
    startedAt: undefined,
  });
}

export type PlanCatchupResult = {
  businessDate: string;
  finalizedPreviousDay: boolean;
  createdBusinessDayPlan: boolean;
};

/**
 * 04:00 ロールオーバーを考慮して catch-up を補完する。実時間待ちせず fake clock で検証可能。
 */
export async function runPlanCatchupUseCase(): Promise<PlanCatchupResult> {
  const now = getCurrentClock().now();
  const settings = await persistenceBridge.getSettings();
  const rolloverHour = settings?.dayRolloverHour ?? DEFAULT_ROLLOVER_HOUR;
  const businessDate = resolveBusinessDate(now, rolloverHour);
  const previousDate = toLocalISODateString(shiftDate(new Date(`${businessDate}T12:00:00`), -1));

  const previousPlan = await persistenceBridge.getPlanForDate(previousDate);
  let finalizedPreviousDay = false;
  if (previousPlan && previousPlan.state !== 'finalized') {
    await finalizeAsMissed(previousPlan);
    finalizedPreviousDay = true;
  }

  let createdBusinessDayPlan = false;
  const currentPlan = await persistenceBridge.getPlanForDate(businessDate);
  if (!currentPlan) {
    const books = await persistenceBridge.getBooks();
    const fallbackBookId = books[0]?.id;
    if (fallbackBookId) {
      await persistenceBridge.upsertPlan({
        planId: `native_plan_${businessDate}`,
        planDate: businessDate,
        bookId: fallbackBookId,
        state: 'scheduled',
        result: 'attempted',
        scheduledAt: `${businessDate}T09:00:00.000Z`,
        retryCount: 0,
        snoozeCount: 0,
        consistencyCredit: false,
        continuousMissedDaysSnapshot: 0,
      });
      createdBusinessDayPlan = true;
    }
  }

  return {
    businessDate,
    finalizedPreviousDay,
    createdBusinessDayPlan,
  };
}
