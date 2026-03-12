import type { ActiveSessionViewProps } from '../../../screens/ActiveSessionView';
import { fixtureBooks } from '../fixtures/books';
import type { MockScenario } from '../types';

export function buildSC13Props(scenario: MockScenario): ActiveSessionViewProps {
    const isRehab =
        scenario === 'rehab' || scenario === 'long_absence' || scenario === 'due' || scenario === 'finished_book';
    const book = isRehab ? fixtureBooks.lightweightBook : fixtureBooks.standardBook;

    return {
        bookTitle: book.title,
        bookCoverUri: book.thumbnailUrl,
        bookCoverSource: book.coverSource,
        mode: 'rehab_3m',
        durationSeconds: 3 * 60,
        remainingSeconds: isRehab ? 95 : 128,
        done: false,
        completing: false,
        onPressBack: () => {},
    };
}
