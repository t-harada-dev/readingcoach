import { copy } from '../../../config/copy';
import type { FocusCoreViewProps } from '../../../screens/FocusCoreView';
import { fixtureBooks } from '../fixtures/books';
import { scenarioFixtures, type CoreMockScenario } from '../fixtures/scenarios';
import type { MockScenario } from '../types';

export function buildSC06Props(_scenario: MockScenario): FocusCoreViewProps {
    const normalizedScenario: CoreMockScenario = 'rehab';
    const fixture = scenarioFixtures[normalizedScenario];
    const book = fixtureBooks[fixture.bookKey];
    const intentCopy = '3日空いても大丈夫。今日は短くても、読書を再開できれば十分です。';

    return {
        book,
        plan: { ...fixture.plan, state: 'scheduled' },
        hasSelectedBook: true,
        loading: false,
        initStatus: 'ready',
        canManualChange: false,
        progressRatio: 0.12,
        showCompletedActions: false,
        headerMessage: copy.focusCore.headerMessage,
        mainMode: 'ignition_1m',
        subMode: 'rescue_5m',
        rehabMode: null,
        intentCopy,
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
