import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SessionCTAButton } from '../components/SessionCTAButton';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { cancelScheduled, requestPermission } from '../notifications';
import { saveSettingsWithDefaults } from '../useCases/SaveSettingsWithDefaults';
import { appTheme } from '../theme/layout';
import type { ScreenProps } from '../navigation/types';

export function NotificationSettingsScreen({ navigation }: ScreenProps<'NotificationSettings'>) {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const settings = await persistenceBridge.getSettings();
      if (!alive) return;
      setEnabled(settings?.notificationsEnabled === true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onEnable = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const granted = await requestPermission();
      await saveSettingsWithDefaults({ notificationsEnabled: granted });
      setEnabled(granted);
    } finally {
      setBusy(false);
    }
  };

  const onDisable = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await saveSettingsWithDefaults({ notificationsEnabled: false });
      await cancelScheduled();
      setEnabled(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container} testID="notification-settings-screen">
      <Text style={styles.title}>通知設定</Text>
      <Text style={styles.subtitle}>通知のON/OFFをいつでも変更できます。</Text>
      <Text testID="notification-settings-status" style={styles.status}>
        現在: {enabled ? '有効' : '無効'}
      </Text>

      <View style={styles.actions}>
        {enabled ? (
          <SessionCTAButton
            testID="notification-settings-disable"
            tone="secondary"
            label="通知を無効にする"
            onPress={() => {
              void onDisable();
            }}
            disabled={busy}
          />
        ) : (
          <SessionCTAButton
            testID="notification-settings-enable"
            tone="primary"
            label="通知を有効にする"
            onPress={() => {
              void onEnable();
            }}
            disabled={busy}
          />
        )}
        <SessionCTAButton
          testID="notification-settings-back"
          tone="ghost"
          label="戻る"
          onPress={() => navigation.goBack()}
          disabled={busy}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.screenBackground,
    paddingHorizontal: appTheme.spacing.screenPaddingHorizontal,
    paddingTop: 22,
    paddingBottom: 24,
  },
  title: {
    color: '#2C2C2C',
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
  },
  status: {
    color: '#2C2C2C',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 18,
  },
  actions: {
    marginTop: 'auto',
  },
});
