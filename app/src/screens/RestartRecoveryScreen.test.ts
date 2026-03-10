import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const ctaCalls: Array<{ label: string; onPress: () => void | Promise<void> }> = [];

vi.mock('react-native', () => ({
  StyleSheet: { create: (styles: unknown) => styles },
  Text: ({ children }: { children: React.ReactNode }) => React.createElement('span', null, children),
  View: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
}));

vi.mock('../components/SessionCTAButton', () => ({
  SessionCTAButton: (props: { label: string; onPress: () => void | Promise<void> }) => {
    ctaCalls.push({ label: props.label, onPress: props.onPress });
    return React.createElement('button', null, props.label);
  },
}));

vi.mock('../bridge/PersistenceBridge', () => ({
  persistenceBridge: {
    getPlanForDate: vi.fn(async () => ({
      planId: 'p1',
      planDate: '2026-03-10',
      bookId: 'b1',
    })),
  },
}));

vi.mock('../useCases/ReconcilePlansUseCase', () => ({
  runReconcilePlansUseCase: vi.fn(async () => ({
    todayPlan: { planId: 'p1', planDate: '2026-03-10', bookId: 'b1' },
  })),
}));

vi.mock('../useCases/FindPlanUseCase', () => ({
  runFindPlanByIdUseCase: vi.fn(async () => null),
}));

const startMock = vi.hoisted(() => vi.fn());
vi.mock('../useCases/StartSessionUseCase', () => ({
  runStartSessionUseCase: startMock,
}));

import { RestartRecoveryScreen } from './RestartRecoveryScreen';

describe('RestartRecoveryScreen', () => {
  beforeEach(() => {
    ctaCalls.length = 0;
    vi.clearAllMocks();
    startMock.mockResolvedValue({
      planId: 'p1',
      sessionId: 's1',
      startedAt: '2026-03-10T10:00:00.000Z',
      bookTitle: 'Book',
      endTimeISO: '2026-03-10T10:01:00.000Z',
      durationSeconds: 60,
    });
  });

  it('SC-07 の CTA 順序を維持する', () => {
    renderToStaticMarkup(
      React.createElement(RestartRecoveryScreen, {
        navigation: { replace: vi.fn(), navigate: vi.fn() },
        route: { params: { planId: 'p1' } },
      })
    );
    expect(ctaCalls.map((c) => c.label)).toEqual([
      '1分だけ読んでみる',
      'ライブラリを開く',
      '時間を変える',
      '今日はやめる',
    ]);
  });

  it('「今日はやめる」で FocusCore に skipRestartOnce=true で戻る', async () => {
    const navigate = vi.fn();
    renderToStaticMarkup(
      React.createElement(RestartRecoveryScreen, {
        navigation: { replace: vi.fn(), navigate },
        route: { params: { planId: 'p1' } },
      })
    );

    await ctaCalls[3]?.onPress();
    expect(navigate).toHaveBeenCalledWith('FocusCore', { skipRestartOnce: true });
  });
});
