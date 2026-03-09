import React, { createContext, useContext, useEffect, useState } from 'react';

import type { ReconcileResult } from './bridge/PersistenceBridge';
import { runReconcileThenNotifyReady } from './useCases/ReconcilePlansUseCase';

type AppInitState =
  | { status: 'booting'; reconcileResult: null }
  | { status: 'ready'; reconcileResult: ReconcileResult }
  | { status: 'error'; reconcileResult: null; error: string };

const AppInitContext = createContext<AppInitState | null>(null);

export function AppInitProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppInitState>({ status: 'booting', reconcileResult: null });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const result = await runReconcileThenNotifyReady('app_launch');
        if (!alive) return;
        setState({ status: 'ready', reconcileResult: result });
      } catch (e) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : String(e);
        setState({ status: 'error', reconcileResult: null, error: msg });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return <AppInitContext.Provider value={state}>{children}</AppInitContext.Provider>;
}

export function useAppInit(): AppInitState {
  const ctx = useContext(AppInitContext);
  if (!ctx) throw new Error('useAppInit must be used within AppInitProvider');
  return ctx;
}

