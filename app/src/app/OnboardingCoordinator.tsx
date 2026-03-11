import { useEffect, useRef } from 'react';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { useAppInit } from '../appInit';

type Props = {
  navigationRef: NavigationContainerRefWithCurrent<any>;
};

export function OnboardingCoordinator({ navigationRef }: Props) {
  const init = useAppInit();
  const consumedRef = useRef(false);

  useEffect(() => {
    if (init.status !== 'ready') return;
    if (!navigationRef.isReady()) return;
    if (consumedRef.current) return;
    consumedRef.current = true;

    (async () => {
      const forceOnboarding = (await persistenceBridge.getLaunchArg('e2e_onboarding')) === '1';
      const forcedStage = await persistenceBridge.getLaunchArg('e2e_onboarding_stage');
      if (!forceOnboarding) return;
      if (forcedStage === 'time') {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'OnboardingTime' }],
        });
        return;
      }
      if (forcedStage === 'notification') {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'OnboardingNotification' }],
        });
        return;
      }
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'OnboardingAddBook', params: { onboarding: true } }],
      });
    })();
  }, [init.status, navigationRef]);

  return null;
}
