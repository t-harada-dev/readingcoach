import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('react-native', () => ({
    ActivityIndicator: () => React.createElement('div', null, 'loading'),
    FlatList: ({ data, renderItem }: { data: unknown[]; renderItem: ({ item }: { item: any }) => React.ReactNode }) =>
        React.createElement('div', null, ...(data ?? []).map((item, index) => React.createElement('div', { key: index }, renderItem({ item })))),
    Image: () => React.createElement('img'),
    ImageBackground: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    NativeModules: {},
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

vi.mock('../../notifications', () => ({
    requestPermission: vi.fn(async () => true),
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

        expect(markup).toContain('SC-01');
        expect(markup).toContain('Onboarding Add Book');
        expect(markup).toContain('SC-04');
        expect(markup).toContain('Normal Home');
        expect(markup).toContain('SC-20');
        expect(markup).toContain('Library');
        expect(markup).toContain('SC-23');
        expect(markup).toContain('Due Action Sheet');
        expect(markup).toContain('SF-03');
        expect(markup).toContain('Notification Surface (Normal)');
    });

    it('renders each screen entry with its default scenario', () => {
        for (const item of screenRegistry) {
            const markup = renderToStaticMarkup(item.render(item.defaultScenario));
            expect(markup.length).toBeGreaterThan(0);
        }
    });

    it('SC-21 renders progress label/value, cover section, and updated focus copy', () => {
        const sc21 = screenRegistry.find((item) => item.screenId === 'SC-21');
        expect(sc21).toBeTruthy();

        for (const scenario of ['normal', 'rehab', 'no_cover', 'cover_removed'] as const) {
            const markup = renderToStaticMarkup(sc21!.render(scenario));
            expect(markup).toContain('進捗バー設定');
            expect(markup).toContain(scenario === 'rehab' ? 'OFF' : 'ON');
            expect(markup).toContain('表紙画像');
            expect(markup).toContain('カメラで撮影');
            expect(markup).toContain('端末から選択');
            expect(markup).toContain('表紙画像を削除');
            expect(markup).toContain('この本を読む');
        }
    });

    it('renders representative newly added screens', () => {
        const sc09 = screenRegistry.find((item) => item.screenId === 'SC-09');
        const sc19 = screenRegistry.find((item) => item.screenId === 'SC-19');
        const sc03 = screenRegistry.find((item) => item.screenId === 'SC-03');
        const sc22 = screenRegistry.find((item) => item.screenId === 'SC-22');
        const sc24 = screenRegistry.find((item) => item.screenId === 'SC-24');
        const sf03 = screenRegistry.find((item) => item.screenId === 'SF-03');
        expect(sc09).toBeTruthy();
        expect(sc19).toBeTruthy();
        expect(sc03).toBeTruthy();
        expect(sc22).toBeTruthy();
        expect(sc24).toBeTruthy();
        expect(sf03).toBeTruthy();

        expect(renderToStaticMarkup(sc09!.render('timeout_or_error'))).toContain('本を追加する');
        const sc19Markup = renderToStaticMarkup(sc19!.render('finished_book'));
        expect(sc19Markup).toContain('次の本を選択しましょう');
        expect(sc19Markup).toContain('この本を読んでいます');
        expect(sc19Markup).not.toContain('候補');
        expect(renderToStaticMarkup(sc03!.render('already_has_data'))).toContain('通知は有効です');
        expect(renderToStaticMarkup(sc22!.render('normal'))).toContain('読書時間を保存');
        expect(renderToStaticMarkup(sc24!.render('normal'))).toContain('一時中断');
        expect(renderToStaticMarkup(sc24!.render('normal'))).toContain('読み終わった');
        expect(renderToStaticMarkup(sc24!.render('normal'))).toContain('やめる（ホームに戻る）');
        expect(renderToStaticMarkup(sf03!.render('normal'))).toContain('予定時刻通知（通常）');
    });

    it('SC-11 switches primary CTA label only for no_result', () => {
        const sc11 = screenRegistry.find((item) => item.screenId === 'SC-11');
        expect(sc11).toBeTruthy();

        const normalMarkup = renderToStaticMarkup(sc11!.render('normal'));
        const noResultMarkup = renderToStaticMarkup(sc11!.render('no_result'));

        expect(normalMarkup).toContain('この本を追加する');
        expect(normalMarkup).toContain('この本を読んでいます');
        expect(normalMarkup).not.toContain('候補');
        expect(noResultMarkup).toContain('戻る');
        expect(noResultMarkup).not.toContain('この本を追加する');
    });
});
