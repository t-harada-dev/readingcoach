import { beforeEach, describe, expect, it, vi } from 'vitest';

type SettingsState = {
  dailyTargetTime: number;
  defaultDuration: number;
  retryLimit: number;
  dayRolloverHour: number;
  progressTrackingEnabled: boolean;
  progressPromptShown: boolean;
};

type BookState = {
  id: string;
  title: string;
  status: string;
  format: string;
  pageCount?: number;
  currentPage?: number;
  lastProgressUpdatedAt?: string;
};

const state = vi.hoisted(() => ({
  settings: null as SettingsState | null,
  books: new Map<string, BookState>(),
}));

const bridgeMock = vi.hoisted(() => ({
  getSettings: vi.fn(async () => state.settings),
  saveSettings: vi.fn(async (next: SettingsState) => {
    state.settings = { ...next };
  }),
  saveBook: vi.fn(async (params: Partial<BookState> & { id: string; title: string }) => {
    const prev = state.books.get(params.id) ?? {
      id: params.id,
      title: params.title,
      status: 'active',
      format: 'paper',
    };
    state.books.set(params.id, { ...prev, ...params });
  }),
}));

vi.mock('../../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

import { enableProgressTracking, updateBookProgress } from '../ProgressTrackingUseCases';

describe('ProgressTrackingSave integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 11, 9, 0, 0, 0));

    state.settings = {
      dailyTargetTime: 21 * 60,
      defaultDuration: 15,
      retryLimit: 1,
      dayRolloverHour: 4,
      progressTrackingEnabled: false,
      progressPromptShown: false,
    };

    state.books.clear();
    state.books.set('book_1', {
      id: 'book_1',
      title: 'Book A',
      status: 'active',
      format: 'paper',
    });
  });

  // TC-CMP-07I: 保存後の truth source（settings/book）を integration で担保
  it('persists progress settings and book page values after setup save', async () => {
    await enableProgressTracking({ source: 'post_completion' });
    await updateBookProgress({
      bookId: 'book_1',
      title: 'Book A',
      pageCount: 320,
      currentPage: 120,
    });

    const saved = state.books.get('book_1');
    expect(saved?.pageCount).toBe(320);
    expect(saved?.currentPage).toBe(120);
    expect(saved?.lastProgressUpdatedAt).toBeTruthy();
    expect(state.settings?.progressTrackingEnabled).toBe(true);
    expect(state.settings?.progressPromptShown).toBe(true);
  });
});
