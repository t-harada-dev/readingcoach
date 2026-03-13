import type { ActiveSessionViewProps } from '../../../screens/ActiveSessionView';
import { fixtureBooks } from '../fixtures/books';
import type { MockScenario } from '../types';

export function buildSC24Props(scenario: MockScenario): ActiveSessionViewProps {
    const isRehab =
        scenario === 'rehab' || scenario === 'long_absence' || scenario === 'due' || scenario === 'finished_book';
    const book = isRehab ? fixtureBooks.lightweightBook : fixtureBooks.standardBook;

    return {
        bookTitle: book.title,
        bookCoverUri: book.thumbnailUrl,
        bookCoverSource: book.coverSource,
        mode: 'rescue_5m',
        durationSeconds: 5 * 60,
        remainingSeconds: isRehab ? 142 : 218,
        paused: false,
        done: false,
        completing: false,
        onPressPause: () => {},
        onPressResume: () => {},
        onPressFinishedBook: () => {},
        onPressQuit: () => {},
    };
}
