import type { LibraryItem } from '../../../screens/LibraryView';
import { fixtureBooks } from './books';

export const fixtureLibraryItems: LibraryItem[] = [
  { ...fixtureBooks.standardBook, isFocus: true },
  { ...fixtureBooks.lightweightBook, isFocus: false },
  { ...fixtureBooks.missingCoverBook, isFocus: false },
  { ...fixtureBooks.unknownPageCountBook, isFocus: false },
];

export const fixtureBookDetail = {
  title: fixtureBooks.standardBook.title,
  author: fixtureBooks.standardBook.author ?? '',
  pageCount: String(fixtureBooks.standardBook.pageCount ?? ''),
  currentPage: String(fixtureBooks.standardBook.currentPage ?? ''),
  thumbnailUrl: fixtureBooks.standardBook.thumbnailUrl ?? '',
};
