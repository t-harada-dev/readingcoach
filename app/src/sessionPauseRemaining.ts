import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = '@readingcoach/sessionPauseRemaining/';

export async function getSessionPauseRemaining(sessionId: string): Promise<number | null> {
  const raw = await AsyncStorage.getItem(`${KEY_PREFIX}${sessionId}`);
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export async function setSessionPauseRemaining(sessionId: string, remainingSeconds: number): Promise<void> {
  await AsyncStorage.setItem(`${KEY_PREFIX}${sessionId}`, String(Math.max(0, Math.floor(remainingSeconds))));
}

export async function clearSessionPauseRemaining(sessionId: string): Promise<void> {
  await AsyncStorage.removeItem(`${KEY_PREFIX}${sessionId}`);
}
