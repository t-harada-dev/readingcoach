import type { SessionMode, StartSessionResult } from '../useCases/StartSessionUseCase';

export type ActiveSessionRouteParams = {
  planId: string;
  sessionId: string;
  bookId: string;
  bookTitle: string;
  mode: SessionMode;
  startedAt: string;
  endTimeISO: string;
  durationSeconds: number;
};

type BuildParamsInput = {
  started: StartSessionResult;
  mode: SessionMode;
  bookId?: string;
};

export function buildActiveSessionRouteParams(input: BuildParamsInput): ActiveSessionRouteParams {
  const { started, mode, bookId } = input;
  return {
    planId: started.planId,
    sessionId: started.sessionId,
    bookId: bookId ?? '',
    bookTitle: started.bookTitle,
    mode,
    startedAt: started.startedAt,
    endTimeISO: started.endTimeISO,
    durationSeconds: started.durationSeconds,
  };
}
