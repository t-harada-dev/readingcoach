import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BookCoverImage } from '../components/BookCoverImage';
import { SessionCTAButton } from '../components/SessionCTAButton';
import { persistenceBridge, type BookDTO } from '../bridge/PersistenceBridge';
import { runNominateNextFocusBookUseCase } from '../useCases/NominateNextFocusBookUseCase';
import { runSetFocusBookForTodayUseCase } from '../useCases/SetFocusBookForTodayUseCase';
import type { ScreenProps } from '../navigation/types';
import { useAsyncFocusEffect } from '../hooks/useAsyncFocusEffect';
import { appTheme } from '../theme/layout';
import { copy } from '../config/copy';

export function NextFocusNominationScreen({ navigation, route }: ScreenProps<'NextFocusNomination'>) {
  const { completedBookId } = route.params;
  const [books, setBooks] = useState<BookDTO[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useAsyncFocusEffect(async (signal) => {
    try {
      const list = await persistenceBridge.getBooks();
      if (!signal.alive) return;
      const candidates = list.filter((b) => b.id !== completedBookId);
      setBooks(candidates);
      setSelectedBookId(null);
    } finally {
      if (!signal.alive) return;
      setLoading(false);
    }
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
      await runSetFocusBookForTodayUseCase(selected.id);
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
                    <BookCoverImage
                      thumbnailUrl={item.thumbnailUrl}
                      coverSource={item.coverSource}
                      title={item.title}
                      style={styles.rowCover}
                    />
                    <View style={styles.rowMain}>
                      <Text style={styles.rowTitle}>{item.title}</Text>
                      {item.author ? <Text style={styles.rowMeta}>{item.author}</Text> : null}
                      {item.status === 'completed' ? (
                        <Text style={styles.rowCompletedBadge}>{copy.nextFocusNomination.completedBadge}</Text>
                      ) : null}
                    </View>
                    {isSelected ? <Text style={styles.rowSelectedBadge}>選択中</Text> : null}
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

      {!loading ? <View testID="next-focus-selection-ready" /> : null}

      <View style={styles.actions}>
        <SessionCTAButton
          testID="next-focus-confirm"
          label={copy.nextFocusNomination.ctaConfirm}
          tone="primary"
          onPress={onConfirm}
          disabled={!selected || saving}
        />
        <SessionCTAButton
          testID="next-focus-add-book"
          label={copy.nextFocusNomination.ctaAddBook}
          tone="secondary"
          onPress={() => navigation.navigate('AddBook')}
          disabled={saving}
        />
      </View>
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
  title: {
    color: appTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 8,
  },
  selectionArea: {
    flex: 1,
    marginTop: 8,
    borderRadius: appTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
    padding: 10,
    minHeight: 320,
  },
  selectionAreaLabel: {
    color: appTheme.colors.textSecondary,
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
    borderRadius: appTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSelected: {
    borderColor: 'rgba(212,138,62,0.45)',
    backgroundColor: appTheme.colors.accentSoft,
  },
  rowCover: {
    width: 36,
    height: 48,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: appTheme.colors.surfaceMuted,
  },
  rowMain: {
    flex: 1,
    paddingRight: 8,
  },
  rowTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  rowMeta: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  rowCompletedBadge: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  rowSelectedBadge: {
    color: appTheme.colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  empty: {
    color: appTheme.colors.textMuted,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  actions: {
    marginTop: 12,
    paddingBottom: 4,
  },
});
