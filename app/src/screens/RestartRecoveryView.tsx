import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BookCoverImage } from '../components/BookCoverImage';
import { SessionCTAButton } from '../components/SessionCTAButton';
import { copy } from '../config/copy';
import { appTheme } from '../theme/layout';

export type RestartRecoveryViewProps = {
    busy: boolean;
    hasSelectedBook: boolean;
    errorText: string | null;
    bookTitle?: string;
    bookThumbnailUrl?: string;
    bookCoverSource?: 'manual' | 'google_books' | 'placeholder';
    onPressStartIgnition: () => void;
    onPressChangeTime: () => void;
    onPressChangeBook: () => void;
};

export function RestartRecoveryView({
    busy,
    hasSelectedBook,
    errorText,
    bookTitle,
    bookThumbnailUrl,
    bookCoverSource,
    onPressStartIgnition,
    onPressChangeTime,
    onPressChangeBook,
}: RestartRecoveryViewProps) {
    const hasBookInfo = (bookTitle?.trim().length ?? 0) > 0 || (bookThumbnailUrl?.trim().length ?? 0) > 0;

    return (
        <View testID="restart-recovery-screen" style={styles.container}>
            <View style={styles.copyWrap}>
                <Text style={styles.title}>{copy.restartRecovery.title}</Text>
                <Text style={styles.subtitle}>{copy.restartRecovery.subtitle}</Text>
                {!hasSelectedBook ? <Text style={styles.warningText}>{copy.focusCore.noBookSelected}</Text> : null}
                {hasBookInfo ? (
                    <View testID="restart-recovery-book-card" style={styles.bookCard}>
                        <Text style={styles.bookLabel}>この本を読みます</Text>
                        <View style={styles.bookContent}>
                            <BookCoverImage
                                testID="restart-recovery-book-cover"
                                placeholderTestID="restart-recovery-book-cover-fallback"
                                thumbnailUrl={bookThumbnailUrl}
                                coverSource={bookCoverSource}
                                title={bookTitle}
                                showPlaceholderTitle={false}
                                style={styles.bookCover}
                            />
                            {bookTitle ? (
                                <Text testID="restart-recovery-book-title" style={styles.bookTitle} numberOfLines={3}>
                                    {bookTitle}
                                </Text>
                            ) : null}
                        </View>
                    </View>
                ) : null}
            </View>

            <View style={styles.actions}>
                <SessionCTAButton
                    testID="restart-start-ignition"
                    tone="primary"
                    label={copy.restartRecovery.ctaStartIgnition}
                    onPress={onPressStartIgnition}
                    disabled={busy || !hasSelectedBook}
                />
                <SessionCTAButton
                    testID="restart-recovery-change-time"
                    tone="ghost"
                    label={copy.restartRecovery.ctaChangeTime}
                    onPress={onPressChangeTime}
                    disabled={busy}
                />
                <SessionCTAButton
                    testID="restart-change-book"
                    tone="ghost"
                    label={copy.restartRecovery.ctaChangeBook}
                    onPress={onPressChangeBook}
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
        alignItems: 'stretch',
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
    warningText: {
        color: '#B91C1C',
        fontSize: 13,
        lineHeight: 19,
        marginTop: 12,
        textAlign: 'center',
    },
    bookCard: {
        marginTop: 20,
        width: '100%',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(44,44,44,0.10)',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
        paddingVertical: 12,
        alignItems: 'stretch',
    },
    bookLabel: {
        color: '#6B7280',
        fontSize: 12,
        fontWeight: '700',
    },
    bookContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    bookCover: {
        width: 56,
        height: 80,
        borderRadius: 8,
    },
    bookTitle: {
        color: '#2C2C2C',
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 10,
        flex: 1,
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
