import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { copy } from '../config/copy';
import type { SessionMode } from '../useCases/StartSessionUseCase';
import { appTheme } from '../theme/layout';

const BG = appTheme.colors.screenBackground;
const TEXT = '#2C2C2C';
const AMBER = '#D48A3E';

function formatRemaining(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function modeTestId(mode?: SessionMode): string | undefined {
  if (mode === 'normal_15m') return 'active-session-mode-15';
  if (mode === 'rescue_5m') return 'active-session-mode-5';
  if (mode === 'rehab_3m') return 'active-session-mode-3';
  if (mode === 'ignition_1m') return 'active-session-mode-1';
  return undefined;
}

export type ActiveSessionViewProps = {
  bookTitle: string;
  mode?: SessionMode;
  remainingSeconds: number;
  done: boolean;
  completing: boolean;
  onPressBack: () => void;
};

export function ActiveSessionView({
  bookTitle,
  mode,
  remainingSeconds,
  done,
  completing,
  onPressBack,
}: ActiveSessionViewProps) {
  return (
    <View testID="active-session-screen" style={styles.container}>
      <Text testID={modeTestId(mode)} style={styles.caption}>{copy.activeSession.caption}</Text>
      <Text style={styles.title}>{bookTitle}</Text>
      <Text style={styles.timer}>
        {done ? (completing ? '完了処理中…' : copy.activeSession.completed) : formatRemaining(remainingSeconds)}
      </Text>

      <TouchableOpacity style={styles.secondaryBtn} onPress={onPressBack}>
        <Text style={styles.secondaryText}>{copy.activeSession.backToHome}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: appTheme.spacing.screenPaddingHorizontal,
    paddingTop: 28,
    alignItems: 'center',
  },
  caption: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
  },
  title: {
    color: TEXT,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
  timer: {
    color: TEXT,
    fontSize: 56,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 28,
  },
  secondaryBtn: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 138, 62, 0.45)',
  },
  secondaryText: {
    color: AMBER,
    fontSize: 15,
    fontWeight: '600',
  },
});
