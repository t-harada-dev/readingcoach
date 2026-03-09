import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = '@readingcoach/manualFocusChangeCount/';

export async function getManualFocusChangeCount(planDate: string): Promise<number> {
  const raw = await AsyncStorage.getItem(`${KEY_PREFIX}${planDate}`);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export async function incrementManualFocusChangeCount(planDate: string): Promise<number> {
  const current = await getManualFocusChangeCount(planDate);
  const next = current + 1;
  await AsyncStorage.setItem(`${KEY_PREFIX}${planDate}`, String(next));
  return next;
}

