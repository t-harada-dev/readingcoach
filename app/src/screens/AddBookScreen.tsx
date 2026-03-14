import React, { useState } from 'react';
import { Alert, Keyboard } from 'react-native';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import type { ScreenProps } from '../navigation/types';
import { AddBookView } from './AddBookView';
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

type SavePayload = {
  title: string;
  author?: string;
  pageCount?: number;
  thumbnailUrl?: string;
  coverSource?: 'manual' | 'google_books' | 'placeholder';
};

function normalizePageCount(raw: string): number | undefined {
  const parsed = Number(raw);
  if (raw.trim().length === 0) return undefined;
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.floor(parsed);
}

export function AddBookScreen({ navigation, route }: ScreenProps<'AddBook'>) {
  const isOnboarding = route.params?.onboarding === true;
  const manualPrefix = isOnboarding ? 'onboarding' : 'add-book';
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [coverSource, setCoverSource] = useState<'manual' | 'google_books' | 'placeholder'>('placeholder');
  const [saving, setSaving] = useState(false);

  const finishAfterSave = () => {
    if (isOnboarding) {
      navigation.replace('OnboardingTime');
      return;
    }
    navigation.goBack();
  };

  const saveBook = async (payload: SavePayload) => {
    await persistenceBridge.saveBook({
      id: `book_${Date.now()}`,
      title: payload.title,
      author: payload.author,
      pageCount: payload.pageCount,
      thumbnailUrl: payload.thumbnailUrl,
      coverSource: payload.coverSource,
      format: 'paper',
      status: 'active',
    });
  };

  const persistAndFinish = async (payload: SavePayload, options: { clearManualInputs?: boolean } = {}) => {
    const { clearManualInputs = false } = options;
    try {
      setSaving(true);
      await saveBook(payload);
      if (clearManualInputs) {
        setTitle('');
        setAuthor('');
        setPageCount('');
        setThumbnailUrl('');
        setCoverSource('placeholder');
      }
      finishAfterSave();
    } catch (error) {
      showErrorAlert('保存に失敗しました', error);
    } finally {
      setSaving(false);
    }
  };

  const onSaveManual = async () => {
    Keyboard.dismiss();
    const normalizedTitle = title.trim();
    if (!normalizedTitle) return;
    await persistAndFinish(
      {
        title: normalizedTitle,
        author: author.trim() || undefined,
        pageCount: normalizePageCount(pageCount),
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        coverSource: thumbnailUrl.trim().length > 0 ? coverSource : 'placeholder',
      },
      { clearManualInputs: true }
    );
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

  return (
    <AddBookView
      isOnboarding={isOnboarding}
      manualPrefix={manualPrefix}
      title={title}
      author={author}
      pageCount={pageCount}
      thumbnailUrl={thumbnailUrl}
      coverSource={coverSource}
      saving={saving}
      onChangeTitle={setTitle}
      onChangeAuthor={setAuthor}
      onChangePageCount={setPageCount}
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
      onPressSaveManual={onSaveManual}
    />
  );
}
