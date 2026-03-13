import { useEffect, useRef } from 'react';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import type { RootStackParamList } from '../navigation/types';

type Props = {
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>;
  navigationReady: boolean;
};

export function OnboardingCoordinator({ navigationRef, navigationReady }: Props) {
  const consumedRef = useRef(false);

  useEffect(() => {
    if (!navigationReady) return;
    if (consumedRef.current) return;

    (async () => {
      if (consumedRef.current) return;
      consumedRef.current = true;
      if (await persistenceBridge.getLaunchArg('e2e_surface_snapshot')) return;

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
  }, [navigationReady, navigationRef]);

  return null;
}
