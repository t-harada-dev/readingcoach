import type { LibraryViewProps } from '../../../screens/LibraryView';
import { fixtureLibraryItems } from '../fixtures/library';
import type { MockScenario } from '../types';

export function buildSC20Props(_scenario: MockScenario): LibraryViewProps {
  return {
    books: fixtureLibraryItems,
    onPressAddBook: () => {},
    onPressBook: () => {},
  };
}
