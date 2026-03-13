import React, { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import type { ScreenProps } from '../navigation/types';
import { runBookSearchUseCase, type BookSearchCandidate } from '../useCases/BookSearchUseCase';
import { AddBookView, type AddBookFlowState } from './AddBookView';
import { showErrorAlert } from '../utils/errorAlert';

type SavePayload = {
  title: string;
  author?: string;
  googleBooksId?: string;
  pageCount?: number;
  thumbnailUrl?: string;
  coverSource?: 'manual' | 'google_books' | 'placeholder';
};

type AddBookScreenProps = {
  navigation: ScreenProps<'AddBook'>['navigation'];
  route: {
    name: 'AddBook' | 'OnboardingAddBook';
    params?: { onboarding?: boolean };
  };
};

function normalizePageCount(raw: string): number | undefined {
  const parsed = Number(raw);
  if (raw.trim().length === 0) return undefined;
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.floor(parsed);
}

export function AddBookScreen({ navigation, route }: AddBookScreenProps) {
  const isOnboarding = route.name === 'OnboardingAddBook' || route.params?.onboarding === true;
  const searchScreenTestId = isOnboarding ? 'onboarding-add-book-screen' : 'add-book-search-screen';
  const searchPrefix = isOnboarding ? 'onboarding' : 'add-book';
  const manualPrefix = isOnboarding ? 'onboarding' : 'add-book';
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [flow, setFlow] = useState<AddBookFlowState>('search');
  const [candidates, setCandidates] = useState<BookSearchCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<BookSearchCandidate | null>(null);
  const [hasExistingBooks, setHasExistingBooks] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!isOnboarding) return () => {
      alive = false;
    };
    void (async () => {
      const books = await persistenceBridge.getBooks();
      if (!alive) return;
      setHasExistingBooks(books.length > 0);
    })();
    return () => {
      alive = false;
    };
  }, [isOnboarding]);

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

  const persistAndFinish = async (payload: SavePayload, options: { clearManualInputs?: boolean } = {}) => {
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
    } catch (error) {
      showErrorAlert('保存に失敗しました', error);
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
        coverSource: thumbnailUrl.trim() ? 'manual' : 'placeholder',
      },
      { clearManualInputs: true }
    );
  };

  const onSearchSubmit = async () => {
    Keyboard.dismiss();
    const trimmed = query.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const result = await runBookSearchUseCase(trimmed);
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
    Keyboard.dismiss();
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
    <AddBookView
      isOnboarding={isOnboarding}
      hasExistingBooks={hasExistingBooks}
      flow={flow}
      searchScreenTestId={searchScreenTestId}
      searchPrefix={searchPrefix}
      manualPrefix={manualPrefix}
      query={query}
      saving={saving}
      candidates={candidates}
      selectedCandidate={selectedCandidate}
      title={title}
      author={author}
      pageCount={pageCount}
      thumbnailUrl={thumbnailUrl}
      onChangeQuery={setQuery}
      onPressSearch={onSearchSubmit}
      onPressOpenManual={() => setFlow('manual')}
      onPressSelectCandidate={setSelectedCandidate}
      onPressSaveCandidate={onSaveCandidate}
      onPressBackToSearch={() => setFlow('search')}
      onChangeTitle={setTitle}
      onChangeAuthor={setAuthor}
      onChangePageCount={setPageCount}
      onChangeThumbnailUrl={setThumbnailUrl}
      onPressSaveManual={onSaveManual}
    />
  );
}
