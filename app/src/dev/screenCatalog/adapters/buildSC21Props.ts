import type { BookDetailViewProps } from '../../../screens/BookDetailView';
import { fixtureBookDetail } from '../fixtures/library';
import type { MockScenario } from '../types';

export function buildSC21Props(_scenario: MockScenario): BookDetailViewProps {
  return {
    title: fixtureBookDetail.title,
    author: fixtureBookDetail.author,
    pageCount: fixtureBookDetail.pageCount,
    currentPage: fixtureBookDetail.currentPage,
    thumbnailUrl: fixtureBookDetail.thumbnailUrl,
    progressEnabled: true,
    saving: false,
    canSave: true,
    onChangeTitle: () => {},
    onChangeAuthor: () => {},
    onChangePageCount: () => {},
    onChangeCurrentPage: () => {},
    onChangeThumbnailUrl: () => {},
    onPressToggleProgress: () => {},
    onPressSave: () => {},
    onPressSetFocusBook: () => {},
  };
}
