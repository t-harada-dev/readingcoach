# Batch 5 - Surface / Widget / Notification / App Intents

参照:
- tsundoku_test_spec_20260310_v2.docx
- 積読コーチ 画面一覧 兼 画面遷移 兼 画面定義
- 積読コーチ_論理仕様書_v1
- 積読コーチ_異常系・縮退運転定義書_20260310

## 目的
OS Surface 起点の user-facing action が reconcile 後に正しい第一導線へ map されることを固定する。
OS UI そのものの押下は native acceptance へ分離し、app 内で deterministic に再現できる部分を先に自動化する。

---

## 対象 TC

### TC-SUR-01
- 元仕様ID: SUR-01
- 前提: SF-03 通常通知相当
- 操作: 開始
- 期待:
  - SC-12
- 自動化: 部分可
- 優先度: 高

### TC-SUR-02
- 元仕様ID: SUR-02
- 前提: SF-04 Rehab通知相当
- 操作: 開始
- 期待:
  - SC-14
- 自動化: 部分可
- 優先度: 高

### TC-SUR-03
- 元仕様ID: SUR-03
- 前提: SF-03/SF-04
- 操作: 5分だけ
- 期待:
  - SC-24
- 自動化: 部分可
- 優先度: 高

### TC-SUR-04
- 元仕様ID: SUR-04
- 前提: SF-03/SF-04
- 操作: 30分延期
- 期待:
  - deferred
  - plan更新して終了
- 自動化: 部分可
- 優先度: 高

### TC-SUR-05
- 元仕様ID: SUR-05
- 前提: SF-01 通常widget
- 操作: 開始
- 期待:
  - SC-12
- 自動化: 部分可
- 優先度: 高

### TC-SUR-06
- 元仕様ID: SUR-06
- 前提: SF-02 Rehab widget
- 操作: 開始
- 期待:
  - SC-14
- 自動化: 部分可
- 優先度: 高

### TC-SUR-07
- 元仕様ID: SUR-07
- 前提: SF-01/SF-02
- 操作: 5分だけ
- 期待:
  - SC-24
- 自動化: 部分可
- 優先度: 高

### TC-SUR-08
- 元仕様ID: SUR-08
- 前提: SF-08 App Intent
- 操作: 読書開始
- 期待:
  - SC-12 or SC-14
- 自動化: 部分可
- 優先度: 高

### TC-SUR-09
- 元仕様ID: SUR-09
- 前提: SF-08 App Intent
- 操作: 5分だけ読む
- 期待:
  - SC-24
- 自動化: 部分可
- 優先度: 高

### TC-SUR-10
- 元仕様ID: SUR-10
- 前提: SF-08 App Intent
- 操作: 今日の本確認
- 期待:
  - 最新状態表示
  - shared snapshot / 正本と整合
- 自動化: 部分可
- 優先度: 高

---

## 仕様メモ

- SF-01 Widget通常: 開始 / 5分だけ -> SC-12 / SC-24
- SF-02 WidgetRehab: 開始 / 5分だけ -> SC-14 / SC-24
- SF-03 通常通知: 開始 / 5分 / 30分延期 -> SC-12 / SC-24 / plan更新
- SF-04 Rehab通知: 開始 / 5分 / 30分延期 -> SC-14 / SC-24 / plan更新
- SF-08 App Intent: 読書開始 / 5分だけ読む / 今日の本確認
- 外部起点は開始前に `reconcile_plans`
- shared snapshot は start 判定の正本ではない
- stale surface は app 起動 + reconcile へ縮退
- Live Activity は表示専用で、正本は SwiftData 側

---

## 推奨レイヤ分担

### Detox / app内 harness
- SUR-01
- SUR-02
- SUR-03
- SUR-04
- SUR-05
- SUR-06
- SUR-07
- SUR-08
- SUR-09
- SUR-10

### Integration
- shared snapshot / WidgetSnapshotStore の整合
- stale snapshot でも誤開始しないこと
- latest book/state 表示整合

### Native acceptance / XCUITest
- 通知 banner / lock screen action
- ホーム画面 widget 実UI押下
- Siri / Shortcuts 実 UI
- Live Activity 実表示

---

## 必要 hook / probe

- surface trigger launchArgs
- notification response test payload
- widget action test payload
- app intent test payload
- WidgetSnapshotStore probe
- shared snapshot stale/latest seed

---

## 実装順

1. SUR-01
2. SUR-03
3. SUR-04
4. SUR-02
5. SUR-05
6. SUR-07
7. SUR-06
8. SUR-08
9. SUR-09
10. SUR-10

---

## ギャップメモ

- OS surface の本物の UI 押下は Detox 範囲外
- Live Activity 表示開始/更新/終了は次バッチ候補
- App Group 設定不備 / action ID 設定漏れは ABN 側と連結した方がよい