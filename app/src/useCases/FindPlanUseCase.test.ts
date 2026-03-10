import { beforeEach, describe, expect, it, vi } from 'vitest';

const bridgeMock = vi.hoisted(() => ({
  getPlansFromTo: vi.fn(),
}));

vi.mock('../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

import { runFindPlanByIdUseCase } from './FindPlanUseCase';

describe('runFindPlanByIdUseCase', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 10, 10, 0, 0, 0));
  });

  it('日付範囲を取得して planId で一致する計画を返す', async () => {
    bridgeMock.getPlansFromTo.mockResolvedValue([
      { planId: 'p0' },
      { planId: 'p1', bookId: 'book_1' },
    ]);

    const found = await runFindPlanByIdUseCase('p1');

    expect(bridgeMock.getPlansFromTo).toHaveBeenCalledWith('2026-03-09', '2026-03-17');
    expect(found).toEqual(expect.objectContaining({ planId: 'p1', bookId: 'book_1' }));
  });
});
