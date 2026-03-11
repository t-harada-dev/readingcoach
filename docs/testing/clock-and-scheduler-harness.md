# Clock and Scheduler Harness

## 目的
DUE-08 系の時間依存ロジックを、実時間待ちなしで自動化するための基盤。

## 導入したもの
- Clock interface
- SystemClock
- FakeClock
- NotificationSchedulerProbe
- NotificationScheduler (`NoopNotificationScheduler` / `InMemoryNotificationScheduler`)
- runtimeOverrides / test DI

## 自動化できるようになるもの
- due -> response_timeout -> deferred
- deferred -> retry_timer_fired -> due
- retry_count 上限 1 回
- 次未応答で finalized(missed)
- 開始 / 延期 / finalized 時の pending 通知キャンセル（usecase レベル）

## まだ対象外
- OS 通知バナー/ロック画面の action button タップ
- 実際の iOS 通知 UI の描画確認
- Widget / Live Activity / App Intents の system surface 統合

## 推奨テストレイヤ
- integration test:
  時刻前進 / retry_count / finalized
- Detox:
  SC-23 の app 内導線
- XCUITest:
  通知 UI action

## FakeClock usage
- 初期時刻を固定して生成
- `advanceMinutes(n)` で時間前進
- evaluator / reconcile / scheduler tick 相当を呼ぶ

## Scheduler probe usage
- `getPending()` で pending 通知一覧確認
- `retry_due` の `kind` / `retryCount` / `fireAt` を確認
- `clear()` で初期化

## 次のステップ
- launchArgs から fake clock を注入
- Detox で due state + clock advance を接続
- DUE-08 の半自動 E2E 化
