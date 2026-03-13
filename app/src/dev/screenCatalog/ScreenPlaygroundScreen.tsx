import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { appTheme } from '../../theme/layout';
import type { ScreenProps } from '../../navigation/types';
import { DevNotice } from './components/DevNotice';
import { ScenarioPicker } from './components/ScenarioPicker';
import { screenCatalogManifest } from './screenCatalogManifest';
import { scenarioRegistry } from './scenarioRegistry';
import { screenRegistry, getScreenRegistryItem } from './screenRegistry';
import type { MockScenario, ScreenId } from './types';

const screenIdSet = new Set<ScreenId>(screenCatalogManifest.map((item) => item.screenId));
const scenarioSet = new Set<MockScenario>(scenarioRegistry.map((item) => item.scenario));

function isScreenId(value: unknown): value is ScreenId {
    return typeof value === 'string' && screenIdSet.has(value as ScreenId);
}

function isScenario(value: unknown): value is MockScenario {
    return typeof value === 'string' && scenarioSet.has(value as MockScenario);
}

export function ScreenPlaygroundScreen({ navigation, route }: ScreenProps<'DevScreenPlayground'>) {
    const params = route.params ?? {};
    const [screenId, setScreenId] = useState<ScreenId>(isScreenId(params.screenId) ? params.screenId : 'SC-04');
    const [scenario, setScenario] = useState<MockScenario>(isScenario(params.scenario) ? params.scenario : 'normal');
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        if (!isScreenId(params.screenId)) return;
        const nextScreen = getScreenRegistryItem(params.screenId);
        setScreenId(params.screenId);
        if (isScenario(params.scenario) && nextScreen.supportedScenarios.includes(params.scenario)) {
            setScenario(params.scenario);
            return;
        }
        setScenario(nextScreen.defaultScenario);
    }, [params.scenario, params.screenId]);

    const currentScreen = useMemo(() => getScreenRegistryItem(screenId), [screenId]);

    return (
        <View testID="screen-playground-screen" style={styles.screen}>
            <View style={styles.content}>
            <DevNotice compact={true} />
            <View style={styles.summaryRow}>
                <Text testID="playground-summary" style={styles.summaryText}>
                    {currentScreen.screenId} / {scenario}
                </Text>
                <View style={styles.summaryActions}>
                    <Pressable testID="back-to-catalog" style={styles.toggleBtn} onPress={() => navigation.navigate('DevScreenCatalog')}>
                        <Text style={styles.toggleBtnText}>一覧へ戻る</Text>
                    </Pressable>
                    <Pressable testID="playground-toggle-details" style={styles.toggleBtn} onPress={() => setShowDetails((v) => !v)}>
                        <Text style={styles.toggleBtnText}>{showDetails ? '詳細を閉じる' : '詳細を表示'}</Text>
                    </Pressable>
                </View>
            </View>

            {showDetails ? (
                <View style={styles.detailsPanel}>
                    <Text style={styles.meta}>screenshotKey: {currentScreen.buildScreenshotKey(scenario)}</Text>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.screenTabs}>
                        {screenRegistry.map((item) => {
                            const active = item.screenId === currentScreen.screenId;
                            return (
                                <Pressable
                                    key={item.screenId}
                                    style={[styles.screenTab, active ? styles.screenTabActive : null]}
                                    onPress={() => {
                                        setScreenId(item.screenId);
                                        setScenario(item.defaultScenario);
                                    }}
                                >
                                    <Text style={[styles.screenTabLabel, active ? styles.screenTabLabelActive : null]}>
                                        {item.screenId}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                    <ScenarioPicker options={currentScreen.supportedScenarios} selected={scenario} onSelect={setScenario} />
                </View>
            ) : null}

            <View testID={`playground-preview-${currentScreen.screenId}-${scenario}`} style={styles.previewCard}>
                {currentScreen.render(scenario)}
            </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: appTheme.colors.screenBackground,
    },
    summaryActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    content: {
        flex: 1,
        paddingHorizontal: appTheme.spacing.screenPaddingHorizontal,
        paddingTop: 12,
        paddingBottom: 32,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryText: {
        color: '#2C2C2C',
        fontSize: 16,
        fontWeight: '800',
    },
    toggleBtn: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(44,44,44,0.12)',
        backgroundColor: '#FFFFFF',
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    toggleBtnText: {
        color: '#4B5563',
        fontSize: 12,
        fontWeight: '700',
    },
    detailsPanel: {
        marginBottom: 4,
    },
    meta: {
        color: '#6B7280',
        fontSize: 12,
        marginBottom: 4,
    },
    screenTabs: {
        gap: 8,
        paddingVertical: 8,
    },
    screenTab: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(44,44,44,0.12)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#FFFFFF',
    },
    screenTabActive: {
        backgroundColor: '#2C2C2C',
        borderColor: '#2C2C2C',
    },
    screenTabLabel: {
        color: '#2C2C2C',
        fontSize: 12,
        fontWeight: '700',
    },
    screenTabLabelActive: {
        color: '#FFFFFF',
    },
    previewCard: {
        marginTop: 10,
        borderRadius: 24,
        overflow: 'hidden',
        minHeight: 720,
    },
});
