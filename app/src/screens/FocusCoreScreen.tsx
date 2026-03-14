import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { persistenceBridge, type BookDTO, type DailyExecutionPlanDTO } from '../bridge/PersistenceBridge';
import { copy, dailyPerformanceMentorQuote } from '../config/copy';
import { toLocalISODateString } from '../date';
import { getManualFocusChangeCount } from '../manualFocusChange';
import { useAppInit } from '../appInit';
import { runStartSessionUseCase, type SessionMode } from '../useCases/StartSessionUseCase';
import { resolvePrimaryStartModeByMissedDays } from '../useCases/ResolveNotificationStartModeUseCase';
import { runLoadTodayFocusUseCase } from '../useCases/LoadTodayFocusUseCase';
import { resolveFocusCoreScreenPolicy } from './screenPolicy';
import { buildActiveSessionRouteParams } from '../navigation/activeSessionRoute';
import type { ScreenProps } from '../navigation/types';
import { useAsyncFocusEffect } from '../hooks/useAsyncFocusEffect';
import { FocusCoreView, type FocusCoreViewProps } from './FocusCoreView';

function progressRatioForBook(book: BookDTO | null): number | null {
    if (!book) return null;
    if (typeof book.pageCount !== 'number' || book.pageCount <= 0) return null;
    if (typeof book.currentPage !== 'number' || book.currentPage < 0) return null;
    if (book.currentPage > book.pageCount) return null;
    return Math.max(0, Math.min(1, book.currentPage / book.pageCount));
}

