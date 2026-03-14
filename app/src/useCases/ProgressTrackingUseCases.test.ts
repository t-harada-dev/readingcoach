import { beforeEach, describe, expect, it, vi } from 'vitest';

const bridgeMock = vi.hoisted(() => ({
  getSettings: vi.fn(),
  saveSettings: vi.fn(),
  saveBook: vi.fn(),
}));

vi.mock('../bridge/PersistenceBridge', () => ({
  persistenceBridge: bridgeMock,
}));

import {
  enableProgressTracking,
} from './EnableProgressTrackingUseCase';
import { skipProgressTrackingPrompt } from './SkipProgressTrackingUseCase';
import { updateBookProgress } from './UpdateBookProgressUseCase';

describe('ProgressTrackingUseCases', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 10, 9, 0, 0, 0));
    bridgeMock.getSettings.mockResolvedValue({
      dailyTargetTime: 8 * 60,
      defaultDuration: 15,
      retryLimit: 1,
      dayRolloverHour: 4,
      progressTrackingEnabled: false,
      progressPromptShown: false,
    });
    bridgeMock.saveSettings.mockResolvedValue(undefined);
    bridgeMock.saveBook.mockResolvedValue(undefined);
  });

  it('enableProgressTracking は設定を有効化して保存する', async () => {
    await enableProgressTracking({ source: 'post_completion' });

    expect(bridgeMock.saveSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        progressTrackingEnabled: true,
        progressPromptShown: true,
      })
    );
  });

  it('skipProgressTrackingPrompt は案内済みフラグのみ更新する', async () => {
    await skipProgressTrackingPrompt();

    expect(bridgeMock.saveSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        progressTrackingEnabled: false,
        progressPromptShown: true,
      })
    );
  });

  it('updateBookProgress は currentPage/pageCount を保存する', async () => {
    await updateBookProgress({
      bookId: 'b1',
      title: '本A',
      currentPage: 120,
      pageCount: 300,
    });

    expect(bridgeMock.saveBook).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'b1',
        title: '本A',
        currentPage: 120,
        pageCount: 300,
      })
    );
  });
});
