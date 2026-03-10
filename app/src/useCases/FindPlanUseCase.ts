import { persistenceBridge, type DailyExecutionPlanDTO } from '../bridge/PersistenceBridge';
import { toLocalISODateString } from '../date';

function shiftDate(base: Date, dayOffset: number): Date {
  const next = new Date(base);
  next.setDate(base.getDate() + dayOffset);
  return next;
}

export async function runFindPlanByIdUseCase(planId: string): Promise<DailyExecutionPlanDTO | null> {
  const today = new Date();
  const from = toLocalISODateString(shiftDate(today, -1));
  const to = toLocalISODateString(shiftDate(today, 7));
  const plans = await persistenceBridge.getPlansFromTo(from, to);
  return plans.find((plan) => plan.planId === planId) ?? null;
}
