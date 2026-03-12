import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BookDTO } from '../bridge/PersistenceBridge';
import { BookCoverImage } from '../components/BookCoverImage';
import { copy } from '../config/copy';

export type LibraryItem = BookDTO & { isFocus: boolean };

export type LibraryViewProps = {
  books: LibraryItem[];
  onPressAddBook: () => void;
  onPressBook: (bookId: string) => void;
};

export function LibraryView({ books, onPressAddBook, onPressBook }: LibraryViewProps) {
  return (
    <View testID="library-screen" style={styles.container}>
      <Text style={styles.title}>{copy.library.title}</Text>
      <Text style={styles.subtitle}>{copy.library.subtitle}</Text>
      <View testID="library-selection-area" style={styles.selectionArea}>
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          style={styles.listView}
          contentContainerStyle={books.length === 0 ? styles.emptyContainer : styles.list}
          ItemSeparatorComponent={() => <View style={styles.rowSeparator} />}
          ListEmptyComponent={<Text testID="library-empty-state" style={styles.empty}>{copy.library.empty}</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              testID={`library-book-row-${item.id}`}
              style={[styles.row, item.isFocus ? styles.rowFocus : null]}
              onPress={() => onPressBook(item.id)}
            >
              <BookCoverImage
                testID={`library-book-cover-${item.id}`}
                placeholderTestID={`library-book-cover-fallback-${item.id}`}
                thumbnailUrl={item.thumbnailUrl}
                coverSource={item.coverSource}
                title={item.title}
                style={styles.cover}
              />
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
      <View style={styles.footer}>
        <TouchableOpacity testID="library-add-book" style={styles.addButton} onPress={onPressAddBook}>
          <Text style={styles.addButtonText}>{copy.library.ctaAddBook}</Text>
        </TouchableOpacity>
      </View>
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
  selectionArea: {
    flex: 1,
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.10)',
    backgroundColor: '#FFFFFF',
    padding: 10,
    minHeight: 360,
  },
  listView: {
    flex: 1,
  },
  addButton: {
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
    paddingBottom: 8,
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
  rowFocus: {
    borderColor: '#D48A3E',
    borderWidth: 2,
    backgroundColor: '#FFF8EE',
  },
  rowSeparator: {
    height: 12,
  },
  cover: {
    width: 44,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
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
    color: '#9A5A1D',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#FCE8D1',
    borderColor: '#E8C29A',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  footer: {
    marginTop: 12,
    paddingBottom: 4,
  },
});
