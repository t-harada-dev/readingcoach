import { beforeEach, describe, expect, it, vi } from 'vitest';

const bridgeMock = vi.hoisted(() => ({
  completeSession: vi.fn(),
}));

vi.mock('../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

import { runCompleteSessionUseCase } from './CompleteSessionUseCase';

describe('runCompleteSessionUseCase', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    bridgeMock.completeSession.mockResolvedValue(undefined);
  });

  it('mode に応じて result を確定し completeSession を呼ぶ', async () => {
    const result = await runCompleteSessionUseCase({
      planId: 'p1',
      sessionId: 's1',
      mode: 'normal_15m',
      bookTitle: '本A',
      endedAtISO: '2026-03-10T10:00:00.000Z',
    });

    expect(bridgeMock.completeSession).toHaveBeenCalledWith(
      'p1',
      's1',
      'hard_success',
      '2026-03-10T10:00:00.000Z'
    );
    expect(result.result).toBe('hard_success');
    expect(result.feedback.title).toBe('今日も前進しました');
  });

  it('ignition_1m は prep_success で progress を返さない', async () => {
    const result = await runCompleteSessionUseCase({
      planId: 'p2',
      sessionId: 's2',
      mode: 'ignition_1m',
      bookTitle: '本B',
      progressTrackingEnabled: true,
      currentPage: 100,
      pageCount: 300,
    });

    expect(result.result).toBe('prep_success');
    expect(result.feedback.progressRatio).toBeNull();
  });
});
