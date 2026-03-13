import type { LibraryItem } from '../../../navigation/types';
import { fixtureBooks } from './books';

export const fixtureLibraryItems: LibraryItem[] = [
  { ...fixtureBooks.standardBook, isFocus: true },
  { ...fixtureBooks.lightweightBook, isFocus: false },
  { ...fixtureBooks.missingCoverBook, isFocus: false },
  { ...fixtureBooks.unknownPageCountBook, isFocus: false },
];

export const fixtureLibraryItemsDense: LibraryItem[] = Array.from({ length: 20 }, (_, index) => {
  const base =
    index === 0
      ? fixtureBooks.standardBook
      : index % 3 === 0
        ? fixtureBooks.missingCoverBook
        : index % 2 === 0
          ? fixtureBooks.lightweightBook
          : fixtureBooks.unknownPageCountBook;
  const order = index + 1;
  return {
    ...base,
    id: `${base.id}-dense-${order}`,
    title: `${base.title} ${order}`,
    isFocus: index === 0,
  };
});

export const fixtureBookDetail = {
  title: fixtureBooks.standardBook.title,
  author: fixtureBooks.standardBook.author ?? '',
  pageCount: String(fixtureBooks.standardBook.pageCount ?? ''),
  currentPage: String(fixtureBooks.standardBook.currentPage ?? ''),
  thumbnailUrl: fixtureBooks.standardBook.thumbnailUrl ?? '',
};
