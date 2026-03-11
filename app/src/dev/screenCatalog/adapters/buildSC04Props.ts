import type { FocusCoreViewProps } from '../../../screens/FocusCoreView';
import { fixtureBooks } from '../fixtures/books';
import { scenarioFixtures } from '../fixtures/scenarios';
import type { MockScenario } from '../types';

export function buildSC04Props(scenario: MockScenario): FocusCoreViewProps {
    const fixture = scenarioFixtures[scenario === 'long_absence' ? 'rehab' : scenario === 'due' ? 'normal' : scenario];
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
        intentCopy: '読み切るより、今日は10ページ進めれば十分です。',
        startingMode: null,
        onPressChangeBook: () => {},
        onPressOpenLibrary: () => {},
        onPressPrimaryCTA: () => {},
        onPressSecondaryCTA: () => {},
        onPressRehabCTA: () => {},
    };
}
