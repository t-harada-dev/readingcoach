import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { MockScenario } from '../types';

export function ScenarioPicker({
    options,
    selected,
    onSelect,
}: {
    options: MockScenario[];
    selected: MockScenario;
    onSelect: (scenario: MockScenario) => void;
}) {
    return (
        <View style={styles.row}>
            {options.map((option) => {
                const active = option === selected;
                return (
                    <Pressable
                        key={option}
                        testID={`scenario-pill-${option}`}
                        style={[styles.pill, active ? styles.pillActive : null]}
                        onPress={() => onSelect(option)}
                    >
                        <Text style={[styles.pillLabel, active ? styles.pillLabelActive : null]}>{option}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingVertical: 4,
    },
    pill: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(44,44,44,0.12)',
        backgroundColor: '#FFFFFF',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    pillActive: {
        backgroundColor: '#D48A3E',
        borderColor: '#D48A3E',
    },
    pillLabel: {
        color: '#2C2C2C',
        fontSize: 12,
        fontWeight: '700',
    },
    pillLabelActive: {
        color: '#FFFFFF',
    },
});
