import type {
  NotificationSchedulerProbe,
  ScheduledNotificationProbeRecord,
} from './NotificationSchedulerProbe';

export type ScheduleDueParams = {
  planId: string;
  fireAtISO: string;
  retryCount: number;
};

export interface NotificationScheduler extends NotificationSchedulerProbe {
  scheduleInitialDue(params: ScheduleDueParams): Promise<void>;
  scheduleRetryDue(params: ScheduleDueParams): Promise<void>;
  cancelForPlan(planId: string): Promise<void>;
}

export class NoopNotificationScheduler implements NotificationScheduler {
  async scheduleInitialDue(_params: ScheduleDueParams): Promise<void> {}

  async scheduleRetryDue(_params: ScheduleDueParams): Promise<void> {}

  async cancelForPlan(_planId: string): Promise<void> {}

  async getPending(): Promise<ScheduledNotificationProbeRecord[]> {
    return [];
  }

  async clear(): Promise<void> {}
}

export class InMemoryNotificationScheduler implements NotificationScheduler {
  private records: ScheduledNotificationProbeRecord[] = [];

  async scheduleInitialDue(params: ScheduleDueParams): Promise<void> {
    this.records = this.records.filter((r) => !(r.planId === params.planId && r.kind === 'initial_due'));
    this.records.push({
      kind: 'initial_due',
      planId: params.planId,
      fireAt: params.fireAtISO,
      retryCount: params.retryCount,
    });
  }

  async scheduleRetryDue(params: ScheduleDueParams): Promise<void> {
    this.records = this.records.filter((r) => !(r.planId === params.planId && r.kind === 'retry_due'));
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
    return [...this.records].sort((a, b) => a.fireAt.localeCompare(b.fireAt));
  }

  async clear(): Promise<void> {
    this.records = [];
  }
}
