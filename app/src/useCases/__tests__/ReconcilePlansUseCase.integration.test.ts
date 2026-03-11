import { beforeEach, describe, expect, it, vi } from 'vitest';

const bridgeMock = vi.hoisted(() => ({
  reconcilePlans: vi.fn(),
  getActiveSession: vi.fn(),
  getBook: vi.fn(),
  startSession: vi.fn(),
}));

const notificationBridgeMock = vi.hoisted(() => ({
  resyncAfterReconcile: vi.fn(),
}));

const liveActivityMock = vi.hoisted(() => ({
  startSession: vi.fn(),
}));

const cancelScheduledForPlanMock = vi.hoisted(() => vi.fn());

vi.mock('../../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

vi.mock('../../bridge/NotificationBridge', () => ({
  notificationBridge: notificationBridgeMock,
}));

vi.mock('../../bridge/LiveActivityBridge', () => ({
  liveActivityBridge: liveActivityMock,
}));

vi.mock('../../notifications', () => ({
  cancelScheduledForPlan: cancelScheduledForPlanMock,
}));

import { runReconcilePlansUseCase } from '../ReconcilePlansUseCase';
import { runStartSessionUseCase } from '../StartSessionUseCase';

describe('ReconcilePlansUseCase integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    notificationBridgeMock.resyncAfterReconcile.mockResolvedValue(undefined);
    liveActivityMock.startSession.mockResolvedValue(undefined);
    cancelScheduledForPlanMock.mockResolvedValue(undefined);
    bridgeMock.reconcilePlans.mockResolvedValue({
      finalizedMissedCount: 0,
      placeholderCreatedCount: 0,
      todayPlanCreated: false,
      continuousMissedDays: 0,
      todayPlan: {
        planId: 'plan_active',
        planDate: '2026-03-11',
        bookId: 'book_1',
        state: 'active',
        result: 'attempted',
        scheduledAt: '2026-03-11T09:00:00.000Z',
        retryCount: 0,
        snoozeCount: 0,
        consistencyCredit: false,
        continuousMissedDaysSnapshot: 0,
        startedAt: '2026-03-11T00:00:00.000Z',
      },
    });
    bridgeMock.getActiveSession.mockResolvedValue({
      plan: {
        planId: 'plan_active',
        planDate: '2026-03-11',
        bookId: 'book_1',
        state: 'active',
        result: 'attempted',
        scheduledAt: '2026-03-11T09:00:00.000Z',
        retryCount: 0,
        snoozeCount: 0,
        consistencyCredit: false,
        continuousMissedDaysSnapshot: 0,
        startedAt: '2026-03-11T00:00:00.000Z',
      },
      session: {
        sessionId: 'session_existing',
        planId: 'plan_active',
        mode: 'normal_15m',
        startedAt: '2026-03-11T00:00:00.000Z',
        outcome: 'active',
      },
    });
    bridgeMock.getBook.mockResolvedValue({ id: 'book_1', title: 'Book A' });
    bridgeMock.startSession.mockResolvedValue({
      sessionId: 'session_new',
      startedAt: '2026-03-11T00:01:00.000Z',
      bookTitle: 'Book A',
    });
  });

  // TC-ACT-08: activeセッションは再起動後(reconcile後)に復元でき、新規sessionを増やさない
  it('restores persisted active session and does not create a duplicate session', async () => {
    const reconcile = await runReconcilePlansUseCase('app_launch');
    expect(bridgeMock.reconcilePlans).toHaveBeenCalledTimes(1);
    expect(notificationBridgeMock.resyncAfterReconcile).toHaveBeenCalledTimes(1);
    expect(reconcile.todayPlan?.state).toBe('active');

    const started = await runStartSessionUseCase({
      planId: 'plan_active',
      mode: 'normal_15m',
      entryPoint: 'app',
    });

    expect(started.sessionId).toBe('session_existing');
    expect(started.startedAt).toBe('2026-03-11T00:00:00.000Z');
    expect(bridgeMock.startSession).not.toHaveBeenCalled();
    expect(liveActivityMock.startSession).not.toHaveBeenCalled();
    expect(cancelScheduledForPlanMock).not.toHaveBeenCalled();
  });
});
