import React from 'react';

import { ActiveSessionView } from '../../screens/ActiveSessionView';
import { BookDetailView } from '../../screens/BookDetailView';
import { CompletionView } from '../../screens/CompletionView';
import { FocusCoreView } from '../../screens/FocusCoreView';
import { LibraryView } from '../../screens/LibraryView';
import { buildSC04Props } from './adapters/buildSC04Props';
import { buildSC05Props } from './adapters/buildSC05Props';
import { buildSC06Props } from './adapters/buildSC06Props';
import { buildSC12Props } from './adapters/buildSC12Props';
import { buildSC14Props } from './adapters/buildSC14Props';
import { buildSC15Props } from './adapters/buildSC15Props';
import { buildSC20Props } from './adapters/buildSC20Props';
import { buildSC21Props } from './adapters/buildSC21Props';
import { SC07CatalogPreview } from './adapters/buildSC07Props';
import { SC23CatalogPreview } from './adapters/buildSC23Props';
import { screenCatalogManifest } from './screenCatalogManifest';
import type { MockScenario, ScreenId, ScreenRegistryItem } from './types';

const renderByScreenId: Record<ScreenId, (scenario: MockScenario) => React.ReactElement> = {
    'SC-04': (scenario) => <FocusCoreView {...buildSC04Props(scenario)} />,
    'SC-05': (scenario) => <FocusCoreView {...buildSC05Props(scenario)} />,
    'SC-06': (scenario) => <FocusCoreView {...buildSC06Props(scenario)} />,
    'SC-07': (scenario) => <SC07CatalogPreview scenario={scenario} />,
    'SC-12': (scenario) => <ActiveSessionView {...buildSC12Props(scenario)} />,
    'SC-14': (scenario) => <CompletionView {...buildSC14Props(scenario)} />,
    'SC-15': (scenario) => <CompletionView {...buildSC15Props(scenario)} />,
    'SC-20': (scenario) => <LibraryView {...buildSC20Props(scenario)} />,
    'SC-21': (scenario) => <BookDetailView {...buildSC21Props(scenario)} />,
    'SC-23': (scenario) => <SC23CatalogPreview scenario={scenario} />,
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
