import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { BookDTO, DailyExecutionPlanDTO } from '../bridge/PersistenceBridge';
import { copy } from '../config/copy';
import type { SessionMode } from '../useCases/StartSessionUseCase';
import { appTheme } from '../theme/layout';
import { SessionCTAButton } from '../components/SessionCTAButton';
import { FocusCoreBookCard } from './FocusCoreBookCard';
import { FocusCoreCompletedSection } from './FocusCoreCompletedSection';
import { FocusCorePendingSection } from './FocusCorePendingSection';

const BG = appTheme.colors.screenBackground;
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
  sessionStartErrorText: string | null;
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
  sessionStartErrorText,
  startingMode,
  onPressChangeBook,
  onPressResolveBook,
  onPressPrimaryCTA,
  onPressSecondaryCTA,
  onPressRehabCTA,
  onPressCompletedExtra5m,
  onPressCompletedExtra15m,
}: FocusCoreViewProps) {
  const ctaDisabled = startingMode !== null || loading || !plan || !hasSelectedBook;

  return (
    <View testID="focus-core-screen" style={styles.screenWrap}>
      <ScrollView
        testID="focus-core-scroll"
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.headerMessage}>{headerMessage}</Text>

        <FocusCoreBookCard
          book={book}
          progressRatio={progressRatio}
          hasSelectedBook={hasSelectedBook}
          canManualChange={canManualChange}
          showChangeBookAction={Boolean(hasSelectedBook && plan)}
          onPressChangeBook={onPressChangeBook}
        />
      </ScrollView>

      <View style={styles.menu}>
        {!showCompletedActions ? <Text style={styles.intentCopy}>{intentCopy}</Text> : null}
        {!hasSelectedBook ? (
          <>
            <Text testID="focus-core-no-book-warning" style={styles.warningText}>
              {copy.focusCore.noBookSelected}
            </Text>
            <SessionCTAButton
              testID="focus-core-resolve-book"
              tone="ghost"
              label={copy.focusCore.resolveBookLink}
              onPress={onPressResolveBook}
            />
          </>
        ) : null}

        {showCompletedActions ? (
          <FocusCoreCompletedSection
            dailyQuote={dailyQuote}
            errorText={sessionStartErrorText}
            startingMode={startingMode}
            ctaDisabled={ctaDisabled}
            onPressCompletedExtra5m={onPressCompletedExtra5m}
            onPressCompletedExtra15m={onPressCompletedExtra15m}
          />
        ) : hasSelectedBook ? (
          <FocusCorePendingSection
            mainMode={mainMode}
            subMode={subMode}
            rehabMode={rehabMode}
            startingMode={startingMode}
            ctaDisabled={ctaDisabled}
            onPressPrimaryCTA={onPressPrimaryCTA}
            onPressSecondaryCTA={onPressSecondaryCTA}
            onPressRehabCTA={onPressRehabCTA}
          />
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
  menu: {
    paddingHorizontal: appTheme.spacing.screenPaddingHorizontal,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(44,44,44,0.06)',
    backgroundColor: BG,
  },
  intentCopy: { color: TEXT, fontSize: 14, lineHeight: 22, marginBottom: 14 },
  warningText: { color: '#B91C1C', fontSize: 13, lineHeight: 20, marginBottom: 8 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  loadingText: { color: '#6B7280', fontSize: 13 },
  errorText: { color: '#B91C1C', fontSize: 13, marginTop: 12 },
});
