# lessons

## 通知システム

1. **非同期の順序**: Reconcile 完了後に `ready()` を呼ぶ（`runReconcileThenNotifyReady`）。古い状態に対して「開始」を出さない。
2. **cancelForPlan 優先**: レスポンス処理の最初の一手はネイティブ側で `cancelForPlan(planId)` を打つ。
3. **`__DEFAULT__` は開始最大化**: 通知体タップ時の既定は 15 分開始。`continuousMissedDays >= 3` では `ignition_1m` に切り替える。
4. **カテゴリ登録ずれ**: `UNNotificationCategory` 登録と `categoryIdentifier` が一致しないと、通知は届くがボタンが効かない。

## SwiftData Bridge

1. **日付の主語は `planDate` 文字列 (`yyyy-MM-dd`)**: ISO8601 `Date` への過剰変換は「今日判定」のズレを生む。
2. **障害は `resolve(nil)` で隠蔽しない**: Fetch/Save 失敗は Promise `reject` で JS 側へ伝播させる。`try!` の singleton 初期化は禁止。
3. **NSDictionary の手作業マッピングを避ける**: `Decodable` 変換ユーティリティを共通化し、型ずれ・欠落を防ぐ。

## テスト実行・報告

1. **PASS の条件を固定**: 「exit code 0」かつ「失敗スイート/失敗ケース 0」を確認できない限り PASS と断定しない。
2. **`vitest` の `environment: node` で画面コンポーネントを直接読むと Flow 構文で失敗する**: テストは `.test.ts` で作成し、`src/**/*.test.ts` の include を事前確認する。
3. **`tee` 付き debug script では `set -o pipefail` を必須化**: `cmd | tee` だけだと実コマンド失敗が `exit 0` に見える。

## Detox / E2E

1. **synced/unsynced は suite ごとに選ぶ**: `due-action-sheet` / `home.session-start` ではタップ不可・モーダル不安定が再現するため、起動 helper は共通化しつつ suite 単位で切り替える。
2. **JS変更後の挙動差分は `e2e:build:ios` で再バンドル確認**: 既存バンドルを参照して古い挙動が残るケースがある。
3. **`toBeVisible()` + `scroll()` をセットで使う**: `toExist()` だけだと ScrollView 外の要素が `View is not hittable` になる。
4. **E2E 入力データは `.json` を直接 `require`**: TS モジュールは Detox/Jest 実行系で読み込み差異が出やすい。正本は1つに固定。
5. **`expo-*` の top-level import は起動クラッシュのリスクあり**: 未組込ビルドでも起動可能なよう、遅延 import + unavailable fallback を入れる。

## Screen Catalog / スクリーンショット

1. **Screen Catalog は手動レビュー専用に保つ**: 自動スクショ基盤の正本に使うと保守が難しくなる。
2. **自動スクショは flow 別 Detox + 補完 `launchArgs` で管理**: `snapshotTargets` でカバレッジを固定し、スコープ外への拡張は明示依頼ベースで行う。

## iOS ビルド（XCUITest / CocoaPods）

1. **CocoaPods 構成は `-workspace` 優先で `xcodebuild` を実行**: `-project` 単体ビルドは Pods の modulemap 不足で失敗しやすい。
2. **XCUI `denied` ケース前に設定状態を正規化**: 前ケースの値が残ると同じ引数でも UI が別分岐になる。失敗理由は `.xcresult` の行番号から特定する。

## アプリ導線

1. **モーダル表示中でも親画面を `null` で潰さない**: 親が空描画だと戻る操作で空画面に落ちる。
2. **導線変更時は副作用契約を追従確認する**: 遷移先差し替え時に旧導線で実行されていたカウンタ更新（例: manual focus change count）が欠落していないかを確認する。
