import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { persistenceBridge, type BookDTO } from '../bridge/PersistenceBridge';
import { BookCoverImage } from '../components/BookCoverImage';
import { SessionCTAButton } from '../components/SessionCTAButton';
import { enableProgressTracking, updateBookProgress } from '../useCases/ProgressTrackingUseCases';

function toPositiveInt(value: string): number | undefined {
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  if (n <= 0) return undefined;
  return Math.floor(n);
}

function toNonNegativeInt(value: string): number | undefined {
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  if (n < 0) return undefined;
  return Math.floor(n);
}

export function ProgressTrackingSetupScreen({ navigation, route }: any) {
  const [pageCount, setPageCount] = useState('');
  const [currentPage, setCurrentPage] = useState('');
  const [busy, setBusy] = useState(false);
  const [book, setBook] = useState<BookDTO | null>(null);
  const bookId = route.params?.bookId as string | undefined;
  const routeBookTitle = route.params?.bookTitle as string | undefined;
  const routeBookAuthor = route.params?.bookAuthor as string | undefined;
  const routeBookThumbnailUrl = route.params?.bookThumbnailUrl as string | undefined;
  const routeBookCoverSource = route.params?.bookCoverSource as BookDTO['coverSource'] | undefined;
  const displayTitle = routeBookTitle ?? book?.title;
  const displayAuthor = routeBookAuthor ?? book?.author;
  const displayThumbnail = routeBookThumbnailUrl ?? book?.thumbnailUrl;
  const displayCoverSource = book?.coverSource ?? routeBookCoverSource;

  useEffect(() => {
    let alive = true;
    if (!bookId) return () => { alive = false; };
    (async () => {
      const found = await persistenceBridge.getBook(bookId);
      if (!alive) return;
      setBook(found);
    })();
    return () => {
      alive = false;
    };
  }, [bookId]);

  const onSave = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await enableProgressTracking({ source: 'post_completion' });
      const bookTitle = routeBookTitle ?? book?.title;
      if (bookId && bookTitle) {
        await updateBookProgress({
          bookId,
          title: bookTitle,
          pageCount: toPositiveInt(pageCount),
          currentPage: toNonNegativeInt(currentPage),
        });
      }
      navigation.goBack();
      navigation.goBack();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View testID="progress-setup-screen" style={styles.container}>
      <Text style={styles.title}>進捗状況の登録</Text>
      <Text style={styles.subtitle}>あとで変更できます。未入力のまま戻ることも可能です。</Text>
      <View testID="progress-setup-book-card" style={styles.bookCard}>
        <Text style={styles.bookLabel}>対象の本</Text>
        {displayTitle ? <Text style={styles.bookTitle}>{displayTitle}</Text> : <Text style={styles.bookFallback}>対象未設定</Text>}
        {displayAuthor ? <Text style={styles.bookAuthor}>{displayAuthor}</Text> : null}
        {displayThumbnail ? (
          <BookCoverImage
            testID="progress-setup-book-cover"
            thumbnailUrl={displayThumbnail}
            coverSource={displayCoverSource}
            title={displayTitle}
            style={styles.cover}
          />
        ) : null}
      </View>
      <Text style={styles.label}>総ページ数（任意）</Text>
      <TextInput
        testID="progress-setup-page-count"
        style={styles.input}
        value={pageCount}
        keyboardType="number-pad"
        onChangeText={setPageCount}
        placeholder="例: 320"
      />
      <Text style={styles.label}>現在ページ（任意）</Text>
      <TextInput
        testID="progress-setup-current-page"
        style={styles.input}
        value={currentPage}
        keyboardType="number-pad"
        onChangeText={setCurrentPage}
        placeholder="例: 120"
      />
      <View style={styles.actions}>
        <SessionCTAButton testID="progress-setup-save" tone="primary" label="保存する" onPress={onSave} disabled={busy} />
        <SessionCTAButton
          testID="progress-setup-back"
          tone="ghost"
          label="戻る"
          onPress={() => navigation.goBack()}
          disabled={busy}
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
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    color: '#2C2C2C',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 8,
  },
  bookCard: {
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.10)',
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  bookLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
  },
  bookTitle: {
    color: '#2C2C2C',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  bookFallback: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 6,
  },
  bookAuthor: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
  },
  cover: {
    width: 72,
    height: 98,
    borderRadius: 10,
    marginTop: 10,
  },
  actions: {
    marginTop: 'auto',
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
