import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BookDTO } from '../bridge/PersistenceBridge';
import type { ActiveSessionRouteParams } from './activeSessionRoute';
import type { SessionMode } from '../useCases/StartSessionUseCase';
import type { ScreenId, MockScenario } from '../dev/screenCatalog/types';

export type CompletionParams = {
  planId: string;
  bookId: string;
  bookTitle: string;
  result: 'hard_success' | 'soft_success' | 'prep_success';
  elapsedSeconds: number;
};

export type DueActionSheetParams = {
  planId: string;
  defaultMode: Exclude<SessionMode, 'rehab_3m'>;
  entryPoint?: 'notification' | 'app';
  dueActionScreenId?: 'SC-23';
};

export type RestartRecoveryParams = {
  planId?: string;
  planDate?: string;
  bookId?: string;
  bookTitle?: string;
  bookThumbnailUrl?: string;
  bookCoverSource?: 'manual' | 'google_books' | 'placeholder';
};

export type NextFocusNominationParams = {
  completedBookId: string;
};

export type LibraryParams = {
  manualChangePlanDate?: string;
  manualChangeCurrentBookId?: string;
};

export type BookDetailParams = {
  bookId: string;
  manualChangePlanDate?: string;
  manualChangeCurrentBookId?: string;
};

export type OnboardingAddBookParams = {
  onboarding?: boolean;
};

export type OnboardingNotificationParams = {
  forceNotificationsEnabled?: boolean;
};

export type ProgressTrackingPromptParams = {
  bookId?: string;
  bookTitle?: string;
};

export type ProgressTrackingSetupParams = {
  bookId?: string;
  bookTitle?: string;
  bookAuthor?: string;
  bookThumbnailUrl?: string;
  bookCoverSource?: BookDTO['coverSource'];
};

export type SurfaceSnapshotId =
  | 'SF-01'
  | 'SF-02'
  | 'SF-03'
  | 'SF-04'
  | 'SF-05'
  | 'SF-06'
  | 'SF-07'
  | 'SF-08'
  | 'SF-09';

export type SurfaceSnapshotParams = {
  snapshotId?: SurfaceSnapshotId;
};

export type RootStackParamList = {
  FocusCore: { skipRestartOnce?: boolean; skipDueRouteOnce?: boolean } | undefined;
  ActiveSession: ActiveSessionRouteParams;
  Completion: CompletionParams;
  DueActionSheet: DueActionSheetParams;
  RestartRecovery: RestartRecoveryParams | undefined;
  TimeChange: undefined;
  NotificationSettings: OnboardingNotificationParams | undefined;
  Settings: OnboardingNotificationParams | undefined;
  ProgressTrackingPrompt: ProgressTrackingPromptParams | undefined;
  ProgressTrackingSetup: ProgressTrackingSetupParams | undefined;
  NextFocusNomination: NextFocusNominationParams;
  Library: LibraryParams | undefined;
  BookDetail: BookDetailParams;
  Reserve: undefined;
  AddBook: undefined;
  OnboardingAddBook: OnboardingAddBookParams | undefined;
  OnboardingTime: undefined;
  OnboardingNotification: OnboardingNotificationParams | undefined;
  SurfaceSnapshot: SurfaceSnapshotParams | undefined;
  DevScreenCatalog: undefined;
  DevScreenPlayground: { screenId?: ScreenId; scenario?: MockScenario } | undefined;
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type LibraryItem = BookDTO & { isFocus: boolean };
