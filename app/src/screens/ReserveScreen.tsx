import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context';
import { requestPermission, scheduleReadingReminder } from '../notifications';

const PRESETS = [
  { label: '7:00', h: 7, m: 0 },
  { label: '12:00', h: 12, m: 0 },
  { label: '21:00', h: 21, m: 0 },
  { label: '22:00', h: 22, m: 0 },
];

export function ReserveScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { books, reservation, setReservation } = useApp();
  const [bookId, setBookId] = useState<string | null>(reservation?.bookId ?? null);
  const [hour, setHour] = useState(reservation ? new Date(reservation.scheduledAt).getHours() : 21);
  const [minute, setMinute] = useState(reservation ? new Date(reservation.scheduledAt).getMinutes() : 0);

  const onConfirm = async () => {
    if (!bookId) return;
    const ok = await requestPermission();
    if (!ok) {
      // 許可されなくても予約は保存（通知だけ飛ばない）
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hour, minute, 0, 0);
    await setReservation(bookId, tomorrow);
    const book = books.find((b) => b.id === bookId);
    if (book) await scheduleReadingReminder(tomorrow, book.title);
    navigation.goBack();
  };

  if (books.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>本を先に追加してください</Text>
        <TouchableOpacity style={styles.link} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.label}>明日読む1冊</Text>
      <View style={styles.bookList}>
        {books.map((b) => (
          <TouchableOpacity
            key={b.id}
            style={[styles.bookRow, bookId === b.id && styles.bookRowSelected]}
            onPress={() => setBookId(b.id)}
          >
            <Text style={styles.bookTitle}>{b.title}</Text>
            {b.author ? <Text style={styles.bookAuthor}>{b.author}</Text> : null}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>時刻</Text>
      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p.label}
            style={[styles.presetBtn, hour === p.h && minute === p.m && styles.presetSelected]}
            onPress={() => {
              setHour(p.h);
              setMinute(p.m);
            }}
          >
            <Text style={styles.presetText}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.hint}>{hour}:{String(minute).padStart(2, '0')} に通知</Text>

      <TouchableOpacity
        style={[styles.cta, !bookId && styles.ctaDisabled]}
        onPress={onConfirm}
        disabled={!bookId}
      >
        <Text style={styles.ctaText}>予約する</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0f0f0f' },
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  label: {
    color: '#888',
    fontSize: 14,
    marginTop: 24,
    marginBottom: 12,
  },
  empty: { color: '#888', fontSize: 16, textAlign: 'center', marginTop: 48 },
  bookList: { gap: 8 },
  bookRow: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  bookRowSelected: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.1)',
  },
  bookTitle: { color: '#fff', fontSize: 16 },
  bookAuthor: { color: '#888', fontSize: 14, marginTop: 4 },
  presets: { flexDirection: 'row', gap: 12, marginTop: 8 },
  presetBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  presetSelected: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.1)',
  },
  presetText: { color: '#ccc', fontSize: 16 },
  hint: { color: '#666', fontSize: 13, marginTop: 12 },
  cta: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
    alignItems: 'center',
  },
  ctaDisabled: { backgroundColor: '#333', opacity: 0.7 },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  link: { marginTop: 24, alignSelf: 'center' },
  linkText: { color: '#666', fontSize: 14 },
});
