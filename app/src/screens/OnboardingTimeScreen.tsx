import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { saveSettingsWithDefaults } from '../useCases/SaveSettingsWithDefaults';

const PRESETS = [
  { label: '07:00', h: 7, m: 0 },
  { label: '12:00', h: 12, m: 0 },
  { label: '21:00', h: 21, m: 0 },
];

export function OnboardingTimeScreen({ navigation }: any) {
  const [hour, setHour] = useState(21);
  const [minute, setMinute] = useState(0);
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (saving) return;
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
      <Text style={styles.title}>読む時間を決める</Text>
      <View testID="onboarding-time-picker" style={styles.presetRow}>
        {PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.label}
            style={[styles.preset, hour === preset.h && minute === preset.m ? styles.presetSelected : null]}
            onPress={() => {
              setHour(preset.h);
              setMinute(preset.m);
            }}
          >
            <Text style={styles.presetText}>{preset.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        testID="onboarding-time-save"
        style={[styles.cta, saving ? styles.disabled : null]}
        onPress={onSave}
        disabled={saving}
      >
        <Text style={styles.ctaText}>この時刻で保存</Text>
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
    marginBottom: 16,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 10,
  },
  preset: {
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.12)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  presetSelected: {
    borderColor: '#D48A3E',
    backgroundColor: 'rgba(212,138,62,0.10)',
  },
  presetText: {
    color: '#2C2C2C',
    fontSize: 15,
    fontWeight: '600',
  },
  cta: {
    marginTop: 20,
    borderRadius: 14,
    backgroundColor: '#D48A3E',
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
});
