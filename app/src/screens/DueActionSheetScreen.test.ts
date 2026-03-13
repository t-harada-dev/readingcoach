import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const ctaCalls: Array<{ label: string; tone: string; onPress: () => void | Promise<void> }> = [];

vi.mock('react-native', () => ({
  StyleSheet: { create: (styles: unknown) => styles },
  Image: () => React.createElement('img'),
  ImageBackground: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Text: ({ children }: { children: React.ReactNode }) => React.createElement('span', null, children),
  View: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
}));

vi.mock('../components/SessionCTAButton', () => ({
  SessionCTAButton: (props: { label: string; tone: string; onPress: () => void | Promise<void> }) => {
    ctaCalls.push({ label: props.label, tone: props.tone, onPress: props.onPress });
    return React.createElement('button', null, props.label);
  },
}));

const startMock = vi.hoisted(() => vi.fn());
const snoozeMock = vi.hoisted(() => vi.fn());
const findPlanMock = vi.hoisted(() => vi.fn());
const getBookMock = vi.hoisted(() => vi.fn());

vi.mock('../useCases/StartSessionUseCase', () => ({
  runStartSessionUseCase: startMock,
}));

vi.mock('../useCases/SnoozePlanUseCase', () => ({
  runSnoozePlanUseCase: snoozeMock,
}));

vi.mock('../useCases/FindPlanUseCase', () => ({
  runFindPlanByIdUseCase: findPlanMock,
}));

vi.mock('../bridge/PersistenceBridge', () => ({
  persistenceBridge: {
    getBook: getBookMock,
  },
}));

vi.mock('../components/BookCoverImage', () => ({
  BookCoverImage: () => React.createElement('img'),
}));

import { DueActionSheetScreen } from './DueActionSheetScreen';

describe('DueActionSheetScreen', () => {
  beforeEach(() => {
    ctaCalls.length = 0;
    vi.clearAllMocks();
    startMock.mockResolvedValue({
      sessionId: 's1',
      startedAt: '2026-03-10T10:00:00.000Z',
      bookTitle: 'Book',
      endTimeISO: '2026-03-10T10:15:00.000Z',
      durationSeconds: 900,
    });
    snoozeMock.mockResolvedValue(undefined);
    findPlanMock.mockResolvedValue({ planId: 'p1', bookId: 'book-1' });
    getBookMock.mockResolvedValue({
      id: 'book-1',
      title: 'Book',
      format: 'paper',
      status: 'active',
    });
  });

  it('SC-23 の CTA 配置（主CTAを最下段）を維持する', () => {
    renderToStaticMarkup(
      React.createElement(DueActionSheetScreen, {
        navigation: { replace: vi.fn(), goBack: vi.fn() } as any,
        route: { params: { planId: 'p1', defaultMode: 'normal_15m' } } as any,
      })
    );

    expect(ctaCalls.map((c) => c.label)).toEqual(['5分だけ', '30分延期', '開始']);
    expect(ctaCalls.map((c) => c.tone)).toEqual(['secondary', 'ghost', 'primary']);
  });

  it('通知起点では start の entryPoint が notification になる', async () => {
    const replace = vi.fn();
    renderToStaticMarkup(
      React.createElement(DueActionSheetScreen, {
        navigation: { replace, goBack: vi.fn() } as any,
        route: { params: { planId: 'p1', defaultMode: 'ignition_1m', entryPoint: 'notification' } } as any,
      })
    );

    await ctaCalls[2]?.onPress();

    expect(startMock).toHaveBeenCalledWith({
      planId: 'p1',
      mode: 'ignition_1m',
      entryPoint: 'notification',
    });
    expect(replace).toHaveBeenCalled();
  });
});
