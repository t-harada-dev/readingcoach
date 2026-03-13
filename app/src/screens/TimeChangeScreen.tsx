import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SessionCTAButton } from '../components/SessionCTAButton';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { copy } from '../config/copy';
import { runUpdateDailyTargetTimeUseCase } from '../useCases/UpdateDailyTargetTimeUseCase';
import { appTheme } from '../theme/layout';
import type { ScreenProps } from '../navigation/types';
import { useAsyncEffect } from '../hooks/useAsyncEffect';
import { normalizeTimeField, TIME_CHANGE_PRESETS } from './timeChangeHelpers';

export function TimeChangeScreen({ navigation }: ScreenProps<'TimeChange'>) {
  const [hourInput, setHourInput] = useState('22');
  const [minuteInput, setMinuteInput] = useState('00');
  const [busy, setBusy] = useState(false);

  useAsyncEffect(async (signal) => {
    const settings = await persistenceBridge.getSettings();
    if (!signal.alive || !settings) return;
    const hour = Math.floor(settings.dailyTargetTime / 60);
    const minute = settings.dailyTargetTime % 60;
    setHourInput(String(hour));
    setMinuteInput(String(minute).padStart(2, '0'));
  }, []);

  const parsedHour = normalizeTimeField(hourInput, 23);
  const parsedMinute = normalizeTimeField(minuteInput, 59);
  const hasValidTime = parsedHour !== null && parsedMinute !== null;

  const onConfirm = async () => {
    const hour = normalizeTimeField(hourInput, 23);
    const minute = normalizeTimeField(minuteInput, 59);
    if (busy || hour === null || minute === null) return;
    setBusy(true);
    try {
      await runUpdateDailyTargetTimeUseCase({ hour, minute });
      navigation.goBack();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View testID="time-change-screen" style={styles.container}>
      <Text style={styles.title}>{copy.timeChange.title}</Text>
      <Text style={styles.subtitle}>{copy.timeChange.subtitle}</Text>

      <View testID="time-change-input" style={styles.timeInputRow}>
        <View style={styles.timeInputBlock}>
          <Text style={styles.inputLabel}>{copy.timeChange.labelHour}</Text>
          <TextInput
            testID="time-change-hour-input"
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
            testID="time-change-minute-input"
            style={styles.timeInput}
            value={minuteInput}
            onChangeText={setMinuteInput}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
      </View>
      <Text style={styles.hint}>{copy.timeChange.hint}</Text>
      <View style={styles.presets}>
        {TIME_CHANGE_PRESETS.map((preset) => (
          <SessionCTAButton
            key={preset.label}
            testID={`time-change-preset-${preset.hour}`}
            tone="secondary"
            label={preset.label}
            onPress={() => {
              setHourInput(String(preset.hour));
              setMinuteInput(String(preset.minute).padStart(2, '0'));
            }}
            disabled={busy}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <SessionCTAButton
          tone="ghost"
          label={copy.timeChange.ctaOpenNotificationSettings}
          onPress={() => navigation.navigate('Settings')}
          disabled={busy}
        />
        <SessionCTAButton
          testID="time-change-confirm"
          tone="primary"
          label={copy.timeChange.ctaConfirm}
          onPress={onConfirm}
          disabled={busy || !hasValidTime}
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
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    color: '#2C2C2C',
    fontSize: 34,
    lineHeight: 44,
    fontWeight: '700',
    marginTop: 12,
  },
  subtitle: {
    color: '#4B5563',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  timeInputBlock: {
    alignItems: 'center',
  },
  inputLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 8,
  },
  timeInput: {
    width: 96,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.12)',
    backgroundColor: '#FFFFFF',
    color: '#2C2C2C',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  colon: {
    color: '#2C2C2C',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 14,
  },
  hint: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  presets: {
    marginTop: 12,
    gap: 8,
  },
  actions: {
    marginTop: 'auto',
  },
});
