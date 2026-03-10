import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CompletionFeedbackCard } from '../components/CompletionFeedbackCard';
import { SessionCTAButton } from '../components/SessionCTAButton';
import { copy } from '../config/copy';
import { buildCompletionFeedback } from '../domain/completionFeedback';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { runStartSessionUseCase } from '../useCases/StartSessionUseCase';
import { shouldOfferProgressTracking } from '../domain/progressTrackingPolicy';
import { completionCtaOrder } from './screenPolicy';

type Params = {
  planId: string;
  bookId: string;
  bookTitle: string;
  result: 'hard_success' | 'soft_success' | 'prep_success';
  elapsedSeconds: number;
};

function toElapsedLabel(seconds: number): string {
  const mins = Math.max(1, Math.round(seconds / 60));
  return `${copy.completion.elapsedPrefix}: ${mins}分`;
}

export function CompletionScreen({ navigation, route }: any) {
  const { planId, bookId, bookTitle, result, elapsedSeconds } = (route.params ?? {}) as Params;
  const [busy, setBusy] = useState(false);
  const [promptChecked, setPromptChecked] = useState(false);
  const ctaOrder = completionCtaOrder();

  const feedback = useMemo(
    () =>
      buildCompletionFeedback({
        result,
        bookTitle,
      }),
    [bookTitle, result]
  );

  useEffect(() => {
    let alive = true;
    if (promptChecked) return;
    (async () => {
      const settings = await persistenceBridge.getSettings();
      if (!alive) return;
      if (shouldOfferProgressTracking(settings)) {
        navigation.navigate('ProgressTrackingPrompt', { bookId, bookTitle });
      }
      setPromptChecked(true);
    })();
    return () => {
      alive = false;
    };
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
      navigation.replace('ActiveSession', {
        planId,
        sessionId: started.sessionId,
        bookId,
        bookTitle: started.bookTitle,
        mode,
        startedAt: started.startedAt,
        endTimeISO: started.endTimeISO,
        durationSeconds: started.durationSeconds,
      });
    } finally {
      setBusy(false);
    }
  };

  const markFinished = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await persistenceBridge.saveBook({
        id: bookId,
        title: bookTitle,
        status: 'completed',
      });
      navigation.navigate('NextFocusNomination', {
        completedBookId: bookId,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <CompletionFeedbackCard
        title={feedback.title}
        message={feedback.message}
        elapsedLabel={toElapsedLabel(elapsedSeconds)}
        progressRatio={feedback.progressRatio}
      />

      {ctaOrder.map((cta) => {
        if (cta === 'extra_5m') {
          return (
            <SessionCTAButton
              key={cta}
              tone="primary"
              label={copy.completion.ctaExtra5m}
              onPress={() => startExtra('rescue_5m')}
              disabled={busy}
            />
          );
        }
        if (cta === 'extra_15m') {
          return (
            <SessionCTAButton
              key={cta}
              tone="secondary"
              label={copy.completion.ctaExtra15m}
              onPress={() => startExtra('normal_15m')}
              disabled={busy}
            />
          );
        }
        if (cta === 'finished_book') {
          return (
            <SessionCTAButton
              key={cta}
              tone="ghost"
              label={copy.completion.ctaFinishedBook}
              onPress={markFinished}
              disabled={busy}
            />
          );
        }
        return (
          <SessionCTAButton
            key={cta}
            tone="ghost"
            label={copy.completion.ctaClose}
            onPress={() => navigation.navigate('FocusCore')}
            disabled={busy}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCF8',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 24,
  },
});
