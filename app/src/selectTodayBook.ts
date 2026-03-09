import type { Book, ExecutionLogEntry } from './types';

/**
 * 今日いちばん読み始めやすい1冊を選ぶ。
 * 優先: 読みかけ → 直近で着手 → それ以外は先頭
 */
export function selectTodayBook(
  books: Book[],
  log: ExecutionLogEntry[],
  reservationBookId: string | null
): Book | null {
  if (books.length === 0) return null;
  if (reservationBookId && books.some((b) => b.id === reservationBookId)) {
    return books.find((b) => b.id === reservationBookId) ?? null;
  }

  const byBook = new Map<string, ExecutionLogEntry[]>();
  for (const e of log) {
    if (!byBook.has(e.bookId)) byBook.set(e.bookId, []);
    byBook.get(e.bookId)!.push(e);
  }
  const lastExec = (bookId: string) => {
    const entries = byBook.get(bookId) ?? [];
    if (entries.length === 0) return null;
    return entries.sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())[0];
  };

  const inProgress = books.filter((b) => byBook.has(b.id));
  const notStarted = books.filter((b) => !byBook.has(b.id));

  if (inProgress.length > 0) {
    inProgress.sort((a, b) => {
      const ta = lastExec(a.id)?.executedAt ?? '';
      const tb = lastExec(b.id)?.executedAt ?? '';
      return new Date(tb).getTime() - new Date(ta).getTime();
    });
    return inProgress[0];
  }
  return notStarted[0] ?? books[0];
}
