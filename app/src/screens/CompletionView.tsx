import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SessionCTAButton } from '../components/SessionCTAButton';
import { copy } from '../config/copy';
import { completionCtaOrder } from './screenPolicy';
import { appTheme } from '../theme/layout';

type CompletionResult = 'hard_success' | 'soft_success' | 'prep_success';

type CompletionFeedback = {
  title: string;
  message: string;
  progressRatio: number | null;
};

function toElapsedLabel(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(clamped / 60)).padStart(2, '0');
  const ss = String(clamped % 60).padStart(2, '0');
  return `${copy.completion.elapsedPrefix}: ${mm}:${ss}`;
}

export type CompletionViewProps = {
  result: CompletionResult;
  elapsedSeconds: number;
  bookTitle: string;
  feedback: CompletionFeedback;
  busy: boolean;
  finishedBookError: string | null;
  onPressExtra5m: () => void;
  onPressExtra15m: () => void;
  onPressFinishedBook: () => void;
  onPressClose: () => void;
};

export function CompletionView({
  elapsedSeconds,
  bookTitle,
  feedback: _feedback,
  busy,
  finishedBookError,
  onPressExtra5m,
  onPressExtra15m,
  onPressFinishedBook,
  onPressClose,
}: CompletionViewProps) {
  const ctaOrder = completionCtaOrder();
  const summaryItems = [
    copy.completion.completedTitle,
    copy.completion.forwardMomentum,
    toElapsedLabel(elapsedSeconds),
    `${copy.completion.readBookPrefix}: ${bookTitle}`,
  ];

  return (
    <View testID="completion-screen" style={styles.container}>
      <View style={styles.summaryCard}>
        <Text testID="completion-message" style={styles.summaryTitle}>
          {summaryItems[0]}
        </Text>
        <Text style={styles.summarySubTitle}>{summaryItems[1]}</Text>
        <Text testID="completion-duration" style={styles.summaryMeta}>
          {summaryItems[2]}
        </Text>
        <Text testID="completion-book-title" style={styles.summaryMeta}>
          {summaryItems[3]}
        </Text>
      </View>

      <View testID="extra-session-screen" style={styles.ctaStack}>
      {ctaOrder.map((cta) => {
        if (cta === 'extra_5m') {
          return (
            <View key={cta} testID="extra-session-5m">
              <SessionCTAButton
                testID="completion-extra-5m"
                tone="primary"
                label={copy.completion.ctaExtra5m}
                onPress={onPressExtra5m}
                disabled={busy}
              />
            </View>
          );
        }
        if (cta === 'extra_15m') {
          return (
            <View key={cta} testID="extra-session-15m">
              <SessionCTAButton
                testID="completion-extra-15m"
                tone="secondary"
                label={copy.completion.ctaExtra15m}
                onPress={onPressExtra15m}
                disabled={busy}
              />
            </View>
          );
        }
        if (cta === 'finished_book') {
          return (
            <SessionCTAButton
              key={cta}
              testID="completion-finished-book"
              tone="ghost"
              label={copy.completion.ctaFinishedBook}
              onPress={onPressFinishedBook}
              disabled={busy}
            />
          );
        }
        return (
          <SessionCTAButton
            key={cta}
            testID="completion-close"
            tone="ghost"
            label={copy.completion.ctaClose}
            onPress={onPressClose}
            disabled={busy}
          />
        );
      })}
      </View>
      {finishedBookError ? (
        <Text testID="completion-finished-error" style={styles.errorText}>
          {finishedBookError}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.screenBackground,
    paddingHorizontal: appTheme.spacing.screenPaddingHorizontal,
    paddingTop: 20,
    paddingBottom: 14,
  },
  summaryCard: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.borderRadius.xl,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  summaryTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  summarySubTitle: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  summaryMeta: {
    color: appTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },
  errorText: {
    marginTop: 10,
    color: appTheme.colors.danger,
    fontSize: 13,
    textAlign: 'center',
  },
  ctaStack: {
    marginTop: 'auto',
    paddingBottom: 10,
  },
});
