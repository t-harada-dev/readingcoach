import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { copy } from '../config/copy';
import { enableProgressTracking, updateBookProgress } from '../useCases/ProgressTrackingUseCases';
import { saveSettingsWithDefaults } from '../useCases/SaveSettingsWithDefaults';
import { runSetFocusBookForTodayUseCase } from '../useCases/SetFocusBookForTodayUseCase';
import { BookDetailView } from './BookDetailView';
import { validateProgressToggleInputs, type ProgressToggleGuardFailureReason } from './bookDetailProgressGuard';
import type { ScreenProps } from '../navigation/types';
import { useAsyncFocusEffect } from '../hooks/useAsyncFocusEffect';
import { showErrorAlert } from '../utils/errorAlert';

type ImagePickerModule = typeof import('expo-image-picker');
let cachedImagePickerModule: ImagePickerModule | null | undefined;

async function resolveImagePickerModule(): Promise<ImagePickerModule | null> {
  if (cachedImagePickerModule !== undefined) return cachedImagePickerModule;
  try {
    cachedImagePickerModule = await import('expo-image-picker');
  } catch {
    cachedImagePickerModule = null;
  }
  return cachedImagePickerModule;
}

export function BookDetailScreen({ route, navigation }: ScreenProps<'BookDetail'>) {
  const { bookId, manualChangePlanDate, manualChangeCurrentBookId } = route.params;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [currentPage, setCurrentPage] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [coverSource, setCoverSource] = useState<'manual' | 'google_books' | 'placeholder'>('placeholder');
  const [progressEnabled, setProgressEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  type SavedSnapshot = {
    title: string;
    author: string;
    pageCount: string;
    currentPage: string;
    thumbnailUrl: string;
    coverSource: 'manual' | 'google_books' | 'placeholder';
    progressEnabled: boolean;
  };
  const savedSnapshotRef = useRef<SavedSnapshot | null>(null);

  const canSave = useMemo(() => title.trim().length > 0 && !saving, [saving, title]);

  function norm(s: string | undefined): string {
    return (s ?? '').trim();
  }
  function isDirty(): boolean {
    const saved = savedSnapshotRef.current;
    if (!saved) return false;
    return (
      norm(title) !== norm(saved.title) ||
      norm(author) !== norm(saved.author) ||
      norm(pageCount) !== norm(saved.pageCount) ||
      norm(currentPage) !== norm(saved.currentPage) ||
      norm(thumbnailUrl) !== norm(saved.thumbnailUrl) ||
      coverSource !== saved.coverSource ||
      progressEnabled !== saved.progressEnabled
    );
  }

  const resolveProgressGuardMessage = (reason: ProgressToggleGuardFailureReason): string => {
    switch (reason) {
      case 'missing_page_count':
        return copy.bookDetail.progressGuardMissingPageCount;
      case 'invalid_page_count':
        return copy.bookDetail.progressGuardInvalidPageCount;
      case 'missing_current_page':
        return copy.bookDetail.progressGuardMissingCurrentPage;
      case 'invalid_current_page':
        return copy.bookDetail.progressGuardInvalidCurrentPage;
      case 'current_exceeds_page_count':
        return copy.bookDetail.progressGuardCurrentExceedsPageCount;
      default:
        return copy.bookDetail.progressGuardMissingPageCount;
    }
  };

  const refresh = useCallback(async () => {
    const [book, settings] = await Promise.all([
      persistenceBridge.getBook(bookId),
      persistenceBridge.getSettings(),
    ]);
    if (!book) return;

    setTitle(book.title);
    setAuthor(book.author ?? '');
    setPageCount(book.pageCount ? String(book.pageCount) : '');
    setCurrentPage(typeof book.currentPage === 'number' ? String(book.currentPage) : '');
    setThumbnailUrl(book.thumbnailUrl ?? '');
    setCoverSource(book.coverSource ?? (book.thumbnailUrl ? 'google_books' : 'placeholder'));
    const hasProgressData =
      typeof book.currentPage === 'number' || (book.lastProgressUpdatedAt ?? '').trim().length > 0;
    const progressOn = hasProgressData ? Boolean(settings?.progressTrackingEnabled) : false;
    setProgressEnabled(progressOn);
    savedSnapshotRef.current = {
      title: book.title,
      author: book.author ?? '',
      pageCount: book.pageCount != null ? String(book.pageCount) : '',
      currentPage: typeof book.currentPage === 'number' ? String(book.currentPage) : '',
      thumbnailUrl: book.thumbnailUrl ?? '',
      coverSource: book.coverSource ?? (book.thumbnailUrl ? 'google_books' : 'placeholder'),
      progressEnabled: progressOn,
    };
  }, [bookId]);

  useAsyncFocusEffect(async (signal) => {
    await refresh();
    if (!signal.alive) return;
  }, [refresh]);

  const onToggleProgress = async () => {
    if (progressEnabled) {
      await saveSettingsWithDefaults({
        progressTrackingEnabled: false,
        progressPromptShown: true,
      });
      setProgressEnabled(false);
      return;
    }

    const guard = validateProgressToggleInputs(pageCount, currentPage);
    if (!guard.ok) {
      Alert.alert(copy.bookDetail.progressGuardTitle, resolveProgressGuardMessage(guard.reason));
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

      if (progressEnabled) {
        const guard = validateProgressToggleInputs(pageCount, currentPage);
        if (!guard.ok) {
          Alert.alert(copy.bookDetail.progressGuardTitle, resolveProgressGuardMessage(guard.reason));
          return;
        }
      }

      await persistenceBridge.saveBook({
        id: bookId,
        title: trimmedTitle,
        author: author.trim() || undefined,
        pageCount: normalizedPageCount,
        currentPage: normalizedCurrentPage,
        lastProgressUpdatedAt: normalizedCurrentPage !== undefined ? new Date().toISOString() : undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        coverSource: thumbnailUrl.trim().length > 0 ? coverSource : 'placeholder',
      });

      if (progressEnabled) {
        await updateBookProgress({
          bookId,
          title: trimmedTitle,
          pageCount: normalizedPageCount,
          currentPage: normalizedCurrentPage,
        });
      }

      savedSnapshotRef.current = {
        title: trimmedTitle,
        author: author.trim(),
        pageCount: normalizedPageCount != null ? String(normalizedPageCount) : '',
        currentPage: normalizedCurrentPage != null ? String(normalizedCurrentPage) : '',
        thumbnailUrl: thumbnailUrl.trim(),
        coverSource: thumbnailUrl.trim().length > 0 ? coverSource : 'placeholder',
        progressEnabled,
      };
      Alert.alert(copy.bookDetail.saved);
    } catch (error) {
      showErrorAlert(copy.bookDetail.saveError, error);
    } finally {
      setSaving(false);
    }
  };

  const pickImageFromLibrary = async () => {
    if (saving) return;
    try {
      const imagePicker = await resolveImagePickerModule();
      if (!imagePicker || typeof imagePicker.requestMediaLibraryPermissionsAsync !== 'function') {
        Alert.alert('画像機能を利用できません', 'このビルドでは画像選択機能が無効です。');
        return;
      }
      const permission = await imagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('権限が必要です', '写真ライブラリへのアクセスを許可してください。');
        return;
      }
      const result = await imagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (result.canceled) return;
      const selected = result.assets[0];
      if (!selected?.uri) return;
      setThumbnailUrl(selected.uri);
      setCoverSource('manual');
    } catch (error) {
      showErrorAlert('画像の選択に失敗しました', error);
    }
  };

  const takePhoto = async () => {
    if (saving) return;
    try {
      const imagePicker = await resolveImagePickerModule();
      if (!imagePicker || typeof imagePicker.requestCameraPermissionsAsync !== 'function') {
        Alert.alert('画像機能を利用できません', 'このビルドではカメラ機能が無効です。');
        return;
      }
      const permission = await imagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('権限が必要です', 'カメラへのアクセスを許可してください。');
        return;
      }
      const result = await imagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (result.canceled) return;
      const selected = result.assets[0];
      if (!selected?.uri) return;
      setThumbnailUrl(selected.uri);
      setCoverSource('manual');
    } catch (error) {
      showErrorAlert('撮影に失敗しました', error);
    }
  };

  const doSetFocusBook = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await runSetFocusBookForTodayUseCase(bookId, {
        manualChangePlanDate,
        manualChangeCurrentBookId,
      });
      navigation.navigate('FocusCore');
    } finally {
      setSaving(false);
    }
  };

  const onSetFocusBook = () => {
    if (saving) return;
    if (!isDirty()) {
      void doSetFocusBook();
      return;
    }
    Alert.alert(copy.bookDetail.unsavedConfirmTitle, '', [
      { text: copy.bookDetail.unsavedConfirmNo, onPress: () => void doSetFocusBook() },
      {
        text: copy.bookDetail.unsavedConfirmYes,
        onPress: async () => {
          await onSave();
          await doSetFocusBook();
        },
      },
    ]);
  };

  return (
    <BookDetailView
      title={title}
      author={author}
      pageCount={pageCount}
      currentPage={currentPage}
      thumbnailUrl={thumbnailUrl}
      coverSource={coverSource}
      progressEnabled={progressEnabled}
      saving={saving}
      canSave={canSave}
      onChangeTitle={setTitle}
      onChangeAuthor={setAuthor}
      onChangePageCount={setPageCount}
      onChangeCurrentPage={setCurrentPage}
      onPressTakePhoto={() => {
        void takePhoto();
      }}
      onPressPickFromLibrary={() => {
        void pickImageFromLibrary();
      }}
      onPressRemoveCover={() => {
        setThumbnailUrl('');
        setCoverSource('placeholder');
      }}
      onPressToggleProgress={() => {
        void onToggleProgress();
      }}
      onPressSave={() => {
        void onSave();
      }}
      onPressSetFocusBook={() => {
        void onSetFocusBook();
      }}
    />
  );
}
