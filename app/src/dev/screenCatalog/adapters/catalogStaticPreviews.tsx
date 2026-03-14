import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SessionCTAButton } from '../../../components/SessionCTAButton';
import { appTheme } from '../../../theme/layout';
import type { MockScenario, ScreenId } from '../types';

export function SC01CatalogPreview({ scenario }: { scenario: MockScenario }) {
    const hasData = scenario === 'already_has_data';
    const title = hasData ? '本を追加する' : 'これから読む本について教えてください';

    return (
        <View style={styles.previewContainer}>
            <Text style={[styles.title, styles.titleWithGap]}>{title}</Text>
            <View style={styles.card}>
                <Text style={styles.label}>書籍を検索</Text>
                <View style={styles.fakeInput}>
                    <Text style={styles.fakeInputText}>深く考える技術</Text>
                </View>
                <SessionCTAButton label="候補を見る" onPress={() => {}} />
                <SessionCTAButton tone="ghost" label="本を登録する" onPress={() => {}} />
            </View>
        </View>
    );
}

export function SC09CatalogPreview({ scenario }: { scenario: MockScenario }) {
    const timeoutOrError = scenario === 'timeout_or_error';
    const noResult = scenario === 'no_result';

    return (
        <View style={styles.previewContainer}>
            <Text style={styles.title}>本を追加する</Text>
            <View style={styles.card}>
                {timeoutOrError ? <Text style={styles.warning}>検索に失敗しました。手入力へ切り替えてください。</Text> : null}
                {noResult ? <Text style={styles.warning}>候補が見つかりませんでした。</Text> : null}
                <Text style={styles.label}>検索ワード</Text>
                <View style={styles.fakeInput}>
                    <Text style={styles.fakeInputText}>{noResult ? '存在しない本' : '深く考える技術'}</Text>
                </View>
                <SessionCTAButton label="検索する" onPress={() => {}} />
                <SessionCTAButton tone="secondary" label="本を登録する" onPress={() => {}} />
            </View>
        </View>
    );
}

export function SC10CatalogPreview({ scenario }: { scenario: MockScenario }) {
    const timeoutOrError = scenario === 'timeout_or_error';

    return (
        <View style={styles.previewContainer}>
            <Text style={styles.title}>本を追加する</Text>
            <View style={styles.card}>
                {timeoutOrError ? <Text style={styles.warning}>検索に失敗しました。手入力で登録してください。</Text> : null}
                <Text style={styles.label}>タイトル</Text>
                <View style={styles.fakeInput}>
                    <Text style={styles.fakeInputText}>読書メモの技術</Text>
                </View>
                <Text style={styles.label}>著者</Text>
                <View style={styles.fakeInput}>
                    <Text style={styles.fakeInputText}>山田 太郎</Text>
                </View>
                <View style={styles.coverActionCard}>
                    <Text style={styles.label}>表紙画像（任意）</Text>
                    <SessionCTAButton tone="secondary" label="カメラで撮影" onPress={() => {}} />
                    <SessionCTAButton tone="secondary" label="端末から選択" onPress={() => {}} />
                </View>
            </View>
            <View style={styles.previewBottomActions}>
                <SessionCTAButton label="保存する" onPress={() => {}} />
            </View>
        </View>
    );
}

export function SC11CatalogPreview({ scenario }: { scenario: MockScenario }) {
    const noResult = scenario === 'no_result';
    const primaryLabel = noResult ? '戻る' : 'この本を追加する';

    return (
        <View style={styles.previewContainer}>
            <Text style={styles.title}>本を追加する</Text>
            <View style={styles.card}>
                {noResult ? (
                    <Text style={styles.warning}>候補が0件です。手入力に戻ってください。</Text>
                ) : (
                    <>
                        <View style={[styles.row, styles.rowSelected]}>
                            <View style={styles.rowMain}>
                                <Text style={styles.rowTitle}>深く考える技術</Text>
                                <Text style={styles.rowMeta}>中村 健</Text>
                            </View>
                            <Text style={styles.rowBadge}>この本を読んでいます</Text>
                        </View>
                        <View style={styles.row}>
                            <View style={styles.rowMain}>
                                <Text style={styles.rowTitle}>思考を鍛える読書</Text>
                                <Text style={styles.rowMeta}>佐藤 彩</Text>
                            </View>
                        </View>
                    </>
                )}
                <SessionCTAButton label={primaryLabel} onPress={() => {}} />
            </View>
        </View>
    );
}

