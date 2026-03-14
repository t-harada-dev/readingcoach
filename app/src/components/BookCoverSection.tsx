import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BookCoverImage } from './BookCoverImage';
import { copy } from '../config/copy';
import { appTheme } from '../theme/layout';

const COVER_REMOVE_LABEL = '表紙画像を削除';

export type BookCoverSectionProps = {
  thumbnailUrl: string;
  coverSource?: 'manual' | 'google_books' | 'placeholder';
  title: string;
  onTakePhoto: () => void;
  onPickFromLibrary: () => void;
  onRemoveCover: () => void;
  saving: boolean;
  testIDPrefix?: string;
};

export function BookCoverSection({
  thumbnailUrl,
  coverSource,
  title,
  onTakePhoto,
  onPickFromLibrary,
  onRemoveCover,
  saving,
  testIDPrefix = 'book-cover',
}: BookCoverSectionProps) {
  return (
    <>
      <Text style={styles.label}>{copy.bookDetail.labelCoverImage}</Text>
      <View style={styles.coverSectionCard}>
        <BookCoverImage
          testID={testIDPrefix ? `${testIDPrefix}-image` : undefined}
          placeholderTestID={testIDPrefix ? `${testIDPrefix}-placeholder` : undefined}
          thumbnailUrl={thumbnailUrl}
          coverSource={coverSource}
          title={title}
          style={styles.cover}
        />
        <TouchableOpacity
          testID={testIDPrefix ? `${testIDPrefix}-camera` : undefined}
          style={styles.secondaryButton}
          onPress={onTakePhoto}
          disabled={saving}
        >
          <Text style={styles.secondaryButtonText}>{copy.bookDetail.ctaTakePhoto}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID={testIDPrefix ? `${testIDPrefix}-library` : undefined}
          style={styles.secondaryButton}
          onPress={onPickFromLibrary}
          disabled={saving}
        >
          <Text style={styles.secondaryButtonText}>{copy.bookDetail.ctaPickImage}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID={testIDPrefix ? `${testIDPrefix}-remove` : undefined}
          style={styles.secondaryButton}
          onPress={onRemoveCover}
          disabled={saving || thumbnailUrl.trim().length === 0}
        >
          <Text style={styles.secondaryButtonText}>{COVER_REMOVE_LABEL}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
    marginTop: 6,
  },
  coverSectionCard: {
    marginTop: 2,
    borderRadius: appTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
    padding: 12,
  },
  cover: {
    width: 140,
    height: 190,
    borderRadius: appTheme.borderRadius.md,
    marginBottom: 12,
    backgroundColor: appTheme.colors.surfaceMuted,
  },
  secondaryButton: {
    marginTop: 10,
    borderRadius: appTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(212, 138, 62, 0.45)',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: appTheme.colors.surface,
  },
  secondaryButtonText: {
    color: appTheme.colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
});
