import { beforeEach, describe, expect, it, vi } from 'vitest';

const bridgeMock = vi.hoisted(() => ({
  completeSession: vi.fn(),
}));

vi.mock('../../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

import { runCompleteSessionUseCase } from '../CompleteSessionUseCase';

describe('CompleteSessionUseCase integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // TC-ACT-09: 完了保存が1回失敗しても再試行で単一完了に収束し、二重加算しない
  it('keeps completion idempotent when first save fails and then retries', async () => {
    const state = {
      failOnce: true,
      finalizedWrites: 0,
      dailyResultRecomputeCount: 0,
      planState: 'active',
      sessionOutcome: 'active',
    };

    bridgeMock.completeSession.mockImplementation(async () => {
      if (state.failOnce) {
        state.failOnce = false;
        throw new Error('injected completion failure');
      }
      if (state.planState === 'finalized' && state.sessionOutcome === 'completed') {
        return;
      }
      state.planState = 'finalized';
      state.sessionOutcome = 'completed';
      state.finalizedWrites += 1;
      state.dailyResultRecomputeCount += 1;
    });

    await expect(
      runCompleteSessionUseCase({
        planId: 'plan_1',
        sessionId: 'session_1',
        mode: 'normal_15m',
        bookTitle: 'Book A',
        endedAtISO: '2026-03-11T00:15:00.000Z',
      })
    ).rejects.toThrow('injected completion failure');

    const retry = await runCompleteSessionUseCase({
      planId: 'plan_1',
      sessionId: 'session_1',
      mode: 'normal_15m',
      bookTitle: 'Book A',
      endedAtISO: '2026-03-11T00:15:00.000Z',
    });
    expect(retry.result).toBe('hard_success');

    const duplicatedRetry = await runCompleteSessionUseCase({
      planId: 'plan_1',
      sessionId: 'session_1',
      mode: 'normal_15m',
      bookTitle: 'Book A',
      endedAtISO: '2026-03-11T00:15:00.000Z',
    });
    expect(duplicatedRetry.result).toBe('hard_success');

    expect(state.finalizedWrites).toBe(1);
    expect(state.dailyResultRecomputeCount).toBe(1);
    expect(bridgeMock.completeSession).toHaveBeenCalledTimes(3);
  });
});
