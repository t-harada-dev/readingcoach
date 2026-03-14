import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { cancelScheduled, requestPermission } from '../notifications';
import { saveSettingsWithDefaults } from '../useCases/SaveSettingsWithDefaults';
import type { ScreenProps } from '../navigation/types';
import { appTheme } from '../theme/layout';

async function resolvePermission(): Promise<boolean> {
  const mock = await persistenceBridge.getLaunchArg('e2e_notification_permission');
  if (mock === 'allowed') return true;
  if (mock === 'denied') return false;
  return requestPermission();
}

export function OnboardingNotificationScreen({ navigation, route }: ScreenProps<'OnboardingNotification'>) {
  const [busy, setBusy] = useState(false);
  const forcedNotificationsEnabled = route.params?.forceNotificationsEnabled;
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof forcedNotificationsEnabled === 'boolean' ? forcedNotificationsEnabled : false
  );

  useEffect(() => {
    let alive = true;
    if (typeof forcedNotificationsEnabled === 'boolean') {
      setNotificationsEnabled(forcedNotificationsEnabled);
      return () => {
        alive = false;
      };
    }
    (async () => {
      const settings = await persistenceBridge.getSettings();
      if (!alive) return;
      setNotificationsEnabled(settings?.notificationsEnabled === true);
    })();
    return () => {
      alive = false;
    };
  }, [forcedNotificationsEnabled]);

  const goReady = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'FocusCore' }],
    });
  };

  const onEnable = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const granted = await resolvePermission();
      await saveSettingsWithDefaults({ notificationsEnabled: granted });
      setNotificationsEnabled(granted);
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
      setNotificationsEnabled(false);
    } finally {
      setBusy(false);
    }
  };

  const onLater = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await saveSettingsWithDefaults({ notificationsEnabled: false });
      setNotificationsEnabled(false);
      goReady();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View testID="onboarding-notification-screen" style={styles.container}>
      <Text style={styles.title}>{notificationsEnabled ? '通知は有効です' : '通知を設定しますか？'}</Text>
      <Text style={styles.sub}>あなたの読書を後押しします</Text>
      <View style={styles.benefits}>
        <Text style={styles.benefitItem}>・開始時刻に読書開始をリマインドします</Text>
        <Text style={styles.benefitItem}>・開始 / 5分だけ / 30分延期を通知から選べます</Text>
      </View>

      <View style={styles.actions}>
        {notificationsEnabled ? (
          <>
            <TouchableOpacity
              testID="onboarding-notification-disable"
              style={[styles.secondary, busy ? styles.disabled : null]}
              onPress={onDisable}
              disabled={busy}
            >
              <Text style={styles.secondaryText}>通知は無効にする</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="onboarding-notification-home"
              style={[styles.primary, styles.primarySpaced, busy ? styles.disabled : null]}
              onPress={goReady}
              disabled={busy}
            >
              <Text style={styles.primaryText}>ホームに戻る</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              testID="onboarding-notification-enable"
              style={[styles.primary, busy ? styles.disabled : null]}
              onPress={onEnable}
              disabled={busy}
            >
              <Text style={styles.primaryText}>通知を有効にする</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="onboarding-notification-later"
              style={[styles.secondary, busy ? styles.disabled : null]}
              onPress={onLater}
              disabled={busy}
            >
              <Text style={styles.secondaryText}>ホームに戻る</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: appTheme.spacing.xl,
    backgroundColor: appTheme.colors.screenBackground,
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  sub: {
    color: appTheme.colors.textMuted,
    fontSize: 14,
    marginBottom: 10,
  },
  benefits: {
    gap: 6,
    marginBottom: 12,
  },
  benefitItem: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    marginTop: 'auto',
    paddingBottom: 8,
  },
  primary: {
    borderRadius: appTheme.borderRadius.lg,
    backgroundColor: appTheme.colors.accent,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    color: appTheme.colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
  primarySpaced: {
    marginTop: 12,
  },
  secondary: {
    borderRadius: appTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: appTheme.colors.surface,
    marginTop: 10,
  },
  secondaryText: {
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
});
