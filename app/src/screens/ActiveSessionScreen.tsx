import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const BG = '#FDFCF8';
const TEXT = '#2C2C2C';
const AMBER = '#D48A3E';

function formatRemaining(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function ActiveSessionScreen({
  navigation,
  route,
}: any) {
  const { bookTitle, endTimeISO } = (route.params ?? {}) as { bookTitle: string; endTimeISO: string };

  const endTime = useMemo(() => new Date(endTimeISO).getTime(), [endTimeISO]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remainingSeconds = Math.max(0, Math.ceil((endTime - now) / 1000));
  const done = remainingSeconds <= 0;

  return (
    <View style={styles.container}>
      <Text style={styles.caption}>集中の時間</Text>
      <Text style={styles.title}>{bookTitle}</Text>
      <Text style={styles.timer}>{done ? '完了' : formatRemaining(remainingSeconds)}</Text>

      <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.secondaryText}>ホームへ戻る</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 22,
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

