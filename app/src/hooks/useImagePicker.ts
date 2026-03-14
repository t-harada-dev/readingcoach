import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

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

type UseImagePickerParams = {
  disabled?: boolean;
  onImageSelected: (uri: string) => void;
};

type UseImagePickerResult = {
  pickImageFromLibrary: () => Promise<void>;
  takePhoto: () => Promise<void>;
  isLoading: boolean;
};

export function useImagePicker({ disabled = false, onImageSelected }: UseImagePickerParams): UseImagePickerResult {
  const [isLoading, setIsLoading] = useState(false);

  const pickImageFromLibrary = useCallback(async () => {
    if (disabled || isLoading) return;
    setIsLoading(true);
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
      onImageSelected(selected.uri);
    } catch (error) {
      showErrorAlert('画像の選択に失敗しました', error);
    } finally {
      setIsLoading(false);
    }
  }, [disabled, isLoading, onImageSelected]);

  const takePhoto = useCallback(async () => {
    if (disabled || isLoading) return;
    setIsLoading(true);
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
      onImageSelected(selected.uri);
    } catch (error) {
      showErrorAlert('撮影に失敗しました', error);
    } finally {
      setIsLoading(false);
    }
  }, [disabled, isLoading, onImageSelected]);

  return {
    pickImageFromLibrary,
    takePhoto,
    isLoading,
  };
}
