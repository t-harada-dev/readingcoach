import React from 'react';
import {
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { BookSearchCandidate } from '../useCases/BookSearchUseCase';
import { copy } from '../config/copy';
import { appTheme } from '../theme/layout';

export type AddBookFlowState = 'search' | 'candidate' | 'manual';

type AddBookViewProps = {
  isOnboarding: boolean;
  hasExistingBooks: boolean;
  flow: AddBookFlowState;
  searchScreenTestId: string;
  searchPrefix: string;
  manualPrefix: string;
  query: string;
  saving: boolean;
  candidates: BookSearchCandidate[];
  selectedCandidate: BookSearchCandidate | null;
  title: string;
  author: string;
  pageCount: string;
  thumbnailUrl: string;
  onChangeQuery: (value: string) => void;
  onPressSearch: () => void;
  onPressOpenManual: () => void;
  onPressSelectCandidate: (candidate: BookSearchCandidate) => void;
  onPressSaveCandidate: () => void;
  onPressBackToSearch: () => void;
  onChangeTitle: (value: string) => void;
  onChangeAuthor: (value: string) => void;
  onChangePageCount: (value: string) => void;
  onChangeThumbnailUrl: (value: string) => void;
  onPressSaveManual: () => void;
};

export function AddBookView(props: AddBookViewProps) {
  const {
    isOnboarding,
    hasExistingBooks,
    flow,
    searchScreenTestId,
    searchPrefix,
    manualPrefix,
    query,
    saving,
    candidates,
    selectedCandidate,
    title,
    author,
    pageCount,
    thumbnailUrl,
    onChangeQuery,
    onPressSearch,
    onPressOpenManual,
    onPressSelectCandidate,
    onPressSaveCandidate,
    onPressBackToSearch,
    onChangeTitle,
    onChangeAuthor,
    onChangePageCount,
    onChangeThumbnailUrl,
    onPressSaveManual,
  } = props;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {isOnboarding ? (
        <Text style={styles.onboardingTitle}>
          {hasExistingBooks ? '本を追加する' : 'これから読む本について教えてください'}
        </Text>
      ) : (
        <Text style={styles.screenTitle}>本を追加する</Text>
      )}
      {flow === 'search' ? (
        <View testID={searchScreenTestId}>
          <Text style={styles.label}>書籍を検索</Text>
          <TextInput
            testID={`${searchPrefix}-search-input`}
            style={styles.input}
            value={query}
            onChangeText={onChangeQuery}
            onSubmitEditing={onPressSearch}
            placeholder="タイトル・著者"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            blurOnSubmit
          />
          <TouchableOpacity
            testID={`${searchPrefix}-search-submit`}
            style={[styles.cta, (!query.trim() || saving) && styles.ctaDisabled]}
            onPress={onPressSearch}
            disabled={!query.trim() || saving}
          >
            <Text style={styles.ctaText}>検索する</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID={`${searchPrefix}-search-empty-fallback`}
            style={styles.linkBtn}
            onPress={() => {
              Keyboard.dismiss();
              onPressOpenManual();
            }}
          >
            <Text style={styles.linkText}>見つからないので手入力する</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {flow === 'candidate' ? (
        <View testID="add-book-candidate-screen">
          {candidates.map((candidate) => (
            <TouchableOpacity
              key={candidate.stableId}
              testID={`add-book-candidate-row-${candidate.stableId}`}
              style={[styles.bookRow, selectedCandidate?.stableId === candidate.stableId && styles.bookRowSelected]}
              onPress={() => onPressSelectCandidate(candidate)}
            >
              <View style={styles.bookRowMain}>
                <Text style={styles.bookTitle}>{candidate.title}</Text>
                {candidate.author ? <Text style={styles.bookAuthor}>{candidate.author}</Text> : null}
              </View>
              {selectedCandidate?.stableId === candidate.stableId ? (
                <Text style={styles.bookSelectedBadge}>この本を読んでいます</Text>
              ) : null}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            testID="add-book-candidate-save"
            style={[styles.cta, (!selectedCandidate || saving) && styles.ctaDisabled]}
            onPress={selectedCandidate ? onPressSaveCandidate : onPressBackToSearch}
            disabled={saving}
          >
            <Text style={styles.ctaText}>{selectedCandidate ? 'この本を追加する' : '戻る'}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {flow === 'manual' ? (
        <View testID={`${manualPrefix}-manual-screen`} style={styles.manualScreen}>
          <Text style={styles.label}>{copy.addBook.labelTitle}</Text>
          <TextInput
            testID={`${manualPrefix}-manual-title-input`}
            style={styles.input}
            value={title}
            onChangeText={onChangeTitle}
            placeholder={copy.addBook.placeholderTitle}
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.optionalLabel}>{copy.addBook.labelAuthorOptional}</Text>
          <TextInput
            testID={`${manualPrefix}-manual-author-input`}
            style={styles.input}
            value={author}
            onChangeText={onChangeAuthor}
            placeholder={copy.addBook.placeholderAuthor}
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.optionalLabel}>{copy.addBook.labelPageCountOptional}</Text>
          <TextInput
            testID={`${manualPrefix}-manual-page-count-input`}
            style={styles.input}
            value={pageCount}
            onChangeText={onChangePageCount}
            placeholder={copy.addBook.placeholderPageCount}
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
          />

          <View style={styles.coverGroup}>
            <Text style={styles.optionalLabel}>{copy.addBook.labelCoverUrlOptional}</Text>
            <TextInput
              testID={`${manualPrefix}-manual-cover-url-input`}
              style={styles.input}
              value={thumbnailUrl}
              onChangeText={onChangeThumbnailUrl}
              placeholder={copy.addBook.placeholderCoverUrl}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

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
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: appTheme.colors.screenBackground,
  },
  label: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
    marginTop: 8,
  },
  onboardingTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  screenTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  optionalLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    borderRadius: 10,
    padding: 14,
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    marginBottom: 8,
  },
  cta: {
    backgroundColor: appTheme.colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  ctaDisabled: { backgroundColor: '#B8B8B8', opacity: 0.8 },
  ctaText: { color: appTheme.colors.textInverse, fontSize: 18, fontWeight: '600' },
  linkBtn: { marginTop: 12, alignSelf: 'center', paddingVertical: 6 },
  linkText: { color: appTheme.colors.textMuted, fontSize: 13, textDecorationLine: 'underline' },
  manualScreen: {
    flex: 1,
  },
  coverGroup: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 6,
  },
  manualActions: {
    marginTop: 'auto',
    paddingBottom: 4,
  },
  bookRow: {
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: appTheme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookRowSelected: {
    borderColor: appTheme.colors.accent,
    backgroundColor: appTheme.colors.accentSoft,
  },
  bookRowMain: {
    flex: 1,
    paddingRight: 8,
  },
  bookTitle: { color: appTheme.colors.textPrimary, fontSize: 15, fontWeight: '700' },
  bookAuthor: { color: appTheme.colors.textMuted, fontSize: 13, marginTop: 4 },
  bookSelectedBadge: {
    color: appTheme.colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
});
