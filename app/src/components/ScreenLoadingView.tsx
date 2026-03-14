import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { appTheme } from '../theme/layout';

type ScreenLoadingViewProps = {
  message?: string;
  testID?: string;
};

export function ScreenLoadingView({ message = '読み込み中…', testID = 'screen-loading-view' }: ScreenLoadingViewProps) {
  return (
    <View testID={testID} style={styles.container}>
      <ActivityIndicator size="small" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appTheme.colors.screenBackground,
    gap: 10,
    paddingHorizontal: 20,
  },
  message: {
    color: appTheme.colors.textMuted,
    fontSize: 13,
  },
});
