import { beforeEach, describe, expect, it, vi } from 'vitest';

const bridgeMock = vi.hoisted(() => ({
  upsertPlan: vi.fn(),
}));

const findPlanMock = vi.hoisted(() => ({
  runFindPlanByIdUseCase: vi.fn(),
}));

vi.mock('../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

vi.mock('./FindPlanUseCase', () => findPlanMock);

import { runSnoozePlanUseCase } from './SnoozePlanUseCase';

describe('runSnoozePlanUseCase', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    bridgeMock.upsertPlan.mockResolvedValue(undefined);
  });

  it('plan がなければ no-op', async () => {
    findPlanMock.runFindPlanByIdUseCase.mockResolvedValue(null);
    await runSnoozePlanUseCase('p0');
    expect(bridgeMock.upsertPlan).not.toHaveBeenCalled();
  });

  it('scheduledAt を 30 分延期し snoozeCount を加算する', async () => {
    findPlanMock.runFindPlanByIdUseCase.mockResolvedValue({
      planId: 'p1',
      planDate: '2026-03-10',
      bookId: 'b1',
      state: 'scheduled',
      result: 'attempted',
      scheduledAt: '2026-03-10T12:00:00.000Z',
      retryCount: 0,
      snoozeCount: 1,
      consistencyCredit: false,
      continuousMissedDaysSnapshot: 0,
    });

    await runSnoozePlanUseCase('p1');

    expect(bridgeMock.upsertPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: 'p1',
        planDate: '2026-03-10',
        scheduledAt: '2026-03-10T12:30:00.000Z',
        snoozeCount: 2,
      })
    );
  });
});
