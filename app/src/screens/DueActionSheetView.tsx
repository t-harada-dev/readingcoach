import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { BookDTO } from '../bridge/PersistenceBridge';
import { BookCoverImage } from '../components/BookCoverImage';
import { SessionCTAButton } from '../components/SessionCTAButton';
import { copy } from '../config/copy';
import { dueActionOrder } from './screenPolicy';
import { appTheme } from '../theme/layout';

type DueActionMode = 'normal_15m' | 'ignition_1m' | 'rescue_5m';

export type DueActionSheetViewProps = {
    busy: boolean;
    defaultMode: 'normal_15m' | 'ignition_1m';
    bookTitle: string;
    bookAuthor?: string;
    bookThumbnailUrl?: string;
    bookCoverSource?: BookDTO['coverSource'];
    onPressStart: (mode: DueActionMode) => void;
    onPressSnooze: () => void;
};

export function DueActionSheetView({
    busy,
    defaultMode,
    bookTitle,
    bookAuthor,
    bookThumbnailUrl,
    bookCoverSource,
    onPressStart,
    onPressSnooze,
}: DueActionSheetViewProps) {
    const actions = dueActionOrder();
    const secondaryActions = actions.filter((action) => action !== 'start');

    return (
        <View testID="due-action-sheet" style={styles.container}>
            <BookCoverImage
                testID="due-action-background"
                thumbnailUrl={bookThumbnailUrl}
                coverSource={bookCoverSource}
                title={bookTitle}
                style={styles.backgroundImage}
                showPlaceholderTitle={false}
            />
            <View style={styles.backgroundDim} />
            <View style={styles.sheet}>
                <Text style={styles.title}>{copy.dueAction.title}</Text>
                <Text style={styles.subtitle}>{copy.dueAction.subtitle}</Text>
                <View style={styles.bookContextRow}>
                    <BookCoverImage
                        testID="due-action-book-cover"
                        placeholderTestID="due-action-book-cover-placeholder"
                        thumbnailUrl={bookThumbnailUrl}
                        coverSource={bookCoverSource}
                        title={bookTitle}
                        style={styles.bookCover}
                    />
                    <View style={styles.bookTextWrap}>
                        <Text testID="due-action-book-title" style={styles.bookTitle} numberOfLines={2}>
                            {bookTitle}
                        </Text>
                        {bookAuthor ? (
                            <Text style={styles.bookAuthor} numberOfLines={1}>
                                {bookAuthor}
                            </Text>
                        ) : null}
                    </View>
                </View>
                <View style={styles.actionStack}>
                {secondaryActions.map((action) => {
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
                <SessionCTAButton
                    testID="due-action-start"
                    tone="primary"
                    label={copy.dueAction.ctaStart}
                    onPress={() => onPressStart(defaultMode)}
                    disabled={busy}
                />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: '#1D1D1D',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.22,
    },
    backgroundDim: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.20)',
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
        marginBottom: 12,
    },
    bookContextRow: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(44,44,44,0.08)',
        backgroundColor: '#FFFFFF',
        padding: 10,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    bookCover: {
        width: 56,
        height: 76,
        borderRadius: 10,
    },
    bookTextWrap: {
        flex: 1,
        marginLeft: 10,
    },
    bookTitle: {
        color: '#2C2C2C',
        fontSize: 14,
        fontWeight: '700',
    },
    bookAuthor: {
        color: '#6B7280',
        fontSize: 12,
        marginTop: 4,
    },
    actionStack: {
        marginTop: 8,
        gap: 4,
    },
});
