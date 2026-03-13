# Release Readiness Matrix (Batch 9)

目的:
- レイヤ別（Detox / integration / XCUITest / manual）に「完了/未完了/代替確認」を一元管理する。
- blocker / non-blocker 判定を release gate として明示する。

## Matrix

| 領域 | TC ID | レイヤ | 実装状態 | blocker判定 | 代替確認手段 | owner | 備考 |
|---|---|---|---|---|---|---|---|
| SUR | TC-SUR-NA-01 | manual native acceptance | 未実施（要実機） | 失敗時 blocker | SUR-01/02/03/04 Detox + 通知ログ | iOS | 通知UI実押下の最終確認 |
| SUR | TC-SUR-NA-02 | manual native acceptance | 未実施（要実機） | 失敗時 blocker | SUR-05/06/07 Detox | iOS | WidgetKit 実UI押下 |
| SUR | TC-SUR-NA-03 | manual native acceptance | 未実施（要実機） | 失敗時 non-blocker | SUR-08/09/10 Detox | iOS | Siri/Shortcuts 実UI |
| SUR | TC-SUR-NA-04 | manual native acceptance | 未実施（要実機） | 失敗時 non-blocker | appログ + session継続確認 | iOS | Live Activity 表示層 |
| ABN | TC-ABN-NA-01 | manual native acceptance | 未実施（要注入環境） | 失敗時 blocker | ABN-05/06/08 Detox | iOS | App Group 不整合 |
| ABN | TC-ABN-NA-02 | manual native acceptance | 未実施（要改変ビルド） | 失敗時 blocker | ABN-12 gap note | iOS | action ID 欠落確認 |
| ABN | TC-ABN-NA-03 | manual native acceptance | 未実施（要注入環境） | 失敗時 non-blocker | ABN-07 設計方針 + session継続 | iOS | 表示障害の局所化 |
| ONB | TC-ONB-NA-01 | manual native acceptance | 未実施（要新規インストール） | 失敗時 blocker | ONB-05/06 Detox (mock) | iOS | 権限ダイアログ実UI |
| BOOK | TC-BOOK-NA-01 | manual native acceptance | 未実施（要実ネットワーク） | 失敗時 blocker | BOOK-01/02/03/04 Detox (mock) | App | 実通信品質・縮退導線 |
| SESSION | TC-SESSION-01 | Detox | 実装予定 | 失敗時 blocker | `e2e/session-completion-consistency.e2e.js` | App | 完了画面の読書時間一致 |
| SESSION | TC-SESSION-02 | Detox | 実装予定 | 失敗時 blocker | `e2e/session-completion-consistency.e2e.js` | App | 完了画面の書籍一致 |
| HOME | TC-REHAB-01 | Detox | 実装予定 | 失敗時 blocker | `e2e/home.rehab.e2e.js` | App | SC-06で3分再開が非表示 |
| LIB | TC-LIB-01 | Detox | 実装予定 | 失敗時 blocker | `e2e/library-detail.e2e.js` | App | ライブラリで書影/placeholder表示 |

## 自動化レイヤ現状（参照）
- Detox:
  - SUR/ABN/ONB/BOOK の主要導線は自動化済み
- integration:
  - reconcile / stale防止 / result整合 / completion fault系は自動化済み
- XCUITest:
  - 本バッチで skeleton 追加（実運用ターゲット接続は別タスク）

## Release Gate
- Gate-1: blocker ケースの manual acceptance が全件 PASS
- Gate-2: `npm run e2e:test:ios` と `npm test` が直近実行で PASS
- Gate-3: non-blocker は既知制約として証跡リンク付きで管理
- Gate-4: `npm run e2e:snapshot:manifest:check` が PASS（SC+SF 対象の欠落なし）

## blocker 扱い（初期定義）
- TC-SUR-NA-01
- TC-SUR-NA-02
- TC-ABN-NA-01
- TC-ABN-NA-02
- TC-ONB-NA-01
- TC-BOOK-NA-01

## non-blocker 扱い（初期定義）
- TC-SUR-NA-03
- TC-SUR-NA-04
- TC-ABN-NA-03
