import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('react-native', () => ({
  Image: () => React.createElement('img'),
  NativeModules: {},
  Platform: { select: (options: Record<string, unknown>) => options.default ?? options.ios ?? options.android ?? {} },
  StyleSheet: { create: (styles: unknown) => styles, absoluteFillObject: {} },
  Text: ({ children }: { children: React.ReactNode }) => React.createElement('span', null, children),
  TouchableOpacity: ({ children }: { children: React.ReactNode }) => React.createElement('button', null, children),
  View: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
}));

vi.mock('../components/BookCoverImage', () => ({
  BookCoverImage: () => React.createElement('img'),
}));

import { ActiveSessionView } from './ActiveSessionView';

describe('ActiveSessionView controls', () => {
  it('shows pause / finish / quit while session is active', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ActiveSessionView, {
        bookTitle: '深く考える技術',
        mode: 'normal_15m',
        durationSeconds: 900,
        remainingSeconds: 840,
        paused: false,
        done: false,
        completing: false,
        onPressPause: vi.fn(),
        onPressResume: vi.fn(),
        onPressFinishedBook: vi.fn(),
        onPressQuit: vi.fn(),
      })
    );

    expect(markup).toContain('一時中断');
    expect(markup).toContain('読み終わった');
    expect(markup).toContain('やめる（ホームに戻る）');
    expect(markup).not.toContain('再開');
  });

  it('shows resume / quit while session is paused', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ActiveSessionView, {
        bookTitle: '深く考える技術',
        mode: 'rescue_5m',
        durationSeconds: 300,
        remainingSeconds: 142,
        paused: true,
        done: false,
        completing: false,
        onPressPause: vi.fn(),
        onPressResume: vi.fn(),
        onPressFinishedBook: vi.fn(),
        onPressQuit: vi.fn(),
      })
    );

    expect(markup).toContain('一時中断中');
    expect(markup).toContain('再開');
    expect(markup).toContain('やめる（ホームに戻る）');
    expect(markup).not.toContain('読み終わった');
  });
});
