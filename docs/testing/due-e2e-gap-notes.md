# Due E2E Gap Notes

更新日: 2026-03-11

## 実装済み（Batch 2）

- TC-DUE-02: due(normal) の `開始` が `SC-12`（15分）へ遷移
- TC-DUE-03: due の `5分だけ` が `SC-24`（5分）へ遷移
- TC-DUE-04: due の `30分延期` で active 遷移しない
- TC-DUE-05: due(rehab3) の `開始` が `SC-14`（1分）へ map
- TC-DUE-06: due(restart7) の `開始` が `SC-14`（1分）へ map
- TC-DUE-07: SC-23 の許可CTA 3種（開始/5分/30分延期）のみを表示
- TC-DUE-08（部分）:
  - deferred(retry pending) は SC-23 を即表示しない
  - retry_fired_once seed で再 due の SC-23 表示を確認

## 基盤追加（DUE-08 向け）

- Clock abstraction（`Clock` / `SystemClock` / `FakeClock`）を導入
- Notification scheduler probe（pending の `kind` / `retryCount` / `fireAt`）を導入
- runtime override（test DI）を導入し、integration test から FakeClock / scheduler を注入可能化
- DueRetryFlow integration test を追加し、response_timeout / retry_timer_fired / retry上限 / finalized を実時間待ちなしで検証

## 解消済みギャップ

- app 内 integration test では `response_timeout` / `retry_timer_fired` の時間依存検証が可能
- pending 通知の `kind` / `retryCount` / `fireAt` を probe で検証可能

## 既知ギャップ（未自動化）

- 「再通知上限 1 回」および「次未応答で finalized(missed)」の end-to-end を Detox で未実装
- FakeClock を Detox 実行中に前進させる test command bridge が未実装
- OS 通知 surface 上の action button（banner/lock screen）のタップ自動化は Detox 範囲外

## 追加で必要な harness

- Detox から FakeClock を制御する test-only bridge（launchArgs 初期値 + runtime advance）
- Detox 中に scheduler probe 状態を取得する test-only command bridge
- native acceptance（XCUITest など）で通知 UI action の統合検証

補足:
- clock/probe の app 内 harness 詳細は `docs/testing/clock-and-scheduler-harness.md` を参照
