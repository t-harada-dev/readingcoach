import { persistenceBridge } from '../bridge/PersistenceBridge';
import { saveSettingsWithDefaults } from './SaveSettingsWithDefaults';

export async function skipProgressTrackingPrompt(): Promise<void> {
  const current = await persistenceBridge.getSettings();
  await saveSettingsWithDefaults({
    progressTrackingEnabled: current?.progressTrackingEnabled ?? false,
    progressPromptShown: true,
  });
}
