import { persistenceBridge } from '../bridge/PersistenceBridge';

export type BookSearchCandidate = {
  stableId: string;
  googleBooksId?: string;
  title: string;
  author?: string;
  pageCount?: number;
  thumbnailUrl?: string;
};

type SearchMode = 'live' | 'success' | 'empty' | 'timeout' | '429' | '5xx' | 'offline';
type GoogleBooksResponse = {
  items?: Array<{
    id?: string;
    volumeInfo?: {
      title?: string;
      authors?: string[];
      pageCount?: number;
      imageLinks?: {
        thumbnail?: string;
        smallThumbnail?: string;
      };
    };
  }>;
};

const SEARCH_TIMEOUT_MS = 8000;

function normalizeMode(raw: string | null): SearchMode {
  if (!raw || raw.trim().length === 0) return 'live';
  switch ((raw ?? '').toLowerCase()) {
    case 'success':
      return 'success';
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
      return 'live';
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

function toHttps(url?: string): string | undefined {
  if (!url) return undefined;
  return url.replace(/^http:\/\//i, 'https://');
}

function mapGoogleBooksItems(items: GoogleBooksResponse['items']): BookSearchCandidate[] {
  if (!items || items.length === 0) return [];

  const mapped: Array<BookSearchCandidate | null> = items.map((item): BookSearchCandidate | null => {
    const volume = item.volumeInfo;
    const title = volume?.title?.trim();
    if (!item.id || !title) return null;

    return {
      stableId: item.id,
      googleBooksId: item.id,
      title,
      author: volume?.authors?.join(', '),
      pageCount: typeof volume?.pageCount === 'number' ? volume.pageCount : undefined,
      thumbnailUrl: toHttps(volume?.imageLinks?.thumbnail ?? volume?.imageLinks?.smallThumbnail),
    };
  });

  return mapped.filter((candidate): candidate is BookSearchCandidate => candidate !== null);
}

async function fetchFromGoogleBooks(query: string): Promise<BookSearchCandidate[]> {
  const normalized = query.trim();
  if (!normalized) return [];

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;
  const params = new URLSearchParams({
    q: normalized,
    maxResults: '10',
    printType: 'books',
    langRestrict: 'ja',
  });
  if (apiKey && apiKey.trim().length > 0) {
    params.set('key', apiKey.trim());
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId =
    controller !== null ? setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS) : null;

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?${params.toString()}`, {
      method: 'GET',
      signal: controller?.signal,
    });

    if (response.status === 429) {
      throw new Error('SEARCH_429');
    }
    if (response.status >= 500) {
      throw new Error('SEARCH_5XX');
    }
    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as GoogleBooksResponse;
    return mapGoogleBooksItems(payload.items);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('SEARCH_')) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('SEARCH_TIMEOUT');
    }
    throw new Error('SEARCH_OFFLINE');
  } finally {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  }
}

export async function runBookSearchUseCase(query: string): Promise<BookSearchCandidate[]> {
  const mode = normalizeMode(await persistenceBridge.getLaunchArg('e2e_book_search_mode'));
  const placeholder = (await persistenceBridge.getLaunchArg('e2e_book_candidate_placeholder')) === '1';

  if (mode === 'live') {
    return fetchFromGoogleBooks(query);
  }
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
