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
import type { ScreenId, ScreenRegistryItem } from './types';

export const screenRegistry: ScreenRegistryItem[] = [
    {
        screenId: 'SC-04',
        title: 'Normal Home',
        defaultScenario: 'normal',
        supportedScenarios: ['normal', 'rehab'],
        buildScreenshotKey: (scenario) => `screen-catalog_SC-04_${scenario}`,
        render: (scenario) => <FocusCoreView {...buildSC04Props(scenario)} />,
    },
    {
        screenId: 'SC-05',
        title: 'Lightweight Home',
        defaultScenario: 'normal',
        supportedScenarios: ['normal', 'rehab'],
        buildScreenshotKey: (scenario) => `screen-catalog_SC-05_${scenario}`,
        render: (scenario) => <FocusCoreView {...buildSC05Props(scenario)} />,
    },
    {
        screenId: 'SC-06',
        title: 'Recovery Home (3+ missed)',
        defaultScenario: 'rehab',
        supportedScenarios: ['rehab', 'due'],
        buildScreenshotKey: (scenario) => `screen-catalog_SC-06_${scenario}`,
        render: (scenario) => <FocusCoreView {...buildSC06Props(scenario)} />,
    },
    {
        screenId: 'SC-07',
        title: 'Restart Recovery',
        defaultScenario: 'long_absence',
        supportedScenarios: ['long_absence'],
        buildScreenshotKey: (scenario) => `screen-catalog_SC-07_${scenario}`,
        render: (scenario) => <SC07CatalogPreview scenario={scenario} />,
    },
    {
        screenId: 'SC-12',
        title: 'Active Session',
        defaultScenario: 'normal',
        supportedScenarios: ['normal', 'rehab'],
        buildScreenshotKey: (scenario) => `screen-catalog_SC-12_${scenario}`,
        render: (scenario) => <ActiveSessionView {...buildSC12Props(scenario)} />,
    },
    {
        screenId: 'SC-14',
        title: 'Completion (Soft)',
        defaultScenario: 'rehab',
        supportedScenarios: ['rehab'],
        buildScreenshotKey: (scenario) => `screen-catalog_SC-14_${scenario}`,
        render: (scenario) => <CompletionView {...buildSC14Props(scenario)} />,
    },
    {
        screenId: 'SC-15',
        title: 'Completion (Hard)',
        defaultScenario: 'normal',
        supportedScenarios: ['normal'],
        buildScreenshotKey: (scenario) => `screen-catalog_SC-15_${scenario}`,
        render: (scenario) => <CompletionView {...buildSC15Props(scenario)} />,
    },
    {
        screenId: 'SC-20',
        title: 'Library',
        defaultScenario: 'normal',
        supportedScenarios: ['normal'],
        buildScreenshotKey: (scenario) => `screen-catalog_SC-20_${scenario}`,
        render: (scenario) => <LibraryView {...buildSC20Props(scenario)} />,
    },
    {
        screenId: 'SC-21',
        title: 'Book Detail',
        defaultScenario: 'normal',
        supportedScenarios: ['normal'],
        buildScreenshotKey: (scenario) => `screen-catalog_SC-21_${scenario}`,
        render: (scenario) => <BookDetailView {...buildSC21Props(scenario)} />,
    },
    {
        screenId: 'SC-23',
        title: 'Due Action Sheet',
        defaultScenario: 'due',
        supportedScenarios: ['due'],
        buildScreenshotKey: (scenario) => `screen-catalog_SC-23_${scenario}`,
        render: (scenario) => <SC23CatalogPreview scenario={scenario} />,
    },
];

export function getScreenRegistryItem(screenId: ScreenId): ScreenRegistryItem {
    const item = screenRegistry.find((candidate) => candidate.screenId === screenId);
    if (!item) {
        throw new Error(`Unknown screenId: ${screenId}`);
    }
    return item;
}
