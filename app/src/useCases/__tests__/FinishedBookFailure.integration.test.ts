import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  completionFinalized: false,
  completionWriteCount: 0,
  finishedBookStatus: 'active' as 'active' | 'completed',
  finishedBookFailOnce: true,
  finishedBookSaveAttempts: 0,
}));

const bridgeMock = vi.hoisted(() => ({
  completeSession: vi.fn(async () => {
    if (state.completionFinalized) return;
    state.completionFinalized = true;
    state.completionWriteCount += 1;
  }),
  saveBook: vi.fn(async () => {
    state.finishedBookSaveAttempts += 1;
    if (state.finishedBookFailOnce) {
      state.finishedBookFailOnce = false;
      throw new Error('injected finished_book save failure');
    }
    state.finishedBookStatus = 'completed';
  }),
}));

vi.mock('../../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

import { runCompleteSessionUseCase } from '../CompleteSessionUseCase';

describe('FinishedBookFailure integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    state.completionFinalized = false;
    state.completionWriteCount = 0;
    state.finishedBookStatus = 'active';
    state.finishedBookFailOnce = true;
    state.finishedBookSaveAttempts = 0;
  });

  // TC-CMP-09F: finished_book 保存失敗時も完了確定は維持し、読了更新のみ再試行対象
  it('keeps session completion finalized while retrying only finished-book save', async () => {
    const completed = await runCompleteSessionUseCase({
      planId: 'plan_1',
      sessionId: 'session_1',
      mode: 'normal_15m',
      bookTitle: 'Book A',
      endedAtISO: '2026-03-11T00:15:00.000Z',
    });
    expect(completed.result).toBe('hard_success');
    expect(state.completionFinalized).toBe(true);

    await expect(
      bridgeMock.saveBook({
        id: 'book_1',
        title: 'Book A',
        status: 'completed',
      })
    ).rejects.toThrow('injected finished_book save failure');
    expect(state.completionFinalized).toBe(true);
    expect(state.finishedBookStatus).toBe('active');

    await bridgeMock.saveBook({
      id: 'book_1',
      title: 'Book A',
      status: 'completed',
    });
    expect(state.finishedBookStatus).toBe('completed');

    await runCompleteSessionUseCase({
      planId: 'plan_1',
      sessionId: 'session_1',
      mode: 'normal_15m',
      bookTitle: 'Book A',
      endedAtISO: '2026-03-11T00:15:00.000Z',
    });

    expect(state.completionWriteCount).toBe(1);
    expect(state.finishedBookSaveAttempts).toBe(2);
  });
});
