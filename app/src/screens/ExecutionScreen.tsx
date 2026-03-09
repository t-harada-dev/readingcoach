import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context';
import type { ExecutionMode } from '../types';

function formatTime(d: Date | null): string {
  if (!d) return '';
  return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

export function ExecutionScreen({ navigation }: { navigation: { navigate: (name: string) => void } }) {
  const { todayBook, reservedTime, books, recordExecution } = useApp();
  const [modeChoice, setModeChoice] = useState<ExecutionMode | null>(null);
  const [done, setDone] = useState(false);

  const onPressMain = () => setModeChoice('15min');
  const onSelectMode = async (mode: ExecutionMode) => {
    if (!todayBook) return;
    await recordExecution(todayBook.id, mode);
    setModeChoice(null);
    setDone(true);
  };
  const onRescue = async (mode: '5min' | '1page') => {
    if (!todayBook) return;
    await recordExecution(todayBook.id, mode);
    setDone(true);
  };

  if (books.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>まず1冊、本を追加してください</Text>
        <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('AddBook')}>
          <Text style={styles.ctaText}>本を追加</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (done) {
    return (
      <View style={styles.container}>
        <Text style={styles.doneTitle}>今日、進んだ</Text>
        <TouchableOpacity style={styles.ctaSecondary} onPress={() => setDone(false)}>
          <Text style={styles.ctaTextSecondary}>OK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (modeChoice) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>どれで進める？</Text>
        <TouchableOpacity style={styles.cta} onPress={() => onSelectMode('15min')}>
          <Text style={styles.ctaText}>15分</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modeBtn} onPress={() => onSelectMode('5min')}>
          <Text style={styles.modeBtnText}>5分だけ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modeBtn} onPress={() => onSelectMode('1page')}>
          <Text style={styles.modeBtnText}>1ページだけ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const book = todayBook!;
  return (
    <View style={styles.container}>
      <Text style={styles.todayLabel}>今日の1冊</Text>
      <Text style={styles.bookTitle}>{book.title}</Text>
      {book.author ? <Text style={styles.bookAuthor}>{book.author}</Text> : null}
      {reservedTime ? (
        <Text style={styles.timeLabel}>予約 {formatTime(reservedTime)}</Text>
      ) : null}

      <TouchableOpacity style={styles.cta} onPress={onPressMain}>
        <Text style={styles.ctaText}>今すぐ読む</Text>
      </TouchableOpacity>

      <View style={styles.rescueRow}>
        <TouchableOpacity style={styles.rescueBtn} onPress={() => onRescue('5min')}>
          <Text style={styles.rescueBtnText}>5分だけ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rescueBtn} onPress={() => onRescue('1page')}>
          <Text style={styles.rescueBtnText}>1ページだけ</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Reserve')}>
        <Text style={styles.linkText}>明日の予約</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('AddBook')}>
        <Text style={styles.linkText}>本を追加</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0f0f0f',
  },
  todayLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  bookTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  bookAuthor: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 16,
  },
  timeLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 32,
  },
  label: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 24,
  },
  cta: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 12,
  },
  ctaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  ctaSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  ctaTextSecondary: {
    color: '#22c55e',
    fontSize: 16,
  },
  modeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  modeBtnText: {
    color: '#aaa',
    fontSize: 16,
  },
  rescueRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  rescueBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
  },
  rescueBtnText: {
    color: '#888',
    fontSize: 14,
  },
  link: {
    paddingVertical: 8,
  },
  linkText: {
    color: '#666',
    fontSize: 14,
  },
  doneTitle: {
    color: '#22c55e',
    fontSize: 20,
    fontWeight: '600',
  },
});
