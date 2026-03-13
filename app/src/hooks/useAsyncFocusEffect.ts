import { useCallback } from 'react';
import type { DependencyList } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  createAsyncEffectSignal,
  deactivateAsyncEffectSignal,
  type AsyncEffectSignal,
} from './useAsyncEffect';

export function useAsyncFocusEffect(
  effect: (signal: AsyncEffectSignal) => Promise<void>,
  deps: DependencyList
): void {
  useFocusEffect(
    useCallback(() => {
      const signal = createAsyncEffectSignal();
      void effect(signal);
      return () => {
        deactivateAsyncEffectSignal(signal);
      };
    }, deps)
  );
}
