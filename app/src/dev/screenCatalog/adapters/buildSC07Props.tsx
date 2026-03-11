import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RestartRecoveryView } from '../../../screens/RestartRecoveryView';
import { appTheme } from '../../../theme/layout';
import type { MockScenario } from '../types';

export function buildSC07Props(_scenario: MockScenario) {
    return {
        busy: false,
        errorText: null,
    };
}

export function SC07CatalogPreview({ scenario }: { scenario: MockScenario }) {
    const [actionLog, setActionLog] = useState<string[]>([]);
    const props = buildSC07Props(scenario);

    return (
        <View style={styles.container}>
            <RestartRecoveryView
                {...props}
                onPressStartIgnition={() => setActionLog((current) => [`start:ignition_1m`, ...current].slice(0, 4))}
                onPressOpenLibrary={() => setActionLog((current) => ['navigate:library', ...current].slice(0, 4))}
                onPressChangeTime={() => setActionLog((current) => ['navigate:time-change', ...current].slice(0, 4))}
                onPressClose={() => setActionLog((current) => ['navigate:focus-core(skipRestartOnce)', ...current].slice(0, 4))}
            />
            <View style={styles.logCard}>
                <Text style={styles.logTitle}>Stub Actions</Text>
                {actionLog.length === 0 ? <Text style={styles.logText}>まだ押下されていません。</Text> : null}
                {actionLog.map((entry) => (
                    <Text key={entry} style={styles.logText}>
                        {entry}
                    </Text>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    logCard: {
        marginHorizontal: appTheme.spacing.screenPaddingHorizontal,
        marginBottom: 24,
        marginTop: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(44,44,44,0.08)',
        backgroundColor: '#FFFFFF',
        padding: 16,
    },
    logTitle: {
        color: '#2C2C2C',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    logText: {
        color: '#4B5563',
        fontSize: 13,
        marginTop: 4,
    },
});
