import { buildCompletionFeedback } from '../../../domain/completionFeedback';
import type { CompletionViewProps } from '../../../screens/CompletionView';
import { fixtureCompletion } from '../fixtures/session';
import type { MockScenario } from '../types';

export function buildSC14Props(_scenario: MockScenario): CompletionViewProps {
  const fixture = fixtureCompletion.sc14;
  const feedback = buildCompletionFeedback({
    result: fixture.result,
    bookTitle: fixture.bookTitle,
  });

  return {
    result: fixture.result,
    elapsedSeconds: fixture.elapsedSeconds,
    bookTitle: fixture.bookTitle,
    feedback,
    busy: false,
    finishedBookError: null,
    onPressExtra5m: () => {},
    onPressExtra15m: () => {},
    onPressFinishedBook: () => {},
    onPressClose: () => {},
  };
}
