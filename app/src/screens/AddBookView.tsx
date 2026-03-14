import React from 'react';
import {
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BookFormFields } from '../components/BookFormFields';
import { BookCoverSection } from '../components/BookCoverSection';
import { copy } from '../config/copy';
import { appTheme } from '../theme/layout';

type AddBookViewProps = {
  isOnboarding: boolean;
  manualPrefix: string;
  title: string;
  author: string;
  pageCount: string;
  thumbnailUrl: string;
  coverSource: 'manual' | 'google_books' | 'placeholder';
  saving: boolean;
  onChangeTitle: (value: string) => void;
  onChangeAuthor: (value: string) => void;
  onChangePageCount: (value: string) => void;
  onPressTakePhoto: () => void;
  onPressPickFromLibrary: () => void;
  onPressRemoveCover: () => void;
  onPressSaveManual: () => void;
};

export function AddBookView({
  manualPrefix,
  title,
  author,
  pageCount,
  thumbnailUrl,
  coverSource,
  saving,
  onChangeTitle,
  onChangeAuthor,
  onChangePageCount,
  onPressTakePhoto,
  onPressPickFromLibrary,
  onPressRemoveCover,
  onPressSaveManual,
}: AddBookViewProps) {
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenTitle}>本を追加する</Text>
        <View testID={`${manualPrefix}-manual-screen`} style={styles.manualScreen}>
          <BookFormFields
            title={title}
            author={author}
            pageCount={pageCount}
            onChangeTitle={onChangeTitle}
            onChangeAuthor={onChangeAuthor}
            onChangePageCount={onChangePageCount}
            testIDPrefix={`${manualPrefix}-manual`}
            testIDSuffix="-input"
          />
          <BookCoverSection
            thumbnailUrl={thumbnailUrl}
            coverSource={coverSource}
            title={title}
            onTakePhoto={onPressTakePhoto}
            onPickFromLibrary={onPressPickFromLibrary}
            onRemoveCover={onPressRemoveCover}
            saving={saving}
            testIDPrefix={`${manualPrefix}-manual-cover`}
          />
        </View>
      </ScrollView>
      <View style={styles.manualActions}>
        <TouchableOpacity
          testID={`${manualPrefix}-manual-save`}
          style={[styles.cta, (!title.trim() || saving) && styles.ctaDisabled]}
          onPress={onPressSaveManual}
          disabled={!title.trim() || saving}
        >
          <Text style={styles.ctaText}>{copy.addBook.ctaAddAndBack}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: appTheme.colors.screenBackground,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  screenTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  manualScreen: {
    minHeight: 200,
  },
  manualActions: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.screenBackground,
  },
  cta: {
    backgroundColor: appTheme.colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaDisabled: { backgroundColor: '#B8B8B8', opacity: 0.8 },
  ctaText: { color: appTheme.colors.textInverse, fontSize: 18, fontWeight: '600' },
});
