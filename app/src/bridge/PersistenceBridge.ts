import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
import { copy } from '../config/copy';

const Native: any = (NativeModules as any)?.PersistenceBridge;
const SettingsManager: any = (NativeModules as any)?.SettingsManager;

export type TriggerSource =
  | 'app_launch'
  | 'foreground'
  | 'background_task'
  | 'widget_render'
  | 'notification_response'
  | 'app_intent';

export interface UserSettingsDTO {
  dailyTargetTime: number;
  defaultDuration: number;
  retryLimit: number;
  dayRolloverHour: number;
  progressTrackingEnabled?: boolean;
  progressPromptShown?: boolean;
  notificationsEnabled?: boolean;
}

export interface BookDTO {
  id: string;
  title: string;
  author?: string;
  googleBooksId?: string;
  thumbnailUrl?: string;
  coverSource?: 'manual' | 'google_books' | 'placeholder';
  pageCount?: number;
  currentPage?: number;
  lastProgressUpdatedAt?: string;
  format: string;
  status: string;
  estimatedPriceAmount?: number;
  estimatedPriceCurrency?: string;
}

export interface DailyExecutionPlanDTO {
  planId: string;
  planDate: string;
  bookId: string;
  state: string;
  result: string;
  scheduledAt: string;
  retryCount: number;
  snoozeCount: number;
  consistencyCredit: boolean;
  continuousMissedDaysSnapshot: number;
  startedAt?: string;
}

export interface SessionLogDTO {
  sessionId: string;
  planId: string;
  mode: string;
  startedAt: string;
  endedAt?: string;
  outcome: string;
}

export interface ReconcileResult {
  finalizedMissedCount: number;
  placeholderCreatedCount: number;
  todayPlanCreated: boolean;
  continuousMissedDays: number;
  todayPlan?: DailyExecutionPlanDTO;
}

type NativePersistenceBridgeAPI = {
  getLaunchArg?(key: string): Promise<string | null>;
  getSettings(): Promise<UserSettingsDTO | null>;
  saveSettings(params: UserSettingsDTO): Promise<void>;
  getBooks(): Promise<BookDTO[]>;
  getBook(bookId: string): Promise<BookDTO | null>;
  saveBook(params: Partial<BookDTO> & { id: string; title: string }): Promise<void>;
  getPlanForDate(planDateISO: string): Promise<DailyExecutionPlanDTO | null>;
  getPlansFromTo(fromISO: string, toISO: string): Promise<DailyExecutionPlanDTO[]>;
  upsertPlan(params: Partial<DailyExecutionPlanDTO> & { planDate: string; bookId: string }): Promise<void>;
  finalizePlanAsMissed(planDateISO: string): Promise<void>;
  startSession(
    planId: string,
    mode: 'normal_15m' | 'rescue_5m' | 'rescue_3m' | 'book_fetch_1m',
    entryPoint: 'notification' | 'widget' | 'app'
  ): Promise<{ sessionId: string; startedAt: string; bookTitle: string; e2eSessionSeconds?: number }>;
  completeSession?(
    planId: string,
    sessionId: string,
    result: 'hard_success' | 'soft_success' | 'prep_success',
    endedAtISO: string
  ): Promise<void>;
  getActiveSession(): Promise<{ plan: DailyExecutionPlanDTO; session: SessionLogDTO } | null>;
  reconcilePlans(referenceDateISO: string, triggerSource: TriggerSource): Promise<ReconcileResult>;
};

function isNativeAvailable(): NativePersistenceBridgeAPI | null {
  if (Platform.OS !== 'ios') return null;
  const b = Native as NativePersistenceBridgeAPI | undefined;
  if (!b) return null;
  if (typeof b.getBooks !== 'function') return null;
  if (typeof b.getPlanForDate !== 'function') return null;
  if (typeof b.reconcilePlans !== 'function') return null;
  if (typeof b.startSession !== 'function') return null;
  return b;
}

