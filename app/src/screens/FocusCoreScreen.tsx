import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { persistenceBridge, type BookDTO, type DailyExecutionPlanDTO } from '../bridge/PersistenceBridge';
import { dailyPerformanceMentorQuote } from '../config/copy';
import { toLocalISODateString } from '../date';
import { getManualFocusChangeCount } from '../manualFocusChange';
import { useAppInit } from '../appInit';
import { runReconcilePlansUseCase } from '../useCases/ReconcilePlansUseCase';
import { runStartSessionUseCase, type SessionMode } from '../useCases/StartSessionUseCase';
import { resolvePrimaryStartModeByMissedDays } from '../useCases/ResolveNotificationStartModeUseCase';
import { resolveFocusCoreScreenPolicy } from './screenPolicy';
import { buildActiveSessionRouteParams } from '../navigation/activeSessionRoute';
import { FocusCoreView, type FocusCoreViewProps } from './FocusCoreView';

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

function tomorrowDateISO(base: Date): string {
    const d = new Date(base);
    d.setDate(d.getDate() + 1);
    return toLocalISODateString(d);
}

export function FocusCoreScreen({ navigation, route }: any) {
    const init = useAppInit();

    const [plan, setPlan] = useState<DailyExecutionPlanDTO | null>(null);
    const [book, setBook] = useState<BookDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [continuousMissedDays, setContinuousMissedDays] = useState(0);
    const [manualChangeCount, setManualChangeCount] = useState(0);
    const [starting, setStarting] = useState<SessionMode | null>(null);
    const dueRoutedPlanIdRef = useRef<string | null>(null);

    const planDate = useMemo(() => (plan?.planDate ? plan.planDate : toLocalISODateString(new Date())), [plan]);
    const canManualChange = manualChangeCount < 1;
    const progressRatio = progressRatioForPlan(plan);
    const hasSelectedBook = Boolean(plan?.bookId && book && book.id === plan.bookId);

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
            const todayPlan = (await persistenceBridge.getPlanForDate(date)) ?? reconcile.todayPlan ?? null;
            let nextPlan = todayPlan;
            if (todayPlan?.state === 'finalized') {
                const tomorrowPlan = await persistenceBridge.getPlanForDate(tomorrowDateISO(new Date()));
                if (tomorrowPlan && tomorrowPlan.state !== 'finalized') {
                    nextPlan = tomorrowPlan;
                }
            }
            setPlan(nextPlan);
            setContinuousMissedDays(reconcile.continuousMissedDays ?? nextPlan?.continuousMissedDaysSnapshot ?? 0);

            if (nextPlan) {
                const nextBook = await persistenceBridge.getBook(nextPlan.bookId);
                setBook(nextBook);
                const count = await getManualFocusChangeCount(nextPlan.planDate);
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
            void (async () => {
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
    }, [continuousMissedDays, init.status, loading, navigation, plan, skipDueRouteOnce]);

    useEffect(() => {
        if (loading || init.status !== 'ready') return;
        if (!plan) return;
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
    }, [policy.screenId, init.status, loading, navigation, plan, skipRestartOnce]);

    const dailyQuote = useMemo(() => dailyPerformanceMentorQuote(planDate), [planDate]);
    const intentCopy =
        policy.screenId === 'SC-06'
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
        mainMode,
        subMode,
        rehabMode,
        intentCopy,
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
    };

    return <FocusCoreView {...viewProps} />;
}
