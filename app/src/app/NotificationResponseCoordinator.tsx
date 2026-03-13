import { useEffect } from 'react';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { useAppInit } from '../appInit';
import {
  routeActionId,
  subscribeNotificationResponse,
} from '../useCases/NotificationResponseHandler';
import type { SessionMode } from '../useCases/StartSessionUseCase';
import { runStartSessionUseCase } from '../useCases/StartSessionUseCase';
import { runFindPlanByIdUseCase } from '../useCases/FindPlanUseCase';
import { runResolveNotificationStartModeUseCase } from '../useCases/ResolveNotificationStartModeUseCase';
import { runSnoozePlanUseCase } from '../useCases/SnoozePlanUseCase';
import { resolveDueActionScreenId } from '../domain/entryRoutePolicy';
import { buildActiveSessionRouteParams } from '../navigation/activeSessionRoute';
import { runResolveSurfaceStartPlanUseCase } from '../useCases/StaleSurfaceStartUseCase';
import type { RootStackParamList } from '../navigation/types';

type Props = {
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>;
};

export function NotificationResponseCoordinator({ navigationRef }: Props) {
  const init = useAppInit();

  useEffect(() => {
    if (init.status !== 'ready') return;

    const unsub = subscribeNotificationResponse(async (payload) => {
      const action = routeActionId(payload.actionId);
      const planId = payload.planId;
      if (!planId) return;

      if (action === 'default') {
        const resolvedPlan = await runResolveSurfaceStartPlanUseCase({
          requestedPlanId: planId,
          triggerSource: 'notification_response',
        });
        if (!resolvedPlan) return;
        const defaultMode = await runResolveNotificationStartModeUseCase(resolvedPlan.planId);
        if (navigationRef.isReady()) {
          const dueActionScreenId = resolveDueActionScreenId();
          navigationRef.navigate('DueActionSheet', {
            planId: resolvedPlan.planId,
            defaultMode,
            entryPoint: 'notification',
            dueActionScreenId,
          });
        }
        return;
      }

      if (action === 'snooze') {
        const resolvedPlan = await runResolveSurfaceStartPlanUseCase({
          requestedPlanId: planId,
          triggerSource: 'notification_response',
        });
        if (!resolvedPlan) return;
        await runSnoozePlanUseCase(resolvedPlan.planId, 30);
        return;
      }

      const resolvedPlan = await runResolveSurfaceStartPlanUseCase({
        requestedPlanId: planId,
        triggerSource: 'notification_response',
      });
      if (!resolvedPlan) return;

      const mode: SessionMode =
        action === 'rescue_5m' ? 'rescue_5m' : await runResolveNotificationStartModeUseCase(resolvedPlan.planId);
      const started = await runStartSessionUseCase({
        planId: resolvedPlan.planId,
        mode,
        entryPoint: 'notification',
      });

      const plan = await runFindPlanByIdUseCase(resolvedPlan.planId);
      if (!navigationRef.isReady()) return;

      navigationRef.navigate(
        'ActiveSession',
        buildActiveSessionRouteParams({ started, mode, bookId: plan?.bookId })
      );
    });

    return () => {
      if (unsub) unsub();
    };
  }, [init.status, navigationRef]);

  return null;
}
