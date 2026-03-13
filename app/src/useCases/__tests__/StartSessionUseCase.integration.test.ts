import { beforeEach, describe, expect, it, vi } from 'vitest';

const bridgeMock = vi.hoisted(() => ({
  getActiveSession: vi.fn(),
  getBook: vi.fn(),
  startSession: vi.fn(),
}));

const liveActivityMock = vi.hoisted(() => ({
  startSession: vi.fn(),
}));

const cancelScheduledForPlanMock = vi.hoisted(() => vi.fn());

vi.mock('../../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

vi.mock('../../bridge/LiveActivityBridge', () => ({
  liveActivityBridge: liveActivityMock,
}));

vi.mock('../../notifications', () => ({
  cancelScheduledForPlan: cancelScheduledForPlanMock,
}));

import { runStartSessionUseCase } from '../StartSessionUseCase';

describe('StartSessionUseCase integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    bridgeMock.getActiveSession.mockResolvedValue(null);
    bridgeMock.getBook.mockResolvedValue({ id: 'book_1', title: 'Book A' });
    liveActivityMock.startSession.mockResolvedValue(undefined);
    cancelScheduledForPlanMock.mockResolvedValue(undefined);
  });

  // TC-ACT-07: 同一planの多重開始は同一activeを再利用し、二重作成しない
  it('coalesces concurrent starts for same plan and returns one active session', async () => {
    type StartSessionResult = { sessionId: string; startedAt: string; bookTitle: string };
    let resolveStart!: (v: StartSessionResult) => void;
    const startPromise = new Promise<StartSessionResult>((resolve) => {
      resolveStart = resolve;
    });
    bridgeMock.startSession.mockReturnValue(startPromise);

    const first = runStartSessionUseCase({
      planId: 'plan_1',
      mode: 'normal_15m',
      entryPoint: 'app',
    });
    const second = runStartSessionUseCase({
      planId: 'plan_1',
      mode: 'normal_15m',
      entryPoint: 'app',
    });

    resolveStart({
      sessionId: 'session_1',
      startedAt: '2026-03-11T00:00:00.000Z',
      bookTitle: 'Book A',
    });

    const [r1, r2] = await Promise.all([first, second]);

    expect(bridgeMock.startSession).toHaveBeenCalledTimes(1);
    expect(liveActivityMock.startSession).toHaveBeenCalledTimes(1);
    expect(cancelScheduledForPlanMock).toHaveBeenCalledTimes(1);
    expect(r1.sessionId).toBe('session_1');
    expect(r2.sessionId).toBe('session_1');
    expect(r1.startedAt).toBe(r2.startedAt);
    expect(r1.endTimeISO).toBe(r2.endTimeISO);
  });
});
