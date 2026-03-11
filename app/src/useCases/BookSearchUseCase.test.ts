import { beforeEach, describe, expect, it, vi } from 'vitest';

const bridgeMock = vi.hoisted(() => ({
  getLaunchArg: vi.fn(),
}));

vi.mock('../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

import { runBookSearchUseCase } from './BookSearchUseCase';

function mockLaunchArgs(args: Record<string, string | null>) {
  bridgeMock.getLaunchArg.mockImplementation(async (key: string) =>
    Object.prototype.hasOwnProperty.call(args, key) ? args[key] : null
  );
}

describe('runBookSearchUseCase', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockLaunchArgs({});
  });

  it('returns mock candidates when e2e mode is success', async () => {
    mockLaunchArgs({
      e2e_book_search_mode: 'success',
      e2e_book_candidate_placeholder: '1',
    });
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const result = await runBookSearchUseCase('DetoxBook');

    expect(result.length).toBe(2);
    expect(result[0]?.title).toContain('DetoxBook');
    expect(result[0]?.thumbnailUrl).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('calls Google Books API in live mode and maps response', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          {
            id: 'gb1',
            volumeInfo: {
              title: 'API Book',
              authors: ['Author A', 'Author B'],
              pageCount: 123,
              imageLinks: { thumbnail: 'http://example.com/thumb.jpg' },
            },
          },
        ],
      }),
    } as Response);

    const result = await runBookSearchUseCase('API Book');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      {
        stableId: 'gb1',
        googleBooksId: 'gb1',
        title: 'API Book',
        author: 'Author A, Author B',
        pageCount: 123,
        thumbnailUrl: 'https://example.com/thumb.jpg',
      },
    ]);
  });

  it('maps 429 response to SEARCH_429', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({}),
    } as Response);

    await expect(runBookSearchUseCase('quota')).rejects.toThrow('SEARCH_429');
  });

  it('maps 5xx response to SEARCH_5XX', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    } as Response);

    await expect(runBookSearchUseCase('server')).rejects.toThrow('SEARCH_5XX');
  });

  it('maps network failures to SEARCH_OFFLINE', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));

    await expect(runBookSearchUseCase('offline')).rejects.toThrow('SEARCH_OFFLINE');
  });
});
