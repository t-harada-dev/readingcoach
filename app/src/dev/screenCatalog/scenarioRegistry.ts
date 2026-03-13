import type { ScenarioRegistryItem } from './types';

export const scenarioRegistry: ScenarioRegistryItem[] = [
    {
        scenario: 'normal',
        label: 'Normal',
        description: '通常ホームの比較用 fixture。',
    },
    {
        scenario: 'rehab',
        label: 'Rehab',
        description: '再開ハードルを下げる軽量導線の fixture。',
    },
    {
        scenario: 'long_absence',
        label: 'Long Absence',
        description: '7日以上未達の強い再開導線を確認する fixture。',
    },
    {
        scenario: 'due',
        label: 'Due',
        description: '期限超過時に判断を促す導線の fixture。',
    },
    {
        scenario: 'empty',
        label: 'Empty',
        description: 'データ0件の空状態を確認する fixture。',
    },
    {
        scenario: 'no_cover',
        label: 'No Cover',
        description: '書影未設定時のプレースホルダー表示を確認する fixture。',
    },
    {
        scenario: 'cover_removed',
        label: 'Cover Removed',
        description: '書影削除後の表示を確認する fixture。',
    },
    {
        scenario: 'already_has_data',
        label: 'Already Has Data',
        description: '初回導線の再訪時を想定した fixture。',
    },
    {
        scenario: 'timeout_or_error',
        label: 'Timeout / Error',
        description: 'APIタイムアウト・失敗時の縮退導線を確認する fixture。',
    },
    {
        scenario: 'no_result',
        label: 'No Result',
        description: '検索0件時の代替導線を確認する fixture。',
    },
    {
        scenario: 'finished_book',
        label: 'Finished Book',
        description: '読了後の分岐導線を確認する fixture。',
    },
];