export function SC18CatalogPreview({ scenario }: { scenario: MockScenario }) {
    return (
        <View style={styles.previewContainer}>
            <Text style={styles.title}>完了</Text>
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>今日のセッションを完了しました</Text>
                <Text style={styles.rowMetaStrong}>読書した時間: {scenario === 'rehab' ? '05:00' : '15:00'}</Text>
                <Text style={styles.rowMetaStrong}>読書した本: 深く考える技術</Text>
            </View>
            <View style={styles.previewBottomActions}>
                <SessionCTAButton label="もう 5 分やる" onPress={() => {}} />
                <SessionCTAButton tone="secondary" label="もう 15 分やる" onPress={() => {}} />
                <SessionCTAButton tone="ghost" label="閉じる / ホームへ戻る" onPress={() => {}} />
            </View>
        </View>
    );
}

export function SC19CatalogPreview({ scenario: _scenario }: { scenario: MockScenario }) {
    return (
        <View style={styles.previewContainer}>
            <Text style={styles.title}>1冊読み切りました！</Text>
            <Text style={styles.subtitle}>次の本を選択しましょう</Text>
            <View style={[styles.card, styles.selectionArea]}>
                <Text style={styles.label}>次に読む本</Text>
                <View style={styles.selectionList}>
                    <View style={[styles.row, styles.rowSelected]}>
                        <View style={styles.rowMain}>
                            <Text style={styles.rowTitle}>1分で戻る読書習慣</Text>
                            <Text style={styles.rowMeta}>佐藤 彩</Text>
                        </View>
                        <Text style={styles.rowBadge}>この本を読んでいます</Text>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.rowMain}>
                            <Text style={styles.rowTitle}>週末に読みたい本</Text>
                            <Text style={styles.rowMeta}>山田 理央</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.rowMain}>
                            <Text style={styles.rowTitle}>読書メモの技術</Text>
                            <Text style={styles.rowMeta}>中村 健</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.rowMain}>
                            <Text style={styles.rowTitle}>構造化思考トレーニング</Text>
                            <Text style={styles.rowMeta}>小林 理央</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.previewBottomActions}>
                <SessionCTAButton label="この本を選ぶ" onPress={() => {}} />
                <SessionCTAButton tone="secondary" label="本を追加する" onPress={() => {}} />
            </View>
        </View>
    );
}

type SurfaceScreenId = Extract<ScreenId, 'SF-01' | 'SF-02' | 'SF-03' | 'SF-04' | 'SF-05' | 'SF-06' | 'SF-07' | 'SF-08' | 'SF-09'>;

const surfaceMeta: Record<
    SurfaceScreenId,
    {
        title: string;
        conditionNormal: string;
        conditionRehab?: string;
        ctas: string[];
        destinations: string[];
    }
> = {
    'SF-01': {
        title: 'ホーム Widget（通常）',
        conditionNormal: '通常時',
        ctas: ['開始', '今日は5分だけにする'],
        destinations: ['SC-12', 'SC-24'],
    },
    'SF-02': {
        title: 'ホーム Widget（Rehab）',
        conditionNormal: '3日以上未達',
        conditionRehab: '3日以上未達（rehab）',
        ctas: ['開始', '今日は5分だけにする'],
        destinations: ['SC-14', 'SC-24'],
    },
    'SF-03': {
        title: '予定時刻通知（通常）',
        conditionNormal: '通常時の通知タップ',
        ctas: ['開始', '今日は5分だけにする', '30分延期'],
        destinations: ['SC-12', 'SC-24'],
    },
    'SF-04': {
        title: '予定時刻通知（Rehab）',
        conditionNormal: '3日以上未達時の通知タップ',
        conditionRehab: 'rehab 通知タップ',
        ctas: ['開始', '今日は5分だけにする', '30分延期'],
        destinations: ['SC-14', 'SC-24'],
    },
    'SF-05': {
        title: 'Live Activity（15分）',
        conditionNormal: '15分セッション中',
        ctas: ['なし'],
        destinations: ['SC-12'],
    },
    'SF-06': {
        title: 'Live Activity（3分）',
        conditionNormal: '3分セッション中',
        conditionRehab: 'rehab_3m セッション中',
        ctas: ['なし'],
        destinations: ['SC-13'],
    },
    'SF-07': {
        title: 'Live Activity（1分）',
        conditionNormal: '1分セッション中',
        conditionRehab: 'ignition_1m セッション中',
        ctas: ['なし'],
        destinations: ['SC-14'],
    },
    'SF-08': {
        title: 'App Intents 起点',
        conditionNormal: 'Shortcut/Siri 起動',
        conditionRehab: 'rehab 時の Shortcut/Siri 起動',
        ctas: ['読書開始', '今日は5分だけにする', '今日の本確認'],
        destinations: ['SC-12', 'SC-14', 'SC-24'],
    },
    'SF-09': {
        title: 'Live Activity（5分）',
        conditionNormal: '5分セッション中',
        ctas: ['なし'],
        destinations: ['SC-24'],
    },
};

