import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { copy } from '../config/copy';
import { enableProgressTracking, updateBookProgress } from '../useCases/ProgressTrackingUseCases';
import { runSetFocusBookForTodayUseCase } from '../useCases/SetFocusBookForTodayUseCase';

type Params = {
  bookId: string;
};

export function BookDetailScreen({ route, navigation }: any) {
  const { bookId } = (route.params ?? {}) as Params;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [currentPage, setCurrentPage] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [progressEnabled, setProgressEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => title.trim().length > 0 && !saving, [saving, title]);

  const refresh = useCallback(async () => {
    const [book, settings] = await Promise.all([
      persistenceBridge.getBook(bookId),
      persistenceBridge.getSettings(),
    ]);
    if (!book) return;

    setTitle(book.title);
    setAuthor(book.author ?? '');
    setPageCount(book.pageCount ? String(book.pageCount) : '');
    setCurrentPage(book.currentPage ? String(book.currentPage) : '');
    setThumbnailUrl(book.thumbnailUrl ?? '');
    setProgressEnabled(Boolean(settings?.progressTrackingEnabled));
  }, [bookId]);

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

  const onToggleProgress = async () => {
    if (progressEnabled) {
      const current = await persistenceBridge.getSettings();
      await persistenceBridge.saveSettings({
        dailyTargetTime: current?.dailyTargetTime ?? 21 * 60,
        defaultDuration: current?.defaultDuration ?? 15,
        retryLimit: current?.retryLimit ?? 1,
        dayRolloverHour: current?.dayRolloverHour ?? 4,
        progressTrackingEnabled: false,
        progressPromptShown: true,
      });
      setProgressEnabled(false);
      return;
    }

    await enableProgressTracking({ source: 'book_detail' });
    setProgressEnabled(true);
  };

  const onSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || saving) return;
    setSaving(true);
    try {
      const parsedPageCount = Number(pageCount);
      const normalizedPageCount =
        pageCount.trim().length > 0 && Number.isFinite(parsedPageCount) && parsedPageCount > 0
          ? Math.floor(parsedPageCount)
          : undefined;
      const parsedCurrentPage = Number(currentPage);
      const normalizedCurrentPage =
        currentPage.trim().length > 0 && Number.isFinite(parsedCurrentPage) && parsedCurrentPage >= 0
          ? Math.floor(parsedCurrentPage)
          : undefined;

      await persistenceBridge.saveBook({
        id: bookId,
        title: trimmedTitle,
        author: author.trim() || undefined,
        pageCount: normalizedPageCount,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
      });

      if (progressEnabled) {
        await updateBookProgress({
          bookId,
          title: trimmedTitle,
          pageCount: normalizedPageCount,
          currentPage: normalizedCurrentPage,
        });
      }

      Alert.alert(copy.bookDetail.saved);
    } catch (error) {
      Alert.alert(copy.bookDetail.saveError, error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  const onSetFocusBook = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await runSetFocusBookForTodayUseCase(bookId);
      navigation.navigate('FocusCore');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView testID="book-detail-screen" contentContainerStyle={styles.container}>
      <Text style={styles.subtitle}>{copy.bookDetail.subtitle}</Text>

      {thumbnailUrl.trim().length > 0 ? (
        <Image source={{ uri: thumbnailUrl }} style={styles.cover} resizeMode="cover" />
      ) : null}

      <Text style={styles.label}>{copy.bookDetail.labelTitle}</Text>
      <TextInput testID="book-detail-title" style={styles.input} value={title} onChangeText={setTitle} placeholder="本のタイトル" />

      <Text style={styles.label}>{copy.bookDetail.labelAuthor}</Text>
      <TextInput testID="book-detail-author" style={styles.input} value={author} onChangeText={setAuthor} placeholder="著者名" />

      <Text style={styles.label}>{copy.bookDetail.labelPageCount}</Text>
      <TextInput
        testID="book-detail-page-count"
        style={styles.input}
        value={pageCount}
        onChangeText={setPageCount}
        keyboardType="numeric"
        placeholder="例: 320"
      />

      <Text style={styles.label}>{copy.bookDetail.labelCoverUrl}</Text>
      <TextInput
        style={styles.input}
        value={thumbnailUrl}
        onChangeText={setThumbnailUrl}
        placeholder="https://..."
        autoCapitalize="none"
      />

      <View style={styles.progressSection}>
        <TouchableOpacity
          testID="book-detail-progress-toggle"
          style={styles.secondaryButton}
          onPress={onToggleProgress}
          disabled={saving}
        >
          <Text
            testID={progressEnabled ? 'book-detail-disable-progress' : 'book-detail-enable-progress'}
            style={styles.secondaryButtonText}
          >
            {progressEnabled ? copy.bookDetail.ctaDisableProgress : copy.bookDetail.ctaEnableProgress}
          </Text>
        </TouchableOpacity>
        {progressEnabled ? (
          <>
            <Text style={styles.label}>{copy.bookDetail.labelCurrentPage}</Text>
            <TextInput
              testID="book-detail-current-page"
              style={styles.input}
              value={currentPage}
              onChangeText={setCurrentPage}
              keyboardType="numeric"
              placeholder="例: 120"
            />
          </>
        ) : (
          <Text style={styles.helpText}>{copy.bookDetail.progressDisabled}</Text>
        )}
      </View>

      <TouchableOpacity testID="book-detail-save" style={[styles.primaryButton, !canSave && styles.disabled]} onPress={onSave} disabled={!canSave}>
        <Text style={styles.primaryButtonText}>{copy.bookDetail.ctaSave}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="book-detail-focus"
        style={[styles.secondaryButton, saving && styles.disabled]}
        onPress={onSetFocusBook}
        disabled={saving}
      >
        <Text style={styles.secondaryButtonText}>{copy.bookDetail.ctaSetFocusBook}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDFCF8',
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 28,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 12,
  },
  cover: {
    width: 140,
    height: 190,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#E5E7EB',
  },
  label: {
    color: '#4B5563',
    fontSize: 13,
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.12)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#2C2C2C',
    fontSize: 15,
  },
  progressSection: {
    marginTop: 10,
  },
  helpText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 8,
  },
  primaryButton: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#D48A3E',
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 138, 62, 0.45)',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#D48A3E',
    fontSize: 14,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
});
