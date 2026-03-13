import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

  const resetToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'FocusCore', params: { skipRestartOnce: true } }],
    });
  };

  const onConfirm = async () => {
    if (!selected || saving) return;
    setSaving(true);
    try {
      await runNominateNextFocusBookUseCase(selected.id);
    } catch {
      // E-36: nomination save failure should not block returning to home.
    } finally {
      setSaving(false);
      resetToHome();
    }
  };

  return (
    <View testID="next-focus-screen" style={styles.container}>
      <Text style={styles.title}>1冊読み切りました！</Text>
      <Text style={styles.subtitle}>次の本を選択しましょう</Text>

      <View style={styles.selectionArea}>
        <Text style={styles.selectionAreaLabel}>次に読む本</Text>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={books}
            keyExtractor={(item) => item.id}
            style={styles.selectionList}
            contentContainerStyle={books.length === 0 ? styles.emptyList : styles.list}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedBookId;
              return (
                <View testID={`next-focus-book-row-${item.id}`}>
                  <TouchableOpacity
                    testID={`next-focus-book-row-${item.id}-button`}
                    style={[styles.row, isSelected ? styles.rowSelected : null]}
                    onPress={() => setSelectedBookId(item.id)}
                    disabled={saving}
                  >
                    <View style={styles.rowMain}>
                      <Text style={styles.rowTitle}>{item.title}</Text>
                      {item.author ? <Text style={styles.rowMeta}>{item.author}</Text> : null}
                    </View>
                    {isSelected ? <Text style={styles.rowSelectedBadge}>この本を読んでいます</Text> : null}
                  </TouchableOpacity>
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>候補がありません。ライブラリで本を追加してください。</Text>
            }
          />
        )}
      </View>

      {!loading && selectedBookId ? <View testID="next-focus-selection-ready" /> : null}

      <View style={styles.actions}>
        <SessionCTAButton
          testID="next-focus-confirm"
          label="次の本を選ぶ"
          tone="primary"
          onPress={onConfirm}
          disabled={!selected || saving}
        />
        <SessionCTAButton
          testID="next-focus-add-book"
          label="本を追加する"
          tone="secondary"
          onPress={() => navigation.navigate('Library')}
          disabled={saving}
        />
      </View>
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
    color: '#2C2C2C',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 8,
  },
  selectionArea: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.10)',
    backgroundColor: '#FFFFFF',
    padding: 10,
    minHeight: 320,
    maxHeight: 320,
  },
  selectionAreaLabel: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  selectionList: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 10,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  row: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.10)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSelected: {
    borderColor: 'rgba(212,138,62,0.45)',
    backgroundColor: 'rgba(212,138,62,0.06)',
  },
  rowMain: {
    flex: 1,
    paddingRight: 8,
  },
  rowTitle: {
    color: '#2C2C2C',
    fontSize: 14,
    fontWeight: '700',
  },
  rowMeta: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  rowSelectedBadge: {
    color: '#D48A3E',
    fontSize: 12,
    fontWeight: '700',
  },
  empty: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  actions: {
    marginTop: 'auto',
    paddingBottom: 4,
  },
});
