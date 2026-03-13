# Native Acceptance Gap Notes (Batch 9)

## 目的
- 「Detox / integration で担保済み」と「native/manual でしか担保できない」を分離し、release 判定可能な状態へ収束させる。

## 自動化境界
- 自動化済み:
  - app 内遷移、state mapping、reconcile 整合、fault injection の一部
- 非自動化（native acceptance）:
  - iOS システム通知 UI 押下
  - ホーム画面 widget 実UI押下
  - Siri / Shortcuts 実UI
  - Dynamic Island / lock screen 表示品質
  - 実ネットワークでの検索 UX

## ケース別の残ギャップ
- SUR:
  - 通知/Widget/Siri/Live Activity の実UI操作と表示品質
- ABN:
  - App Group 実障害注入
  - category/action ID 欠落時の実機フォールバック確認
  - ActivityKit 実失敗時の局所化
- ONB:
  - 通知権限システムダイアログ
- BOOK:
  - 実通信（RTT/429/timeout）での縮退 UX

## 判定原則
- blocker:
  - 主導線が停止する
  - フォールバックが機能しない
  - 正本整合を壊す
- non-blocker:
  - 表示層限定で主導線継続
  - 既知制約として証跡付きで管理可能

## XCUITest skeleton 方針
- heavy 実装はしない
- 追加対象:
  - `app/ios/appUITests/AcceptanceSmokeUITests.swift`
  - `app/ios/appUITests/InterruptionHandling.swift`
- 用途:
  - 権限ダイアログ interruption monitor 雛形
  - launch / foreground の smoke 雛形

## 注意点
- 現時点のプロジェクトには `appUITests` ターゲット配線が未確認のため、
  skeleton 追加後は Xcode 側の target 追加・scheme 有効化が必要。
