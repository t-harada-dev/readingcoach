import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { requestPermission } from '../notifications';

async function resolvePermission(): Promise<boolean> {
  const mock = await persistenceBridge.getLaunchArg('e2e_notification_permission');
  if (mock === 'allowed') return true;
  if (mock === 'denied') return false;
  return requestPermission();
}

export function OnboardingNotificationScreen({ navigation }: any) {
  const [busy, setBusy] = useState(false);

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
      await resolvePermission();
      goReady();
    } finally {
      setBusy(false);
    }
  };

  const onLater = async () => {
    if (busy) return;
    setBusy(true);
    try {
      goReady();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View testID="onboarding-notification-screen" style={styles.container}>
      <Text style={styles.title}>通知を設定しますか？</Text>
      <Text style={styles.sub}>拒否してもアプリはそのまま使えます。</Text>
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
        <Text style={styles.secondaryText}>あとで</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FDFCF8',
  },
  title: {
    color: '#2C2C2C',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  sub: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 20,
  },
  primary: {
    borderRadius: 14,
    backgroundColor: '#D48A3E',
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondary: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.12)',
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },
  secondaryText: {
    color: '#2C2C2C',
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
});
