import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { persistenceBridge, type BookDTO } from '../bridge/PersistenceBridge';
import { copy } from '../config/copy';
import { incrementManualFocusChangeCount } from '../manualFocusChange';

const BG = '#FDFCF8';
const TEXT = '#2C2C2C';
const AMBER = '#D48A3E';

type Params = {
  planId: string;
  planDate: string;
  scheduledAt?: string;
  currentBookId: string;
};

export function FocusBookPickerScreen({
  navigation,
  route,
}: any) {
  const { planDate, planId, scheduledAt, currentBookId } = (route.params ?? {}) as Params;

  const [books, setBooks] = useState<BookDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingBookId, setSavingBookId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await persistenceBridge.getBooks();
        if (!alive) return;
        setBooks(list);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onSelect = async (bookId: string) => {
    if (bookId === currentBookId) return navigation.goBack();
    if (savingBookId) return;
    setSavingBookId(bookId);
    try {
      await persistenceBridge.upsertPlan({
        planId,
        planDate,
        scheduledAt: scheduledAt ?? new Date().toISOString(),
        bookId,
      });
      await incrementManualFocusChangeCount(planDate);
      navigation.goBack();
    } finally {
      setSavingBookId(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{copy.focusBookPicker.title}</Text>
      <Text style={styles.subtitle}>{copy.focusBookPicker.subtitle}</Text>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(b) => b.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const selected = item.id === currentBookId;
            const disabled = savingBookId !== null && savingBookId !== item.id;
            return (
              <TouchableOpacity
                style={[styles.row, selected && styles.rowSelected, disabled && styles.rowDisabled]}
                onPress={() => onSelect(item.id)}
                disabled={disabled}
              >
                <View style={styles.rowText}>
                  <Text style={styles.bookTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.author ? (
                    <Text style={styles.bookAuthor} numberOfLines={1}>
                      {item.author}
                    </Text>
                  ) : null}
                </View>
                {selected ? <Text style={styles.selectedMark}>{copy.focusBookPicker.selectedMark}</Text> : null}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, paddingHorizontal: 22, paddingTop: 18 },
  title: { color: TEXT, fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#6B7280', fontSize: 13, marginTop: 6 },
  loading: { paddingTop: 24 },
  list: { paddingTop: 16, paddingBottom: 24, gap: 10 },
  row: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.10)',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowSelected: {
    borderColor: 'rgba(212, 138, 62, 0.45)',
    backgroundColor: 'rgba(212, 138, 62, 0.06)',
  },
  rowDisabled: { opacity: 0.6 },
  rowText: { flex: 1, paddingRight: 10 },
  bookTitle: { color: TEXT, fontSize: 15, fontWeight: '600' },
  bookAuthor: { color: '#6B7280', fontSize: 13, marginTop: 2 },
  selectedMark: { color: AMBER, fontSize: 13, fontWeight: '700' },
});
