import { persistenceBridge } from '../bridge/PersistenceBridge';

export async function enableProgressTracking(params?: { source?: 'post_completion' | 'book_detail' }): Promise<void> {
  void params;
  const current = await persistenceBridge.getSettings();
  await persistenceBridge.saveSettings({
    dailyTargetTime: current?.dailyTargetTime ?? 21 * 60,
    defaultDuration: current?.defaultDuration ?? 15,
    retryLimit: current?.retryLimit ?? 1,
    dayRolloverHour: current?.dayRolloverHour ?? 4,
    progressTrackingEnabled: true,
    progressPromptShown: true,
  });
}

export async function skipProgressTrackingPrompt(): Promise<void> {
  const current = await persistenceBridge.getSettings();
  await persistenceBridge.saveSettings({
    dailyTargetTime: current?.dailyTargetTime ?? 21 * 60,
    defaultDuration: current?.defaultDuration ?? 15,
    retryLimit: current?.retryLimit ?? 1,
    dayRolloverHour: current?.dayRolloverHour ?? 4,
    progressTrackingEnabled: current?.progressTrackingEnabled ?? false,
    progressPromptShown: true,
  });
}

export async function updateBookProgress(params: {
  bookId: string;
  title: string;
  pageCount?: number;
  currentPage?: number;
}): Promise<void> {
  const { bookId, title, pageCount, currentPage } = params;
  await persistenceBridge.saveBook({
    id: bookId,
    title,
    pageCount,
    currentPage,
    lastProgressUpdatedAt: new Date().toISOString(),
  });
}

