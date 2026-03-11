import { persistenceBridge } from '../bridge/PersistenceBridge';

export type BookSearchCandidate = {
  stableId: string;
  title: string;
  author?: string;
  pageCount?: number;
  thumbnailUrl?: string;
};

type SearchMode = 'success' | 'empty' | 'timeout' | '429' | '5xx' | 'offline';

function normalizeMode(raw: string | null): SearchMode {
  switch ((raw ?? '').toLowerCase()) {
    case 'empty':
      return 'empty';
    case 'timeout':
      return 'timeout';
    case '429':
      return '429';
    case '5xx':
      return '5xx';
    case 'offline':
      return 'offline';
    default:
      return 'success';
  }
}

function makeCandidates(query: string, withPlaceholder = false): BookSearchCandidate[] {
  const q = query.trim() || 'Sample';
  return [
    {
      stableId: 'c1',
      title: `${q} 入門`,
      author: '著者A',
      pageCount: 320,
      thumbnailUrl: withPlaceholder ? undefined : 'https://example.invalid/cover-a.jpg',
    },
    {
      stableId: 'c2',
      title: `${q} 実践`,
      author: '著者B',
      pageCount: 240,
      thumbnailUrl: withPlaceholder ? undefined : 'https://example.invalid/cover-b.jpg',
    },
  ];
}

export async function runBookSearchUseCase(query: string): Promise<BookSearchCandidate[]> {
  const mode = normalizeMode(await persistenceBridge.getLaunchArg('e2e_book_search_mode'));
  const placeholder = (await persistenceBridge.getLaunchArg('e2e_book_candidate_placeholder')) === '1';

  if (mode === 'success') {
    return makeCandidates(query, placeholder);
  }
  if (mode === 'empty') {
    return [];
  }
  if (mode === 'timeout') {
    throw new Error('SEARCH_TIMEOUT');
  }
  if (mode === '429') {
    throw new Error('SEARCH_429');
  }
  if (mode === '5xx') {
    throw new Error('SEARCH_5XX');
  }
  throw new Error('SEARCH_OFFLINE');
}
