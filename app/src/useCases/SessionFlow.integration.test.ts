import { beforeEach, describe, expect, it, vi } from 'vitest';

const bridgeMock = vi.hoisted(() => ({
  completeSession: vi.fn(),
  getSettings: vi.fn(),
  upsertPlan: vi.fn(),
}));

vi.mock('../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

import { runCompleteSessionUseCase } from './CompleteSessionUseCase';
import { runNominateNextFocusBookUseCase } from './NominateNextFocusBookUseCase';

describe('session flow integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 10, 22, 0, 0, 0));
    bridgeMock.completeSession.mockResolvedValue(undefined);
    bridgeMock.getSettings.mockResolvedValue({
      dailyTargetTime: 21 * 60,
      defaultDuration: 15,
      retryLimit: 1,
      dayRolloverHour: 4,
    });
    bridgeMock.upsertPlan.mockResolvedValue(undefined);
  });

  it('15分完了後に次本指名すると翌日計画が作られる', async () => {
    const completed = await runCompleteSessionUseCase({
      planId: 'plan_today',
      sessionId: 'session_1',
      mode: 'normal_15m',
      bookTitle: '本A',
      endedAtISO: '2026-03-10T22:15:00.000Z',
    });
    expect(completed.result).toBe('hard_success');

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

