# Native Acceptance Checklist (Batch 9)

目的:
- Detox / integration の外にある iOS ネイティブ面を最終受入可能な形で固定する。
- 「何を手動受入し、何が release blocker か」を証跡付きで判定可能にする。

## 0. 実施前提
- 実施環境:
  - 実機 iPhone（iOS 17+ 推奨）
  - 同一 Apple ID / 通知許可可能な状態
  - Widget / Siri / Shortcuts / Live Activity が利用可能
- ビルド:
  - `npm run e2e:build:ios` 済み、または Xcode で `app` 実行可能
- データ:
  - `rehab3` / `rehab7` 相当状態を再現できる seed があること
  - 本データが 2 冊以上あること（次本指名・置換確認用）

## 1. 証跡取得ルール
- 動画:
  - 実機画面収録（Control Center の録画）または QuickTime 収録
- スクリーンショット:
  - OS surface（通知バナー、ロック画面、Widget、Dynamic Island）を必須取得
- ログ:
  - Xcode console / macOS Console.app / 必要に応じて `log stream`
  - 例: `xcrun simctl spawn booted log stream --level debug --style compact --predicate 'process == "app"'`
- 失敗時:
  - 再現動画 + 手順 + 実施端末情報（iOS version / device）を 1 セットで保存

## 2. チェックリスト（判定用）

| ID | 領域 | 前提 | 手順 | 期待結果 | 判定 | 証跡 | 補完済み自動テスト | 備考 |
|---|---|---|---|---|---|---|---|---|
| TC-SUR-NA-01 | SUR | 通知発火可能 | banner/lock screen で `開始` `5分` `30分延期` を実押下 | `開始/5分` は適切なセッション導線、`30分` は計画更新で active 非遷移 | 失敗時 blocker | 動画 + 通知UIスクショ + appログ | SUR-01/02/03/04 (Detox) | OS通知UI押下のみ native |
| TC-SUR-NA-02 | SUR | ホーム画面に widget 配置済み | widget から 通常/rehab で `開始`/`5分` 押下 | 状態依存で SC-12/14/24 へ整合 | 失敗時 blocker | 動画 + ホーム画面スクショ | SUR-05/06/07 (Detox) | WidgetKit 実UI確認 |
| TC-SUR-NA-03 | SUR | Siri/Shortcuts 設定済み | 「読書開始」「5分だけ」「今日の本確認」を実行 | action が状態依存で正しく map | 失敗時 non-blocker（代替導線が健全なら） | 動画 + Siri結果スクショ | SUR-08/09/10 (Detox) | 音声認識ぶれは除外 |
| TC-SUR-NA-04 | SUR | ActivityKit 有効端末 | セッション開始/進行/終了を観察 | Dynamic Island/lock screen 表示が整合、終了後残骸なし | 失敗時 non-blocker（本体導線健全なら） | 開始/更新/終了スクショ3点以上 | なし（acceptance） | 表示層のみ |
| TC-ABN-NA-01 | ABN | App Group 障害注入手段あり | App Group 不整合を注入し起動/操作 | app本体主導線は継続、OS surfaceのみ縮退 | 失敗時 blocker | 障害注入手順 + 動画 + ログ | ABN-05/06/08 (Detox) | 縮退設計の成立確認 |
| TC-ABN-NA-02 | ABN | category/action 設定改変可能 | action ID 欠落状態で通知操作 | app起動フォールバック、CTA無効は検出可能 | 失敗時 blocker | 通知UIスクショ + ログ | ABN-12 は native 領域 | フォールバック必須 |
| TC-ABN-NA-03 | ABN | ActivityKit 失敗注入可 | Live Activity 開始失敗を注入 | セッション本体は継続、表示失敗は局所化 | 失敗時 non-blocker | 動画 + 失敗ログ | ABN-07 は native 領域 | 局所障害の確認 |
| TC-ONB-NA-01 | ONB | 新規インストール相当 | 通知権限ダイアログで 許可/拒否 両方確認 | どちらでも主導線継続、文言/遷移が自然 | 失敗時 blocker | ダイアログスクショ + 動画 | ONB-05/06 (Detox mock) | システムダイアログは手動 |
| TC-BOOK-NA-01 | BOOK | 実ネットワーク制御可 | 通信遅延/429/timeout で検索導線確認 | 手入力縮退、主導線継続、UI崩れなし | 失敗時 blocker | 動画 + APIログ + RTTメモ | BOOK-01/02/03/04 (Detox mock) | 実通信品質を最終確認 |

## 3. 失敗時 triage 観点
- A. データ正本崩壊（plan/book/session 不整合）:
  - blocker。release 停止。
- B. 主導線停止（開始できない / ホーム復帰不能）:
  - blocker。即修正対象。
- C. OS surface 表示のみの不整合（Live Activity 等）:
  - non-blocker 候補。ただし再現率 > 30% なら blocker 再評価。
- D. 外部依存（通信品質）:
  - fallback が機能すれば non-blocker、fallback 崩壊は blocker。

## 4. 実施順序（推奨）
1. TC-ONB-NA-01
2. TC-SUR-NA-01
3. TC-SUR-NA-02
4. TC-ABN-NA-02
5. TC-BOOK-NA-01
6. TC-SUR-NA-03
7. TC-SUR-NA-04
8. TC-ABN-NA-01
9. TC-ABN-NA-03
