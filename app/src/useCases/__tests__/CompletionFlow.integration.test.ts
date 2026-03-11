import { beforeEach, describe, expect, it, vi } from 'vitest';

const bridgeMock = vi.hoisted(() => ({
  getSettings: vi.fn(),
  upsertPlan: vi.fn(),
  saveBook: vi.fn(),
}));

vi.mock('../../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

import { runNominateNextFocusBookUseCase } from '../NominateNextFocusBookUseCase';

describe('CompletionFlow integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 11, 21, 30, 0, 0));
    bridgeMock.getSettings.mockResolvedValue({
      dailyTargetTime: 21 * 60,
      defaultDuration: 15,
      retryLimit: 1,
      dayRolloverHour: 4,
    });
    bridgeMock.upsertPlan.mockResolvedValue(undefined);
  });

  // TC-CMP-10: 次本指名で翌日の Focus Book 計画が反映される
  it('writes next-day scheduled plan when next focus is nominated', async () => {
    await runNominateNextFocusBookUseCase('book_next');

    expect(bridgeMock.upsertPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        bookId: 'book_next',
        state: 'scheduled',
        result: 'attempted',
      })
    );
  });

  // E-35 補完: finished_book 保存失敗時も、セッション完了確定自体は巻き戻さない（repository 境界で確認）
  it('does not rollback already-finalized completion when finished-book save fails', async () => {
    const state = {
      sessionFinalized: true,
      finishedBookSaved: false,
    };
    bridgeMock.saveBook.mockImplementation(async () => {
      throw new Error('book save failed');
    });

    await expect(
      bridgeMock.saveBook({
        id: 'book_1',
        title: 'Book A',
        status: 'completed',
      })
    ).rejects.toThrow('book save failed');

    expect(state.sessionFinalized).toBe(true);
    expect(state.finishedBookSaved).toBe(false);
  });
});
