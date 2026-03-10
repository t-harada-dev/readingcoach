import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, string>();

const asyncStorageMock = vi.hoisted(() => ({
  getItem: vi.fn(async (key: string) => store.get(key) ?? null),
  setItem: vi.fn(async (key: string, value: string) => {
    store.set(key, value);
  }),
}));

const notificationsMock = vi.hoisted(() => {
  let seq = 1;
  return {
    setNotificationHandler: vi.fn(),
    scheduleNotificationAsync: vi.fn(async () => `nid_${seq++}`),
    cancelScheduledNotificationAsync: vi.fn(async () => {}),
    cancelAllScheduledNotificationsAsync: vi.fn(async () => {}),
    requestPermissionsAsync: vi.fn(async () => ({ status: 'granted' })),
    SchedulableTriggerInputTypes: { DATE: 'date' },
  };
});

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: asyncStorageMock,
}));

vi.mock('expo-notifications', () => notificationsMock);

import { cancelScheduledForPlan, scheduleReadingReminder } from './notifications';

describe('notifications', () => {
  beforeEach(() => {
    store.clear();
    vi.clearAllMocks();
  });

  it('planId 指定時は本通知+15分後再通知を1回ずつ予約する', async () => {
    const now = new Date('2026-03-10T12:00:00.000Z');
    await scheduleReadingReminder(now, 'Book A', { planId: 'p1' });

    expect(notificationsMock.scheduleNotificationAsync).toHaveBeenCalledTimes(2);

    const firstTrigger = (notificationsMock.scheduleNotificationAsync.mock.calls[0] as any)?.[0]?.trigger;
    const secondTrigger = (notificationsMock.scheduleNotificationAsync.mock.calls[1] as any)?.[0]?.trigger;
    expect(firstTrigger.date.toISOString()).toBe('2026-03-10T12:00:00.000Z');
    expect(secondTrigger.date.toISOString()).toBe('2026-03-10T12:15:00.000Z');
  });

  it('同じ planId の再予約時は古い通知を cancel してから再作成する', async () => {
    const now = new Date('2026-03-10T12:00:00.000Z');
    await scheduleReadingReminder(now, 'Book A', { planId: 'p1' });
    const firstResults = notificationsMock.scheduleNotificationAsync.mock.results as Array<{ value: Promise<string> }>;
    const firstPrimary = firstResults[0]!.value;
    const firstRetry = firstResults[1]!.value;
    await scheduleReadingReminder(now, 'Book A', { planId: 'p1' });

    // 2回目の予約前に1回目の primary/retry が取消される
    await expect(firstPrimary).resolves.toBeTruthy();
    await expect(firstRetry).resolves.toBeTruthy();
    expect(notificationsMock.cancelScheduledNotificationAsync).toHaveBeenCalledWith(await firstPrimary);
    expect(notificationsMock.cancelScheduledNotificationAsync).toHaveBeenCalledWith(await firstRetry);
    expect(notificationsMock.scheduleNotificationAsync).toHaveBeenCalledTimes(4);
  });

  it('cancelScheduledForPlan は primary/retry を両方取り消す', async () => {
    const now = new Date('2026-03-10T12:00:00.000Z');
    await scheduleReadingReminder(now, 'Book A', { planId: 'p1' });
    const firstResults = notificationsMock.scheduleNotificationAsync.mock.results as Array<{ value: Promise<string> }>;
    const primary = firstResults[0]!.value;
    const retry = firstResults[1]!.value;

    await cancelScheduledForPlan('p1');

    await expect(primary).resolves.toBeTruthy();
    await expect(retry).resolves.toBeTruthy();
    expect(notificationsMock.cancelScheduledNotificationAsync).toHaveBeenCalledWith(await primary);
    expect(notificationsMock.cancelScheduledNotificationAsync).toHaveBeenCalledWith(await retry);
  });
});
