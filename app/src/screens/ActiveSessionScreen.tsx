import React, { useEffect, useMemo, useRef, useState } from 'react';
import { runCompleteSessionUseCase } from '../useCases/CompleteSessionUseCase';
import type { SessionMode } from '../useCases/StartSessionUseCase';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { ActiveSessionView } from './ActiveSessionView';

export function ActiveSessionScreen({
  navigation,
  route,
}: any) {
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
  const [completing, setCompleting] = useState(false);
  const [bookCoverUri, setBookCoverUri] = useState<string | undefined>(undefined);
  const finalizedRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remainingSeconds = Math.max(0, Math.ceil((endTime - now) / 1000));
  const done = remainingSeconds <= 0;

  useEffect(() => {
    let alive = true;
    if (!bookId) return;
    void (async () => {
      const book = await persistenceBridge.getBook(bookId);
      if (!alive) return;
      setBookCoverUri(book?.thumbnailUrl);
    })();
    return () => {
      alive = false;
    };
  }, [bookId]);

  useEffect(() => {
    if (!done || finalizedRef.current || completing) return;
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
  }, [bookId, bookTitle, completing, done, durationSeconds, mode, navigation, planId, sessionId, startedAt]);

  return (
    <ActiveSessionView
      bookTitle={bookTitle}
      bookCoverUri={bookCoverUri}
      mode={mode}
      durationSeconds={durationSeconds ?? 0}
      remainingSeconds={remainingSeconds}
      done={done}
      completing={completing}
      onPressBack={() => navigation.goBack()}
    />
  );
}
