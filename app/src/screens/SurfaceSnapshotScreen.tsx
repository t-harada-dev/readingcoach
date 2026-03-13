import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type SurfaceSnapshotId =
  | 'SF-01'
  | 'SF-02'
  | 'SF-03'
  | 'SF-04'
  | 'SF-05'
  | 'SF-06'
  | 'SF-07'
  | 'SF-08'
  | 'SF-09';

type SnapshotSpec = {
  title: string;
  subtitle: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  ctaTertiary?: string;
  badge?: string;
};

const SPECS: Record<SurfaceSnapshotId, SnapshotSpec> = {
  'SF-01': {
    title: 'ホーム Widget（通常）',
    subtitle: '今日の読書セッションを開始',
    ctaPrimary: '開始',
    ctaSecondary: '5分だけ',
    badge: 'Widget',
  },
  'SF-02': {
    title: 'ホーム Widget（Rehab）',
    subtitle: '再開モードで最短スタート',
    ctaPrimary: '開始',
    ctaSecondary: '5分だけ',
    badge: 'Widget',
  },
  'SF-03': {
    title: '予定時刻通知（通常）',
    subtitle: '予定時刻になりました',
    ctaPrimary: '開始',
    ctaSecondary: '5分だけ',
    ctaTertiary: '30分延期',
    badge: 'Notification',
  },
  'SF-04': {
    title: '予定時刻通知（Rehab）',
    subtitle: '軽く再開しましょう',
    ctaPrimary: '開始',
    ctaSecondary: '5分だけ',
    ctaTertiary: '30分延期',
    badge: 'Notification',
  },
  'SF-05': {
    title: 'Live Activity（15分）',
    subtitle: '残り 12:34',
    badge: 'Live Activity',
  },
  'SF-06': {
    title: 'Live Activity（3分）',
    subtitle: '残り 02:10',
    badge: 'Live Activity',
  },
  'SF-07': {
    title: 'Live Activity（1分）',
    subtitle: '残り 00:45',
    badge: 'Live Activity',
  },
  'SF-08': {
    title: 'App Intents（開始）',
    subtitle: 'Siri / Shortcut から読書開始',
    ctaPrimary: '読書開始',
    ctaSecondary: '5分だけ読む',
    ctaTertiary: '今日の本確認',
    badge: 'App Intents',
  },
  'SF-09': {
    title: 'Live Activity（5分）',
    subtitle: '残り 04:21',
    badge: 'Live Activity',
  },
};

export function isSurfaceSnapshotId(value: string | null | undefined): value is SurfaceSnapshotId {
  if (!value) return false;
  return Object.prototype.hasOwnProperty.call(SPECS, value);
}

export function SurfaceSnapshotScreen({ route }: any) {
  const requestedSnapshotId = typeof route?.params?.snapshotId === 'string' ? route.params.snapshotId : null;
  const snapshotId = isSurfaceSnapshotId(requestedSnapshotId) ? requestedSnapshotId : 'SF-01';
  const spec = SPECS[snapshotId];

  return (
    <View testID="surface-snapshot-screen" style={styles.screen}>
      <View style={styles.card}>
        <Text testID="surface-snapshot-id" style={styles.id}>{snapshotId}</Text>
        <Text style={styles.badge}>{spec.badge ?? 'Surface'}</Text>
        <Text testID="surface-snapshot-title" style={styles.title}>{spec.title}</Text>
        <Text testID="surface-snapshot-subtitle" style={styles.subtitle}>{spec.subtitle}</Text>

        <View style={styles.actions}>
          {spec.ctaPrimary ? <Text style={[styles.action, styles.primary]}>{spec.ctaPrimary}</Text> : null}
          {spec.ctaSecondary ? <Text style={styles.action}>{spec.ctaSecondary}</Text> : null}
          {spec.ctaTertiary ? <Text style={styles.action}>{spec.ctaTertiary}</Text> : null}
        </View>
      </View>
      <View testID={`surface-snapshot-ready-${snapshotId}`} />
      <View testID="surface-snapshot-ready" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.15)',
  },
  id: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
  },
  badge: {
    marginTop: 6,
    color: '#2B3A55',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    marginTop: 10,
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 8,
    color: '#4B5563',
    fontSize: 14,
  },
  actions: {
    marginTop: 14,
    gap: 8,
  },
  action: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.18)',
    paddingVertical: 8,
    textAlign: 'center',
    color: '#111827',
    fontWeight: '700',
    fontSize: 13,
  },
  primary: {
    backgroundColor: '#F59E0B',
    borderColor: '#E08A00',
    color: '#FFFFFF',
  },
});
