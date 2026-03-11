import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FakeClock } from '../../services/time/Clock';
import { InMemoryNotificationScheduler } from '../../services/notifications/NotificationScheduler';
import {
  resetRuntimeOverrides,
  setClockForTests,
  setNotificationSchedulerForTests,
} from '../../testHarness/runtimeOverrides';

const bridgeMock = vi.hoisted(() => ({
  upsertPlan: vi.fn(async () => {}),
}));

const findPlanMock = vi.hoisted(() => vi.fn());

vi.mock('../../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

vi.mock('../FindPlanUseCase', () => ({
  runFindPlanByIdUseCase: findPlanMock,
}));

import {
  runCleanupDueNotificationsUseCase,
  runEvaluateDueResponseTimeoutUseCase,
  runEvaluateRetryTimerFiredUseCase,
} from '../DueRetryFlowUseCase';

describe('DueRetryFlow integration', () => {
  let scheduler: InMemoryNotificationScheduler;

  const planBase = {
    planId: 'plan_due_1',
    planDate: '2026-03-11',
    bookId: 'book_1',
    state: 'due',
    result: 'attempted',
    scheduledAt: '2026-03-11T21:00:00.000Z',
    retryCount: 0,
    snoozeCount: 0,
    consistencyCredit: false,
    continuousMissedDaysSnapshot: 0,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    bridgeMock.upsertPlan.mockClear();
    findPlanMock.mockReset();
    resetRuntimeOverrides();
    setClockForTests(new FakeClock('2026-03-11T21:00:00.000Z'));
    scheduler = new InMemoryNotificationScheduler();
    setNotificationSchedulerForTests(scheduler);
  });

  it('CASE-1: due(timeout) -> deferred and retry_due scheduled (retryCount=1)', async () => {
    findPlanMock.mockResolvedValue({ ...planBase, state: 'due', retryCount: 0 });

    const result = await runEvaluateDueResponseTimeoutUseCase(planBase.planId);
    expect(result).toBe('deferred');

    expect(bridgeMock.upsertPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: planBase.planId,
        state: 'deferred',
        retryCount: 1,
      })
    );
    await expect(scheduler.getPending()).resolves.toEqual([
      expect.objectContaining({
        kind: 'retry_due',
        planId: planBase.planId,
        retryCount: 1,
      }),
    ]);
  });

  it('CASE-2: deferred + clock advance -> due', async () => {
    const clock = new FakeClock('2026-03-11T21:00:00.000Z');
    setClockForTests(clock);
    findPlanMock.mockResolvedValue({
      ...planBase,
      state: 'deferred',
      retryCount: 1,
      scheduledAt: '2026-03-11T21:15:00.000Z',
    });

    clock.advanceMinutes(15);
    const result = await runEvaluateRetryTimerFiredUseCase(planBase.planId);
    expect(result).toBe('due');
    expect(bridgeMock.upsertPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: planBase.planId,
        state: 'due',
      })
    );
  });

  it('CASE-3: retried due timeout -> finalized(missed) and no extra retry schedule', async () => {
    const scheduler = new InMemoryNotificationScheduler();
    setNotificationSchedulerForTests(scheduler);
    await scheduler.scheduleRetryDue({
      planId: planBase.planId,
      fireAtISO: '2026-03-11T21:15:00.000Z',
      retryCount: 1,
    });

    findPlanMock.mockResolvedValue({
      ...planBase,
      state: 'due',
      retryCount: 1,
    });
    const result = await runEvaluateDueResponseTimeoutUseCase(planBase.planId);

    expect(result).toBe('finalized');
    expect(bridgeMock.upsertPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: planBase.planId,
        state: 'finalized',
        result: 'missed',
      })
    );
    expect(await scheduler.getPending()).toEqual([]);
  });

  it('CASE-4: started/snoozed/finalized states cancel pending notifications', async () => {
    const scheduler = new InMemoryNotificationScheduler();
    setNotificationSchedulerForTests(scheduler);
    await scheduler.scheduleRetryDue({
      planId: planBase.planId,
      fireAtISO: '2026-03-11T21:15:00.000Z',
      retryCount: 1,
    });

    findPlanMock.mockResolvedValue({
      ...planBase,
      state: 'finalized',
      result: 'missed',
      retryCount: 1,
    });
    await runCleanupDueNotificationsUseCase(planBase.planId);
    expect(await scheduler.getPending()).toEqual([]);
  });
});
