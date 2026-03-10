import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { persistenceBridge, type BookDTO } from '../bridge/PersistenceBridge';
import { copy } from '../config/copy';
import { toLocalISODateString } from '../date';

type LibraryItem = BookDTO & { isFocus: boolean };

export function LibraryScreen({ navigation }: any) {
  const [books, setBooks] = useState<LibraryItem[]>([]);

  const refresh = useCallback(async () => {
    const today = toLocalISODateString(new Date());
    const [list, plan] = await Promise.all([
      persistenceBridge.getBooks(),
      persistenceBridge.getPlanForDate(today),
    ]);
    const rows = list.map((book) => ({
      ...book,
      isFocus: plan?.bookId === book.id,
    }));
    setBooks(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        await refresh();
        if (!alive) return;
      })();
      return () => {
        alive = false;
      };
    }, [refresh])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{copy.library.title}</Text>
      <Text style={styles.subtitle}>{copy.library.subtitle}</Text>

      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddBook')}>
        <Text style={styles.addButtonText}>{copy.library.ctaAddBook}</Text>
      </TouchableOpacity>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        contentContainerStyle={books.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={<Text style={styles.empty}>{copy.library.empty}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              navigation.navigate('BookDetail', {
                bookId: item.id,
              })
            }
          >
            <View style={styles.rowMain}>
              <Text style={styles.bookTitle} numberOfLines={1}>
                {item.title}
              </Text>
              {item.author ? (
                <Text style={styles.bookMeta} numberOfLines={1}>
                  {item.author}
                </Text>
              ) : null}
              {item.pageCount ? (
                <Text style={styles.bookMeta}>{item.pageCount} ページ</Text>
              ) : null}
            </View>
            {item.isFocus ? <Text style={styles.focusBadge}>{copy.library.focusBadge}</Text> : null}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCF8',
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 24,
  },
  title: {
    color: '#2C2C2C',
    fontSize: 19,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 6,
  },
  addButton: {
    marginTop: 14,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#D48A3E',
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  list: {
    gap: 10,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    color: '#6B7280',
    fontSize: 14,
  },
  row: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.10)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowMain: {
    flex: 1,
    paddingRight: 10,
  },
  bookTitle: {
    color: '#2C2C2C',
    fontSize: 15,
    fontWeight: '600',
  },
  bookMeta: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  focusBadge: {
    color: '#D48A3E',
    fontSize: 12,
    fontWeight: '700',
  },
});
