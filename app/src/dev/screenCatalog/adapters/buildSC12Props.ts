import type { ActiveSessionViewProps } from '../../../screens/ActiveSessionView';
import { fixtureActiveSession } from '../fixtures/session';
import type { MockScenario } from '../types';

export function buildSC12Props(scenario: MockScenario): ActiveSessionViewProps {
  const fixture = scenario === 'rehab' || scenario === 'long_absence' || scenario === 'due'
    ? fixtureActiveSession.rehab
    : fixtureActiveSession.normal;

  return {
    bookTitle: fixture.bookTitle,
    bookCoverUri: fixture.bookCoverUri,
    mode: fixture.mode,
    durationSeconds: fixture.durationSeconds,
    remainingSeconds: fixture.remainingSeconds,
    paused: false,
    done: false,
    completing: false,
    onPressPause: () => {},
    onPressResume: () => {},
    onPressFinishedBook: () => {},
    onPressQuit: () => {},
  };
}
