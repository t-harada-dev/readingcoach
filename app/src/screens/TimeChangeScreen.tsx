import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SessionCTAButton } from '../components/SessionCTAButton';
import { persistenceBridge } from '../bridge/PersistenceBridge';
import { copy } from '../config/copy';
import { runUpdateDailyTargetTimeUseCase } from '../useCases/UpdateDailyTargetTimeUseCase';
import { appTheme } from '../theme/layout';

type Preset = { label: string; hour: number; minute: number };

const PRESETS: Preset[] = [
  { label: '7:00', hour: 7, minute: 0 },
  { label: '12:00', hour: 12, minute: 0 },
  { label: '21:00', hour: 21, minute: 0 },
  { label: '22:00', hour: 22, minute: 0 },
];

export function TimeChangeScreen({ navigation }: any) {
  const [hour, setHour] = useState(22);
  const [minute, setMinute] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const settings = await persistenceBridge.getSettings();
      if (!alive || !settings) return;
      setHour(Math.floor(settings.dailyTargetTime / 60));
      setMinute(settings.dailyTargetTime % 60);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onConfirm = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await runUpdateDailyTargetTimeUseCase({ hour, minute });
      navigation.goBack();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{copy.timeChange.title}</Text>
      <Text style={styles.subtitle}>{copy.timeChange.subtitle}</Text>

      <View style={styles.presetRow}>
        {PRESETS.map((preset) => {
          const selected = preset.hour === hour && preset.minute === minute;
          return (
            <SessionCTAButton
              key={preset.label}
              tone={selected ? 'primary' : 'secondary'}
              label={preset.label}
              onPress={() => {
                setHour(preset.hour);
                setMinute(preset.minute);
              }}
              disabled={busy}
            />
          );
        })}
      </View>
      <Text style={styles.selectedTime}>
        {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
      </Text>
      <Text style={styles.hint}>{copy.timeChange.hint}</Text>

      <SessionCTAButton
        tone="primary"
        label={copy.timeChange.ctaConfirm}
        onPress={onConfirm}
        disabled={busy}
      />
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
    marginBottom: 20,
  },
  presetRow: {
    gap: 8,
  },
  selectedTime: {
    color: '#2C2C2C',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },
  hint: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
});
