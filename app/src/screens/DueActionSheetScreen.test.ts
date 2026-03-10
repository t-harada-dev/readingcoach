import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const ctaCalls: Array<{ label: string; tone: string; onPress: () => void | Promise<void> }> = [];

vi.mock('react-native', () => ({
  StyleSheet: { create: (styles: unknown) => styles },
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

vi.mock('../useCases/StartSessionUseCase', () => ({
  runStartSessionUseCase: startMock,
}));

vi.mock('../useCases/SnoozePlanUseCase', () => ({
  runSnoozePlanUseCase: snoozeMock,
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
  });

  it('SC-23 の CTA 順序（開始/5分/30分延期）を維持する', () => {
    renderToStaticMarkup(
      React.createElement(DueActionSheetScreen, {
        navigation: { replace: vi.fn(), goBack: vi.fn() },
        route: { params: { planId: 'p1', defaultMode: 'normal_15m' } },
      })
    );

    expect(ctaCalls.map((c) => c.label)).toEqual(['開始', '5分だけ', '30分延期']);
    expect(ctaCalls.map((c) => c.tone)).toEqual(['primary', 'secondary', 'ghost']);
  });

  it('通知起点では start の entryPoint が notification になる', async () => {
    const replace = vi.fn();
    renderToStaticMarkup(
      React.createElement(DueActionSheetScreen, {
        navigation: { replace, goBack: vi.fn() },
        route: { params: { planId: 'p1', defaultMode: 'ignition_1m', entryPoint: 'notification' } },
      })
    );

    await ctaCalls[0]?.onPress();

    expect(startMock).toHaveBeenCalledWith({
      planId: 'p1',
      mode: 'ignition_1m',
      entryPoint: 'notification',
    });
    expect(replace).toHaveBeenCalled();
  });
});
