import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  message: string;
  elapsedLabel: string;
  progressRatio: number | null;
};

export function CompletionFeedbackCard({ title, message, elapsedLabel, progressRatio }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.elapsed}>{elapsedLabel}</Text>
      {progressRatio !== null ? (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progressRatio * 100)}%` }]} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.08)',
    padding: 16,
    width: '100%',
  },
  title: {
    color: '#2C2C2C',
    fontSize: 20,
    fontWeight: '700',
  },
  message: {
    color: '#525252',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  elapsed: {
    color: '#2C2C2C',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  progressTrack: {
    marginTop: 12,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D48A3E',
  },
});

