import { useEffect, useRef } from 'react';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { runReconcilePlansUseCase } from '../useCases/ReconcilePlansUseCase';
import { toLocalISODateString } from '../date';
import { runResolveNotificationStartModeUseCase } from '../useCases/ResolveNotificationStartModeUseCase';
import { runStartSessionUseCase, type EntryPoint, type SessionMode } from '../useCases/StartSessionUseCase';
import { buildActiveSessionRouteParams } from '../navigation/activeSessionRoute';
import { runSnoozePlanUseCase } from '../useCases/SnoozePlanUseCase';
import { useAppInit } from '../appInit';

type Props = {
  navigationRef: NavigationContainerRefWithCurrent<any>;
};

type SurfaceSource = 'notification_response' | 'widget_render' | 'app_intent';
type SurfaceAction = 'start' | 'start_5m' | 'snooze_30m' | 'show_today_book';

function toSource(raw?: string | null): SurfaceSource | null {
  if (raw === 'notification_response' || raw === 'widget_render' || raw === 'app_intent') return raw;
  return null;
}

function toAction(raw?: string | null): SurfaceAction | null {
  if (raw === 'start' || raw === 'start_5m' || raw === 'snooze_30m' || raw === 'show_today_book') return raw;
  return null;
}

function toEntryPoint(source: SurfaceSource): EntryPoint {
  if (source === 'notification_response') return 'notification';
  if (source === 'widget_render') return 'widget';
  return 'app';
}

export function SurfaceTriggerCoordinator({ navigationRef }: Props) {
  const init = useAppInit();
  const consumedRef = useRef(false);

  useEffect(() => {
    if (init.status !== 'ready') return;
    if (!navigationRef.isReady()) return;
    if (consumedRef.current) return;

    consumedRef.current = true;

    (async () => {
      const source = toSource(await persistenceBridge.getLaunchArg('e2e_surface_source'));
      const action = toAction(await persistenceBridge.getLaunchArg('e2e_surface_action'));
      if (!source || !action) return;

      const reconcile = await runReconcilePlansUseCase(source);
      const plan = reconcile.todayPlan ?? (await persistenceBridge.getPlanForDate(toLocalISODateString(new Date())));
      if (!plan) return;

      if (action === 'show_today_book') {
        return;
      }

      if (action === 'snooze_30m') {
        await runSnoozePlanUseCase(plan.planId, 30);
        return;
      }

      const mode: SessionMode =
        action === 'start_5m' ? 'rescue_5m' : await runResolveNotificationStartModeUseCase(plan.planId);

      try {
        const started = await runStartSessionUseCase({
          planId: plan.planId,
          mode,
          entryPoint: toEntryPoint(source),
        });

        navigationRef.navigate('ActiveSession', buildActiveSessionRouteParams({ started, mode, bookId: plan.bookId }));
      } catch {
        // Surface start failure must not block main in-app lane.
        if (navigationRef.isReady()) {
          navigationRef.navigate('FocusCore');
        }
      }
    })();
  }, [init.status, navigationRef]);

  return null;
}
