import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { copy } from '../config/copy';

export type BookDetailViewProps = {
  title: string;
  author: string;
  pageCount: string;
  currentPage: string;
  thumbnailUrl: string;
  progressEnabled: boolean;
  saving: boolean;
  canSave: boolean;
  onChangeTitle: (value: string) => void;
  onChangeAuthor: (value: string) => void;
  onChangePageCount: (value: string) => void;
  onChangeCurrentPage: (value: string) => void;
  onChangeThumbnailUrl: (value: string) => void;
  onPressToggleProgress: () => void;
  onPressSave: () => void;
  onPressSetFocusBook: () => void;
};

export function BookDetailView({
  title,
  author,
  pageCount,
  currentPage,
  thumbnailUrl,
  progressEnabled,
  saving,
  canSave,
  onChangeTitle,
  onChangeAuthor,
  onChangePageCount,
  onChangeCurrentPage,
  onChangeThumbnailUrl,
  onPressToggleProgress,
  onPressSave,
  onPressSetFocusBook,
}: BookDetailViewProps) {
  return (
    <ScrollView testID="book-detail-screen" contentContainerStyle={styles.container}>
      <Text style={styles.subtitle}>{copy.bookDetail.subtitle}</Text>

      {thumbnailUrl.trim().length > 0 ? (
        <Image source={{ uri: thumbnailUrl }} style={styles.cover} resizeMode="cover" />
      ) : null}

      <Text style={styles.label}>{copy.bookDetail.labelTitle}</Text>
      <TextInput testID="book-detail-title" style={styles.input} value={title} onChangeText={onChangeTitle} placeholder="本のタイトル" />

      <Text style={styles.label}>{copy.bookDetail.labelAuthor}</Text>
      <TextInput testID="book-detail-author" style={styles.input} value={author} onChangeText={onChangeAuthor} placeholder="著者名" />

      <Text style={styles.label}>{copy.bookDetail.labelPageCount}</Text>
      <TextInput
        testID="book-detail-page-count"
        style={styles.input}
        value={pageCount}
        onChangeText={onChangePageCount}
        keyboardType="numeric"
        placeholder="例: 320"
      />

      <Text style={styles.label}>{copy.bookDetail.labelCoverUrl}</Text>
      <TextInput
        style={styles.input}
        value={thumbnailUrl}
        onChangeText={onChangeThumbnailUrl}
        placeholder="https://..."
        autoCapitalize="none"
      />

      <TouchableOpacity
        testID="book-detail-progress-toggle"
        style={styles.secondaryButton}
        onPress={onPressToggleProgress}
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
            onChangeText={onChangeCurrentPage}
            keyboardType="numeric"
            placeholder="例: 120"
          />
        </>
      ) : (
        <Text style={styles.helpText}>{copy.bookDetail.progressDisabled}</Text>
      )}

      <TouchableOpacity testID="book-detail-save" style={[styles.primaryButton, !canSave && styles.disabled]} onPress={onPressSave} disabled={!canSave}>
        <Text style={styles.primaryButtonText}>{copy.bookDetail.ctaSave}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="book-detail-focus"
        style={[styles.secondaryButton, saving && styles.disabled]}
        onPress={onPressSetFocusBook}
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
