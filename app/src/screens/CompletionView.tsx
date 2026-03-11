import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CompletionFeedbackCard } from '../components/CompletionFeedbackCard';
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
  const mins = Math.max(1, Math.round(seconds / 60));
  return `${copy.completion.elapsedPrefix}: ${mins}分`;
}

export type CompletionViewProps = {
  result: CompletionResult;
  elapsedSeconds: number;
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
  feedback,
  busy,
  finishedBookError,
  onPressExtra5m,
  onPressExtra15m,
  onPressFinishedBook,
  onPressClose,
}: CompletionViewProps) {
  const ctaOrder = completionCtaOrder();

  return (
    <View testID="completion-screen" style={styles.container}>
      <CompletionFeedbackCard
        title={feedback.title}
        message={feedback.message}
        elapsedLabel={toElapsedLabel(elapsedSeconds)}
        progressRatio={feedback.progressRatio}
        messageTestID="completion-message"
        elapsedTestID="completion-duration"
        progressTestID="completion-progress"
      />

      <View testID="extra-session-screen">
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
    paddingBottom: 24,
  },
  errorText: {
    marginTop: 12,
    color: '#B91C1C',
    fontSize: 13,
    textAlign: 'center',
  },
});
