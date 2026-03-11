# E2E Batch 1 - Home / Session Start / Library

参照:
- tsundoku_test_spec_20260310_v2.docx
- 画面一覧 兼 画面遷移 兼 画面定義

## 目的
最初の自動E2Eバッチとして、通常ホームの主要導線とライブラリ導線を固定する。
未達状態依存ケースは、state injection の有無で実装可否を切り分ける。

---

## 対象 TC

### TC-HOME-04
- 元仕様ID: HOME-04
- 前提: normal state
- 入口: SC-04 通常ホーム
- 操作: ライブラリを開く
- 期待:
  - SC-20 が表示される
  - ホームから補助管理へ遷移できる
- 自動化: 可
- 優先度: 高

### TC-HOME-01
- 元仕様ID: HOME-01
- 前提: normal state
- 入口: SC-04 通常ホーム
- 操作: 主CTAで 15分開始
- 期待:
  - SC-12 が表示される
  - 通常時主CTAは 15分である
- 自動化: 可
- 優先度: 高

### TC-HOME-02
- 元仕様ID: HOME-02
- 前提: normal state
- 入口: SC-04 通常ホーム
- 操作: 副CTAで 5分だけ開始
- 期待:
  - SC-24 が表示される
  - 副CTAは 5分である
- 自動化: 可
- 優先度: 高

### TC-HOME-03
- 元仕様ID: HOME-03
- 前提:
  - normal state
  - manualFocusChangeCount = 0
- 入口: SC-04 通常ホーム
- 操作: 本変更リンク → Focus Book Picker → 選択して戻る
- 期待:
  - SC-08 へ遷移
  - 選択後に呼び出し元ホームへ戻る
  - 1日1回制限を破らない
- 自動化: 可
- 優先度: 中

### TC-HOME-05
- 元仕様ID: HOME-05
- 前提: heavy_day_signal = true
- 入口: SC-05
- 操作: 15分開始 / 5分開始
- 期待:
  - 15分 → SC-12
  - 5分 → SC-24
  - heavy day でも主CTAは 15分維持
- 自動化: 可
- 優先度: 中

### TC-HOME-06
- 元仕様ID: HOME-06
- 前提: continuous_missed_days = 3
- 入口: SC-06 Rehabホーム
- 操作: 1分で再点火
- 期待:
  - SC-14 が表示される
  - 3日以上未達の主CTAは 1分
- 自動化: 可（state injection 必須）
- 優先度: 高

### TC-HOME-07
- 元仕様ID: HOME-07
- 前提: continuous_missed_days = 3
- 入口: SC-06 Rehabホーム
- 操作: 3分再開
- 期待:
  - SC-13 が表示される
  - 3分は Rehab バナー導線である
- 自動化: 可（state injection 必須）
- 優先度: 中

### TC-HOME-08
- 元仕様ID: HOME-08
- 前提: continuous_missed_days = 3
- 入口: SC-06 Rehabホーム
- 操作: ライブラリを開く / 本変更
- 期待:
  - SC-20 または SC-08 に遷移
  - Rehab 状態でも補助管理導線を失わない
- 自動化: 可（state injection 必須）
- 優先度: 中

### TC-HOME-09
- 元仕様ID: 画面定義 SC-07 相当
- 前提: continuous_missed_days = 7
- 入口: SC-07 再開専用導線
- 操作:
  - 1分開始
  - ライブラリ
  - 時刻変更
  - 閉じる
- 期待:
  - 1分 → SC-14
  - ライブラリ → SC-20
  - 時刻変更 → SC-22
  - 閉じる → 終了
- 自動化: 可（state injection 必須）
- 優先度: 高

---

## 必要 testID

## FocusCore / Restart / Active / Library
- focus-core-screen
- focus-core-primary-cta
- focus-core-secondary-cta
- focus-core-rehab-cta
- focus-core-change-book
- focus-core-open-library
- restart-recovery-screen
- restart-recovery-primary-cta
- restart-recovery-open-library
- restart-recovery-change-time
- active-session-screen
- active-session-mode-15
- active-session-mode-5
- active-session-mode-3
- active-session-mode-1
- library-screen
- library-add-book
- library-book-row-<bookId or stable-id>

---

## 実装順

1. TC-HOME-04
2. TC-HOME-01
3. TC-HOME-02
4. TC-HOME-03
5. state injection 導入
6. TC-HOME-06 / 07 / 08 / 09

---

## ギャップメモ
以下が未実装なら、先に seed / fake state / launchArgs を足す必要がある。

- normal state を deterministic に作る seed
- heavy_day_signal=true の seed
- continuous_missed_days=3 / 7 の seed
- Focus book / library データの seed
- 画面モードを識別する stable testID
