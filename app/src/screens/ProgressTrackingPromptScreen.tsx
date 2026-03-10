import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SessionCTAButton } from '../components/SessionCTAButton';
import { skipProgressTrackingPrompt } from '../useCases/ProgressTrackingUseCases';

export function ProgressTrackingPromptScreen({ navigation, route }: any) {
  const [busy, setBusy] = useState(false);

  const onSkip = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await skipProgressTrackingPrompt();
      navigation.goBack();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>進捗バーを使いますか？</Text>
      <Text style={styles.subtitle}>
        任意機能です。使わなくても、開始・継続・完了の体験は変わりません。
      </Text>
      <SessionCTAButton
        tone="primary"
        label="設定する"
        onPress={() =>
          navigation.navigate('ProgressTrackingSetup', {
            bookId: route.params?.bookId,
            bookTitle: route.params?.bookTitle,
          })
        }
        disabled={busy}
      />
      <SessionCTAButton tone="secondary" label="あとで" onPress={onSkip} disabled={busy} />
      <SessionCTAButton tone="ghost" label="使わない" onPress={onSkip} disabled={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCF8',
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  title: {
    color: '#2C2C2C',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 8,
  },
});

