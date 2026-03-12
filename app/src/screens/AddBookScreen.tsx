import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { copy } from '../config/copy';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { runBookSearchUseCase, type BookSearchCandidate } from '../useCases/BookSearchUseCase';

type FlowState = 'search' | 'candidate' | 'manual';
type SavePayload = {
  title: string;
  author?: string;
  googleBooksId?: string;
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

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function AddBookScreen({ navigation, route }: any) {
  const isOnboarding = route?.name === 'OnboardingAddBook' || route?.params?.onboarding === true;
  const searchScreenTestId = isOnboarding ? 'onboarding-add-book-screen' : 'add-book-search-screen';
  const searchPrefix = isOnboarding ? 'onboarding' : 'add-book';
  const manualPrefix = isOnboarding ? 'onboarding' : 'add-book';
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [flow, setFlow] = useState<FlowState>('search');
  const [candidates, setCandidates] = useState<BookSearchCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<BookSearchCandidate | null>(null);

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
      googleBooksId: payload.googleBooksId,
      pageCount: payload.pageCount,
      thumbnailUrl: payload.thumbnailUrl,
      coverSource: payload.coverSource,
      format: 'paper',
      status: 'active',
    });
  };

  const persistAndFinish = async (
    payload: SavePayload,
    options: { clearManualInputs?: boolean } = {}
  ) => {
    const { clearManualInputs = false } = options;
    try {
      setSaving(true);
      await saveBook(payload);
      if (clearManualInputs) {
        setTitle('');
        setAuthor('');
        setPageCount('');
        setThumbnailUrl('');
      }
      finishAfterSave();
    } catch (e) {
      Alert.alert('保存に失敗しました', toErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const onSave = async () => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) return;

    await persistAndFinish(
      {
        title: normalizedTitle,
        author: author.trim() || undefined,
        pageCount: normalizePageCount(pageCount),
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        coverSource: thumbnailUrl.trim() ? 'manual' : 'placeholder',
      },
      { clearManualInputs: true }
    );
  };

  const onSearchSubmit = async () => {
    const q = query.trim();
    if (!q || saving) return;
    setSaving(true);
    try {
      const result = await runBookSearchUseCase(q);
      if (result.length === 0) {
        setFlow('manual');
        return;
      }
      setCandidates(result);
      setSelectedCandidate(result[0] ?? null);
      setFlow('candidate');
    } catch {
      setFlow('manual');
    } finally {
      setSaving(false);
    }
  };

  const onSaveCandidate = async () => {
    if (!selectedCandidate || saving) return;
    await persistAndFinish({
        title: selectedCandidate.title,
        author: selectedCandidate.author,
        googleBooksId: selectedCandidate.googleBooksId,
        pageCount: selectedCandidate.pageCount,
        thumbnailUrl: selectedCandidate.thumbnailUrl,
        coverSource: selectedCandidate.thumbnailUrl ? 'google_books' : 'placeholder',
      });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {flow === 'search' ? (
        <View testID={searchScreenTestId}>
          <Text style={styles.label}>書籍を検索</Text>
          <TextInput
            testID={`${searchPrefix}-search-input`}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSearchSubmit}
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
            onPress={onSearchSubmit}
            disabled={!query.trim() || saving}
          >
            <Text style={styles.ctaText}>検索する</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID={`${searchPrefix}-search-empty-fallback`}
            style={styles.linkBtn}
            onPress={() => setFlow('manual')}
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
              onPress={() => setSelectedCandidate(candidate)}
            >
              <Text style={styles.bookTitle}>{candidate.title}</Text>
              {candidate.author ? <Text style={styles.bookAuthor}>{candidate.author}</Text> : null}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            testID="add-book-candidate-save"
            style={[styles.cta, (!selectedCandidate || saving) && styles.ctaDisabled]}
            onPress={onSaveCandidate}
            disabled={!selectedCandidate || saving}
          >
            <Text style={styles.ctaText}>この本を追加</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {flow === 'manual' ? (
        <View testID={`${manualPrefix}-manual-entry`}>
          <View testID="add-book-manual-screen" />
          <Text style={styles.label}>{copy.addBook.labelTitle}</Text>
          <TextInput
            testID="add-book-manual-title"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={copy.addBook.placeholderTitle}
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.label}>{copy.addBook.labelAuthorOptional}</Text>
          <TextInput
            testID="add-book-manual-author"
            style={styles.input}
            value={author}
            onChangeText={setAuthor}
            placeholder={copy.addBook.placeholderAuthor}
            placeholderTextColor="#666"
            autoCapitalize="none"
          />
          <Text style={styles.label}>{copy.addBook.labelPageCountOptional}</Text>
          <TextInput
            testID="add-book-manual-page-count"
            style={styles.input}
            value={pageCount}
            onChangeText={setPageCount}
            placeholder={copy.addBook.placeholderPageCount}
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
          <Text style={styles.optionalLabel}>{copy.addBook.labelCoverUrlOptional}</Text>
          <TextInput
            style={styles.input}
            value={thumbnailUrl}
            onChangeText={setThumbnailUrl}
            placeholder={copy.addBook.placeholderCoverUrl}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />
          <TouchableOpacity
            testID="add-book-manual-save"
            style={[styles.cta, (!title.trim() || saving) && styles.ctaDisabled]}
            onPress={onSave}
            disabled={!title.trim() || saving}
          >
            <Text style={styles.ctaText}>{copy.addBook.ctaAddAndBack}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FDFCF8',
  },
  label: {
    color: '#4B5563',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 8,
  },
  optionalLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.12)',
    borderRadius: 10,
    padding: 14,
    color: '#2C2C2C',
    fontSize: 16,
    marginBottom: 8,
  },
  cta: {
    backgroundColor: '#D48A3E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  ctaDisabled: { backgroundColor: '#B8B8B8', opacity: 0.8 },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  linkBtn: { marginTop: 12, alignSelf: 'center', paddingVertical: 6 },
  linkText: { color: '#6B7280', fontSize: 13, textDecorationLine: 'underline' },
  bookRow: {
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.12)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  bookRowSelected: {
    borderColor: '#D48A3E',
    backgroundColor: 'rgba(212,138,62,0.10)',
  },
  bookTitle: { color: '#2C2C2C', fontSize: 15, fontWeight: '700' },
  bookAuthor: { color: '#6B7280', fontSize: 13, marginTop: 4 },
});
