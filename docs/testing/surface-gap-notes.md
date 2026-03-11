# Surface Batch 5 Gap Notes

## SUR-01〜10 で今回自動化できた範囲
- Detox（app内 harness）
  - SUR-01/02/03/04: notification 起点の `start / start_5m / snooze_30m`
  - SUR-05/06/07: widget 起点の `start / start_5m`
  - SUR-08/09/10: app intent 起点の `start / start_5m / show_today_book`
- integration
  - shared snapshot より正本（plan/book）優先で today book を解決
  - stale snapshot タイトルは canonical 取得不能時のみ縮退利用

## app内 harness / Detox / integration / native acceptance の分担
- app内 harness
  - launchArgs: `e2e_surface_source` / `e2e_surface_action`
  - source: `notification_response | widget_render | app_intent`
  - action: `start | start_5m | snooze_30m | show_today_book`
- Detox
  - 起点イベント到達後の reconcile と遷移（SC-12/14/24）を固定
  - snooze 後に active へ入らないことを固定
- integration
  - today book 解決時の正本優先ルール
  - stale snapshot 縮退ルール
- native acceptance
  - banner / lock screen action の実押下
  - ホーム画面 widget 実UI押下
  - Siri / Shortcuts 実UI

## WidgetSnapshotStore / shared snapshot の整合ルール
- start 判定は snapshot を正本にしない
- 外部起点の開始前に必ず reconcile を先行
- today book 表示は reconcile 後の plan/book（正本）を優先
- snapshot は表示補助。正本取得不能時のみ縮退利用

## stale surface での縮退メモ
- stale notification/widget/app intent payload でも開始時は reconcile で再評価
- 正本と矛盾する stale snapshot は開始判定に使わない
- `show_today_book` で canonical title が取得できない場合のみ snapshot title を表示候補にする

## Live Activity を次バッチへ回した理由
- Live Activity は表示専用 surface で、状態正本ではない
- Dynamic Island / lock screen の実表示更新は Detox 範囲外
- SUR-11 は XCUITest / 手動受入で UI 実表示を補完する方が妥当

## 2026-03-11 実行結果メモ（安定化後）
- `npm run e2e:test:ios` は **12 suites / 32 tests / 失敗 0（exit code 0）**
- SUR 系ケース数は減らしていない（SUR-01〜10 の自動化対象は維持）
- フレーク対策として `surface-app-intent.e2e.js` の SUR-09 待機を 12s -> 20s に延長
  - 対象: `active-session-screen` 可視待機
  - 理由: app_intent 起点で稀に初期化待ちが伸びるケースを吸収
