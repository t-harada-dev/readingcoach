import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('react-native', () => ({
  ActivityIndicator: () => React.createElement('i'),
  Image: () => React.createElement('img'),
  Platform: { select: (options: Record<string, unknown>) => options.default ?? options.ios ?? options.android ?? {} },
  ScrollView: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  StyleSheet: { create: (styles: unknown) => styles },
  Text: ({ children }: { children: React.ReactNode }) => React.createElement('span', null, children),
  TouchableOpacity: ({ children }: { children: React.ReactNode }) => React.createElement('button', null, children),
  View: ({ children, testID }: { children?: React.ReactNode; testID?: string }) =>
    React.createElement('div', { 'data-testid': testID }, children),
}));

import { FocusCoreView, type FocusCoreViewProps } from './FocusCoreView';

function buildProps(overrides: Partial<FocusCoreViewProps> = {}): FocusCoreViewProps {
  return {
    book: {
      id: 'book_1',
      title: 'Book A',
      format: 'paper',
      status: 'active',
    },
    plan: {
      planId: 'plan_1',
      planDate: '2026-03-13',
      bookId: 'book_1',
      state: 'scheduled',
      result: 'attempted',
      scheduledAt: '2026-03-13T00:00:00.000Z',
      retryCount: 0,
      snoozeCount: 0,
      consistencyCredit: false,
      continuousMissedDaysSnapshot: 0,
    },
    hasSelectedBook: true,
    loading: false,
    initStatus: 'ready',
    canManualChange: true,
    progressRatio: 0.5,
    showCompletedActions: false,
    headerMessage: 'Header message',
    mainMode: 'normal_15m',
    subMode: 'rescue_5m',
    rehabMode: null,
    intentCopy: 'intent',
    dailyQuote: null,
    sessionStartErrorText: null,
    startingMode: null,
    onPressChangeBook: vi.fn(),
    onPressResolveBook: vi.fn(),
    onPressPrimaryCTA: vi.fn(),
    onPressSecondaryCTA: vi.fn(),
    onPressRehabCTA: vi.fn(),
    onPressCompletedExtra5m: vi.fn(),
    onPressCompletedExtra15m: vi.fn(),
    ...overrides,
  };
}

describe('FocusCoreView progress visibility', () => {
  it('hides progress track when progressRatio is null', () => {
    const markup = renderToStaticMarkup(React.createElement(FocusCoreView, buildProps({ progressRatio: null })));
    expect(markup).not.toContain('focus-core-progress-track');
  });

  it('renders progress track when page progress is available', () => {
    const markup = renderToStaticMarkup(React.createElement(FocusCoreView, buildProps({ progressRatio: 0.4 })));
    expect(markup).toContain('focus-core-progress-track');
  });

  it('renders completed section in quote -> title -> CTA order', () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        FocusCoreView,
        buildProps({
          showCompletedActions: true,
          dailyQuote: { text: 'Quote', author: 'Author' },
        })
      )
    );

    const quoteAt = markup.indexOf('Quote');
    const titleAt = markup.indexOf('今日のセッションは完了しています');
    const ctaAt = markup.indexOf('もう 5 分やる');

    expect(quoteAt).toBeGreaterThanOrEqual(0);
    expect(titleAt).toBeGreaterThan(quoteAt);
    expect(ctaAt).toBeGreaterThan(titleAt);
  });
});
