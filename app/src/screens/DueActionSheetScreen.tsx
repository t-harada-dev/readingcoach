import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SessionCTAButton } from '../components/SessionCTAButton';
import { copy } from '../config/copy';
import { runStartSessionUseCase } from '../useCases/StartSessionUseCase';
import { runSnoozePlanUseCase } from '../useCases/SnoozePlanUseCase';
import { dueActionOrder } from './screenPolicy';
import { buildActiveSessionRouteParams } from '../navigation/activeSessionRoute';
import { appTheme } from '../theme/layout';

type Params = {
  planId: string;
  defaultMode: 'normal_15m' | 'ignition_1m';
  entryPoint?: 'notification' | 'app';
  dueActionScreenId?: 'SC-23';
};

export function DueActionSheetScreen({ navigation, route }: any) {
  const { planId, defaultMode, entryPoint } = (route.params ?? {}) as Params;
  const [busy, setBusy] = useState(false);
  const actions = dueActionOrder();

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
    <View style={styles.container}>
      <View style={styles.sheet}>
        <Text style={styles.title}>{copy.dueAction.title}</Text>
        <Text style={styles.subtitle}>{copy.dueAction.subtitle}</Text>
        {actions.map((action) => {
          if (action === 'start') {
            return (
              <SessionCTAButton
                key={action}
                tone="primary"
                label={copy.dueAction.ctaStart}
                onPress={() => onStart(defaultMode ?? 'normal_15m')}
                disabled={busy}
              />
            );
          }
          if (action === 'rescue_5m') {
            return (
              <SessionCTAButton
                key={action}
                tone="secondary"
                label={copy.dueAction.cta5m}
                onPress={() => onStart('rescue_5m')}
                disabled={busy}
              />
            );
          }
          return (
            <SessionCTAButton
              key={action}
              tone="ghost"
              label={copy.dueAction.ctaSnooze}
              onPress={async () => {
                if (!planId || busy) return;
                setBusy(true);
                try {
                  await runSnoozePlanUseCase(planId, 30);
                  navigation.goBack();
                } finally {
                  setBusy(false);
                }
              }}
              disabled={busy}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.16)',
  },
  sheet: {
    backgroundColor: appTheme.colors.screenBackground,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    color: '#2C2C2C',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 6,
    marginBottom: 8,
  },
});
