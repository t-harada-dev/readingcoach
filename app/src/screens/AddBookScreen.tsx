import React, { useState } from 'react';
import { Keyboard } from 'react-native';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import type { ScreenProps } from '../navigation/types';
import { AddBookView } from './AddBookView';
import { useImagePicker } from '../hooks/useImagePicker';

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
  const [errorText, setErrorText] = useState<string | null>(null);
  const { pickImageFromLibrary, takePhoto, isLoading: imagePickerLoading } = useImagePicker({
    disabled: saving,
    onImageSelected: (uri) => {
      setThumbnailUrl(uri);
      setCoverSource('manual');
    },
  });

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
      setErrorText(null);
      await saveBook(payload);
      if (clearManualInputs) {
        setTitle('');
        setAuthor('');
        setPageCount('');
        setThumbnailUrl('');
        setCoverSource('placeholder');
      }
      finishAfterSave();
    } catch {
      setErrorText('保存に失敗しました');
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

  return (
    <AddBookView
      isOnboarding={isOnboarding}
      manualPrefix={manualPrefix}
      title={title}
      author={author}
      pageCount={pageCount}
      thumbnailUrl={thumbnailUrl}
      coverSource={coverSource}
      saving={saving || imagePickerLoading}
      loading={saving || imagePickerLoading}
      errorText={errorText}
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
