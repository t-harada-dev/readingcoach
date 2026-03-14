import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { appTheme } from '../theme/layout';

type InlineErrorBannerProps = {
  message: string;
  testID?: string;
};

export function InlineErrorBanner({ message, testID = 'inline-error-banner' }: InlineErrorBannerProps) {
  return (
    <View testID={testID} style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    borderRadius: appTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(185,28,28,0.28)',
    backgroundColor: 'rgba(185,28,28,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  message: {
    color: appTheme.colors.danger,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
