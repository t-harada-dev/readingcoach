import React, { useMemo, useState } from 'react';
import { copy } from '../config/copy';
import { buildCompletionFeedback } from '../domain/completionFeedback';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { runStartSessionUseCase } from '../useCases/StartSessionUseCase';
import { shouldOfferProgressTracking } from '../domain/progressTrackingPolicy';
import { buildActiveSessionRouteParams } from '../navigation/activeSessionRoute';
import type { ScreenProps } from '../navigation/types';
import { useAsyncEffect } from '../hooks/useAsyncEffect';
import { CompletionView } from './CompletionView';

export function CompletionScreen({ navigation, route }: ScreenProps<'Completion'>) {
  const { planId, bookId, bookTitle, result, elapsedSeconds } = route.params;
  const [busy, setBusy] = useState(false);
  const [promptChecked, setPromptChecked] = useState(false);
  const [finishedBookError, setFinishedBookError] = useState<string | null>(null);

  const feedback = useMemo(
    () =>
      buildCompletionFeedback({
        result,
        bookTitle,
      }),
    [bookTitle, result]
  );

  useAsyncEffect(async (signal) => {
    if (promptChecked) return;
    const settings = await persistenceBridge.getSettings();
    if (!signal.alive) return;
    if (shouldOfferProgressTracking(settings)) {
      navigation.navigate('ProgressTrackingPrompt', { bookId, bookTitle });
    }
    setPromptChecked(true);
  }, [bookId, bookTitle, navigation, promptChecked]);

  const startExtra = async (mode: 'rescue_5m' | 'normal_15m') => {
    if (busy) return;
    setBusy(true);
    try {
      const started = await runStartSessionUseCase({
        planId,
        mode,
        entryPoint: 'app',
      });
      navigation.replace(
        'ActiveSession',
        buildActiveSessionRouteParams({ started, mode, bookId })
      );
    } finally {
      setBusy(false);
    }
  };

  const markFinished = async () => {
    if (busy) return;
    setBusy(true);
    setFinishedBookError(null);
    try {
      await persistenceBridge.saveBook({
        id: bookId,
        title: bookTitle,
        status: 'completed',
      });
      navigation.navigate('NextFocusNomination', {
        completedBookId: bookId,
      });
    } catch {
      setFinishedBookError(copy.completion.finishedBookSaveError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <CompletionView
      result={result}
      elapsedSeconds={elapsedSeconds}
      bookTitle={bookTitle}
      feedback={feedback}
      busy={busy}
      finishedBookError={finishedBookError}
      onPressExtra5m={() => startExtra('rescue_5m')}
      onPressExtra15m={() => startExtra('normal_15m')}
      onPressFinishedBook={markFinished}
      onPressClose={() => navigation.navigate('FocusCore')}
    />
  );
}
