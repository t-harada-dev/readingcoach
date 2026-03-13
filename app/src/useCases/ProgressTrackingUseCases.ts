import { persistenceBridge } from '../bridge/PersistenceBridge';
import { saveSettingsWithDefaults } from './SaveSettingsWithDefaults';

export async function enableProgressTracking(params?: { source?: 'post_completion' | 'book_detail' }): Promise<void> {
  void params;
  await saveSettingsWithDefaults({
    progressTrackingEnabled: true,
    progressPromptShown: true,
  });
}

export async function skipProgressTrackingPrompt(): Promise<void> {
  const current = await persistenceBridge.getSettings();
  await saveSettingsWithDefaults({
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
