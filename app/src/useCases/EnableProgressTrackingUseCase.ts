import { saveSettingsWithDefaults } from './SaveSettingsWithDefaults';

export async function enableProgressTracking(params?: { source?: 'post_completion' | 'book_detail' }): Promise<void> {
  void params;
  await saveSettingsWithDefaults({
    progressTrackingEnabled: true,
    progressPromptShown: true,
  });
}
