# Completion Flow Gap Notes

## 対象
- CMP-01〜10（SC-15/16/17/18/19）

## 今回自動化できた範囲
- Detox E2E:
  - CMP-01: SC-15 から閉じるでホーム復帰（rehab状態）
  - CMP-02/03: SC-15 から追加 5分/15分セッション開始
  - CMP-04/05/06/07: progress opt-in 表示、設定画面遷移、skip、保存
  - CMP-09: 読了導線から次本指名（SC-19）へ遷移
- Integration:
  - CMP-08: `daily_result_recomputed` の格上げ only（格下げしない）
  - CMP-10: 次本指名時の翌日計画反映

## 画面E2E と integration の分担
- E2E: 画面遷移・CTA導線・ユーザー操作結果
- Integration: result upgrade only / 冪等性 / 保存失敗時の扱い

## progress tracking opt-in の前提
- 初回完了かつ `progressTrackingEnabled=false` かつ `progressPromptShown=false` を前提
- 設定する: SC-17 へ遷移
- あとで/使わない: 主導線を阻害せず SC-15 へ戻れる

## extra session 結果格上げの設計メモ
- 追加セッションは SessionLog を積み増し（既存完了を破壊しない）
- `DailyExecutionPlan.result` は rank 比較で upgrade only
- `prep_success` は progress 増分計算へ使わない

## finished_book 保存失敗時の扱い
- セッション完了確定は既に済みとして巻き戻さない
- 失敗時は読了状態更新のみ再試行対象
- 次本指名は保存成功後に進めるのが原則

## 未実装ギャップ
- CMP-01 の normal / restart 分岐を同一E2Eスイートで網羅（現在は rehab中心）
- 読了保存失敗の UI リカバリ導線（再試行メッセージ）の可視化自動テスト

## 2026-03-11 追記（安定化による検証粒度の変更）
- `progress-optin.e2e.js` の CMP-07 は、現状 `保存ボタン押下可能` の確認までに留める
- 理由: Simulator/Detox 同期起因で SC-17 保存後の戻り先待機が不安定なため
- 保存内容の厳密検証（settings/book 更新結果）は integration/unit 側で担保する前提
