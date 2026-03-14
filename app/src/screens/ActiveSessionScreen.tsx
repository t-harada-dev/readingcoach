import React, { useEffect, useMemo, useRef, useState } from 'react';
import { runCompleteSessionUseCase } from '../useCases/CompleteSessionUseCase';
import type { SessionMode } from '../useCases/StartSessionUseCase';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import type { ScreenProps } from '../navigation/types';
import { useAsyncEffect } from '../hooks/useAsyncEffect';
import { clearSessionPauseRemaining, getSessionPauseRemaining, setSessionPauseRemaining } from '../sessionPauseRemaining';
import { ActiveSessionView } from './ActiveSessionView';

export function ActiveSessionScreen({ navigation, route }: ScreenProps<'ActiveSession'>) {
  const {
    planId,
    sessionId,
    bookId,
    bookTitle,
    mode,
    startedAt,
    endTimeISO,
    durationSeconds,
  } = (route.params ?? {}) as {
    planId?: string;
    sessionId?: string;
    bookId?: string;
    bookTitle: string;
    mode?: SessionMode;
    startedAt?: string;
    endTimeISO: string;
    durationSeconds?: number;
  };

  const endTime = useMemo(() => new Date(endTimeISO).getTime(), [endTimeISO]);
  const [now, setNow] = useState(() => Date.now());
  const [endTimeMs, setEndTimeMs] = useState(endTime);
  const [pauseStartedAt, setPauseStartedAt] = useState<number | null>(null);
  const [completing, setCompleting] = useState(false);
  const [bookCoverUri, setBookCoverUri] = useState<string | undefined>(undefined);
  const [bookCoverSource, setBookCoverSource] = useState<'manual' | 'google_books' | 'placeholder'>('placeholder');
  const finalizedRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const paused = pauseStartedAt !== null;
  const referenceNow = paused ? pauseStartedAt : now;
  const remainingSeconds = Math.max(0, Math.ceil((endTimeMs - referenceNow) / 1000));
  const done = !paused && remainingSeconds <= 0;

  useAsyncEffect(async (signal) => {
    if (!bookId) return;
    const book = await persistenceBridge.getBook(bookId);
    if (!signal.alive) return;
    setBookCoverUri(book?.thumbnailUrl);
    setBookCoverSource(book?.coverSource ?? (book?.thumbnailUrl ? 'google_books' : 'placeholder'));
  }, [bookId]);

  useAsyncEffect(async (signal) => {
    if (!sessionId) return;
    const remaining = await getSessionPauseRemaining(sessionId);
    if (!signal.alive) return;
    if (remaining != null) {
      setEndTimeMs(Date.now() + remaining * 1000);
      await clearSessionPauseRemaining(sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!done || finalizedRef.current || completing || paused) return;
    if (!planId || !sessionId || !mode) return;
    finalizedRef.current = true;
    setCompleting(true);

    (async () => {
      try {
        const completed = await runCompleteSessionUseCase({
          planId,
          sessionId,
          mode,
          bookTitle,
          endedAtISO: new Date().toISOString(),
        });
        navigation.replace('Completion', {
          planId,
          bookId: bookId ?? '',
          bookTitle,
          result: completed.result,
          elapsedSeconds:
            durationSeconds ??
            (startedAt ? Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)) : 0),
        });
      } finally {
        setCompleting(false);
      }
    })();
  }, [bookId, bookTitle, completing, done, durationSeconds, mode, navigation, paused, planId, sessionId, startedAt]);

  const onPressFinishedBook = async () => {
    if (completing || !bookId) return;
    setCompleting(true);
    try {
      if (planId && sessionId && mode) {
        await runCompleteSessionUseCase({
          planId,
          sessionId,
          mode,
          bookTitle,
          endedAtISO: new Date().toISOString(),
        });
      }
      const existing = await persistenceBridge.getBook(bookId);
      await persistenceBridge.saveBook({
        ...(existing ?? {}),
        id: bookId,
        title: existing?.title ?? bookTitle,
        status: 'completed',
      });
      navigation.replace('NextFocusNomination', {
        completedBookId: bookId,
      });
    } catch {
      navigation.navigate('FocusCore');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <ActiveSessionView
      bookTitle={bookTitle}
      bookCoverUri={bookCoverUri}
      bookCoverSource={bookCoverSource}
      mode={mode}
      durationSeconds={durationSeconds ?? 0}
      remainingSeconds={remainingSeconds}
      paused={paused}
      done={done}
      completing={completing}
      onPressPause={() => setPauseStartedAt(Date.now())}
      onPressResume={() => {
        if (pauseStartedAt === null) return;
        const pausedDuration = Date.now() - pauseStartedAt;
        setEndTimeMs((prev) => prev + pausedDuration);
        setPauseStartedAt(null);
        setNow(Date.now());
      }}
      onPressFinishedBook={() => {
        void onPressFinishedBook();
      }}
      onPressQuit={() => {
        const remaining = Math.max(0, Math.ceil((endTimeMs - Date.now()) / 1000));
        if (sessionId) {
          void setSessionPauseRemaining(sessionId, remaining);
        }
        navigation.navigate('FocusCore');
      }}
    />
  );
}
