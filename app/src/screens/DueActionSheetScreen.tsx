import React, { useState } from 'react';

import { runStartSessionUseCase } from '../useCases/StartSessionUseCase';
import { runSnoozePlanUseCase } from '../useCases/SnoozePlanUseCase';
import { buildActiveSessionRouteParams } from '../navigation/activeSessionRoute';
import { DueActionSheetView } from './DueActionSheetView';

type Params = {
    planId: string;
    defaultMode: 'normal_15m' | 'ignition_1m';
    entryPoint?: 'notification' | 'app';
    dueActionScreenId?: 'SC-23';
};

export function DueActionSheetScreen({ navigation, route }: any) {
    const { planId, defaultMode, entryPoint } = (route.params ?? {}) as Params;
    const [busy, setBusy] = useState(false);

    const onStart = async (mode: 'normal_15m' | 'ignition_1m' | 'rescue_5m') => {
        if (!planId || busy) return;
        setBusy(true);
        try {
            const started = await runStartSessionUseCase({
                planId,
                mode,
                entryPoint: entryPoint === 'notification' ? 'notification' : 'app',
            });
            navigation.replace('ActiveSession', buildActiveSessionRouteParams({ started, mode }));
        } finally {
            setBusy(false);
        }
    };

    return (
        <DueActionSheetView
            busy={busy}
            defaultMode={defaultMode ?? 'normal_15m'}
            onPressStart={onStart}
            onPressSnooze={async () => {
                if (!planId || busy) return;
                setBusy(true);
                try {
                    await runSnoozePlanUseCase(planId, 30);
                    navigation.goBack();
                } finally {
                    setBusy(false);
                }
            }}
        />
    );
}
