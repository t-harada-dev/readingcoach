import { beforeEach, describe, expect, it, vi } from 'vitest';

const bridgeMock = vi.hoisted(() => ({
  getSettings: vi.fn(),
  saveSettings: vi.fn(),
}));

vi.mock('../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

import { saveSettingsWithDefaults } from './SaveSettingsWithDefaults';

describe('saveSettingsWithDefaults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bridgeMock.saveSettings.mockResolvedValue(undefined);
  });

  it('legacy settings への部分更新で notificationsEnabled を暗黙追加しない', async () => {
    bridgeMock.getSettings.mockResolvedValue({
      dailyTargetTime: 21 * 60,
      defaultDuration: 15,
      retryLimit: 1,
      dayRolloverHour: 4,
      progressTrackingEnabled: false,
      progressPromptShown: false,
    });

    await saveSettingsWithDefaults({ dailyTargetTime: 22 * 60 });

    const saved = bridgeMock.saveSettings.mock.calls[0][0];
    expect(saved.dailyTargetTime).toBe(22 * 60);
    expect('notificationsEnabled' in saved).toBe(false);
  });

  it('notificationsEnabled が既存設定にあれば値を維持する', async () => {
    bridgeMock.getSettings.mockResolvedValue({
      dailyTargetTime: 21 * 60,
      defaultDuration: 15,
      retryLimit: 1,
      dayRolloverHour: 4,
      progressTrackingEnabled: false,
      progressPromptShown: false,
      notificationsEnabled: true,
    });

    await saveSettingsWithDefaults({ dailyTargetTime: 20 * 60 });

    const saved = bridgeMock.saveSettings.mock.calls[0][0];
    expect(saved.notificationsEnabled).toBe(true);
  });
});
