import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BookFormFields } from '../components/BookFormFields';
import { BookCoverSection } from '../components/BookCoverSection';
import { InlineErrorBanner } from '../components/InlineErrorBanner';
import { ScreenLoadingView } from '../components/ScreenLoadingView';
import { copy } from '../config/copy';
import { appTheme } from '../theme/layout';

export type BookDetailViewProps = {
  title: string;
  author: string;
  pageCount: string;
  currentPage: string;
  thumbnailUrl: string;
  coverSource?: 'manual' | 'google_books' | 'placeholder';
  progressEnabled: boolean;
  saving: boolean;
  loading: boolean;
  canSave: boolean;
  errorText: string | null;
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
  loading,
  canSave,
  errorText,
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
  if (loading) {
    return <ScreenLoadingView testID="book-detail-loading" message={copy.focusCore.loading} />;
  }

  return (
    <ScrollView testID="book-detail-screen" contentContainerStyle={styles.container}>
      {copy.bookDetail.subtitle ? <Text style={styles.subtitle}>{copy.bookDetail.subtitle}</Text> : null}

      <BookFormFields
        title={title}
        author={author}
        pageCount={pageCount}
        onChangeTitle={onChangeTitle}
        onChangeAuthor={onChangeAuthor}
        onChangePageCount={onChangePageCount}
        testIDPrefix="book-detail"
        testIDSuffix=""
      />

      <Text style={styles.label}>{copy.bookDetail.labelCurrentPage}</Text>
      <TextInput
        testID="book-detail-current-page"
        style={styles.input}
        value={currentPage}
        onChangeText={onChangeCurrentPage}
        keyboardType="numeric"
        placeholder="例: 120"
      />
      {!progressEnabled ? <Text style={styles.helpText}>{copy.bookDetail.progressDisabled}</Text> : null}

      <Text style={styles.label}>進捗バー設定</Text>
      <View style={styles.settingValueRow}>
        <TouchableOpacity
          testID={progressEnabled ? 'book-detail-disable-progress' : 'book-detail-enable-progress'}
          style={styles.settingValueButton}
          onPress={onPressToggleProgress}
          disabled={saving}
        >
          <Text style={styles.settingValue}>{progressEnabled ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
        <Switch
          testID="book-detail-progress-toggle"
          value={progressEnabled}
          onValueChange={onPressToggleProgress}
          disabled={saving}
          trackColor={{ false: '#C7CED8', true: '#F0C58C' }}
          thumbColor={progressEnabled ? appTheme.colors.accent : appTheme.colors.surface}
        />
      </View>

      <BookCoverSection
        thumbnailUrl={thumbnailUrl}
        coverSource={coverSource}
        title={title}
        onTakePhoto={onPressTakePhoto}
        onPickFromLibrary={onPressPickFromLibrary}
        onRemoveCover={onPressRemoveCover}
        saving={saving}
        testIDPrefix="book-detail-cover"
      />

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
      {errorText ? <InlineErrorBanner testID="book-detail-inline-error" message={errorText} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: appTheme.colors.screenBackground,
    paddingHorizontal: appTheme.spacing.screenPaddingHorizontal,
    paddingTop: 16,
    paddingBottom: 28,
  },
  subtitle: {
    color: appTheme.colors.textMuted,
    fontSize: 13,
    marginBottom: 12,
  },
  label: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    borderRadius: appTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    backgroundColor: appTheme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: appTheme.colors.textPrimary,
    fontSize: 15,
  },
  helpText: {
    borderRadius: appTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
    color: appTheme.colors.textMuted,
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  settingValueRow: {
    marginTop: 2,
    marginBottom: 8,
    borderRadius: appTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    backgroundColor: appTheme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingValue: {
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  settingValueButton: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  primaryButton: {
    marginTop: 16,
    borderRadius: appTheme.borderRadius.lg,
    backgroundColor: appTheme.colors.accent,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: appTheme.colors.textInverse,
    fontSize: 15,
    fontWeight: '700',
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
  disabled: {
    opacity: 0.55,
  },
});
