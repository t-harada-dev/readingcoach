import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ScreenRegistryItem } from '../types';

export function ScreenCard({
    item,
    onPress,
}: {
    item: ScreenRegistryItem;
    onPress: () => void;
}) {
    return (
        <Pressable testID={`screen-card-${item.screenId}`} style={styles.card} onPress={onPress}>
            <View style={styles.row}>
                <Text style={styles.screenId}>{item.screenId}</Text>
                <Text style={styles.title}>{item.title}</Text>
            </View>
            <Text style={styles.meta}>Scenarios: {item.supportedScenarios.join(', ')}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(44,44,44,0.08)',
        padding: 16,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    screenId: {
        color: '#8A5A21',
        fontSize: 13,
        fontWeight: '800',
    },
    title: {
        color: '#2C2C2C',
        fontSize: 16,
        fontWeight: '700',
        flexShrink: 1,
    },
    meta: {
        color: '#6B7280',
        fontSize: 12,
        marginTop: 8,
    },
});
