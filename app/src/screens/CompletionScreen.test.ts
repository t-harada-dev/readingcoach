import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const ctaCalls: Array<{ label: string; onPress: () => void | Promise<void> }> = [];
const saveBookMock = vi.hoisted(() => vi.fn(async () => {}));
const getSettingsMock = vi.hoisted(() => vi.fn(async () => null));

vi.mock('react-native', () => ({
  StyleSheet: { create: (styles: unknown) => styles },
  Text: ({ children }: { children: React.ReactNode }) => React.createElement('span', null, children),
  View: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
}));

vi.mock('../components/CompletionFeedbackCard', () => ({
  CompletionFeedbackCard: () => React.createElement('section', null, 'feedback'),
}));

vi.mock('../components/SessionCTAButton', () => ({
  SessionCTAButton: (props: { label: string; onPress: () => void | Promise<void> }) => {
    ctaCalls.push({ label: props.label, onPress: props.onPress });
    return React.createElement('button', null, props.label);
  },
}));

vi.mock('../bridge/PersistenceBridge', () => ({
  persistenceBridge: {
    getSettings: getSettingsMock,
    saveBook: saveBookMock,
  },
}));

vi.mock('../domain/progressTrackingPolicy', () => ({
  shouldOfferProgressTracking: vi.fn(() => false),
}));

const startMock = vi.hoisted(() => vi.fn());
vi.mock('../useCases/StartSessionUseCase', () => ({
  runStartSessionUseCase: startMock,
}));

import { CompletionScreen } from './CompletionScreen';

describe('CompletionScreen', () => {
  beforeEach(() => {
    ctaCalls.length = 0;
    vi.clearAllMocks();
    getSettingsMock.mockResolvedValue(null);
    saveBookMock.mockResolvedValue(undefined);
    startMock.mockResolvedValue({
      sessionId: 's1',
      startedAt: '2026-03-10T10:00:00.000Z',
      bookTitle: 'Book',
      endTimeISO: '2026-03-10T10:15:00.000Z',
      durationSeconds: 900,
    });
  });

  it('SC-15 の CTA 順序（5分/15分/読了/閉じる）を維持する', () => {
    renderToStaticMarkup(
      React.createElement(CompletionScreen, {
        navigation: { replace: vi.fn(), navigate: vi.fn() },
        route: {
          params: {
            planId: 'p1',
            bookId: 'b1',
            bookTitle: 'Book',
            result: 'soft_success',
            elapsedSeconds: 300,
          },
        },
      })
    );

    expect(ctaCalls.map((c) => c.label)).toEqual(['もう 5 分やる', 'もう 15 分やる', '読了した', '閉じる / ホームへ戻る']);
  });

  it('先頭CTAで rescue_5m 開始になる', async () => {
    const replace = vi.fn();
    renderToStaticMarkup(
      React.createElement(CompletionScreen, {
        navigation: { replace, navigate: vi.fn() },
        route: {
          params: {
            planId: 'p1',
            bookId: 'b1',
            bookTitle: 'Book',
            result: 'soft_success',
            elapsedSeconds: 300,
          },
        },
      })
    );

    await ctaCalls[0]?.onPress();
    expect(startMock).toHaveBeenCalledWith({
      planId: 'p1',
      mode: 'rescue_5m',
      entryPoint: 'app',
    });
    expect(replace).toHaveBeenCalled();
  });

  it('読了保存失敗後に再試行でき、成功時に NextFocus へ遷移する', async () => {
    const navigate = vi.fn();
    saveBookMock
      .mockRejectedValueOnce(new Error('injected save failure'))
      .mockResolvedValueOnce(undefined);

    renderToStaticMarkup(
      React.createElement(CompletionScreen, {
        navigation: { replace: vi.fn(), navigate },
        route: {
          params: {
            planId: 'p1',
            bookId: 'b1',
            bookTitle: 'Book',
            result: 'soft_success',
            elapsedSeconds: 300,
          },
        },
      })
    );

    const finished = ctaCalls.find((c) => c.label === '読了した');
    expect(finished).toBeTruthy();

    await finished?.onPress();
    expect(navigate).not.toHaveBeenCalledWith('NextFocusNomination', expect.anything());

    await finished?.onPress();
    expect(navigate).toHaveBeenCalledWith('NextFocusNomination', {
      completedBookId: 'b1',
    });
    expect(saveBookMock).toHaveBeenCalledTimes(2);
  });
});
