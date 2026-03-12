import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  bookCoverUri?: string;
  mode?: SessionMode;
  durationSeconds: number;
  remainingSeconds: number;
  done: boolean;
  completing: boolean;
  onPressBack: () => void;
};

function toProgressRatio(remainingSeconds: number, durationSeconds: number): number {
  const total = Math.max(1, durationSeconds);
  const consumed = Math.max(0, Math.min(total, total - Math.max(0, remainingSeconds)));
  return consumed / total;
}

export function ActiveSessionView({
  bookTitle,
  bookCoverUri,
  mode,
  durationSeconds,
  remainingSeconds,
  done,
  completing,
  onPressBack,
}: ActiveSessionViewProps) {
  const progressRatio = toProgressRatio(remainingSeconds, durationSeconds);
  const rightRotation = `${Math.min(progressRatio, 0.5) * 360}deg`;
  const leftRotation = `${Math.max(0, progressRatio - 0.5) * 360}deg`;
  const isLeftVisible = progressRatio > 0.5;
  const remaining = done ? (completing ? '完了処理中…' : copy.activeSession.completed) : formatRemaining(remainingSeconds);

  return (
    <View testID="active-session-screen" style={styles.container}>
      <Text testID={modeTestId(mode)} style={styles.caption}>{copy.activeSession.caption}</Text>
      {bookCoverUri ? (
        <Image testID="active-session-cover" source={{ uri: bookCoverUri }} style={styles.cover} resizeMode="cover" />
      ) : (
        <View testID="active-session-cover-fallback" style={styles.coverFallback}>
          <Text style={styles.coverFallbackText} numberOfLines={3}>
            {bookTitle}
          </Text>
        </View>
      )}
      <Text testID="active-session-book-title" style={styles.title}>
        {bookTitle}
      </Text>
      <View style={styles.progressCircle} testID="active-session-progress-circle">
        <View style={styles.progressTrack} />
        <View style={styles.rightMask}>
          <View style={[styles.progressHalf, styles.progressRight, { transform: [{ rotate: rightRotation }] }]} />
        </View>
        {isLeftVisible ? (
          <View style={styles.leftMask}>
            <View style={[styles.progressHalf, styles.progressLeft, { transform: [{ rotate: leftRotation }] }]} />
          </View>
        ) : null}
        <View style={styles.progressCenter}>
          <Text testID="active-session-remaining" style={styles.timer}>
            {remaining}
          </Text>
        </View>
      </View>

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
  cover: {
    marginTop: 14,
    width: 120,
    height: 160,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  coverFallback: {
    marginTop: 14,
    width: 120,
    height: 160,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  coverFallbackText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressCircle: {
    marginTop: 24,
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTrack: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 10,
    borderColor: '#E5E7EB',
  },
  rightMask: {
    position: 'absolute',
    width: 90,
    height: 180,
    right: 0,
    overflow: 'hidden',
  },
  leftMask: {
    position: 'absolute',
    width: 90,
    height: 180,
    left: 0,
    overflow: 'hidden',
  },
  progressHalf: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 10,
    borderColor: '#D48A3E',
  },
  progressRight: {
    right: 0,
  },
  progressLeft: {
    left: 0,
  },
  progressCenter: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    color: TEXT,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 1,
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
