import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SessionCTAButton } from '../components/SessionCTAButton';
import { copy } from '../config/copy';
import { appTheme } from '../theme/layout';

export type RestartRecoveryViewProps = {
    busy: boolean;
    errorText: string | null;
    onPressStartIgnition: () => void;
    onPressOpenLibrary: () => void;
    onPressChangeTime: () => void;
    onPressClose: () => void;
};

export function RestartRecoveryView({
    busy,
    errorText,
    onPressStartIgnition,
    onPressOpenLibrary,
    onPressChangeTime,
    onPressClose,
}: RestartRecoveryViewProps) {
    return (
        <View testID="restart-recovery-screen" style={styles.container}>
            <View style={styles.copyWrap}>
                <Text style={styles.title}>{copy.restartRecovery.title}</Text>
                <Text style={styles.subtitle}>{copy.restartRecovery.subtitle}</Text>
            </View>

            <View style={styles.actions}>
                <SessionCTAButton
                    testID="restart-start-ignition"
                    tone="primary"
                    label={copy.restartRecovery.ctaStartIgnition}
                    onPress={onPressStartIgnition}
                    disabled={busy}
                />
                <SessionCTAButton
                    tone="ghost"
                    label={copy.restartRecovery.ctaOpenLibrary}
                    onPress={onPressOpenLibrary}
                    disabled={busy}
                />
                <SessionCTAButton
                    tone="ghost"
                    label={copy.restartRecovery.ctaChangeTime}
                    onPress={onPressChangeTime}
                    disabled={busy}
                />
                <SessionCTAButton
                    testID="restart-close"
                    tone="ghost"
                    label={copy.restartRecovery.ctaClose}
                    onPress={onPressClose}
                    disabled={busy}
                />
            </View>

            {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: appTheme.colors.screenBackground,
        paddingHorizontal: appTheme.spacing.screenPaddingHorizontal,
        paddingTop: 28,
        paddingBottom: 20,
        justifyContent: 'space-between',
    },
    copyWrap: {
        alignItems: 'center',
        marginTop: 28,
    },
    title: {
        color: '#2C2C2C',
        fontSize: 34,
        lineHeight: 46,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        color: '#4B5563',
        fontSize: 21,
        lineHeight: 31,
        marginTop: 20,
        textAlign: 'center',
    },
    actions: {
        marginBottom: 20,
    },
    errorText: {
        color: '#B91C1C',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 8,
    },
});
