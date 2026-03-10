import { beforeEach, describe, expect, it, vi } from 'vitest';

const bridgeMock = vi.hoisted(() => ({
  getSettings: vi.fn(),
  saveSettings: vi.fn(),
}));

vi.mock('../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

import { runUpdateDailyTargetTimeUseCase } from './UpdateDailyTargetTimeUseCase';

describe('runUpdateDailyTargetTimeUseCase', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    bridgeMock.getSettings.mockResolvedValue({
      dailyTargetTime: 21 * 60,
      defaultDuration: 15,
      retryLimit: 1,
      dayRolloverHour: 4,
      progressTrackingEnabled: true,
      progressPromptShown: true,
    });
    bridgeMock.saveSettings.mockResolvedValue(undefined);
  });

  it('hour/minute から dailyTargetTime を更新する', async () => {
    const value = await runUpdateDailyTargetTimeUseCase({ hour: 22, minute: 30 });

    expect(value).toBe(22 * 60 + 30);
    expect(bridgeMock.saveSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        dailyTargetTime: 22 * 60 + 30,
      })
    );
  });

  it('時刻が不正なら例外', async () => {
    await expect(runUpdateDailyTargetTimeUseCase({ hour: 24, minute: 0 })).rejects.toThrow(
      'hour must be 0-23'
    );
  });
});
