import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SessionCTAButton } from '../components/SessionCTAButton';
import { copy } from '../config/copy';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { toLocalISODateString } from '../date';
import { runFindPlanByIdUseCase } from '../useCases/FindPlanUseCase';
import { runReconcilePlansUseCase } from '../useCases/ReconcilePlansUseCase';
import { runStartSessionUseCase } from '../useCases/StartSessionUseCase';
import { buildActiveSessionRouteParams } from '../navigation/activeSessionRoute';
import { appTheme } from '../theme/layout';

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
    <View testID="restart-recovery-screen" style={styles.container}>
      <View style={styles.copyWrap}>
        <Text style={styles.title}>{copy.restartRecovery.title}</Text>
        <Text style={styles.subtitle}>{copy.restartRecovery.subtitle}</Text>
      </View>

      <View style={styles.actions}>
        <SessionCTAButton
          testID="restart-start-ignition"
          tone="primary"
          label={copy.restartRecovery.ctaStartIgnition}
          onPress={startIgnition}
          disabled={busy}
        />
        <SessionCTAButton
          tone="ghost"
          label={copy.restartRecovery.ctaOpenLibrary}
          onPress={() => navigation.navigate('Library')}
          disabled={busy}
        />
        <SessionCTAButton
          tone="ghost"
          label={copy.restartRecovery.ctaChangeTime}
          onPress={() => navigation.navigate('TimeChange')}
          disabled={busy}
        />
        <SessionCTAButton
          testID="restart-close"
          tone="ghost"
          label={copy.restartRecovery.ctaClose}
          onPress={() => navigation.navigate('FocusCore', { skipRestartOnce: true })}
          disabled={busy}
        />
      </View>

      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.screenBackground,
    paddingHorizontal: appTheme.spacing.screenPaddingHorizontal,
    paddingTop: 44,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  copyWrap: {
    alignItems: 'center',
    marginTop: 48,
  },
  title: {
    color: '#2C2C2C',
    fontSize: 42,
    lineHeight: 56,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#4B5563',
    fontSize: 26,
    lineHeight: 38,
    marginTop: 30,
    textAlign: 'center',
  },
  actions: {
    marginBottom: 20,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
});
