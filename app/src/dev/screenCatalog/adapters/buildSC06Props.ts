import type { FocusCoreViewProps } from '../../../screens/FocusCoreView';
import { fixtureBooks } from '../fixtures/books';
import { scenarioFixtures } from '../fixtures/scenarios';
import type { MockScenario } from '../types';

export function buildSC06Props(scenario: MockScenario): FocusCoreViewProps {
    const fixture = scenarioFixtures[scenario === 'normal' ? 'rehab' : scenario === 'long_absence' ? 'rehab' : scenario];
    const book = fixtureBooks[fixture.bookKey];
    const isDue = scenario === 'due';
    const intentCopy = isDue
        ? '予定時刻を過ぎています。今は「開始」か「5分だけ」で先に進めましょう。'
        : '3日空いても大丈夫。まずは1分だけ、読む姿勢を戻しましょう。';

    return {
        book,
        plan: isDue ? { ...fixture.plan, state: 'due' } : { ...fixture.plan, state: 'scheduled' },
        loading: false,
        initStatus: 'ready',
        canManualChange: false,
        progressRatio: isDue ? 0.03 : 0.12,
        mainMode: 'ignition_1m',
        subMode: 'rescue_5m',
        rehabMode: 'rehab_3m',
        intentCopy,
        startingMode: null,
        onPressChangeBook: () => {},
        onPressOpenLibrary: () => {},
        onPressPrimaryCTA: () => {},
        onPressSecondaryCTA: () => {},
        onPressRehabCTA: () => {},
    };
}
