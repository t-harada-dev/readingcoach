import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { copy } from '../config/copy';
import { saveSettingsWithDefaults } from '../useCases/SaveSettingsWithDefaults';
import type { ScreenProps } from '../navigation/types';
import { appTheme } from '../theme/layout';

function normalizeTimeField(raw: string, max: number): number | null {
  if (raw.trim().length === 0) return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  const normalized = Math.floor(value);
  if (normalized < 0 || normalized > max) return null;
  return normalized;
}

export function OnboardingTimeScreen({ navigation }: ScreenProps<'OnboardingTime'>) {
  const [hourInput, setHourInput] = useState('21');
  const [minuteInput, setMinuteInput] = useState('00');
  const [saving, setSaving] = useState(false);

  const parsedHour = normalizeTimeField(hourInput, 23);
  const parsedMinute = normalizeTimeField(minuteInput, 59);
  const hasValidTime = parsedHour !== null && parsedMinute !== null;

  const onSave = async () => {
    const hour = normalizeTimeField(hourInput, 23);
    const minute = normalizeTimeField(minuteInput, 59);
    if (saving || hour === null || minute === null) return;
    setSaving(true);
    try {
      await saveSettingsWithDefaults({
        dailyTargetTime: hour * 60 + minute,
      });
      navigation.replace('OnboardingNotification');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View testID="onboarding-time-screen" style={styles.container}>
      <Text style={styles.title}>{copy.onboardingTime.title}</Text>
      <Text style={styles.subtitle}>{copy.onboardingTime.subtitle}</Text>
      <View testID="onboarding-time-picker" style={styles.timeInputRow}>
        <View style={styles.timeInputBlock}>
          <Text style={styles.inputLabel}>{copy.onboardingTime.labelHour}</Text>
          <TextInput
            testID="onboarding-time-hour-input"
            style={styles.timeInput}
            value={hourInput}
            onChangeText={setHourInput}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
        <Text style={styles.colon}>:</Text>
        <View style={styles.timeInputBlock}>
          <Text style={styles.inputLabel}>{copy.onboardingTime.labelMinute}</Text>
          <TextInput
            testID="onboarding-time-minute-input"
            style={styles.timeInput}
            value={minuteInput}
            onChangeText={setMinuteInput}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
      </View>
      <TouchableOpacity
        testID="onboarding-time-save"
        style={[styles.cta, (saving || !hasValidTime) ? styles.disabled : null]}
        onPress={onSave}
        disabled={saving || !hasValidTime}
      >
        <Text style={styles.ctaText}>{copy.onboardingTime.ctaSave}</Text>
      </TouchableOpacity>
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
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: appTheme.colors.textMuted,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 18,
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
    color: appTheme.colors.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
  timeInput: {
    width: 96,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    borderRadius: appTheme.borderRadius.lg,
    backgroundColor: appTheme.colors.surface,
    color: appTheme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  colon: {
    color: appTheme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 14,
  },
  cta: {
    marginTop: 'auto',
    borderRadius: appTheme.borderRadius.lg,
    backgroundColor: appTheme.colors.accent,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: {
    color: appTheme.colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
});
