import { beforeEach, describe, expect, it, vi } from 'vitest';

const bridgeMock = vi.hoisted(() => ({
  getSettings: vi.fn(),
  upsertPlan: vi.fn(),
}));

vi.mock('../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

import { runNominateNextFocusBookUseCase } from './NominateNextFocusBookUseCase';

describe('runNominateNextFocusBookUseCase', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 10, 12, 0, 0, 0));
    bridgeMock.getSettings.mockResolvedValue({
      dailyTargetTime: 21 * 60,
      defaultDuration: 15,
      retryLimit: 1,
      dayRolloverHour: 4,
    });
    bridgeMock.upsertPlan.mockResolvedValue(undefined);
  });

  it('翌日の計画を upsert する', async () => {
    await runNominateNextFocusBookUseCase('book_next');

    expect(bridgeMock.upsertPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        planDate: '2026-03-11',
        bookId: 'book_next',
        state: 'scheduled',
      })
    );
  });
});
