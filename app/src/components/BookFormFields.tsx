import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { copy } from '../config/copy';
import { appTheme } from '../theme/layout';

export type BookFormFieldsProps = {
  title: string;
  author: string;
  pageCount: string;
  onChangeTitle: (value: string) => void;
  onChangeAuthor: (value: string) => void;
  onChangePageCount: (value: string) => void;
  testIDPrefix?: string;
  /** default '-input' for add-book manual form; '' for book-detail */
  testIDSuffix?: string;
};

export function BookFormFields({
  title,
  author,
  pageCount,
  onChangeTitle,
  onChangeAuthor,
  onChangePageCount,
  testIDPrefix = 'book-form',
  testIDSuffix = '-input',
}: BookFormFieldsProps) {
  return (
    <>
      <Text style={styles.label}>{copy.bookDetail.labelTitle}</Text>
      <TextInput
        testID={testIDPrefix ? `${testIDPrefix}-title${testIDSuffix}` : undefined}
        style={styles.input}
        value={title}
        onChangeText={onChangeTitle}
        placeholder="本のタイトル"
      />

      <Text style={styles.label}>{copy.bookDetail.labelAuthor}</Text>
      <TextInput
        testID={testIDPrefix ? `${testIDPrefix}-author${testIDSuffix}` : undefined}
        style={styles.input}
        value={author}
        onChangeText={onChangeAuthor}
        placeholder="著者名"
      />

      <Text style={styles.label}>{copy.bookDetail.labelPageCount}</Text>
      <TextInput
        testID={testIDPrefix ? `${testIDPrefix}-page-count${testIDSuffix}` : undefined}
        style={styles.input}
        value={pageCount}
        onChangeText={onChangePageCount}
        keyboardType="numeric"
        placeholder="例: 320"
      />
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
});
