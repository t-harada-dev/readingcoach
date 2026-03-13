import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { copy } from './config/copy';
import { persistenceBridge } from './bridge/PersistenceBridge';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

const PLAN_NOTIFICATION_IDS_KEY = '@readingcoach/notification/planIds';
const UNRESPONSIVE_RETRY_DELAY_MINUTES = 15;

type PlanNotificationIds = {
  primaryId: string;
  retryId?: string;
};

type NotificationPlanMap = Record<string, PlanNotificationIds>;

type ScheduleOptions = {
  planId?: string;
};

async function readPlanMap(): Promise<NotificationPlanMap> {
  const raw = await AsyncStorage.getItem(PLAN_NOTIFICATION_IDS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as NotificationPlanMap;
    return parsed ?? {};
  } catch {
    return {};
  }
}

async function writePlanMap(map: NotificationPlanMap): Promise<void> {
  await AsyncStorage.setItem(PLAN_NOTIFICATION_IDS_KEY, JSON.stringify(map));
}

function plusMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function buildReminderContent(bookTitle: string, retry: boolean) {
  return {
    title: copy.notifications.readNowTitle,
    body: bookTitle,
    data: retry ? { screen: 'Execution', retry: true } : { screen: 'Execution' },
  } as const;
}

export async function cancelScheduledForPlan(planId: string): Promise<void> {
  if (!planId) return;
  const map = await readPlanMap();
  const ids = map[planId];
  if (!ids) return;
  await Notifications.cancelScheduledNotificationAsync(ids.primaryId);
  if (ids.retryId) {
    await Notifications.cancelScheduledNotificationAsync(ids.retryId);
  }
  delete map[planId];
  await writePlanMap(map);
}

export async function scheduleReadingReminder(
  scheduledAt: Date,
  bookTitle: string,
  options?: ScheduleOptions
): Promise<string | null> {
  const settings = await persistenceBridge.getSettings();
  if (settings?.notificationsEnabled === false) {
    return null;
  }

  if (options?.planId) {
    await cancelScheduledForPlan(options.planId);
  }

  const primaryId = await Notifications.scheduleNotificationAsync({
    content: buildReminderContent(bookTitle, false),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: scheduledAt,
    },
  });

  const retryId = await Notifications.scheduleNotificationAsync({
    content: buildReminderContent(bookTitle, true),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: plusMinutes(scheduledAt, UNRESPONSIVE_RETRY_DELAY_MINUTES),
    },
  });

  if (options?.planId) {
    const map = await readPlanMap();
    map[options.planId] = { primaryId, retryId };
    await writePlanMap(map);
  }

  return primaryId;
}

export async function cancelScheduled(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
