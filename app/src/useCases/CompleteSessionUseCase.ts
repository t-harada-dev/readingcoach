import { persistenceBridge } from '../bridge/PersistenceBridge';
import { buildCompletionFeedback, toExecutionResult, type CompletionFeedback } from '../domain/completionFeedback';
import type { SessionMode } from './StartSessionUseCase';

export type CompleteSessionParams = {
  planId: string;
  sessionId: string;
  mode: SessionMode;
  bookTitle: string;
  endedAtISO?: string;
  progressTrackingEnabled?: boolean;
  currentPage?: number;
  pageCount?: number;
};

export type CompleteSessionResult = {
  result: 'hard_success' | 'soft_success' | 'prep_success';
  feedback: CompletionFeedback;
};

export async function runCompleteSessionUseCase(params: CompleteSessionParams): Promise<CompleteSessionResult> {
  const {
    planId,
    sessionId,
    mode,
    bookTitle,
    endedAtISO = new Date().toISOString(),
    progressTrackingEnabled = false,
    currentPage,
    pageCount,
  } = params;

  const result = toExecutionResult(mode);
  await persistenceBridge.completeSession(planId, sessionId, result, endedAtISO);

  const feedback = buildCompletionFeedback({
    result,
    bookTitle,
    progressTrackingEnabled,
    currentPage,
    pageCount,
  });

  return { result, feedback };
}

