import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DueActionSheetView } from '../../../screens/DueActionSheetView';
import { appTheme } from '../../../theme/layout';
import { fixtureBooks } from '../fixtures/books';
import type { MockScenario } from '../types';

export function buildSC23Props(scenario: MockScenario) {
    const focusBook = scenario === 'rehab' || scenario === 'due' ? fixtureBooks.missingCoverBook : fixtureBooks.standardBook;
    const bookThumbnailUrl = (focusBook as { thumbnailUrl?: string }).thumbnailUrl;
    return {
        defaultMode: (scenario === 'rehab' ? 'ignition_1m' : 'normal_15m') as 'normal_15m' | 'ignition_1m',
        bookTitle: focusBook.title,
        bookAuthor: focusBook.author,
        bookThumbnailUrl,
        bookCoverSource: (bookThumbnailUrl ? 'google_books' : 'placeholder') as 'google_books' | 'placeholder',
    };
}

export function SC23CatalogPreview({ scenario }: { scenario: MockScenario }) {
    const [actionLog, setActionLog] = useState<string[]>([]);
    const props = buildSC23Props(scenario);

    return (
        <View style={styles.container}>
            <DueActionSheetView
                busy={false}
                defaultMode={props.defaultMode}
                hasSelectedBook={true}
                bookTitle={props.bookTitle}
                bookAuthor={props.bookAuthor}
                bookThumbnailUrl={props.bookThumbnailUrl}
                bookCoverSource={props.bookCoverSource}
                onPressStart={(mode) => setActionLog((current) => [`start:${mode}`, ...current].slice(0, 4))}
                onPressResolveBook={() => setActionLog((current) => ['navigate:library', ...current].slice(0, 4))}
                onPressSnooze={() => setActionLog((current) => ['snooze:30m', ...current].slice(0, 4))}
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
        backgroundColor: appTheme.colors.screenBackground,
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
