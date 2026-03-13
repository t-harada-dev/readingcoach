import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FakeClock } from '../../services/time/Clock';
import { resetRuntimeOverrides, setClockForTests } from '../../testHarness/runtimeOverrides';

const bridgeMock = vi.hoisted(() => ({
  getSettings: vi.fn(),
  getPlanForDate: vi.fn(),
  getBooks: vi.fn(),
  upsertPlan: vi.fn(),
}));

vi.mock('../../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

import { runPlanCatchupUseCase } from '../PlanCatchupUseCase';

describe('PlanCatchup integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    bridgeMock.getSettings.mockResolvedValue({
      dailyTargetTime: 1260,
      defaultDuration: 15,
      retryLimit: 1,
      dayRolloverHour: 4,
    });
    bridgeMock.getBooks.mockResolvedValue([{ id: 'book_1', title: 'Book 1', format: 'paper', status: 'active' }]);
  });

  afterEach(() => {
    resetRuntimeOverrides();
  });

  // TC-ABN-10: 04:00またぎ前の catch-up で前日 finalize + 業務日 plan 補完
  it('finalizes previous day and creates business-date plan before 04:00', async () => {
    setClockForTests(new FakeClock('2026-03-11T03:30:00'));

    bridgeMock.getPlanForDate.mockImplementation(async (date: string) => {
      if (date === '2026-03-09') {
        return {
          planId: 'plan_prev',
          planDate: '2026-03-09',
          bookId: 'book_1',
          state: 'due',
          result: 'attempted',
          scheduledAt: '2026-03-09T09:00:00.000Z',
          retryCount: 0,
          snoozeCount: 0,
          consistencyCredit: false,
          continuousMissedDaysSnapshot: 1,
        };
      }
      if (date === '2026-03-10') return null;
      return null;
    });

    const result = await runPlanCatchupUseCase();

    expect(result.businessDate).toBe('2026-03-10');
    expect(result.finalizedPreviousDay).toBe(true);
    expect(result.createdBusinessDayPlan).toBe(true);
    expect(bridgeMock.upsertPlan).toHaveBeenCalledTimes(2);
  });

  // TC-ABN-09: 当日plan欠損時は補完生成して主導線を維持
  it('creates business-date plan when missing', async () => {
    setClockForTests(new FakeClock('2026-03-11T10:00:00'));
    bridgeMock.getPlanForDate.mockResolvedValue(null);

    const result = await runPlanCatchupUseCase();

    expect(result.businessDate).toBe('2026-03-11');
    expect(result.createdBusinessDayPlan).toBe(true);
    expect(bridgeMock.upsertPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        planDate: '2026-03-11',
        state: 'scheduled',
      })
    );
  });
});