const MOCK_KEYS = {
  settings: '@readingcoach/mock/settings',
  books: '@readingcoach/mock/books',
  plans: '@readingcoach/mock/plans',
  sessions: '@readingcoach/mock/sessions',
  activeSessionId: '@readingcoach/mock/activeSessionId',
} as const;

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfDayISO(dateISO: string): string {
  return `${dateISO}T09:00:00.000Z`;
}

function byPlanDate(a: DailyExecutionPlanDTO, b: DailyExecutionPlanDTO): number {
  return a.planDate.localeCompare(b.planDate);
}

async function ensureSeeded(): Promise<{ books: BookDTO[]; plans: DailyExecutionPlanDTO[] }> {
  let books = await readJSON<BookDTO[]>(MOCK_KEYS.books, []);
  let plans = await readJSON<DailyExecutionPlanDTO[]>(MOCK_KEYS.plans, []);

  if (books.length === 0) {
    books = copy.persistence.mockSeedBooks.map((seed) => ({
      id: seed.id,
      title: seed.title,
      author: seed.author,
      format: seed.format,
      status: seed.status,
      thumbnailUrl: undefined,
      pageCount: seed.pageCount,
    }));
    await writeJSON(MOCK_KEYS.books, books);
  }

  const today = isoDate(new Date());
  const todayId = `mock_plan_${today}`;
  const hasToday = plans.some((p) => p.planId === todayId || p.planDate === today);
  if (!hasToday) {
    const plan: DailyExecutionPlanDTO = {
      planId: todayId,
      planDate: today,
      bookId: books[0]?.id ?? 'mock_book_1',
      state: 'scheduled',
      result: 'attempted',
      scheduledAt: startOfDayISO(today),
      retryCount: 0,
      snoozeCount: 0,
      consistencyCredit: false,
      continuousMissedDaysSnapshot: 0,
    };
    plans = [...plans, plan].sort(byPlanDate);
    await writeJSON(MOCK_KEYS.plans, plans);
  }

  return { books, plans };
}

