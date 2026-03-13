import { useEffect } from 'react';
import type { DependencyList } from 'react';

export type AsyncEffectSignal = {
  alive: boolean;
};

export function createAsyncEffectSignal(): AsyncEffectSignal {
  return { alive: true };
}

export function deactivateAsyncEffectSignal(signal: AsyncEffectSignal): void {
  signal.alive = false;
}

export function useAsyncEffect(
  effect: (signal: AsyncEffectSignal) => Promise<void>,
  deps: DependencyList
): void {
  useEffect(() => {
    const signal = createAsyncEffectSignal();
    void effect(signal);
    return () => {
      deactivateAsyncEffectSignal(signal);
    };
  }, deps);
}
