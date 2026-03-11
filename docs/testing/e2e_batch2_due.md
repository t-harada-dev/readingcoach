# E2E Batch 2 - Due / Notification Response / Retry

参照:
- tsundoku_test_spec_20260310_v2.docx
- 積読コーチ 画面一覧 兼 画面遷移 兼 画面定義
- 積読コーチ_論理仕様書_v1
- 積読コーチ_UIUX統合指針_20260309

## 目的
SC-23 Due Action Sheet と due 起点の主要導線を固定する。
通知 action そのものの完全自動化ではなく、まず app 内で deterministic に再現できる due 経路を押さえる。

---

## 対象 TC

### TC-DUE-02
- 元仕様ID: DUE-02
- 前提: plan.state=due, normal
- 入口: SC-23
- 操作: 開始
- 期待:
  - SC-12 が表示される
  - 通常時 due 開始は 15分導線
- 自動化: 可
- 優先度: 高

### TC-DUE-03
- 元仕様ID: DUE-03
- 前提: plan.state=due
- 入口: SC-23
- 操作: 5分だけ
- 期待:
  - SC-24 が表示される
  - 軽量開始導線が due でも成立する
- 自動化: 可
- 優先度: 高

### TC-DUE-04
- 元仕様ID: DUE-04
- 前提: plan.state=due
- 入口: SC-23
- 操作: 30分延期
- 期待:
  - plan が更新される
  - active へ遷移しない
  - due 状態のまま即開始しない
- 自動化: 可
- 優先度: 高

### TC-DUE-05
- 元仕様ID: DUE-05
- 前提: plan.state=due, continuous_missed_days >= 3
- 入口: SC-23
- 操作: 開始
- 期待:
  - SC-14 が表示される
  - rehab 状態では due 開始が 1分へ map される
- 自動化: 可（state injection 必須）
- 優先度: 高

### TC-DUE-06
- 元仕様ID: DUE-06
- 前提: plan.state=due, continuous_missed_days >= 7
- 入口: SC-23
- 操作: 開始
- 期待:
  - SC-14 が表示される
  - 再開専用導線相当でも due 開始は 1分へ map される
- 自動化: 可（state injection 必須）
- 優先度: 高

### TC-DUE-07
- 元仕様ID: DUE-07
- 前提: plan.state=due
- 入口: SC-23
- 確認: 許可 CTA 以外が表示されない
- 期待:
  - 開始 / 5分だけ / 30分延期のみ
  - 本変更なし
  - library 遷移なし
  - 管理操作なし
- 自動化: 可
- 優先度: 高

### TC-DUE-08
- 元仕様ID: DUE-08
- 前提:
  - due
  - retry_count=0
  - response_timeout 再現可能
  - retry_timer_fired 再現可能
- 操作:
  - 未応答で timeout
  - deferred へ遷移
  - retry timer 発火
- 期待:
  - due に戻る
  - 再通知は上限 1 回
  - 次の未応答で finalized(missed)
- 自動化: 部分可
- 優先度: 高

---

## 画面・Surface対応

- SC-23 Due Action Sheet
- SC-12 Active Session_15分
- SC-14 Active Session_1分
- SC-24 Active Session_5分
- SF-03 予定時刻通知_通常
- SF-04 予定時刻通知_Rehab

---

## 必要 testID

### DueActionSheet
- due-action-sheet
- due-action-start
- due-action-start-5m
- due-action-snooze-30m

### ActiveSession
- active-session-screen
- active-session-mode-15
- active-session-mode-5
- active-session-mode-1

### Optional
- restart-recovery-screen
- focus-core-screen

---

## 実装順

1. TC-DUE-02
2. TC-DUE-03
3. TC-DUE-04
4. TC-DUE-07
5. seed / clock control 導入
6. TC-DUE-05
7. TC-DUE-06
8. TC-DUE-08

---

## ギャップメモ

以下が未整備なら先に追加する:
- due 状態 seed
- continuous_missed_days=3 / 7 seed
- retry_count seed
- timeout / retry_timer_fired を再現する clock mock
- 通知起点の代替 deep link または launchArgs
- persistence state の assert 手段

---

## 補足

- 通知 action のネイティブ UI 自体は XCUITest / native acceptance へ逃がしてよい
- app E2E では「SC-23 が出る」「CTA が正しい遷移をする」「禁止導線が混ざらない」を優先する
- DUE-02〜08 は blocker 優先群