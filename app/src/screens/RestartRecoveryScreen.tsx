import React, { useMemo, useState } from 'react';

import { copy } from '../config/copy';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { toLocalISODateString } from '../date';
import { runFindPlanByIdUseCase } from '../useCases/FindPlanUseCase';
import { runReconcilePlansUseCase } from '../useCases/ReconcilePlansUseCase';
import { runStartSessionUseCase } from '../useCases/StartSessionUseCase';
import { buildActiveSessionRouteParams } from '../navigation/activeSessionRoute';
import { RestartRecoveryView } from './RestartRecoveryView';

type Params = {
    planId?: string;
    planDate?: string;
};

export function RestartRecoveryScreen({ navigation, route }: any) {
    const { planId, planDate } = (route.params ?? {}) as Params;
    const [busy, setBusy] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);

    const targetDate = useMemo(() => planDate ?? toLocalISODateString(new Date()), [planDate]);

    const startIgnition = async () => {
        if (busy) return;
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
            errorText={errorText}
            onPressStartIgnition={startIgnition}
            onPressChangeTime={() => navigation.navigate('TimeChange')}
            onPressClose={() => navigation.navigate('FocusCore', { skipRestartOnce: true })}
        />
    );
}
