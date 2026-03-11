export type ScheduledNotificationProbeRecord = {
  kind: 'initial_due' | 'retry_due';
  planId: string;
  fireAt: string;
  retryCount: number;
};

export interface NotificationSchedulerProbe {
  getPending(): Promise<ScheduledNotificationProbeRecord[]>;
  clear(): Promise<void>;
}
