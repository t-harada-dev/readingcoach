import React, { useMemo, useState } from 'react';

import { copy } from '../config/copy';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { toLocalISODateString } from '../date';
import { runFindPlanByIdUseCase } from '../useCases/FindPlanUseCase';
import { runReconcilePlansUseCase } from '../useCases/ReconcilePlansUseCase';
import { runStartSessionUseCase } from '../useCases/StartSessionUseCase';
import { buildActiveSessionRouteParams } from '../navigation/activeSessionRoute';
import type { ScreenProps } from '../navigation/types';
import { RestartRecoveryView } from './RestartRecoveryView';

export function RestartRecoveryScreen({ navigation, route }: ScreenProps<'RestartRecovery'>) {
    const { planId, planDate, bookId, bookTitle, bookThumbnailUrl, bookCoverSource } = route.params ?? {};
    const [busy, setBusy] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);

    const targetDate = useMemo(() => planDate ?? toLocalISODateString(new Date()), [planDate]);
    const hasSelectedBook = Boolean(bookId);

    const startIgnition = async () => {
        if (busy) return;
        if (!hasSelectedBook) return;
        setBusy(true);
        setErrorText(null);
        try {
            const reconcile = await runReconcilePlansUseCase('foreground');
            const date = reconcile.todayPlan?.planDate ?? targetDate;
            const planForDate = (await persistenceBridge.getPlanForDate(date)) ?? reconcile.todayPlan ?? null;
            const plan = planId ? ((await runFindPlanByIdUseCase(planId)) ?? planForDate) : planForDate;
            if (!plan) throw new Error('plan not found');

            const started = await runStartSessionUseCase({
                planId: plan.planId,
                mode: 'ignition_1m',
                entryPoint: 'app',
            });

            navigation.replace(
                'ActiveSession',
                buildActiveSessionRouteParams({ started, mode: 'ignition_1m', bookId: plan.bookId })
            );
        } catch {
            setErrorText(copy.restartRecovery.startError);
        } finally {
            setBusy(false);
        }
    };

    return (
        <RestartRecoveryView
            busy={busy}
            hasSelectedBook={hasSelectedBook}
            errorText={errorText}
            bookTitle={bookTitle}
            bookThumbnailUrl={bookThumbnailUrl}
            bookCoverSource={bookCoverSource}
            onPressStartIgnition={startIgnition}
            onPressChangeTime={() => navigation.navigate('Settings')}
            onPressChangeBook={() => navigation.navigate('Library')}
        />
    );
}
