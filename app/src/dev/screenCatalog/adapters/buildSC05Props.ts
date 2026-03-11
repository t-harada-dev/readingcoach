import type { FocusCoreViewProps } from '../../../screens/FocusCoreView';
import { scenarioFixtures } from '../fixtures/scenarios';
import type { MockScenario } from '../types';

export function buildSC05Props(scenario: MockScenario): FocusCoreViewProps {
  const fixture = scenarioFixtures[scenario === 'due' ? 'rehab' : scenario];

  return {
    book: null,
    plan: fixture.plan,
    loading: false,
    initStatus: 'ready',
    canManualChange: true,
    progressRatio: 0,
    mainMode: 'ignition_1m',
    subMode: 'rescue_5m',
    rehabMode: null,
    intentCopy: '今日は軽く始めるだけで十分です。1分だけでも前進です。',
    startingMode: null,
    onPressChangeBook: () => {},
    onPressOpenLibrary: () => {},
    onPressPrimaryCTA: () => {},
    onPressSecondaryCTA: () => {},
    onPressRehabCTA: () => {},
  };
}
