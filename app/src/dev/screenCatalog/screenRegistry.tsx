import React from 'react';

import { ActiveSessionView } from '../../screens/ActiveSessionView';
import { BookDetailView } from '../../screens/BookDetailView';
import { CompletionView } from '../../screens/CompletionView';
import { FocusCoreView } from '../../screens/FocusCoreView';
import { LibraryView } from '../../screens/LibraryView';
import { OnboardingNotificationScreen } from '../../screens/OnboardingNotificationScreen';
import { OnboardingTimeScreen } from '../../screens/OnboardingTimeScreen';
import { ProgressTrackingPromptScreen } from '../../screens/ProgressTrackingPromptScreen';
import { ProgressTrackingSetupScreen } from '../../screens/ProgressTrackingSetupScreen';
import { TimeChangeScreen } from '../../screens/TimeChangeScreen';
import { buildSC04Props } from './adapters/buildSC04Props';
import { buildSC05Props } from './adapters/buildSC05Props';
import { buildSC06Props } from './adapters/buildSC06Props';
import { buildSC12Props } from './adapters/buildSC12Props';
import { buildSC13Props } from './adapters/buildSC13Props';
import { buildSC14Props } from './adapters/buildSC14Props';
import { buildSC15Props } from './adapters/buildSC15Props';
import { buildSC20Props } from './adapters/buildSC20Props';
import { buildSC21Props } from './adapters/buildSC21Props';
import { buildSC24Props } from './adapters/buildSC24Props';
import {
    SC01CatalogPreview,
    SC09CatalogPreview,
    SC10CatalogPreview,
    SC11CatalogPreview,
    SC18CatalogPreview,
    SC19CatalogPreview,
    SFCatalogPreview,
} from './adapters/catalogStaticPreviews';
import { SC07CatalogPreview } from './adapters/buildSC07Props';
import { SC23CatalogPreview } from './adapters/buildSC23Props';
import { fixtureBooks } from './fixtures/books';
import { screenCatalogManifest } from './screenCatalogManifest';
import type { MockScenario, ScreenId, ScreenRegistryItem } from './types';

const stubNavigation = {
    navigate: () => {},
    replace: () => {},
    reset: () => {},
    goBack: () => {},
};

const renderByScreenId: Record<ScreenId, (scenario: MockScenario) => React.ReactElement> = {
    'SC-01': (scenario) => <SC01CatalogPreview scenario={scenario} />,
    'SC-02': () => <OnboardingTimeScreen navigation={stubNavigation} />,
    'SC-03': (scenario) => (
        <OnboardingNotificationScreen
            navigation={stubNavigation}
            route={{ params: { forceNotificationsEnabled: scenario === 'already_has_data' } }}
        />
    ),
    'SC-04': (scenario) => <FocusCoreView {...buildSC04Props(scenario)} />,
    'SC-05': (scenario) => <FocusCoreView {...buildSC05Props(scenario)} />,
    'SC-06': (scenario) => <FocusCoreView {...buildSC06Props(scenario)} />,
    'SC-07': (scenario) => <SC07CatalogPreview scenario={scenario} />,
    'SC-09': (scenario) => <SC09CatalogPreview scenario={scenario} />,
    'SC-10': (scenario) => <SC10CatalogPreview scenario={scenario} />,
    'SC-11': (scenario) => <SC11CatalogPreview scenario={scenario} />,
    'SC-12': (scenario) => <ActiveSessionView {...buildSC12Props(scenario)} />,
    'SC-13': (scenario) => <ActiveSessionView {...buildSC13Props(scenario)} />,
    'SC-14': (scenario) => <CompletionView {...buildSC14Props(scenario)} />,
    'SC-15': (scenario) => <CompletionView {...buildSC15Props(scenario)} />,
    'SC-16': (scenario) => (
        <ProgressTrackingPromptScreen
            navigation={stubNavigation}
            route={{
                params: {
                    bookId: fixtureBooks.standardBook.id,
                    bookTitle: scenario === 'rehab' ? fixtureBooks.lightweightBook.title : fixtureBooks.standardBook.title,
                },
            }}
        />
    ),
    'SC-17': (scenario) => (
        <ProgressTrackingSetupScreen
            navigation={stubNavigation}
            route={{
                params: {
                    bookId: scenario === 'rehab' ? fixtureBooks.missingCoverBook.id : fixtureBooks.standardBook.id,
                    bookTitle: scenario === 'rehab' ? fixtureBooks.missingCoverBook.title : fixtureBooks.standardBook.title,
                    bookAuthor: scenario === 'rehab' ? fixtureBooks.missingCoverBook.author : fixtureBooks.standardBook.author,
                    bookThumbnailUrl: scenario === 'rehab' ? undefined : fixtureBooks.standardBook.thumbnailUrl,
                    bookCoverSource: scenario === 'rehab' ? 'placeholder' : fixtureBooks.standardBook.coverSource,
                },
            }}
        />
    ),
    'SC-18': (scenario) => <SC18CatalogPreview scenario={scenario} />,
    'SC-19': (scenario) => <SC19CatalogPreview scenario={scenario} />,
    'SC-20': (scenario) => <LibraryView {...buildSC20Props(scenario)} />,
    'SC-21': (scenario) => <BookDetailView {...buildSC21Props(scenario)} />,
    'SC-22': () => <TimeChangeScreen navigation={stubNavigation} />,
    'SC-23': (scenario) => <SC23CatalogPreview scenario={scenario} />,
    'SC-24': (scenario) => <ActiveSessionView {...buildSC24Props(scenario)} />,
    'SF-01': (scenario) => <SFCatalogPreview surfaceId="SF-01" scenario={scenario} />,
    'SF-02': (scenario) => <SFCatalogPreview surfaceId="SF-02" scenario={scenario} />,
    'SF-03': (scenario) => <SFCatalogPreview surfaceId="SF-03" scenario={scenario} />,
    'SF-04': (scenario) => <SFCatalogPreview surfaceId="SF-04" scenario={scenario} />,
    'SF-05': (scenario) => <SFCatalogPreview surfaceId="SF-05" scenario={scenario} />,
    'SF-06': (scenario) => <SFCatalogPreview surfaceId="SF-06" scenario={scenario} />,
    'SF-07': (scenario) => <SFCatalogPreview surfaceId="SF-07" scenario={scenario} />,
    'SF-08': (scenario) => <SFCatalogPreview surfaceId="SF-08" scenario={scenario} />,
    'SF-09': (scenario) => <SFCatalogPreview surfaceId="SF-09" scenario={scenario} />,
};

export const screenRegistry: ScreenRegistryItem[] = screenCatalogManifest.map((item) => ({
    screenId: item.screenId,
    title: item.title,
    defaultScenario: item.defaultScenario,
    supportedScenarios: [...item.supportedScenarios],
    buildScreenshotKey: (scenario) => `${item.screenshotKeyPrefix}_${scenario}`,
    render: (scenario) => renderByScreenId[item.screenId](scenario),
}));

export function getScreenRegistryItem(screenId: ScreenId): ScreenRegistryItem {
    const item = screenRegistry.find((candidate) => candidate.screenId === screenId);
    if (!item) {
        throw new Error(`Unknown screenId: ${screenId}`);
    }
    return item;
}
