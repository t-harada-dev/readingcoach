import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { InlineErrorBanner } from '../components/InlineErrorBanner';
import { SessionCTAButton } from '../components/SessionCTAButton';
import { copy } from '../config/copy';
import type { SessionMode } from '../useCases/StartSessionUseCase';

type FocusCoreCompletedSectionProps = {
  dailyQuote: { text: string; author: string } | null;
  errorText: string | null;
  startingMode: SessionMode | null;
  ctaDisabled: boolean;
  onPressCompletedExtra5m: () => void;
  onPressCompletedExtra15m: () => void;
};

export function FocusCoreCompletedSection({
  dailyQuote,
  errorText,
  startingMode,
  ctaDisabled,
  onPressCompletedExtra5m,
  onPressCompletedExtra15m,
}: FocusCoreCompletedSectionProps) {
  return (
    <>
      {dailyQuote ? (
        <Text style={styles.quoteText}>
          「{dailyQuote.text}」
          {'\n'}— {dailyQuote.author}
        </Text>
      ) : null}
      <Text style={styles.completedTitle}>{copy.focusCore.completedTitle}</Text>
      <Text style={styles.completedSubtitle}>{copy.focusCore.completedSubtitle}</Text>
      <View style={startingMode ? styles.disabled : null}>
        <SessionCTAButton
          testID="focus-core-completed-extra-5m"
          tone="primary"
          label={copy.completion.ctaExtra5m}
          onPress={onPressCompletedExtra5m}
          disabled={ctaDisabled}
        />
      </View>
      <View style={startingMode ? styles.disabled : null}>
        <SessionCTAButton
          testID="focus-core-completed-extra-15m"
          tone="secondary"
          label={copy.completion.ctaExtra15m}
          onPress={onPressCompletedExtra15m}
          disabled={ctaDisabled}
        />
      </View>
      {errorText ? <InlineErrorBanner testID="focus-core-completed-error" message={errorText} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  completedTitle: {
    color: '#2C2C2C',
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
    marginBottom: 12,
  },
  disabled: { opacity: 0.6 },
});
