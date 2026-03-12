import { beforeEach, describe, expect, it, vi } from 'vitest';

const bridgeMock = vi.hoisted(() => ({
  getPlanForDate: vi.fn(),
  upsertPlan: vi.fn(),
}));
const incrementManualFocusChangeCountMock = vi.hoisted(() => vi.fn());

vi.mock('../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));
vi.mock('../manualFocusChange', () => ({
  incrementManualFocusChangeCount: incrementManualFocusChangeCountMock,
}));

import { runSetFocusBookForTodayUseCase } from './SetFocusBookForTodayUseCase';

describe('runSetFocusBookForTodayUseCase', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 10, 9, 0, 0, 0));
    bridgeMock.upsertPlan.mockResolvedValue(undefined);
    incrementManualFocusChangeCountMock.mockResolvedValue(1);
  });

  it('既存計画があれば planId を維持して本のみ切替える', async () => {
    bridgeMock.getPlanForDate.mockResolvedValue({
      planId: 'p1',
      planDate: '2026-03-10',
      scheduledAt: '2026-03-10T21:00:00.000Z',
      state: 'scheduled',
      result: 'attempted',
    });

    await runSetFocusBookForTodayUseCase('book_2');

    expect(bridgeMock.upsertPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: 'p1',
        planDate: '2026-03-10',
        bookId: 'book_2',
      })
    );
  });

  it('既存計画がなくても当日計画を作成して Focus Book を設定する', async () => {
    bridgeMock.getPlanForDate.mockResolvedValue(null);

    await runSetFocusBookForTodayUseCase('book_3');

    expect(bridgeMock.upsertPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: undefined,
        planDate: '2026-03-10',
        bookId: 'book_3',
        state: 'scheduled',
        result: 'attempted',
      })
    );
  });

  it('手動変更導線では本が変わったときだけ変更回数を加算する', async () => {
    bridgeMock.getPlanForDate.mockResolvedValue(null);

    await runSetFocusBookForTodayUseCase('book_2', {
      manualChangePlanDate: '2026-03-10',
      manualChangeCurrentBookId: 'book_1',
    });

    expect(incrementManualFocusChangeCountMock).toHaveBeenCalledWith('2026-03-10');
  });

  it('手動変更導線でも同一本なら変更回数を加算しない', async () => {
    bridgeMock.getPlanForDate.mockResolvedValue(null);

    await runSetFocusBookForTodayUseCase('book_2', {
      manualChangePlanDate: '2026-03-10',
      manualChangeCurrentBookId: 'book_2',
    });

    expect(incrementManualFocusChangeCountMock).not.toHaveBeenCalled();
  });
});