export function FocusCoreScreen({ navigation, route }: ScreenProps<'FocusCore'>) {
    const init = useAppInit();

    const [plan, setPlan] = useState<DailyExecutionPlanDTO | null>(null);
    const [book, setBook] = useState<BookDTO | null>(null);
    const [progressTrackingEnabled, setProgressTrackingEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [continuousMissedDays, setContinuousMissedDays] = useState(0);
    const [manualChangeCount, setManualChangeCount] = useState(0);
    const [starting, setStarting] = useState<SessionMode | null>(null);
    const [sessionStartErrorText, setSessionStartErrorText] = useState<string | null>(null);
    const dueRoutedPlanIdRef = useRef<string | null>(null);
    const todayISO = toLocalISODateString(new Date());

    const planDate = useMemo(() => (plan?.planDate ? plan.planDate : toLocalISODateString(new Date())), [plan]);
    const canManualChange = manualChangeCount < 1;
    const progressRatio = progressTrackingEnabled ? progressRatioForBook(book) : null;
    const hasSelectedBook = Boolean(plan?.bookId && book && book.id === plan.bookId);
    const showCompletedActions = Boolean(plan?.state === 'finalized' && plan?.planDate === todayISO && hasSelectedBook);

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
            const { plan: todayPlan, book: nextBook, settings, continuousMissedDays } =
                await runLoadTodayFocusUseCase('foreground');
            setProgressTrackingEnabled(Boolean(settings?.progressTrackingEnabled));
            setPlan(todayPlan);
            setBook(nextBook);
            setContinuousMissedDays(continuousMissedDays);

            if (todayPlan) {
                const count = await getManualFocusChangeCount(todayPlan.planDate);
                setManualChangeCount(count);
            } else {
                setManualChangeCount(0);
            }
        } finally {
            setLoading(false);
        }
    }, [init.status]);

    useAsyncFocusEffect(async (signal) => {
        if (!signal.alive) return;
        await refresh();
    }, [refresh]);

    const onPressChangeBook = () => {
        if (!plan || !canManualChange) return;
        navigation.navigate('Library', {
            manualChangePlanDate: plan.planDate,
            manualChangeCurrentBookId: plan.bookId,
        });
    };

    const onPressResolveBook = () => {
        navigation.navigate('Library');
    };

    const startSession = async (mode: SessionMode) => {
        if (!plan || !hasSelectedBook || starting) return;
        setStarting(mode);
        setSessionStartErrorText(null);
        try {
            const result = await runStartSessionUseCase({
                planId: plan.planId,
                mode,
                entryPoint: 'app',
            });
            navigation.navigate(
                'ActiveSession',
                buildActiveSessionRouteParams({ started: result, mode, bookId: plan.bookId })
            );
        } catch {
            setSessionStartErrorText(copy.focusCore.startSessionError);
        } finally {
            setStarting(null);
        }
    };

    const mainMode: SessionMode = policy.primaryMode;
    const subMode: SessionMode | null = policy.secondaryMode;
    const rehabMode: SessionMode | null = policy.rehabMode;
    const skipRestartOnce = Boolean(route?.params?.skipRestartOnce);
    const skipDueRouteOnce = Boolean(route?.params?.skipDueRouteOnce);

    useEffect(() => {
        if (!skipRestartOnce) return;
        navigation.setParams({ skipRestartOnce: false });
    }, [navigation, skipRestartOnce]);

    useEffect(() => {
        if (!skipDueRouteOnce) return;
        navigation.setParams({ skipDueRouteOnce: false });
    }, [navigation, skipDueRouteOnce]);

    useEffect(() => {
        if (loading || init.status !== 'ready') return;
        if (skipDueRouteOnce) return;
        if (showCompletedActions) return;
        if (!plan) return;
        if (plan.state !== 'due') {
            dueRoutedPlanIdRef.current = null;
            return;
        }
        if (dueRoutedPlanIdRef.current === plan.planId) return;

        const missedDays = continuousMissedDays || plan.continuousMissedDaysSnapshot || 0;
        dueRoutedPlanIdRef.current = plan.planId;
        navigation.navigate('DueActionSheet', {
            planId: plan.planId,
            defaultMode: resolvePrimaryStartModeByMissedDays(missedDays),
            entryPoint: 'app',
            dueActionScreenId: 'SC-23',
        });
    }, [continuousMissedDays, init.status, loading, navigation, plan, showCompletedActions, skipDueRouteOnce]);

    useEffect(() => {
        if (loading || init.status !== 'ready') return;
        if (!plan) return;
        if (showCompletedActions) return;
        if (plan.state === 'due') return;
        if (skipRestartOnce) return;
        if (policy.screenId !== 'SC-07') return;
        navigation.navigate('RestartRecovery', {
            planId: plan.planId,
            planDate: plan.planDate,
            bookId: book?.id,
            bookTitle: book?.title,
            bookThumbnailUrl: book?.thumbnailUrl,
            bookCoverSource: book?.coverSource ?? (book?.thumbnailUrl ? 'google_books' : 'placeholder'),
        });
    }, [policy.screenId, init.status, loading, navigation, plan, showCompletedActions, skipRestartOnce]);

    const dailyQuote = useMemo(() => dailyPerformanceMentorQuote(planDate), [planDate]);
    const intentCopy =
        showCompletedActions
            ? copy.focusCore.completedSubtitle
            : policy.screenId === 'SC-06'
            ? '3日空いても大丈夫。今日は短くても、読書を再開できれば十分です。'
            : `「${dailyQuote.text}」\n— ${dailyQuote.author}`;
    const viewProps: FocusCoreViewProps = {
        book,
        plan,
        hasSelectedBook,
        loading,
        initStatus: init.status,
        canManualChange,
        progressRatio,
        showCompletedActions,
        mainMode,
        subMode,
        rehabMode,
        intentCopy,
        headerMessage: showCompletedActions
            ? copy.focusCore.headerMessageCompleted
            : copy.focusCore.headerMessage,
        dailyQuote: dailyQuote,
        sessionStartErrorText,
        startingMode: starting,
        onPressChangeBook,
        onPressResolveBook,
        onPressPrimaryCTA: () => {
            void startSession(mainMode);
        },
        onPressSecondaryCTA: () => {
            if (!subMode) return;
            void startSession(subMode);
        },
        onPressRehabCTA: () => {
            if (!rehabMode) return;
            void startSession(rehabMode);
        },
        onPressCompletedExtra5m: () => {
            void startSession('rescue_5m');
        },
        onPressCompletedExtra15m: () => {
            void startSession('normal_15m');
        },
    };

    return <FocusCoreView {...viewProps} />;
}
