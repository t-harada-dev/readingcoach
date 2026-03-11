# Batch 4 - Completion Flow / Progress Opt-in / Extra Session / Next Focus

参照:
- tsundoku_test_spec_20260310_v2.docx
- 積読コーチ 画面一覧 兼 画面遷移 兼 画面定義
- 積読コーチ_論理仕様書_v1
- 積読コーチ_異常系・縮退運転定義書_20260310
- 積読コーチ_UIUX統合指針_20260309

## 目的
完了後の前進体験、追加セッション、progress tracking opt-in、読了後次本指名を固定する。

---

## 対象 TC

### TC-CMP-01
- 元仕様ID: CMP-01
- 前提: SC-15通常完了
- 操作: 閉じる
- 期待:
  - SC-04 / SC-06 / SC-07 のいずれかへ戻る
  - 戻り先は状態依存
- 自動化: E2E
- 優先度: 高

### TC-CMP-02
- 元仕様ID: CMP-02
- 前提: SC-15
- 操作: もう5分やる
- 期待:
  - SC-24
- 自動化: E2E
- 優先度: 高

### TC-CMP-03
- 元仕様ID: CMP-03
- 前提: SC-15
- 操作: もう15分やる
- 期待:
  - SC-12
- 自動化: E2E
- 優先度: 高

### TC-CMP-04
- 元仕様ID: CMP-04
- 前提: 初回完了かつ progress 未設定
- 操作: 完了後導線確認
- 期待:
  - SC-16
- 自動化: E2E
- 優先度: 高

### TC-CMP-05
- 元仕様ID: CMP-05
- 前提: SC-16
- 操作: 設定する
- 期待:
  - SC-17
- 自動化: E2E
- 優先度: 中

### TC-CMP-06
- 元仕様ID: CMP-06
- 前提: SC-16
- 操作: あとで / 使わない
- 期待:
  - SC-15 またはホーム
  - progress tracking を強制しない
- 自動化: E2E
- 優先度: 高

### TC-CMP-07
- 元仕様ID: CMP-07
- 前提: SC-17
- 操作: 総ページ数 / 現在ページ入力 → 保存
- 期待:
  - SC-15 またはホーム
  - Book.currentPage / Book.pageCount 更新
- 自動化: E2E + integration
- 優先度: 中

### TC-CMP-08
- 元仕様ID: CMP-08
- 前提: finalized(soft_success / attempted / prep_success)
- 操作: 追加セッション開始 -> 完了
- 期待:
  - daily_result_recomputed
  - result は格上げのみ
  - SessionLog が追加される
- 自動化: integration
- 優先度: 高

### TC-CMP-09
- 元仕様ID: CMP-09
- 前提: SC-15
- 操作: 読了した
- 期待:
  - SC-19
- 自動化: E2E
- 優先度: 高

### TC-CMP-10
- 元仕様ID: CMP-10
- 前提: finished_book
- 操作: 次の本を選ぶ
- 期待:
  - ホームへ戻る
  - 次の Focus Book が反映
- 自動化: E2E
- 優先度: 高

---

## 仕様メモ

- SC-15 は実行時間を必須表示し、必要時 progress を表示し、前進メッセージを返す
- progress tracking は opt-in。未設定でも主導線を壊さない
- `progress_self_reported` は finished_book のみ
- extra_session_started は finalized のまま SessionLog を追加
- daily_result_recomputed は result を格上げのみ更新
- `prep_success` は progress 増分に使わない
- 読了保存失敗時もセッション完了自体は確定済み
- 次本指名失敗時も読了状態は保存し、次回ホームで再提案

---

## 必要 testID

### SC-15 Completion
- completion-screen
- completion-close
- completion-extra-5m
- completion-extra-15m
- completion-finished-book
- completion-duration
- completion-progress
- completion-message

### SC-16 Progress Prompt
- progress-prompt-screen
- progress-prompt-enable
- progress-prompt-later
- progress-prompt-disable

### SC-17 Progress Setup
- progress-setup-screen
- progress-setup-page-count
- progress-setup-current-page
- progress-setup-save

### SC-18 Extra Session
- extra-session-screen
- extra-session-5m
- extra-session-15m

### SC-19 Next Focus
- next-focus-screen
- next-focus-book-row-<stable-id>
- next-focus-confirm

### Active Session
- active-session-screen
- active-session-mode-15
- active-session-mode-5
- active-session-mode-3
- active-session-mode-1

---

## 推奨レイヤ分担

### Detox E2E
- CMP-01
- CMP-02
- CMP-03
- CMP-04
- CMP-05
- CMP-06
- CMP-07（一部）
- CMP-09
- CMP-10

### Integration
- CMP-07（保存結果）
- CMP-08
- finished_book 保存失敗時の挙動
- 読了後次本失敗時の劣化動作

---

## 実装順

1. CMP-02
2. CMP-03
3. CMP-01
4. CMP-04
5. CMP-06
6. CMP-05
7. CMP-09
8. CMP-10
9. CMP-08
10. CMP-07

---

## ギャップメモ

- 初回完了判定の seed が必要
- progressTrackingEnabled ON/OFF seed が必要
- finished_book 後の候補本 seed が必要
- extra session 後の result recompute は integration で見るべき
- 読了保存失敗 / 次本指名失敗は fault injection が必要