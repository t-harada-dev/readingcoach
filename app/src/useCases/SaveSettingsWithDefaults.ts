import { persistenceBridge, type UserSettingsDTO } from '../bridge/PersistenceBridge';

const DEFAULT_SETTINGS: UserSettingsDTO = {
  dailyTargetTime: 21 * 60,
  defaultDuration: 15,
  retryLimit: 1,
  dayRolloverHour: 4,
  progressTrackingEnabled: false,
  progressPromptShown: false,
};

function withSettingsDefaults(
  current: UserSettingsDTO | null,
  overrides: Partial<UserSettingsDTO>
): UserSettingsDTO {
  return {
    ...DEFAULT_SETTINGS,
    ...(current ?? {}),
    ...overrides,
  };
}

export async function saveSettingsWithDefaults(
  overrides: Partial<UserSettingsDTO>
): Promise<UserSettingsDTO> {
  const current = await persistenceBridge.getSettings();
  const next = withSettingsDefaults(current, overrides);
  await persistenceBridge.saveSettings(next);
  return next;
}