const mockBridge: NativePersistenceBridgeAPI = {
  async getLaunchArg() {
    return null;
  },

  async getSettings() {
    await ensureSeeded();
    return readJSON<UserSettingsDTO | null>(MOCK_KEYS.settings, null);
  },

  async saveSettings(params) {
    await ensureSeeded();
    await writeJSON(MOCK_KEYS.settings, params);
  },

  async getBooks() {
    const { books } = await ensureSeeded();
    return books;
  },

  async getBook(bookId) {
    const { books } = await ensureSeeded();
    return books.find((b) => b.id === bookId) ?? null;
  },

  async saveBook(params) {
    const { books } = await ensureSeeded();
    const next: BookDTO = {
      id: params.id,
      title: params.title,
      author: params.author,
      googleBooksId: params.googleBooksId,
      thumbnailUrl: params.thumbnailUrl,
      coverSource: params.coverSource,
      pageCount: params.pageCount,
      currentPage: params.currentPage,
      lastProgressUpdatedAt: params.lastProgressUpdatedAt,
      format: params.format ?? 'paper',
      status: params.status ?? 'active',
      estimatedPriceAmount: params.estimatedPriceAmount,
      estimatedPriceCurrency: params.estimatedPriceCurrency,
    };
    const idx = books.findIndex((b) => b.id === next.id);
    const out = idx >= 0 ? books.map((b, i) => (i === idx ? { ...b, ...next } : b)) : [...books, next];
    await writeJSON(MOCK_KEYS.books, out);
  },

  async getPlanForDate(planDateISO) {
    const { plans } = await ensureSeeded();
    return plans.find((p) => p.planDate === planDateISO) ?? null;
  },

  async getPlansFromTo(fromISO, toISO) {
    const { plans } = await ensureSeeded();
    const from = fromISO.slice(0, 10);
    const to = toISO.slice(0, 10);
    return plans.filter((p) => p.planDate >= from && p.planDate <= to);
  },

  async upsertPlan(params) {
    const { plans, books } = await ensureSeeded();
    const planDate = params.planDate;
    const planId = params.planId ?? `mock_plan_${planDate}`;
    const existingIdx = plans.findIndex((p) => p.planId === planId || p.planDate === planDate);

    const base: DailyExecutionPlanDTO =
      existingIdx >= 0
        ? plans[existingIdx]
        : {
            planId,
            planDate,
            bookId: books[0]?.id ?? 'mock_book_1',
            state: 'scheduled',
            result: 'attempted',
            scheduledAt: startOfDayISO(planDate),
            retryCount: 0,
            snoozeCount: 0,
            consistencyCredit: false,
            continuousMissedDaysSnapshot: 0,
          };

    const next: DailyExecutionPlanDTO = {
      ...base,
      ...params,
      planId,
      planDate,
    };

    const out = existingIdx >= 0 ? plans.map((p, i) => (i === existingIdx ? next : p)) : [...plans, next].sort(byPlanDate);
    await writeJSON(MOCK_KEYS.plans, out);
  },

  async finalizePlanAsMissed(planDateISO) {
    const { plans } = await ensureSeeded();
    const idx = plans.findIndex((p) => p.planDate === planDateISO);
    if (idx < 0) return;
    const next: DailyExecutionPlanDTO = { ...plans[idx], state: 'finalized', result: 'missed' };
    const out = plans.map((p, i) => (i === idx ? next : p));
    await writeJSON(MOCK_KEYS.plans, out);
  },

  async startSession(planId, mode, entryPoint) {
    void entryPoint;
    const { plans, books } = await ensureSeeded();
    const idx = plans.findIndex((p) => p.planId === planId);
    if (idx < 0) throw new Error('Plan not found (mock)');

    const startedAt = new Date().toISOString();
    const plan = plans[idx];
    const book = books.find((b) => b.id === plan.bookId);
    const bookTitle = book?.title ?? 'Reading Session';

    const sessionId = `mock_session_${Date.now()}`;
    const session: SessionLogDTO = {
      sessionId,
      planId,
      mode,
      startedAt,
      outcome: 'active',
    };

    const updatedPlan: DailyExecutionPlanDTO = {
      ...plan,
      state: 'active',
      result: 'attempted',
      startedAt,
    };

    const outPlans = plans.map((p, i) => (i === idx ? updatedPlan : p));
    await writeJSON(MOCK_KEYS.plans, outPlans);

    const sessions = await readJSON<SessionLogDTO[]>(MOCK_KEYS.sessions, []);
    await writeJSON(MOCK_KEYS.sessions, [...sessions, session]);
    await AsyncStorage.setItem(MOCK_KEYS.activeSessionId, sessionId);

    return { sessionId, startedAt, bookTitle };
  },

  async completeSession(planId, sessionId, result, endedAtISO) {
    const plans = await readJSON<DailyExecutionPlanDTO[]>(MOCK_KEYS.plans, []);
    const sessions = await readJSON<SessionLogDTO[]>(MOCK_KEYS.sessions, []);

    const nextPlans = plans.map((p) =>
      p.planId === planId ? { ...p, state: 'finalized', result } : p
    );
    const nextSessions = sessions.map((s) =>
      s.sessionId === sessionId ? { ...s, endedAt: endedAtISO, outcome: 'completed' } : s
    );

    await writeJSON(MOCK_KEYS.plans, nextPlans);
    await writeJSON(MOCK_KEYS.sessions, nextSessions);
    await AsyncStorage.removeItem(MOCK_KEYS.activeSessionId);
  },

  async getActiveSession() {
    await ensureSeeded();
    const sessionId = await AsyncStorage.getItem(MOCK_KEYS.activeSessionId);
    if (!sessionId) return null;
    const sessions = await readJSON<SessionLogDTO[]>(MOCK_KEYS.sessions, []);
    const session = sessions.find((s) => s.sessionId === sessionId) ?? null;
    if (!session || session.endedAt) return null;

    const plans = await readJSON<DailyExecutionPlanDTO[]>(MOCK_KEYS.plans, []);
    const plan = plans.find((p) => p.planId === session.planId) ?? null;
    if (!plan) return null;

    return { plan, session };
  },

  async reconcilePlans(referenceDateISO, triggerSource) {
    void referenceDateISO;
    void triggerSource;
    const { plans } = await ensureSeeded();
    const today = isoDate(new Date());
    const todayPlan = plans.find((p) => p.planDate === today) ?? undefined;
    return {
      finalizedMissedCount: 0,
      placeholderCreatedCount: 0,
      todayPlanCreated: Boolean(todayPlan),
      continuousMissedDays: 0,
      todayPlan,
    };
  },
};

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

  getSettings(): Promise<UserSettingsDTO | null> {
    const bridge = getBridge();
    return bridge.getSettings().then((v: UserSettingsDTO | null) => v ?? null);
  },

  saveSettings(params: UserSettingsDTO): Promise<void> {
    const bridge = getBridge();
    return bridge.saveSettings(params);
  },

  getBooks(): Promise<BookDTO[]> {
    const bridge = getBridge();
    return bridge.getBooks();
  },

  getBook(bookId: string): Promise<BookDTO | null> {
    const bridge = getBridge();
    return bridge.getBook(bookId).then((v: BookDTO | null) => v ?? null);
  },

  saveBook(params: Partial<BookDTO> & { id: string; title: string }): Promise<void> {
    const bridge = getBridge();
    return bridge.saveBook(params);
  },

  getPlanForDate(planDateISO: string): Promise<DailyExecutionPlanDTO | null> {
    const bridge = getBridge();
    return bridge.getPlanForDate(planDateISO).then((v: DailyExecutionPlanDTO | null) => v ?? null);
  },

  getPlansFromTo(fromISO: string, toISO: string): Promise<DailyExecutionPlanDTO[]> {
    const bridge = getBridge();
    return bridge.getPlansFromTo(fromISO, toISO);
  },

  upsertPlan(params: Partial<DailyExecutionPlanDTO> & { planDate: string; bookId: string }): Promise<void> {
    const bridge = getBridge();
    return bridge.upsertPlan(params);
  },

  finalizePlanAsMissed(planDateISO: string): Promise<void> {
    const bridge = getBridge();
    return bridge.finalizePlanAsMissed(planDateISO);
  },

  /** 論理仕様 11.4 session_start_*: SessionLog 作成・plan を active に・永続化。既に active なら no-op。 */
  startSession(
    planId: string,
    mode: 'normal_15m' | 'rescue_5m' | 'rescue_3m' | 'book_fetch_1m',
    entryPoint: 'notification' | 'widget' | 'app'
  ): Promise<{ sessionId: string; startedAt: string; bookTitle: string; e2eSessionSeconds?: number }> {
    const bridge = getBridge();
    return bridge.startSession(planId, mode, entryPoint);
  },

  completeSession(
    planId: string,
    sessionId: string,
    result: 'hard_success' | 'soft_success' | 'prep_success',
    endedAtISO: string
  ): Promise<void> {
    void planId;
    void sessionId;
    void result;
    void endedAtISO;
    const bridge = getBridge();
    if (typeof bridge.completeSession === 'function') {
      return bridge.completeSession(planId, sessionId, result, endedAtISO);
    }
    return Promise.resolve();
  },

  getActiveSession(): Promise<{ plan: DailyExecutionPlanDTO; session: SessionLogDTO } | null> {
    const bridge = getBridge();
    return bridge.getActiveSession().then((v: { plan: DailyExecutionPlanDTO; session: SessionLogDTO } | null) => v ?? null);
  },

  reconcilePlans(referenceDateISO: string, triggerSource: TriggerSource): Promise<ReconcileResult> {
    const bridge = getBridge();
    return bridge.reconcilePlans(referenceDateISO, triggerSource);
  },
};
