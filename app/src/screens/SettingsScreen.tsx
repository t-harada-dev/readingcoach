import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { SessionCTAButton } from '../components/SessionCTAButton';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { copy } from '../config/copy';
import { cancelScheduled, requestPermission } from '../notifications';
import { saveSettingsWithDefaults } from '../useCases/SaveSettingsWithDefaults';
import { runUpdateDailyTargetTimeUseCase } from '../useCases/UpdateDailyTargetTimeUseCase';
import { appTheme } from '../theme/layout';

function normalizeTimeField(raw: string, max: number): number | null {
  if (raw.trim().length === 0) return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  const normalized = Math.floor(value);
  if (normalized < 0 || normalized > max) return null;
  return normalized;
}

export function SettingsScreen({ navigation, route }: any) {
  const routeForcedNotificationsEnabled = route?.params?.forceNotificationsEnabled;
  const [hourInput, setHourInput] = useState('21');
  const [minuteInput, setMinuteInput] = useState('00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof routeForcedNotificationsEnabled === 'boolean' ? routeForcedNotificationsEnabled : false
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    if (typeof routeForcedNotificationsEnabled === 'boolean') {
      setNotificationsEnabled(routeForcedNotificationsEnabled);
      return () => {
        alive = false;
      };
    }
    (async () => {
      const settings = await persistenceBridge.getSettings();
      if (!alive || !settings) return;
      const hour = Math.floor(settings.dailyTargetTime / 60);
      const minute = settings.dailyTargetTime % 60;
      setHourInput(String(hour));
      setMinuteInput(String(minute).padStart(2, '0'));
      setNotificationsEnabled(settings.notificationsEnabled === true);
    })();
    return () => {
      alive = false;
    };
  }, [routeForcedNotificationsEnabled]);

  const parsedHour = normalizeTimeField(hourInput, 23);
  const parsedMinute = normalizeTimeField(minuteInput, 59);
  const hasValidTime = parsedHour !== null && parsedMinute !== null;

  const onSaveTime = async () => {
    const hour = normalizeTimeField(hourInput, 23);
    const minute = normalizeTimeField(minuteInput, 59);
    if (busy || hour === null || minute === null) return;
    setBusy(true);
    try {
      await runUpdateDailyTargetTimeUseCase({ hour, minute });
    } finally {
      setBusy(false);
    }
  };

  const onEnableNotification = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const granted = await requestPermission();
      await saveSettingsWithDefaults({ notificationsEnabled: granted });
      setNotificationsEnabled(granted);
    } finally {
      setBusy(false);
    }
  };

  const onDisableNotification = async () => {
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

  return (
    <View testID="settings-screen" style={styles.container}>
      <Text style={styles.title}>{copy.settings.title}</Text>
      <Text style={styles.subtitle}>{copy.settings.subtitle}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{copy.settings.timeSectionTitle}</Text>
        <View testID="settings-time-input" style={styles.timeInputRow}>
          <View style={styles.timeInputBlock}>
            <Text style={styles.inputLabel}>{copy.timeChange.labelHour}</Text>
            <TextInput
              testID="settings-hour-input"
              style={styles.timeInput}
              value={hourInput}
              onChangeText={setHourInput}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
          <Text style={styles.colon}>:</Text>
          <View style={styles.timeInputBlock}>
            <Text style={styles.inputLabel}>{copy.timeChange.labelMinute}</Text>
            <TextInput
              testID="settings-minute-input"
              style={styles.timeInput}
              value={minuteInput}
              onChangeText={setMinuteInput}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
        </View>
        <SessionCTAButton
          testID="settings-save-time"
          tone="primary"
          label={copy.settings.ctaSaveTime}
          onPress={() => {
            void onSaveTime();
          }}
          disabled={busy || !hasValidTime}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{copy.settings.notificationSectionTitle}</Text>
        <Text testID="settings-notification-status" style={styles.status}>
          {copy.settings.notificationStatus}: {notificationsEnabled ? copy.settings.notificationEnabled : copy.settings.notificationDisabled}
        </Text>
        {notificationsEnabled ? (
          <SessionCTAButton
            testID="settings-disable-notification"
            tone="secondary"
            label={copy.settings.ctaDisableNotification}
            onPress={() => {
              void onDisableNotification();
            }}
            disabled={busy}
          />
        ) : (
          <SessionCTAButton
            testID="settings-enable-notification"
            tone="primary"
            label={copy.settings.ctaEnableNotification}
            onPress={() => {
              void onEnableNotification();
            }}
            disabled={busy}
          />
        )}
      </View>

      <View style={styles.actions}>
        <SessionCTAButton
          testID="settings-back"
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
  section: {
    marginTop: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.08)',
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  sectionTitle: {
    color: '#2C2C2C',
    fontSize: 15,
    fontWeight: '700',
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  timeInputBlock: {
    alignItems: 'center',
  },
  inputLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 6,
  },
  timeInput: {
    width: 88,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.12)',
    backgroundColor: '#FFFFFF',
    color: '#2C2C2C',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  colon: {
    color: '#2C2C2C',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  status: {
    color: '#4B5563',
    fontSize: 14,
    marginTop: 8,
  },
  actions: {
    marginTop: 'auto',
  },
});
