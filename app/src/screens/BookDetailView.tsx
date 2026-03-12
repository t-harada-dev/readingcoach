import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BookCoverImage } from '../components/BookCoverImage';
import { copy } from '../config/copy';

export type BookDetailViewProps = {
  title: string;
  author: string;
  pageCount: string;
  currentPage: string;
  thumbnailUrl: string;
  coverSource?: 'manual' | 'google_books' | 'placeholder';
  progressEnabled: boolean;
  saving: boolean;
  canSave: boolean;
  onChangeTitle: (value: string) => void;
  onChangeAuthor: (value: string) => void;
  onChangePageCount: (value: string) => void;
  onChangeCurrentPage: (value: string) => void;
  onPressTakePhoto: () => void;
  onPressPickFromLibrary: () => void;
  onPressRemoveCover: () => void;
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
  coverSource,
  progressEnabled,
  saving,
  canSave,
  onChangeTitle,
  onChangeAuthor,
  onChangePageCount,
  onChangeCurrentPage,
  onPressTakePhoto,
  onPressPickFromLibrary,
  onPressRemoveCover,
  onPressToggleProgress,
  onPressSave,
  onPressSetFocusBook,
}: BookDetailViewProps) {
  return (
    <ScrollView testID="book-detail-screen" contentContainerStyle={styles.container}>
      {copy.bookDetail.subtitle ? <Text style={styles.subtitle}>{copy.bookDetail.subtitle}</Text> : null}

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

      <Text style={styles.label}>{copy.bookDetail.labelCurrentPage}</Text>
      {progressEnabled ? (
        <TextInput
          testID="book-detail-current-page"
          style={styles.input}
          value={currentPage}
          onChangeText={onChangeCurrentPage}
          keyboardType="numeric"
          placeholder="例: 120"
        />
      ) : (
        <Text style={styles.helpText}>{copy.bookDetail.progressDisabled}</Text>
      )}

      <View style={styles.progressSettingRow}>
        <View style={styles.progressSettingTextWrap}>
          <Text style={styles.progressSettingLabel}>進捗バー設定</Text>
          <Text
            testID={progressEnabled ? 'book-detail-disable-progress' : 'book-detail-enable-progress'}
            style={styles.progressState}
          >
            {progressEnabled ? '現在: ON' : '現在: OFF'}
          </Text>
        </View>
        <Switch
          testID="book-detail-progress-toggle"
          value={progressEnabled}
          onValueChange={onPressToggleProgress}
          disabled={saving}
          trackColor={{ false: '#C7CED8', true: '#F0C58C' }}
          thumbColor={progressEnabled ? '#D48A3E' : '#FFFFFF'}
        />
      </View>

      <Text style={styles.label}>{copy.bookDetail.labelCoverImage}</Text>
      <BookCoverImage
        testID="book-detail-cover-image"
        placeholderTestID="book-detail-cover-placeholder"
        thumbnailUrl={thumbnailUrl}
        coverSource={coverSource}
        title={title}
        style={styles.cover}
      />
      <TouchableOpacity
        testID="book-detail-cover-camera"
        style={styles.secondaryButton}
        onPress={onPressTakePhoto}
        disabled={saving}
      >
        <Text style={styles.secondaryButtonText}>{copy.bookDetail.ctaTakePhoto}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="book-detail-cover-library"
        style={styles.secondaryButton}
        onPress={onPressPickFromLibrary}
        disabled={saving}
      >
        <Text style={styles.secondaryButtonText}>{copy.bookDetail.ctaPickImage}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="book-detail-cover-remove"
        style={styles.secondaryButton}
        onPress={onPressRemoveCover}
        disabled={saving || thumbnailUrl.trim().length === 0}
      >
        <Text style={styles.secondaryButtonText}>表紙画像を削除</Text>
      </TouchableOpacity>

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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.10)',
    backgroundColor: '#FFFFFF',
    color: '#6B7280',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  progressSettingRow: {
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.10)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressSettingTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  progressSettingLabel: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '700',
  },
  progressState: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 3,
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
