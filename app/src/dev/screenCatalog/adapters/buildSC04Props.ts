import { copy } from '../../../config/copy';
import type { FocusCoreViewProps } from '../../../screens/FocusCoreView';
import { fixtureBooks } from '../fixtures/books';
import { scenarioFixtures, type CoreMockScenario } from '../fixtures/scenarios';
import type { MockScenario } from '../types';

export function buildSC04Props(scenario: MockScenario): FocusCoreViewProps {
    const normalizedScenario: CoreMockScenario =
        scenario === 'rehab'
            ? 'rehab'
            : scenario === 'long_absence'
              ? 'rehab'
              : scenario === 'due' || scenario === 'empty' || scenario === 'no_cover' || scenario === 'cover_removed'
                ? 'normal'
                : 'normal';
    const fixture = scenarioFixtures[normalizedScenario];
    const book = fixtureBooks[fixture.bookKey];

    return {
        book,
        plan: fixture.plan,
        hasSelectedBook: true,
        loading: false,
        initStatus: 'ready',
        canManualChange: true,
        progressRatio: fixture.progressTrackingEnabled ? 0.42 : 0,
        showCompletedActions: false,
        headerMessage: copy.focusCore.headerMessage,
        mainMode: fixture.mainMode,
        subMode: fixture.subMode,
        rehabMode: fixture.rehabMode,
        intentCopy: '「人生は短いのではない。私たちがそれを浪費しているのだ」\n— セネカ',
        dailyQuote: { text: '人生は短いのではない。私たちがそれを浪費しているのだ', author: 'セネカ' },
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
