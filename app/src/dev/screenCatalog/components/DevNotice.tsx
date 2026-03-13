import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function DevNotice({ compact = false }: { compact?: boolean }) {
    return (
        <View style={[styles.notice, compact ? styles.noticeCompact : null]}>
            <Text style={styles.title}>DEV SCREEN CATALOG</Text>
            {!compact ? <Text style={styles.body}>既存画面の再生専用です。本番 API や永続更新は行いません。</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    notice: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(212, 138, 62, 0.24)',
        backgroundColor: 'rgba(212, 138, 62, 0.08)',
        padding: 14,
        marginBottom: 16,
    },
    noticeCompact: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    title: {
        color: '#8A5A21',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    body: {
        color: '#6B7280',
        fontSize: 13,
        marginTop: 6,
        lineHeight: 18,
    },
});
