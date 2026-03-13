import type { LibraryViewProps } from '../../../screens/LibraryView';
import { fixtureLibraryItemsDense } from '../fixtures/library';
import type { MockScenario } from '../types';

export function buildSC20Props(_scenario: MockScenario): LibraryViewProps {
  if (_scenario === 'empty') {
    return {
      books: [],
      onPressAddBook: () => {},
      onPressBook: () => {},
    };
  }

  return {
    books: fixtureLibraryItemsDense,
    onPressAddBook: () => {},
    onPressBook: () => {},
  };
}
