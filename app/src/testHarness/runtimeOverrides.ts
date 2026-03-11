import type { Clock } from '../services/time/Clock';
import { SystemClock } from '../services/time/Clock';
import type { NotificationScheduler } from '../services/notifications/NotificationScheduler';
import { NoopNotificationScheduler } from '../services/notifications/NotificationScheduler';

const systemClock = new SystemClock();
const defaultScheduler = new NoopNotificationScheduler();

let clockOverride: Clock | null = null;
let schedulerOverride: NotificationScheduler | null = null;

export function setClockForTests(clock: Clock): void {
  clockOverride = clock;
}

export function setNotificationSchedulerForTests(scheduler: NotificationScheduler): void {
  schedulerOverride = scheduler;
}

export function getCurrentClock(): Clock {
  return clockOverride ?? systemClock;
}

export function getCurrentNotificationScheduler(): NotificationScheduler {
  return schedulerOverride ?? defaultScheduler;
}

export function resetRuntimeOverrides(): void {
  clockOverride = null;
  schedulerOverride = null;
}
