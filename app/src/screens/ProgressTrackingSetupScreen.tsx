import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SessionCTAButton } from '../components/SessionCTAButton';
import { enableProgressTracking, updateBookProgress } from '../useCases/ProgressTrackingUseCases';

function toPositiveInt(value: string): number | undefined {
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  if (n <= 0) return undefined;
  return Math.floor(n);
}

export function ProgressTrackingSetupScreen({ navigation, route }: any) {
  const [pageCount, setPageCount] = useState('');
  const [currentPage, setCurrentPage] = useState('');
  const [busy, setBusy] = useState(false);

  const onSave = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await enableProgressTracking({ source: 'post_completion' });
      const bookId = route.params?.bookId as string | undefined;
      const bookTitle = route.params?.bookTitle as string | undefined;
      if (bookId && bookTitle) {
        await updateBookProgress({
          bookId,
          title: bookTitle,
          pageCount: toPositiveInt(pageCount),
          currentPage: toPositiveInt(currentPage),
        });
      }
      navigation.goBack();
      navigation.goBack();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>進捗の初期設定</Text>
      <Text style={styles.label}>総ページ数（任意）</Text>
      <TextInput
        style={styles.input}
        value={pageCount}
        keyboardType="number-pad"
        onChangeText={setPageCount}
        placeholder="例: 320"
      />
      <Text style={styles.label}>現在ページ（任意）</Text>
      <TextInput
        style={styles.input}
        value={currentPage}
        keyboardType="number-pad"
        onChangeText={setCurrentPage}
        placeholder="例: 120"
      />
      <SessionCTAButton tone="primary" label="保存する" onPress={onSave} disabled={busy} />
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
  label: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 18,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#2C2C2C',
    fontSize: 16,
  },
});

