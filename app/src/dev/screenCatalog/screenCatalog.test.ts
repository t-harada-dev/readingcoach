import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('react-native', () => ({
    ActivityIndicator: () => React.createElement('div', null, 'loading'),
    FlatList: ({ data, renderItem }: { data: unknown[]; renderItem: ({ item }: { item: any }) => React.ReactNode }) =>
        React.createElement('div', null, ...(data ?? []).map((item, index) => React.createElement('div', { key: index }, renderItem({ item })))),
    Image: () => React.createElement('img'),
    ImageBackground: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    Platform: { select: (options: Record<string, unknown>) => options.default ?? options.ios ?? options.android ?? {} },
    Pressable: ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) =>
        React.createElement('button', { onClick: onPress }, children),
    ScrollView: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    StyleSheet: { create: (styles: unknown) => styles, absoluteFillObject: {} },
    Switch: ({ value }: { value: boolean }) => React.createElement('input', { type: 'checkbox', checked: value, readOnly: true }),
    Text: ({ children }: { children: React.ReactNode }) => React.createElement('span', null, children),
    TextInput: ({ value }: { value?: string }) => React.createElement('input', { value }),
    TouchableOpacity: ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) =>
        React.createElement('button', { onClick: onPress }, children),
    View: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
}));

vi.mock('../../components/BookCoverImage', () => ({
    BookCoverImage: () => React.createElement('img'),
}));

import { ScreenCatalogScreen } from './ScreenCatalogScreen';
import { screenCatalogManifest } from './screenCatalogManifest';
import { screenRegistry } from './screenRegistry';

describe('screen catalog', () => {
    it('registers the requested screens', () => {
        expect(screenRegistry.map((item) => item.screenId)).toEqual(screenCatalogManifest.map((item) => item.screenId));
    });

    it('keeps manifest and registry metadata aligned', () => {
        expect(
            screenRegistry.map((item) => ({
                screenId: item.screenId,
                title: item.title,
                defaultScenario: item.defaultScenario,
                supportedScenarios: item.supportedScenarios,
                screenshotKey: item.buildScreenshotKey(item.defaultScenario),
            }))
        ).toEqual(
            screenCatalogManifest.map((item) => ({
                screenId: item.screenId,
                title: item.title,
                defaultScenario: item.defaultScenario,
                supportedScenarios: item.supportedScenarios,
                screenshotKey: `${item.screenshotKeyPrefix}_${item.defaultScenario}`,
            }))
        );
    });

    it('renders the catalog list with screen ids and titles', () => {
        const markup = renderToStaticMarkup(
            React.createElement(ScreenCatalogScreen, {
                navigation: { navigate: vi.fn() },
            })
        );

        expect(markup).toContain('SC-04');
        expect(markup).toContain('Normal Home');
        expect(markup).toContain('SC-20');
        expect(markup).toContain('Library');
        expect(markup).toContain('SC-23');
        expect(markup).toContain('Due Action Sheet');
    });

    it('renders each screen entry with its default scenario', () => {
        for (const item of screenRegistry) {
            const markup = renderToStaticMarkup(item.render(item.defaultScenario));
            expect(markup.length).toBeGreaterThan(0);
        }
    });
});
