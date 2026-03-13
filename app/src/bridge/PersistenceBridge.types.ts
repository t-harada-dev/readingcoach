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

export type NativePersistenceBridgeAPI = {
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
