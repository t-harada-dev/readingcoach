import type { BookDetailViewProps } from '../../../screens/BookDetailView';
import { fixtureBooks } from '../fixtures/books';
import type { MockScenario } from '../types';

export function buildSC21Props(scenario: MockScenario): BookDetailViewProps {
  const scenarioBookMap = {
    rehab: fixtureBooks.missingCoverBook,
    no_cover: fixtureBooks.missingCoverBook,
    cover_removed: fixtureBooks.missingCoverBook,
    normal: fixtureBooks.standardBook,
    long_absence: fixtureBooks.standardBook,
    due: fixtureBooks.standardBook,
    empty: fixtureBooks.standardBook,
  } as const;
  const book = scenarioBookMap[scenario];
  const isNoCover = scenario === 'no_cover' || scenario === 'cover_removed';
  const thumbnailUrl = isNoCover ? undefined : (book as { thumbnailUrl?: string }).thumbnailUrl;
  const progressEnabled = scenario !== 'rehab';
  return {
    title: book.title,
    author: book.author ?? '',
    pageCount: String(book.pageCount ?? ''),
    currentPage: String(book.currentPage ?? ''),
    thumbnailUrl: thumbnailUrl ?? '',
    coverSource: thumbnailUrl ? 'google_books' : 'placeholder',
    progressEnabled,
    saving: false,
    canSave: true,
    onChangeTitle: () => {},
    onChangeAuthor: () => {},
    onChangePageCount: () => {},
    onChangeCurrentPage: () => {},
    onPressTakePhoto: () => {},
    onPressPickFromLibrary: () => {},
    onPressRemoveCover: () => {},
    onPressToggleProgress: () => {},
    onPressSave: () => {},
    onPressSetFocusBook: () => {},
  };
}
