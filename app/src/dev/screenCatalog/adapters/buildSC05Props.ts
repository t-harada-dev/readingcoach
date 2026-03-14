import { copy } from '../../../config/copy';
import type { FocusCoreViewProps } from '../../../screens/FocusCoreView';
import { scenarioFixtures, type CoreMockScenario } from '../fixtures/scenarios';
import type { MockScenario } from '../types';

export function buildSC05Props(scenario: MockScenario): FocusCoreViewProps {
  const normalizedScenario: CoreMockScenario =
    scenario === 'rehab'
      ? 'rehab'
      : scenario === 'due' || scenario === 'empty' || scenario === 'no_cover' || scenario === 'cover_removed'
        ? 'rehab'
        : 'normal';
  const fixture = scenarioFixtures[normalizedScenario];

  return {
    book: null,
    plan: fixture.plan,
    hasSelectedBook: false,
    loading: false,
    initStatus: 'ready',
    canManualChange: true,
    progressRatio: null,
    showCompletedActions: false,
    headerMessage: copy.focusCore.headerMessage,
    mainMode: 'ignition_1m',
    subMode: 'rescue_5m',
    rehabMode: null,
    intentCopy: '今日は軽く始めるだけで十分です。1分だけでも前進です。',
    dailyQuote: null,
    startingMode: null,
    onPressChangeBook: () => {},
    onPressResolveBook: () => {},
    onPressPrimaryCTA: () => {},
    onPressSecondaryCTA: () => {},
    onPressRehabCTA: () => {},
    onPressCompletedExtra5m: () => {},
    onPressCompletedExtra15m: () => {},
  };
}
