import { persistenceBridge } from '../bridge/PersistenceBridge';

export async function updateBookProgress(params: {
  bookId: string;
  title: string;
  pageCount?: number;
  currentPage?: number;
}): Promise<void> {
  const { bookId, title, pageCount, currentPage } = params;
  await persistenceBridge.saveBook({
    id: bookId,
    title,
    pageCount,
    currentPage,
    lastProgressUpdatedAt: new Date().toISOString(),
  });
}
