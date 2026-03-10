import { persistenceBridge } from '../bridge/PersistenceBridge';
import { buildNextPlan } from '../domain/nextFocusPolicy';

export async function runNominateNextFocusBookUseCase(bookId: string): Promise<void> {
  const settings = await persistenceBridge.getSettings();
  const dailyTargetTimeMinutes = settings?.dailyTargetTime ?? 21 * 60;
  const nextPlan = buildNextPlan({
    now: new Date(),
    dailyTargetTimeMinutes,
  });

  await persistenceBridge.upsertPlan({
    planDate: nextPlan.planDate,
    scheduledAt: nextPlan.scheduledAtISO,
    bookId,
    state: 'scheduled',
    result: 'attempted',
  });
}

