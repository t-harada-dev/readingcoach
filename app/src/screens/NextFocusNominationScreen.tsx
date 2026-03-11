import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SessionCTAButton } from '../components/SessionCTAButton';
import { persistenceBridge, type BookDTO } from '../bridge/PersistenceBridge';
import { runNominateNextFocusBookUseCase } from '../useCases/NominateNextFocusBookUseCase';

type Params = {
  completedBookId: string;
};

export function NextFocusNominationScreen({ navigation, route }: any) {
  const { completedBookId } = (route.params ?? {}) as Params;
  const [books, setBooks] = useState<BookDTO[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await persistenceBridge.getBooks();
        if (!alive) return;
        const candidates = list.filter((b) => b.id !== completedBookId && b.status !== 'completed');
        setBooks(candidates);
        if (candidates[0]) setSelectedBookId(candidates[0].id);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [completedBookId]);

  const selected = useMemo(
    () => books.find((b) => b.id === selectedBookId) ?? null,
    [books, selectedBookId]
  );

  const onConfirm = async () => {
    if (!selected || saving) return;
    setSaving(true);
    try {
      await runNominateNextFocusBookUseCase(selected.id);
    } catch {
      // E-36: nomination save failure should not block returning to home.
    } finally {
      setSaving(false);
      navigation.navigate('FocusCore');
    }
  };

  return (
    <View testID="next-focus-screen" style={styles.container}>
      <Text style={styles.title}>次に読む本を決めましょう</Text>
      <Text style={styles.subtitle}>読了おめでとうございます。明日の Focus Book を1冊だけ選びます。</Text>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View testID={`next-focus-book-row-${item.id}`}>
              <SessionCTAButton
                testID={`next-focus-book-row-${item.id}-button`}
                label={item.author ? `${item.title} / ${item.author}` : item.title}
                tone={item.id === selectedBookId ? 'primary' : 'secondary'}
                onPress={() => setSelectedBookId(item.id)}
                disabled={saving}
              />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>候補がありません。後でライブラリから設定できます。</Text>
          }
        />
      )}
      <SessionCTAButton
        testID="next-focus-confirm"
        label="次の本を確定"
        tone="primary"
        onPress={onConfirm}
        disabled={!selected || saving}
      />
      <SessionCTAButton
        label="あとで"
        tone="ghost"
        onPress={() => navigation.navigate('FocusCore')}
        disabled={saving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCF8',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 24,
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
    marginTop: 8,
    marginBottom: 8,
  },
  loadingWrap: {
    paddingTop: 20,
  },
  list: {
    paddingBottom: 12,
  },
  empty: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 12,
  },
});
