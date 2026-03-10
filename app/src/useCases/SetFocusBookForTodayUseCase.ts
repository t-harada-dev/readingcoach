import { persistenceBridge } from '../bridge/PersistenceBridge';
import { toLocalISODateString } from '../date';

export async function runSetFocusBookForTodayUseCase(bookId: string): Promise<void> {
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
}

