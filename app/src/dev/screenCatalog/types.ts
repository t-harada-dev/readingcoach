import type { ReactElement } from 'react';

export type ScreenId =
    | 'SC-04'
    | 'SC-05'
    | 'SC-06'
    | 'SC-07'
    | 'SC-12'
    | 'SC-14'
    | 'SC-15'
    | 'SC-20'
    | 'SC-21'
    | 'SC-23';
export type MockScenario = 'normal' | 'rehab' | 'long_absence' | 'due';

export type ScenarioRegistryItem = {
    scenario: MockScenario;
    label: string;
    description: string;
};

export type ScreenRegistryItem = {
    screenId: ScreenId;
    title: string;
    defaultScenario: MockScenario;
    supportedScenarios: MockScenario[];
    buildScreenshotKey: (scenario: MockScenario) => string;
    render: (scenario: MockScenario) => ReactElement;
};
