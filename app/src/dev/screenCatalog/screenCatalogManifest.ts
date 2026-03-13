import manifest from './screenCatalogManifest.json';
import type { MockScenario, ScreenId } from './types';

export type ScreenCatalogManifestItem = {
    screenId: ScreenId;
    title: string;
    defaultScenario: MockScenario;
    supportedScenarios: MockScenario[];
    screenshotKeyPrefix: string;
};

export const screenCatalogManifest = manifest as ScreenCatalogManifestItem[];
