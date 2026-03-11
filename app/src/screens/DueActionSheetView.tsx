import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SessionCTAButton } from '../components/SessionCTAButton';
import { copy } from '../config/copy';
import { dueActionOrder } from './screenPolicy';
import { appTheme } from '../theme/layout';

type DueActionMode = 'normal_15m' | 'ignition_1m' | 'rescue_5m';

export type DueActionSheetViewProps = {
    busy: boolean;
    defaultMode: 'normal_15m' | 'ignition_1m';
    onPressStart: (mode: DueActionMode) => void;
    onPressSnooze: () => void;
};

export function DueActionSheetView({
    busy,
    defaultMode,
    onPressStart,
    onPressSnooze,
}: DueActionSheetViewProps) {
    const actions = dueActionOrder();

    return (
        <View testID="due-action-sheet" style={styles.container}>
            <View style={styles.sheet}>
                <Text style={styles.title}>{copy.dueAction.title}</Text>
                <Text style={styles.subtitle}>{copy.dueAction.subtitle}</Text>
                {actions.map((action) => {
                    if (action === 'start') {
                        return (
                            <SessionCTAButton
                                key={action}
                                testID="due-action-start"
                                tone="primary"
                                label={copy.dueAction.ctaStart}
                                onPress={() => onPressStart(defaultMode)}
                                disabled={busy}
                            />
                        );
                    }
                    if (action === 'rescue_5m') {
                        return (
                            <SessionCTAButton
                                key={action}
                                testID="due-action-start-5m"
                                tone="secondary"
                                label={copy.dueAction.cta5m}
                                onPress={() => onPressStart('rescue_5m')}
                                disabled={busy}
                            />
                        );
                    }
                    return (
                        <SessionCTAButton
                            key={action}
                            testID="due-action-snooze-30m"
                            tone="ghost"
                            label={copy.dueAction.ctaSnooze}
                            onPress={onPressSnooze}
                            disabled={busy}
                        />
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.16)',
    },
    sheet: {
        backgroundColor: appTheme.colors.screenBackground,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        paddingHorizontal: 18,
        paddingTop: 16,
        paddingBottom: 24,
    },
    title: {
        color: '#2C2C2C',
        fontSize: 18,
        fontWeight: '700',
    },
    subtitle: {
        color: '#6B7280',
        fontSize: 13,
        marginTop: 6,
        marginBottom: 8,
    },
});
