import { beforeEach, describe, expect, it, vi } from 'vitest';

const reconcileMock = vi.hoisted(() => ({
  runReconcilePlansUseCase: vi.fn(),
}));

const findPlanMock = vi.hoisted(() => ({
  runFindPlanByIdUseCase: vi.fn(),
}));

const bridgeMock = vi.hoisted(() => ({
  getPlanForDate: vi.fn(),
}));

vi.mock('../ReconcilePlansUseCase', () => reconcileMock);
vi.mock('../FindPlanUseCase', () => findPlanMock);
vi.mock('../../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

import { runResolveSurfaceStartPlanUseCase } from '../StaleSurfaceStartUseCase';

describe('StaleSurfaceStart integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    reconcileMock.runReconcilePlansUseCase.mockResolvedValue({
      finalizedMissedCount: 0,
      placeholderCreatedCount: 0,
      todayPlanCreated: false,
      continuousMissedDays: 0,
      todayPlan: {
        planId: 'plan_today',
        planDate: '2026-03-11',
        bookId: 'book_today',
        state: 'scheduled',
        result: 'attempted',
        scheduledAt: '2026-03-11T09:00:00.000Z',
        retryCount: 0,
        snoozeCount: 0,
        consistencyCredit: false,
        continuousMissedDaysSnapshot: 0,
      },
    });
    bridgeMock.getPlanForDate.mockResolvedValue(null);
  });

  // TC-ABN-04: stale plan payload を開始判定に使わず、reconcile後の最新計画へ解決する
  it('avoids stale notification plan and resolves to today plan after reconcile', async () => {
    findPlanMock.runFindPlanByIdUseCase.mockResolvedValue({
      planId: 'plan_old',
      planDate: '2026-03-10',
      bookId: 'book_old',
      state: 'due',
      result: 'attempted',
      scheduledAt: '2026-03-10T09:00:00.000Z',
      retryCount: 0,
      snoozeCount: 0,
      consistencyCredit: false,
      continuousMissedDaysSnapshot: 1,
    });

    const resolved = await runResolveSurfaceStartPlanUseCase({
      requestedPlanId: 'plan_old',
      triggerSource: 'notification_response',
    });

    expect(reconcileMock.runReconcilePlansUseCase).toHaveBeenCalledWith('notification_response');
    expect(resolved?.planId).toBe('plan_today');
  });

  it('uses requested plan when it is already today plan', async () => {
    findPlanMock.runFindPlanByIdUseCase.mockResolvedValue({
      planId: 'plan_today',
      planDate: '2026-03-11',
      bookId: 'book_today',
      state: 'due',
      result: 'attempted',
      scheduledAt: '2026-03-11T09:00:00.000Z',
      retryCount: 0,
      snoozeCount: 0,
      consistencyCredit: false,
      continuousMissedDaysSnapshot: 0,
    });

    const resolved = await runResolveSurfaceStartPlanUseCase({
      requestedPlanId: 'plan_today',
      triggerSource: 'notification_response',
    });

    expect(resolved?.planId).toBe('plan_today');
  });

  // TC-ABN-09: 当日plan欠損でも補完生成後の当日計画へ解決できる
  it('falls back to canonical planForDate when reconcile todayPlan is absent', async () => {
    findPlanMock.runFindPlanByIdUseCase.mockResolvedValue(null);
    reconcileMock.runReconcilePlansUseCase.mockResolvedValue({
      finalizedMissedCount: 0,
      placeholderCreatedCount: 1,
      todayPlanCreated: true,
      continuousMissedDays: 0,
      todayPlan: undefined,
    });
    bridgeMock.getPlanForDate.mockResolvedValue({
      planId: 'plan_today_generated',
      planDate: '2026-03-11',
      bookId: 'book_today',
      state: 'scheduled',
      result: 'attempted',
      scheduledAt: '2026-03-11T09:00:00.000Z',
      retryCount: 0,
      snoozeCount: 0,
      consistencyCredit: false,
      continuousMissedDaysSnapshot: 0,
    });

    const resolved = await runResolveSurfaceStartPlanUseCase({
      requestedPlanId: 'missing_plan',
      triggerSource: 'widget_render',
    });

    expect(resolved?.planId).toBe('plan_today_generated');
    expect(bridgeMock.getPlanForDate).toHaveBeenCalledTimes(1);
  });
});
