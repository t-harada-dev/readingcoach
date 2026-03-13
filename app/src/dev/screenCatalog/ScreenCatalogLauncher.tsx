import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function ScreenCatalogLauncher({ onPress }: { onPress: () => void }) {
    return (
        <View pointerEvents="box-none" style={styles.overlay}>
            <Pressable testID="open-screen-catalog" style={styles.button} onPress={onPress}>
                <Text style={styles.label}>CATALOG</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        paddingRight: 16,
        paddingBottom: 28,
    },
    button: {
        borderRadius: 999,
        backgroundColor: '#2C2C2C',
        paddingVertical: 10,
        paddingHorizontal: 14,
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    label: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
});
