import { persistenceBridge } from '../bridge/PersistenceBridge';
import { toLocalISODateString } from '../date';
import { incrementManualFocusChangeCount } from '../manualFocusChange';

type SetFocusBookOptions = {
  manualChangePlanDate?: string;
  manualChangeCurrentBookId?: string;
};

export async function runSetFocusBookForTodayUseCase(bookId: string, options?: SetFocusBookOptions): Promise<void> {
  const today = toLocalISODateString(new Date());
  const existing = await persistenceBridge.getPlanForDate(today);

  await persistenceBridge.upsertPlan({
    planId: existing?.planId,
    planDate: today,
    scheduledAt: existing?.scheduledAt ?? new Date().toISOString(),
    bookId,
    state: existing?.state ?? 'scheduled',
    result: existing?.result ?? 'attempted',
  });

  if (
    options?.manualChangePlanDate &&
    options.manualChangeCurrentBookId &&
    options.manualChangeCurrentBookId !== bookId
  ) {
    await incrementManualFocusChangeCount(options.manualChangePlanDate);
  }
}
