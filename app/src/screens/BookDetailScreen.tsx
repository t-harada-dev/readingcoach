import React, { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { copy } from '../config/copy';
import { enableProgressTracking, updateBookProgress } from '../useCases/ProgressTrackingUseCases';
import { saveSettingsWithDefaults } from '../useCases/SaveSettingsWithDefaults';
import { runSetFocusBookForTodayUseCase } from '../useCases/SetFocusBookForTodayUseCase';
import { BookDetailView } from './BookDetailView';

type Params = {
  bookId: string;
};

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
      await saveSettingsWithDefaults({
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

  const pickImageFromLibrary = async () => {
    if (saving) return;
    try {
      const imagePicker = await resolveImagePickerModule();
      if (!imagePicker) {
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
    } catch (error) {
      Alert.alert('画像の選択に失敗しました', error instanceof Error ? error.message : String(error));
    }
  };

  const takePhoto = async () => {
    if (saving) return;
    try {
      const imagePicker = await resolveImagePickerModule();
      if (!imagePicker) {
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
    } catch (error) {
      Alert.alert('撮影に失敗しました', error instanceof Error ? error.message : String(error));
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
    <BookDetailView
      title={title}
      author={author}
      pageCount={pageCount}
      currentPage={currentPage}
      thumbnailUrl={thumbnailUrl}
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
