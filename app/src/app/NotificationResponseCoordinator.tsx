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

type Props = {
  navigationRef: NavigationContainerRefWithCurrent<any>;
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
        const defaultMode = await runResolveNotificationStartModeUseCase(planId);
        if (navigationRef.isReady()) {
          const dueActionScreenId = resolveDueActionScreenId();
          navigationRef.navigate('DueActionSheet', {
            planId,
            defaultMode,
            entryPoint: 'notification',
            dueActionScreenId,
          });
        }
        return;
      }

      if (action === 'snooze') {
        await runSnoozePlanUseCase(planId, 30);
        return;
      }

      const mode: SessionMode =
        action === 'rescue_5m' ? 'rescue_5m' : await runResolveNotificationStartModeUseCase(planId);
      const started = await runStartSessionUseCase({
        planId,
        mode,
        entryPoint: 'notification',
      });

      const plan = await runFindPlanByIdUseCase(planId);
      if (!navigationRef.isReady()) return;

      navigationRef.navigate('ActiveSession', {
        planId: started.planId,
        sessionId: started.sessionId,
        bookId: plan?.bookId ?? '',
        bookTitle: started.bookTitle,
        mode,
        startedAt: started.startedAt,
        endTimeISO: started.endTimeISO,
        durationSeconds: started.durationSeconds,
      });
    });

    return () => {
      if (unsub) unsub();
    };
  }, [init.status, navigationRef]);

  return null;
}
