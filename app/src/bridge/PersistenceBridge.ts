import { NativeModules, Platform } from 'react-native';
import type {
  BookDTO,
  DailyExecutionPlanDTO,
  NativePersistenceBridgeAPI,
  ReconcileResult,
  SessionLogDTO,
  TriggerSource,
  UserSettingsDTO,
} from './PersistenceBridge.types';
import { mockBridge } from './MockPersistenceBridge';

const Native: any = (NativeModules as any)?.PersistenceBridge;
const SettingsManager: any = (NativeModules as any)?.SettingsManager;

function isNativeAvailable(): NativePersistenceBridgeAPI | null {
  if (Platform.OS !== 'ios') return null;
  const bridge = Native as NativePersistenceBridgeAPI | undefined;
  if (!bridge) return null;
  if (typeof bridge.getBooks !== 'function') return null;
  if (typeof bridge.getPlanForDate !== 'function') return null;
  if (typeof bridge.reconcilePlans !== 'function') return null;
  if (typeof bridge.startSession !== 'function') return null;
  return bridge;
}

function getBridge(): NativePersistenceBridgeAPI {
  return isNativeAvailable() ?? mockBridge;
}

function readLaunchArgFallback(key: string): string | null {
  const settings = SettingsManager?.settings;
  const value = settings?.[key];
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return null;
}

export const persistenceBridge = {
  async getLaunchArg(key: string): Promise<string | null> {
    const bridge = getBridge();
    const fallback = readLaunchArgFallback(key);
    if (typeof bridge.getLaunchArg !== 'function') return fallback;
    try {
      const value = await Promise.race<string | null>([
        bridge.getLaunchArg(key),
        new Promise<string | null>((resolve) => {
          setTimeout(() => resolve(fallback), 250);
        }),
      ]);
      return value ?? fallback;
    } catch {
      return fallback;
    }
  },

  async getSettings(): Promise<UserSettingsDTO | null> {
    const bridge = getBridge();
    const value = await bridge.getSettings();
    return value ?? null;
  },

  async saveSettings(params: UserSettingsDTO): Promise<void> {
    const bridge = getBridge();
    await bridge.saveSettings(params);
  },

  async getBooks(): Promise<BookDTO[]> {
    const bridge = getBridge();
    return bridge.getBooks();
  },

  async getBook(bookId: string): Promise<BookDTO | null> {
    const bridge = getBridge();
    const value = await bridge.getBook(bookId);
    return value ?? null;
  },

  async saveBook(params: Partial<BookDTO> & { id: string; title: string }): Promise<void> {
    const bridge = getBridge();
    await bridge.saveBook(params);
  },

  async getPlanForDate(planDateISO: string): Promise<DailyExecutionPlanDTO | null> {
    const bridge = getBridge();
    const value = await bridge.getPlanForDate(planDateISO);
    return value ?? null;
  },

  async getPlansFromTo(fromISO: string, toISO: string): Promise<DailyExecutionPlanDTO[]> {
    const bridge = getBridge();
    return bridge.getPlansFromTo(fromISO, toISO);
  },

  async upsertPlan(params: Partial<DailyExecutionPlanDTO> & { planDate: string; bookId: string }): Promise<void> {
    const bridge = getBridge();
    await bridge.upsertPlan(params);
  },

  async finalizePlanAsMissed(planDateISO: string): Promise<void> {
    const bridge = getBridge();
    await bridge.finalizePlanAsMissed(planDateISO);
  },

  async startSession(
    planId: string,
    mode: 'normal_15m' | 'rescue_5m' | 'rescue_3m' | 'book_fetch_1m',
    entryPoint: 'notification' | 'widget' | 'app'
  ): Promise<{ sessionId: string; startedAt: string; bookTitle: string; e2eSessionSeconds?: number }> {
    const bridge = getBridge();
    return bridge.startSession(planId, mode, entryPoint);
  },

  async completeSession(
    planId: string,
    sessionId: string,
    result: 'hard_success' | 'soft_success' | 'prep_success',
    endedAtISO: string
  ): Promise<void> {
    const bridge = getBridge();
    if (typeof bridge.completeSession === 'function') {
      await bridge.completeSession(planId, sessionId, result, endedAtISO);
    }
  },

  async getActiveSession(): Promise<{ plan: DailyExecutionPlanDTO; session: SessionLogDTO } | null> {
    const bridge = getBridge();
    const value = await bridge.getActiveSession();
    return value ?? null;
  },

  async reconcilePlans(referenceDateISO: string, triggerSource: TriggerSource): Promise<ReconcileResult> {
    const bridge = getBridge();
    return bridge.reconcilePlans(referenceDateISO, triggerSource);
  },
};

export type {
  TriggerSource,
  UserSettingsDTO,
  BookDTO,
  DailyExecutionPlanDTO,
  SessionLogDTO,
  ReconcileResult,
  NativePersistenceBridgeAPI,
} from './PersistenceBridge.types';
