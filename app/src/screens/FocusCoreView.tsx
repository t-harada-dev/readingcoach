import React from 'react';
import {
    ActivityIndicator,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import type { BookDTO, DailyExecutionPlanDTO } from '../bridge/PersistenceBridge';
import { copy, sessionModeLabel } from '../config/copy';
import type { SessionMode } from '../useCases/StartSessionUseCase';
import { appTheme } from '../theme/layout';

const BG = appTheme.colors.screenBackground;
const AMBER = '#D48A3E';
const TEXT = '#2C2C2C';

export type FocusCoreViewProps = {
    book: BookDTO | null;
    plan: DailyExecutionPlanDTO | null;
    hasSelectedBook: boolean;
    loading: boolean;
    initStatus: 'booting' | 'ready' | 'error';
    canManualChange: boolean;
    progressRatio: number | null;
    showCompletedActions: boolean;
    mainMode: SessionMode;
    subMode: SessionMode | null;
    rehabMode: SessionMode | null;
    intentCopy: string;
    headerMessage: string;
    dailyQuote: { text: string; author: string } | null;
    startingMode: SessionMode | null;
    onPressChangeBook: () => void;
    onPressResolveBook: () => void;
    onPressPrimaryCTA: () => void;
    onPressSecondaryCTA: () => void;
    onPressRehabCTA: () => void;
    onPressCompletedExtra5m: () => void;
    onPressCompletedExtra15m: () => void;
};

export function FocusCoreView({
    book,
    plan,
    hasSelectedBook,
    loading,
    initStatus,
    canManualChange,
    progressRatio,
    showCompletedActions,
    mainMode,
    subMode,
    rehabMode,
    intentCopy,
    headerMessage,
    dailyQuote,
    startingMode,
    onPressChangeBook,
    onPressResolveBook,
    onPressPrimaryCTA,
    onPressSecondaryCTA,
    onPressRehabCTA,
    onPressCompletedExtra5m,
    onPressCompletedExtra15m,
}: FocusCoreViewProps) {
    return (
        <View testID="focus-core-screen" style={styles.screenWrap}>
            <ScrollView
                testID="focus-core-scroll"
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.headerMessage}>{headerMessage}</Text>

                <View style={styles.card}>
                    <View style={styles.coverWrap}>
                        {book?.thumbnailUrl ? (
                            <Image
                                source={{ uri: book.thumbnailUrl }}
                                style={styles.cover}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.coverPlaceholder}>
                                <Text style={styles.coverPlaceholderText} numberOfLines={3}>
                                    {book?.title ?? copy.focusCore.coverFallbackTitle}
                                </Text>
                            </View>
                        )}
                    </View>

                    {progressRatio !== null ? (
                        <View testID="focus-core-progress-track" style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${Math.round(progressRatio * 100)}%` }]} />
                        </View>
                    ) : null}

                    {book?.title ? (
                        <>
                            <Text testID="focus-core-book-title" style={styles.bookTitle} numberOfLines={2}>
                                {book.title}
                            </Text>
                            {book.author ? (
                                <Text style={styles.bookAuthor} numberOfLines={1}>
                                    {book.author}
                                </Text>
                            ) : null}
                        </>
                    ) : null}

                    {hasSelectedBook && plan && canManualChange ? (
                        <TouchableOpacity testID="focus-core-change-book" style={styles.ghostLink} onPress={onPressChangeBook}>
                            <Text style={styles.ghostLinkText}>{copy.focusCore.changeBookLink}</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </ScrollView>

            <View style={styles.menu}>
                    {!showCompletedActions ? <Text style={styles.intentCopy}>{intentCopy}</Text> : null}
                    {!hasSelectedBook ? (
                        <>
                            <Text testID="focus-core-no-book-warning" style={styles.warningText}>
                                {copy.focusCore.noBookSelected}
                            </Text>
                            <TouchableOpacity
                                testID="focus-core-resolve-book"
                                style={styles.resolveLink}
                                onPress={onPressResolveBook}
                            >
                                <Text style={styles.resolveLinkText}>{copy.focusCore.resolveBookLink}</Text>
                            </TouchableOpacity>
                        </>
                    ) : null}

                    {showCompletedActions ? (
                        <>
                            <Text style={styles.completedTitle}>{copy.focusCore.completedTitle}</Text>
                            <Text style={styles.completedSubtitle}>{copy.focusCore.completedSubtitle}</Text>
                            {dailyQuote ? (
                                <Text style={styles.quoteText}>「{dailyQuote.text}」{'\n'}— {dailyQuote.author}</Text>
                            ) : null}
                            <TouchableOpacity
                                testID="focus-core-completed-extra-5m"
                                style={[styles.mainBtn, startingMode ? styles.btnDisabled : null]}
                                onPress={onPressCompletedExtra5m}
                                disabled={startingMode !== null || loading || !plan || !hasSelectedBook}
                            >
                                <Text style={styles.mainBtnText}>{copy.completion.ctaExtra5m}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                testID="focus-core-completed-extra-15m"
                                style={[styles.subBtn, startingMode ? styles.btnDisabled : null]}
                                onPress={onPressCompletedExtra15m}
                                disabled={startingMode !== null || loading || !plan || !hasSelectedBook}
                            >
                                <Text style={styles.subBtnText}>{copy.completion.ctaExtra15m}</Text>
                            </TouchableOpacity>
                        </>
                    ) : hasSelectedBook ? (
                        <>
                            <TouchableOpacity
                                testID="focus-core-primary-cta"
                                style={[styles.mainBtn, startingMode ? styles.btnDisabled : null]}
                                onPress={onPressPrimaryCTA}
                                disabled={startingMode !== null || loading || !plan || !hasSelectedBook}
                            >
                                <Text style={styles.mainBtnText}>{sessionModeLabel(mainMode)}</Text>
                            </TouchableOpacity>

                            {subMode ? (
                                <TouchableOpacity
                                    testID="focus-core-secondary-cta"
                                    style={[styles.subBtn, startingMode ? styles.btnDisabled : null]}
                                    onPress={onPressSecondaryCTA}
                                    disabled={startingMode !== null || loading || !plan || !hasSelectedBook}
                                >
                                    <Text style={styles.subBtnText}>{sessionModeLabel(subMode)}</Text>
                                </TouchableOpacity>
                            ) : null}
                            {rehabMode ? (
                                <TouchableOpacity
                                    testID="focus-core-rehab-cta"
                                    style={[styles.subBtn, startingMode ? styles.btnDisabled : null]}
                                    onPress={onPressRehabCTA}
                                    disabled={startingMode !== null || loading || !plan || !hasSelectedBook}
                                >
                                    <Text style={styles.subBtnText}>{sessionModeLabel(rehabMode)}</Text>
                                </TouchableOpacity>
                            ) : null}
                        </>
                    ) : null}

                    {loading || initStatus === 'booting' ? (
                        <View testID="focus-core-loading" style={styles.loadingRow}>
                            <ActivityIndicator />
                            <Text style={styles.loadingText}>{copy.focusCore.loading}</Text>
                        </View>
                    ) : null}

                    {initStatus === 'error' ? (
                        <Text testID="focus-core-init-error" style={styles.errorText}>
                            {copy.focusCore.initError}
                        </Text>
                    ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screenWrap: {
        flex: 1,
        backgroundColor: BG,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: appTheme.spacing.screenPaddingHorizontal,
        paddingTop: 18,
        paddingBottom: 12,
    },
    headerMessage: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '300',
        lineHeight: 20,
        marginTop: 6,
        marginBottom: 14,
        textAlign: 'center',
    },
    card: {
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(44,44,44,0.06)',
        alignItems: 'center',
    },
    coverWrap: {
        width: 200,
        height: 267,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
            },
            android: { elevation: 4 },
            default: {},
        }),
    },
    cover: { width: '100%', height: '100%' },
    coverPlaceholder: {
        flex: 1,
        padding: 18,
        justifyContent: 'center',
        backgroundColor: 'rgba(212, 138, 62, 0.10)',
    },
    coverPlaceholderText: { color: TEXT, fontSize: 18, fontWeight: '700', textAlign: 'center' },
    progressTrack: {
        height: 4,
        width: '100%',
        borderRadius: 999,
        backgroundColor: 'rgba(212, 138, 62, 0.18)',
        overflow: 'hidden',
        marginTop: 14,
    },
    progressFill: { height: 4, backgroundColor: AMBER },
    bookTitle: { color: TEXT, fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' },
    bookAuthor: { color: '#6B7280', fontSize: 13, marginTop: 6 },
    ghostLink: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 10 },
    ghostLinkText: { color: '#6B7280', fontSize: 13, textDecorationLine: 'underline' },
    menu: {
        paddingHorizontal: appTheme.spacing.screenPaddingHorizontal,
        paddingTop: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(44,44,44,0.06)',
        backgroundColor: BG,
    },
    intentCopy: { color: TEXT, fontSize: 14, lineHeight: 22, marginBottom: 14 },
    completedTitle: {
        color: TEXT,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    completedSubtitle: {
        color: '#6B7280',
        fontSize: 13,
        lineHeight: 19,
        marginBottom: 10,
    },
    quoteText: {
        color: '#6B7280',
        fontSize: 13,
        lineHeight: 20,
        fontStyle: 'italic',
        marginBottom: 14,
    },
    warningText: { color: '#B91C1C', fontSize: 13, lineHeight: 20, marginBottom: 8 },
    resolveLink: { alignSelf: 'flex-start', paddingVertical: 4, marginBottom: 8 },
    resolveLinkText: { color: '#6B7280', fontSize: 13, textDecorationLine: 'underline' },
    mainBtn: {
        backgroundColor: AMBER,
        borderRadius: 20,
        paddingVertical: 16,
        alignItems: 'center',
    },
    mainBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    subBtn: {
        marginTop: 12,
        borderWidth: 1,
        borderColor: 'rgba(212, 138, 62, 0.45)',
        borderRadius: 20,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    subBtnText: { color: AMBER, fontSize: 15, fontWeight: '700' },
    btnDisabled: { opacity: 0.6 },
    loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
    loadingText: { color: '#6B7280', fontSize: 13 },
    errorText: { color: '#B91C1C', fontSize: 13, marginTop: 12 },
});
