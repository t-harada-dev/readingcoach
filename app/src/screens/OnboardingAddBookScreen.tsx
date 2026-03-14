import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { copy } from '../config/copy';
import type { ScreenProps } from '../navigation/types';
import { appTheme } from '../theme/layout';

export function OnboardingAddBookScreen({ navigation }: ScreenProps<'OnboardingAddBook'>) {
  const onPressManual = () => {
    navigation.navigate('AddBook', { onboarding: true });
  };

  return (
    <View testID="onboarding-add-book-landing" style={styles.container}>
      <Text style={styles.title}>{copy.onboardingAddBook.title}</Text>
      <TouchableOpacity
        testID="onboarding-add-book-cta-manual"
        style={styles.cta}
        onPress={onPressManual}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaText}>{copy.onboardingAddBook.ctaManual}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: appTheme.spacing.xl,
    backgroundColor: appTheme.colors.screenBackground,
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 32,
  },
  cta: {
    borderRadius: appTheme.borderRadius.lg,
    backgroundColor: appTheme.colors.accent,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    color: appTheme.colors.textInverse,
    fontSize: 18,
    fontWeight: '600',
  },
});
