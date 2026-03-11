import { afterEach, describe, expect, it } from 'vitest';
import type { NotificationScheduler } from '../../services/notifications/NotificationScheduler';
import type { ScheduledNotificationProbeRecord } from '../../services/notifications/NotificationSchedulerProbe';
import {
  resetRuntimeOverrides,
  setNotificationSchedulerForTests,
} from '../../testHarness/runtimeOverrides';
import { runNotificationReconcileUseCase } from '../NotificationReconcileUseCase';

class ProbeNotificationScheduler implements NotificationScheduler {
  private records: ScheduledNotificationProbeRecord[];

  constructor(seed: ScheduledNotificationProbeRecord[]) {
    this.records = [...seed];
  }

  async scheduleInitialDue(params: { planId: string; fireAtISO: string; retryCount: number }): Promise<void> {
    this.records.push({
      kind: 'initial_due',
      planId: params.planId,
      fireAt: params.fireAtISO,
      retryCount: params.retryCount,
    });
  }

  async scheduleRetryDue(params: { planId: string; fireAtISO: string; retryCount: number }): Promise<void> {
    this.records.push({
      kind: 'retry_due',
      planId: params.planId,
      fireAt: params.fireAtISO,
      retryCount: params.retryCount,
    });
  }

  async cancelForPlan(planId: string): Promise<void> {
    this.records = this.records.filter((r) => r.planId !== planId);
  }

  async getPending(): Promise<ScheduledNotificationProbeRecord[]> {
    return [...this.records].sort((a, b) => `${a.planId}:${a.kind}`.localeCompare(`${b.planId}:${b.kind}`));
  }

  async clear(): Promise<void> {
    this.records = [];
  }
}

describe('NotificationReconcile integration', () => {
  afterEach(() => {
    resetRuntimeOverrides();
  });

  // TC-ABN-02: 通知期待集合に不足があるとき、不足分のみ再構築する
  it('rebuilds only missing notification requests', async () => {
    const scheduler = new ProbeNotificationScheduler([
      {
        kind: 'initial_due',
        planId: 'p1',
        fireAt: '2026-03-11T09:00:00.000Z',
        retryCount: 0,
      },
    ]);
    setNotificationSchedulerForTests(scheduler);

    const expected = [
      {
        kind: 'initial_due' as const,
        planId: 'p1',
        fireAt: '2026-03-11T09:00:00.000Z',
        retryCount: 0,
      },
      {
        kind: 'retry_due' as const,
        planId: 'p1',
        fireAt: '2026-03-11T09:15:00.000Z',
        retryCount: 1,
      },
    ];

    const result = await runNotificationReconcileUseCase(expected);

    expect(result.rebuiltCount).toBe(1);
    expect(result.dedupedCount).toBe(0);
    expect(result.cleanedExtraCount).toBe(0);
    expect(result.pendingAfter).toHaveLength(2);
    expect(result.pendingAfter.map((r) => r.kind).sort()).toEqual(['initial_due', 'retry_due']);
  });

  // TC-ABN-03: 同一目的通知の重複を安定ID(kind+planId)で収束させる
  it('deduplicates duplicate notification requests and converges to expected set', async () => {
    const scheduler = new ProbeNotificationScheduler([
      {
        kind: 'initial_due',
        planId: 'p1',
        fireAt: '2026-03-11T09:00:00.000Z',
        retryCount: 0,
      },
      {
        kind: 'initial_due',
        planId: 'p1',
        fireAt: '2026-03-11T09:01:00.000Z',
        retryCount: 0,
      },
      {
        kind: 'retry_due',
        planId: 'p1',
        fireAt: '2026-03-11T09:15:00.000Z',
        retryCount: 1,
      },
    ]);
    setNotificationSchedulerForTests(scheduler);

    const expected = [
      {
        kind: 'initial_due' as const,
        planId: 'p1',
        fireAt: '2026-03-11T09:00:00.000Z',
        retryCount: 0,
      },
      {
        kind: 'retry_due' as const,
        planId: 'p1',
        fireAt: '2026-03-11T09:15:00.000Z',
        retryCount: 1,
      },
    ];

    const result = await runNotificationReconcileUseCase(expected);

    expect(result.dedupedCount).toBeGreaterThanOrEqual(1);
    expect(result.pendingAfter).toHaveLength(2);
    expect(result.pendingAfter.map((r) => `${r.kind}:${r.planId}`)).toEqual([
      'initial_due:p1',
      'retry_due:p1',
    ]);
  });
});
