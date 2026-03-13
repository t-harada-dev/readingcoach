import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SessionCTAButton } from '../components/SessionCTAButton';
import { skipProgressTrackingPrompt } from '../useCases/ProgressTrackingUseCases';

export function ProgressTrackingPromptScreen({ navigation, route }: any) {
  const [busy, setBusy] = useState(false);
  const closePrompt = () => {
    if (typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    if (typeof navigation.dismiss === 'function') {
      navigation.dismiss();
    }
  };

  const onSkip = async () => {
    if (busy) return;
    setBusy(true);
    closePrompt();
    let settled = false;
    try {
      await Promise.race<void>([
        skipProgressTrackingPrompt(),
        new Promise<void>((resolve) =>
          setTimeout(() => {
            if (settled) return;
            resolve();
          }, 5000)
        ),
      ]);
    } catch {
      // Persist is best-effort. Users must be able to return to completion even on failure.
    } finally {
      settled = true;
    }
  };

  return (
    <View testID="progress-prompt-screen" style={styles.container}>
      <Text style={styles.title}>進捗バーを使いますか？</Text>
      <Text style={styles.subtitle}>
        任意機能です。使わなくても、開始・継続・完了の体験は変わりません。
      </Text>
      <SessionCTAButton
        testID="progress-prompt-enable"
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
      <SessionCTAButton testID="progress-prompt-later" tone="secondary" label="あとで" onPress={onSkip} disabled={busy} />
      <SessionCTAButton testID="progress-prompt-disable" tone="ghost" label="使わない" onPress={onSkip} disabled={busy} />
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
