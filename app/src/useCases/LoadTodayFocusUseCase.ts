import { persistenceBridge, type BookDTO, type DailyExecutionPlanDTO, type TriggerSource, type UserSettingsDTO } from '../bridge/PersistenceBridge';
import { toLocalISODateString } from '../date';
import { runReconcilePlansUseCase } from './ReconcilePlansUseCase';

export type LoadTodayFocusResult = {
  plan: DailyExecutionPlanDTO | null;
  book: BookDTO | null;
  settings: UserSettingsDTO | null;
  continuousMissedDays: number;
};

export async function runLoadTodayFocusUseCase(triggerSource: TriggerSource = 'foreground'): Promise<LoadTodayFocusResult> {
  const [reconcile, settings] = await Promise.all([
    runReconcilePlansUseCase(triggerSource),
    persistenceBridge.getSettings(),
  ]);

  const date = reconcile.todayPlan?.planDate ?? toLocalISODateString(new Date());
  const plan = (await persistenceBridge.getPlanForDate(date)) ?? reconcile.todayPlan ?? null;
  const book = plan ? await persistenceBridge.getBook(plan.bookId) : null;
  const continuousMissedDays = reconcile.continuousMissedDays ?? plan?.continuousMissedDaysSnapshot ?? 0;

  return {
    plan,
    book,
    settings,
    continuousMissedDays,
  };
}
