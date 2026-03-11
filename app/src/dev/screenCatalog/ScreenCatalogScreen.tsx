import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { appTheme } from '../../theme/layout';
import { DevNotice } from './components/DevNotice';
import { ScreenCard } from './components/ScreenCard';
import { screenRegistry } from './screenRegistry';

export function ScreenCatalogScreen({ navigation }: any) {
    return (
        <ScrollView testID="screen-catalog-screen" style={styles.screen} contentContainerStyle={styles.content}>
            <DevNotice />
            <View style={styles.headerRow}>
                <Text style={styles.title}>Screen Catalog</Text>
                <Text style={styles.caption}>{screenRegistry.length} screens</Text>
            </View>
            {screenRegistry.map((item) => (
                <ScreenCard
                    key={item.screenId}
                    item={item}
                    onPress={() =>
                        navigation.navigate('DevScreenPlayground', {
                            screenId: item.screenId,
                            scenario: item.defaultScenario,
                        })
                    }
                />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: appTheme.colors.screenBackground,
    },
    content: {
        paddingHorizontal: appTheme.spacing.screenPaddingHorizontal,
        paddingTop: 24,
        paddingBottom: 32,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    title: {
        color: '#2C2C2C',
        fontSize: 28,
        fontWeight: '800',
    },
    caption: {
        color: '#6B7280',
        fontSize: 13,
    },
});