export function SFCatalogPreview({
    surfaceId,
    scenario,
}: {
    surfaceId: SurfaceScreenId;
    scenario: MockScenario;
}) {
    const meta = surfaceMeta[surfaceId];
    const condition = scenario === 'rehab' ? meta.conditionRehab ?? meta.conditionNormal : meta.conditionNormal;

    return (
        <View style={styles.previewContainer}>
            <Text style={styles.title}>
                {surfaceId} {meta.title}
            </Text>
            <Text style={styles.subtitle}>Surface の見た目と主要導線を静的確認</Text>
            <View style={styles.card}>
                <Text style={styles.label}>表示条件</Text>
                <Text style={styles.rowMeta}>{condition}</Text>
                <Text style={[styles.label, styles.sectionGap]}>主要CTA</Text>
                <View style={styles.chipRow}>
                    {meta.ctas.map((cta) => (
                        <View key={cta} style={styles.chip}>
                            <Text style={styles.chipText}>{cta}</Text>
                        </View>
                    ))}
                </View>
                <Text style={[styles.label, styles.sectionGap]}>想定遷移先</Text>
                <Text style={styles.rowMeta}>{meta.destinations.join(' / ')}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    previewContainer: {
        flex: 1,
        backgroundColor: appTheme.colors.screenBackground,
        paddingHorizontal: appTheme.spacing.screenPaddingHorizontal,
        paddingVertical: 18,
    },
    title: {
        color: '#2C2C2C',
        fontSize: 20,
        fontWeight: '800',
    },
    titleWithGap: {
        marginBottom: 10,
    },
    subtitle: {
        color: '#6B7280',
        fontSize: 13,
        marginTop: 6,
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(44,44,44,0.08)',
        padding: 14,
    },
    label: {
        color: '#4B5563',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 6,
    },
    fakeInput: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(44,44,44,0.12)',
        backgroundColor: '#FAFAFA',
        paddingHorizontal: 10,
        paddingVertical: 12,
    },
    fakeInputText: {
        color: '#2C2C2C',
        fontSize: 14,
    },
    warning: {
        color: '#B45309',
        backgroundColor: 'rgba(251,191,36,0.16)',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 10,
    },
    row: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(44,44,44,0.10)',
        backgroundColor: '#FFFFFF',
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    rowSelected: {
        borderColor: 'rgba(212,138,62,0.45)',
        backgroundColor: 'rgba(212,138,62,0.06)',
    },
    rowCover: {
        width: 42,
        height: 60,
        borderRadius: 8,
    },
    rowMain: {
        flex: 1,
        marginLeft: 10,
    },
    rowTitle: {
        color: '#2C2C2C',
        fontSize: 14,
        fontWeight: '700',
    },
    rowMeta: {
        color: '#6B7280',
        fontSize: 12,
        marginTop: 2,
    },
    rowMetaStrong: {
        color: '#2C2C2C',
        fontSize: 12,
        fontWeight: '700',
        marginTop: 4,
    },
    rowBadge: {
        color: '#D48A3E',
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 8,
    },
    sectionTitle: {
        color: '#2C2C2C',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    sectionGap: {
        marginTop: 10,
    },
    coverActionCard: {
        marginTop: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(44,44,44,0.10)',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    previewBottomActions: {
        marginTop: 12,
    },
    selectionArea: {
        flex: 1,
    },
    selectionList: {
        minHeight: 260,
        maxHeight: 260,
        overflow: 'hidden',
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: 'rgba(44,44,44,0.08)',
    },
    chipText: {
        color: '#374151',
        fontSize: 12,
        fontWeight: '700',
    },
});
