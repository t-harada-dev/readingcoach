import type { ReactElement } from 'react';

export type ScreenId =
    | 'SC-01'
    | 'SC-02'
    | 'SC-03'
    | 'SC-04'
    | 'SC-05'
    | 'SC-06'
    | 'SC-07'
    | 'SC-09'
    | 'SC-10'
    | 'SC-11'
    | 'SC-12'
    | 'SC-13'
    | 'SC-14'
    | 'SC-15'
    | 'SC-16'
    | 'SC-17'
    | 'SC-18'
    | 'SC-19'
    | 'SC-20'
    | 'SC-21'
    | 'SC-22'
    | 'SC-23'
    | 'SC-24'
    | 'SF-01'
    | 'SF-02'
    | 'SF-03'
    | 'SF-04'
    | 'SF-05'
    | 'SF-06'
    | 'SF-07'
    | 'SF-08'
    | 'SF-09';
export type MockScenario =
    | 'normal'
    | 'rehab'
    | 'long_absence'
    | 'due'
    | 'empty'
    | 'no_cover'
    | 'cover_removed'
    | 'already_has_data'
    | 'timeout_or_error'
    | 'no_result'
    | 'finished_book';

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
