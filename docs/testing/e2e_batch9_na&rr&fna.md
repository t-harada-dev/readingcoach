# Batch 9 - Native Acceptance / Release Readiness / Final Non-Automated Coverage

目的:
アップロード済みの tsundoku_test_spec_20260310_v2.docx と既存 gap notes に沿って、
自動化の外に残る Native acceptance / 手動受入 / release readiness を整理し、
必要なら最小限の XCUITest または acceptance checklist を追加する。
今回は「全部を Detox 化する」のではなく、最終判定可能な形に残件を収束させる。

背景:
既に整理済み:
- SUR の native acceptance 残:
  - banner / lock screen action
  - ホーム画面 widget 実UI押下
  - Siri / Shortcuts 実UI
  - Live Activity 実表示
- ABN の native acceptance 残:
  - App Group 実障害注入
  - notification category / action ID 設定漏れ
  - ActivityKit 実失敗注入
- ONB/BOOK の native acceptance 残:
  - 通知権限システムダイアログ
  - 実デバイス検索API通信品質
- テスト仕様書では Native iOS acceptance と手動受入を最終層として明記

今回の作業範囲:
1. Native acceptance が必要なケースを 1 つの checklist / matrix に整理
2. 実装可能なら最小限の XCUITest 雛形または受入手順書を追加
3. Release blocker / non-blocker の判定表を追加
4. 実行環境前提、証跡取得方法、失敗時の triage 観点を md に残す
5. production コード変更は原則しない。必要なら testability 向上の最小限に留める

今回整理したいケース:

## SUR Native Acceptance
### TC-SUR-NA-01
- 通知 banner/lock screen の action button 実押下
- 開始 / 5分 / 30分延期
- 期待:
  - app or action が正しく反応
  - SC-12/14/24 または plan更新

### TC-SUR-NA-02
- ホーム画面 widget 実UI押下
- 通常 / rehab それぞれの開始 / 5分
- 期待:
  - app / intent / widget action が正しく遷移

### TC-SUR-NA-03
- Siri / Shortcuts 実UI
- 読書開始 / 5分だけ読む / 今日の本確認
- 期待:
  - 状態依存で正しく map

### TC-SUR-NA-04
- Live Activity 実表示
- 開始 / 更新 / 終了
- 期待:
  - Dynamic Island / lock screen で正しく見える
  - stale が残っても正本は app 側優先

## ABN Native Acceptance
### TC-ABN-NA-01
- App Group 不整合
- 期待:
  - app 本体主導線継続
  - widget/intent/live activity のみ縮退
  - blocker として検出可能

### TC-ABN-NA-02
- 通知 category/action ID 設定漏れ
- 期待:
  - app 起動フォールバック
  - CTA 動作不全を blocker として検出

### TC-ABN-NA-03
- Live Activity 開始失敗
- 期待:
  - session 本体は継続
  - 表示失敗は局所化

## ONB Native Acceptance
### TC-ONB-NA-01
- 通知権限システムダイアログ
- 許可 / 拒否
- 期待:
  - app の導線は維持
  - 表示文言・導線が不自然でない

## BOOK Native Acceptance
### TC-BOOK-NA-01
- 実デバイス上の検索 API 通信品質
- RTT / 帯域制限 / 429 / タイムアウト時の UX
- 期待:
  - 手入力縮退
  - 主導線継続
  - placeholder / 0件時の見た目確認

今回追加してほしい成果物:
A. docs/testing/native-acceptance-checklist.md
- ケース一覧
- 事前条件
- 実施手順
- 期待結果
- blocker 判定
- 証跡（動画/スクショ/log）取得方法

B. docs/testing/release-readiness-matrix.md
- 領域
- ケース
- レイヤ（Detox / integration / XCUITest / manual）
- ステータス
- blocker/non-blocker
- 代替確認方法

C. 可能なら XCUITest skeleton
- 通知権限ダイアログ handling
- app launch / interruption monitor 雛形
- ただし heavy 実装は不要。ひな型レベルでよい

推奨ファイル:
- docs/testing/native-acceptance-checklist.md
- docs/testing/release-readiness-matrix.md
- docs/testing/native-acceptance-gap-notes.md
- ios/appUITests/AcceptanceSmokeUITests.swift （可能なら）
- ios/appUITests/InterruptionHandling.swift （可能なら）

重要な実装方針:
- Detox に寄せすぎない
- 「何が自動化済みで、何が acceptance / manual か」を明確にする
- blocker / non-blocker の線引きを残す
- 証跡取得と triage を手順化する
- production コードをほぼ触らない

仕様の参照ポイント:
- Native iOS acceptance は通知 action、WidgetKit、Live Activity、App Intents を補完する層
- 手動受入は OS surface の見た目、文言、interactivity、availability 差異を最終確認する層
- SUR では Live Activity を次バッチへ回した理由が既に整理済み
- ABN では App Group / action ID / Live Activity 失敗が native acceptance 領域
- ONB では通知権限システムダイアログが native acceptance 領域
- BOOK では実デバイス検索通信品質が native acceptance 領域
- release blocker は 0 件、non-blocker は既知制約としてログ付き管理

受け入れ条件:
1. Native acceptance の対象ケースが1枚に整理される
2. release readiness matrix が作成される
3. blocker / non-blocker の判定が記録される
4. 可能なら XCUITest 雛形が追加される
5. production コードをほぼ変更しない

禁止事項:
- Detox で無理に OS 実UI押下を再現しようとすること
- acceptance 領域を未整理のまま残すこと
- blocker/non-blocker を曖昧にすること

作業後に出してほしい内容:
- 追加ファイル一覧
- 追加した checklist / matrix の要約
- XCUITest 雛形の有無
- blocker 扱いケース一覧
- 実施順序の提案

---

# Batch 9 - Test Case / Acceptance Checklist Seed

## Native Acceptance Cases

### SUR
- TC-SUR-NA-01 通知 banner/lock screen action
- TC-SUR-NA-02 ホーム画面 widget 実UI押下
- TC-SUR-NA-03 Siri / Shortcuts 実UI
- TC-SUR-NA-04 Live Activity 実表示開始/更新/終了

### ABN
- TC-ABN-NA-01 App Group 不整合
- TC-ABN-NA-02 notification category/action ID 設定漏れ
- TC-ABN-NA-03 Live Activity 開始失敗

### ONB
- TC-ONB-NA-01 通知権限システムダイアログ

### BOOK
- TC-BOOK-NA-01 実デバイス検索 API 通信品質 / 429 / timeout / fallback UX

## Checklist の最低列
- ID
- 領域
- 前提
- 手順
- 期待結果
- blocker / non-blocker
- 証跡
- 補完済み自動テスト
- 備考

## Release Readiness Matrix の最低列
- 領域
- TC ID
- レイヤ
- 実装済み/未実装
- blocker判定
- 代替確認手段
- owner
- 備考