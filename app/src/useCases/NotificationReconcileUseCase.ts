import { getCurrentNotificationScheduler } from '../testHarness/runtimeOverrides';
import type { ScheduledNotificationProbeRecord } from '../services/notifications/NotificationSchedulerProbe';

export type ExpectedNotificationRecord = ScheduledNotificationProbeRecord;

export type NotificationReconcileSummary = {
  rebuiltCount: number;
  dedupedCount: number;
  cleanedExtraCount: number;
  pendingAfter: ScheduledNotificationProbeRecord[];
};

function stableKey(record: { kind: string; planId: string }): string {
  return `${record.kind}:${record.planId}`;
}

async function scheduleExpected(record: ExpectedNotificationRecord): Promise<void> {
  const scheduler = getCurrentNotificationScheduler();
  if (record.kind === 'initial_due') {
    await scheduler.scheduleInitialDue({
      planId: record.planId,
      fireAtISO: record.fireAt,
      retryCount: record.retryCount,
    });
    return;
  }
  await scheduler.scheduleRetryDue({
    planId: record.planId,
    fireAtISO: record.fireAt,
    retryCount: record.retryCount,
  });
}

export async function runNotificationReconcileUseCase(
  expected: ExpectedNotificationRecord[]
): Promise<NotificationReconcileSummary> {
  const scheduler = getCurrentNotificationScheduler();
  const pending = await scheduler.getPending();
  const expectedKeySet = new Set(expected.map((r) => stableKey(r)));

  let dedupedCount = 0;
  let cleanedExtraCount = 0;
  let rebuiltCount = 0;

  const pendingByKey = new Map<string, ScheduledNotificationProbeRecord[]>();
  for (const record of pending) {
    const key = stableKey(record);
    const bucket = pendingByKey.get(key) ?? [];
    bucket.push(record);
    pendingByKey.set(key, bucket);
  }

  const planIdsToRebuild = new Set<string>();
  for (const [key, bucket] of pendingByKey.entries()) {
    if (bucket.length > 1) {
      dedupedCount += bucket.length - 1;
      planIdsToRebuild.add(bucket[0]!.planId);
    }
    if (!expectedKeySet.has(key)) {
      cleanedExtraCount += bucket.length;
      planIdsToRebuild.add(bucket[0]!.planId);
    }
  }

  for (const planId of planIdsToRebuild) {
    await scheduler.cancelForPlan(planId);
    const expectedForPlan = expected.filter((r) => r.planId === planId);
    for (const record of expectedForPlan) {
      await scheduleExpected(record);
      rebuiltCount += 1;
    }
  }

  if (planIdsToRebuild.size === 0) {
    for (const record of expected) {
      const key = stableKey(record);
      if (!pendingByKey.has(key)) {
        await scheduleExpected(record);
        rebuiltCount += 1;
      }
    }
  }

  const pendingAfter = await scheduler.getPending();
  return {
    rebuiltCount,
    dedupedCount,
    cleanedExtraCount,
    pendingAfter,
  };
}
