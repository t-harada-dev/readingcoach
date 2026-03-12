import type { FocusCoreViewProps } from '../../../screens/FocusCoreView';
import { fixtureBooks } from '../fixtures/books';
import { scenarioFixtures } from '../fixtures/scenarios';
import type { MockScenario } from '../types';

export function buildSC04Props(scenario: MockScenario): FocusCoreViewProps {
    const normalizedScenario =
        scenario === 'long_absence'
            ? 'rehab'
            : scenario === 'due' || scenario === 'empty' || scenario === 'no_cover' || scenario === 'cover_removed'
              ? 'normal'
              : scenario;
    const fixture = scenarioFixtures[normalizedScenario];
    const book = fixtureBooks[fixture.bookKey];

    return {
        book,
        plan: fixture.plan,
        loading: false,
        initStatus: 'ready',
        canManualChange: true,
        progressRatio: fixture.progressTrackingEnabled ? 0.42 : 0,
        mainMode: fixture.mainMode,
        subMode: fixture.subMode,
        rehabMode: fixture.rehabMode,
        intentCopy: '「人生は短いのではない。私たちがそれを浪費しているのだ」\n— セネカ',
        startingMode: null,
        onPressChangeBook: () => {},
        onPressPrimaryCTA: () => {},
        onPressSecondaryCTA: () => {},
        onPressRehabCTA: () => {},
    };
}
