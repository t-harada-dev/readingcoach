import { beforeEach, describe, expect, it, vi } from 'vitest';

const bridgeMock = vi.hoisted(() => ({
  getBook: vi.fn(),
  getPlanForDate: vi.fn(),
}));

const reconcileMock = vi.hoisted(() => ({
  runReconcilePlansUseCase: vi.fn(),
}));

vi.mock('../../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

vi.mock('../ReconcilePlansUseCase', () => reconcileMock);

import { runResolveSurfaceTodayBookUseCase } from '../SurfaceSnapshotUseCase';

describe('SurfaceSnapshot integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    reconcileMock.runReconcilePlansUseCase.mockResolvedValue({
      todayPlan: {
        planId: 'p1',
        planDate: '2026-03-11',
        bookId: 'canonical_book',
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

  it('prefers canonical store over stale snapshot title', async () => {
    bridgeMock.getBook.mockResolvedValue({ id: 'canonical_book', title: 'Canonical Title' });

    const result = await runResolveSurfaceTodayBookUseCase({
      source: 'app_intent',
      snapshotTitle: 'Stale Snapshot Title',
    });

    expect(result?.title).toBe('Canonical Title');
  });

  it('falls back to snapshot title only when canonical title is unavailable', async () => {
    bridgeMock.getBook.mockResolvedValue({ id: 'canonical_book', title: '' });

    const result = await runResolveSurfaceTodayBookUseCase({
      source: 'app_intent',
      snapshotTitle: 'Fallback Snapshot Title',
    });

    expect(result?.title).toBe('Fallback Snapshot Title');
  });

  it('returns null when neither plan nor snapshot can resolve today book', async () => {
    reconcileMock.runReconcilePlansUseCase.mockResolvedValue({ todayPlan: undefined });
    bridgeMock.getPlanForDate.mockResolvedValue(null);

    const result = await runResolveSurfaceTodayBookUseCase({
      source: 'app_intent',
      snapshotTitle: undefined,
    });

    expect(result).toBeNull();
  });
});
