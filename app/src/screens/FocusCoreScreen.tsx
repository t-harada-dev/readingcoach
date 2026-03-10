import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { persistenceBridge, type BookDTO, type DailyExecutionPlanDTO } from '../bridge/PersistenceBridge';
import { copy, dailyPerformanceMentorQuote, sessionModeLabel } from '../config/copy';
import { toLocalISODateString } from '../date';
import { getManualFocusChangeCount } from '../manualFocusChange';
import { useAppInit } from '../appInit';
import { runReconcilePlansUseCase } from '../useCases/ReconcilePlansUseCase';
import { runStartSessionUseCase, type SessionMode } from '../useCases/StartSessionUseCase';
import { resolveFocusCoreScreenPolicy } from './screenPolicy';

const BG = '#FDFCF8';
const AMBER = '#D48A3E';
const TEXT = '#2C2C2C';

function progressRatioForPlan(plan: DailyExecutionPlanDTO | null): number {
  if (!plan) return 0;
  switch (plan.result) {
    case 'hard_success':
      return 1;
    case 'soft_success':
      return 0.7;
    case 'prep_success':
      return 0.2;
    case 'attempted':
      return 0.1;
    case 'missed':
      return 0;
    default:
      return 0;
  }
}

export function FocusCoreScreen({
  navigation,
  route,
}: any) {
  const init = useAppInit();

  const [plan, setPlan] = useState<DailyExecutionPlanDTO | null>(null);
  const [book, setBook] = useState<BookDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [continuousMissedDays, setContinuousMissedDays] = useState(0);
  const [manualChangeCount, setManualChangeCount] = useState(0);
  const [starting, setStarting] = useState<SessionMode | null>(null);

  const planDate = useMemo(() => (plan?.planDate ? plan.planDate : toLocalISODateString(new Date())), [plan]);
  const canManualChange = manualChangeCount < 1;
  const progressRatio = progressRatioForPlan(plan);

  const policy = useMemo(
    () =>
      resolveFocusCoreScreenPolicy({
        continuousMissedDays,
        heavyDaySignal: plan?.state === 'scheduled' && plan?.result === 'attempted',
      }),
    [continuousMissedDays, plan?.result, plan?.state]
  );

  const refresh = useCallback(async () => {
    if (init.status !== 'ready') return;
    setLoading(true);
    try {
      const reconcile = await runReconcilePlansUseCase('foreground');
      const date = reconcile.todayPlan?.planDate ?? toLocalISODateString(new Date());
      const p = (await persistenceBridge.getPlanForDate(date)) ?? reconcile.todayPlan ?? null;
      setPlan(p);
      setContinuousMissedDays(reconcile.continuousMissedDays ?? p?.continuousMissedDaysSnapshot ?? 0);

      if (p) {
        const b = await persistenceBridge.getBook(p.bookId);
        setBook(b);
        const count = await getManualFocusChangeCount(p.planDate);
        setManualChangeCount(count);
      } else {
        setBook(null);
        setManualChangeCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [init.status]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        if (!alive) return;
        await refresh();
      })();
      return () => {
        alive = false;
      };
    }, [refresh])
  );

  const onPressChangeBook = () => {
    if (!plan || !canManualChange) return;
    navigation.navigate('FocusBookPicker', {
      planId: plan.planId,
      planDate: plan.planDate,
      scheduledAt: plan.scheduledAt,
      currentBookId: plan.bookId,
    });
  };

  const startSession = async (mode: SessionMode) => {
    if (!plan || starting) return;
    setStarting(mode);
    try {
      const result = await runStartSessionUseCase({
        planId: plan.planId,
        mode,
        entryPoint: 'app',
      });
      navigation.navigate('ActiveSession', {
        planId: result.planId,
        sessionId: result.sessionId,
        bookId: plan.bookId,
        bookTitle: result.bookTitle,
        mode,
        startedAt: result.startedAt,
        endTimeISO: result.endTimeISO,
        durationSeconds: result.durationSeconds,
      });
    } finally {
      setStarting(null);
    }
  };

  const mainMode: SessionMode = policy.primaryMode;
  const subMode: SessionMode | null = policy.secondaryMode;
  const rehabMode: SessionMode | null = policy.rehabMode;
  const skipRestartOnce = Boolean(route?.params?.skipRestartOnce);

  useEffect(() => {
    if (!skipRestartOnce) return;
    navigation.setParams({ skipRestartOnce: false });
  }, [navigation, skipRestartOnce]);

  useEffect(() => {
    if (loading || init.status !== 'ready') return;
    if (!plan) return;
    if (skipRestartOnce) return;
    if (policy.screenId !== 'SC-07') return;
    navigation.navigate('RestartRecovery', { planId: plan.planId, planDate: plan.planDate });
  }, [policy.screenId, init.status, loading, navigation, plan, skipRestartOnce]);

  const dailyQuote = useMemo(() => dailyPerformanceMentorQuote(planDate), [planDate]);
  const subCopy = `「${dailyQuote.text}」\n— ${dailyQuote.author}`;

  return (
    <View style={styles.container}>
      <Text style={styles.headerMessage}>{copy.focusCore.headerMessage}</Text>

      <View style={styles.card}>
        <View style={styles.coverWrap}>
          {book?.thumbnailUrl ? (
            <Image
              source={{ uri: book.thumbnailUrl }}
              style={styles.cover}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Text style={styles.coverPlaceholderText} numberOfLines={3}>
                {book?.title ?? copy.focusCore.coverFallbackTitle}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progressRatio * 100)}%` }]} />
        </View>

        {book?.title ? (
          <>
            <Text style={styles.bookTitle} numberOfLines={2}>
              {book.title}
            </Text>
            {book.author ? (
              <Text style={styles.bookAuthor} numberOfLines={1}>
                {book.author}
              </Text>
            ) : null}
          </>
        ) : null}

        {plan && canManualChange ? (
          <TouchableOpacity style={styles.ghostLink} onPress={onPressChangeBook}>
            <Text style={styles.ghostLinkText}>{copy.focusCore.changeBookLink}</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={styles.ghostLink} onPress={() => navigation.navigate('Library')}>
          <Text style={styles.ghostLinkText}>{copy.focusCore.openLibraryLink}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menu}>
        <Text style={styles.intentCopy}>{subCopy}</Text>

        <TouchableOpacity
          style={[styles.mainBtn, starting ? styles.btnDisabled : null]}
          onPress={() => startSession(mainMode)}
          disabled={starting !== null || loading || !plan}
        >
          <Text style={styles.mainBtnText}>{sessionModeLabel(mainMode)}</Text>
        </TouchableOpacity>

        {subMode ? (
          <TouchableOpacity
            style={[styles.subBtn, starting ? styles.btnDisabled : null]}
            onPress={() => startSession(subMode)}
            disabled={starting !== null || loading || !plan}
          >
            <Text style={styles.subBtnText}>{sessionModeLabel(subMode)}</Text>
          </TouchableOpacity>
        ) : null}
        {rehabMode ? (
          <TouchableOpacity
            style={[styles.subBtn, starting ? styles.btnDisabled : null]}
            onPress={() => startSession(rehabMode)}
            disabled={starting !== null || loading || !plan}
          >
            <Text style={styles.subBtnText}>{sessionModeLabel(rehabMode)}</Text>
          </TouchableOpacity>
        ) : null}

        {loading || init.status === 'booting' ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>{copy.focusCore.loading}</Text>
          </View>
        ) : null}

        {init.status === 'error' ? (
          <Text style={styles.errorText}>{copy.focusCore.initError}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 24,
  },
  headerMessage: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 14,
    textAlign: 'center',
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.06)',
    alignItems: 'center',
  },
  coverWrap: {
    width: 240,
    height: 320,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  cover: { width: '100%', height: '100%' },
  coverPlaceholder: {
    flex: 1,
    padding: 18,
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 138, 62, 0.10)',
  },
  coverPlaceholderText: { color: TEXT, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  progressTrack: {
    height: 4,
    width: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(212, 138, 62, 0.18)',
    overflow: 'hidden',
    marginTop: 14,
  },
  progressFill: { height: 4, backgroundColor: AMBER },
  bookTitle: { color: TEXT, fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  bookAuthor: { color: '#6B7280', fontSize: 13, marginTop: 6 },
  ghostLink: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 10 },
  ghostLinkText: { color: '#6B7280', fontSize: 13, textDecorationLine: 'underline' },
  menu: { marginTop: 18 },
  intentCopy: { color: TEXT, fontSize: 14, lineHeight: 22, marginBottom: 14 },
  mainBtn: {
    backgroundColor: AMBER,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  mainBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  subBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 138, 62, 0.45)',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  subBtnText: { color: AMBER, fontSize: 15, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  loadingText: { color: '#6B7280', fontSize: 13 },
  errorText: { color: '#B91C1C', fontSize: 13, marginTop: 12 },
});
