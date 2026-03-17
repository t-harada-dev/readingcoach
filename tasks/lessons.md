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

## テスト結果報告の整合性

1. **PASS 報告の条件を固定する**: 「exit code 0」かつ「失敗スイート/失敗ケース 0」を確認できない限り、PASS と断定しない。
2. **ログが最優先**: 手元実行ログと報告が食い違う場合は、ログ側を正として即時訂正する。
3. **不確実性を明示する**: 実行出力が欠落・省略されている場合は「未確認」として扱い、成功扱いにしない。

## シェル実装の移植性（macOS / BSD）

1. **`awk` の `match(..., ..., array)` 依存を避ける**: macOS 標準 `awk` では非互換になるケースがあるため、`sub` / `index` ベースで抽出する。
2. **ローカルの標準ツール前提で検証する**: Linux/GNU 前提の one-liner は導入前に `bash -n` と実行環境（BSD awk/sed）で最小実行確認する。

## Detox E2E と manifest 参照

1. **E2E は JSON 参照が安定**: Detox/Jest 実行系では TS モジュールの読み込み差異が出やすい。E2E 入力データは `.json` を直接 `require` する方が安定する。
2. **正本を複数にしない**: TS ラッパーは許容するが、E2E 側の参照先は固定し、同期責務を明確にして不整合を防ぐ。

## ログ保存と終了コード

1. **`tee` 付き debug script では `pipefail` を必須化**: `cmd | tee` だけだと失敗が `exit 0` に見える。`set -o pipefail` を先に有効化して、実コマンドの失敗を正しく返す。

## Screen Catalog と自動スクショ運用

1. **Screen Catalog は手動レビュー専用に保つ**: catalog を自動スクショ基盤の正本にすると、デバッグ用途と回帰証跡用途が混ざって保守が難しくなる。
2. **自動スクショは flow 別Detox + 補完 launchArgs で管理する**: 到達困難画面のみ `e2e_state` 注入で補完し、`snapshotTargets` でカバレッジを固定する。

## スコープ制御（snapshot）

1. **ユーザーが求める対象数を超えて拡張しない**: 全UI化は強い前提変更なので、明示依頼がなければ優先画面セット（今回なら10画面）を維持する。

## Expo ネイティブ依存の導入直後（E2E）

1. **`expo-*` を画面で top-level import すると未組込ビルドで起動クラッシュする**: `expo-image-picker` のような optional 機能は遅延 import + unavailable fallback を入れ、Detox 用既存ビルドでも起動可能に保つ。

## Detox 同期OFF起動の適用範囲

1. **`detoxEnableSynchronization=0` は全スイート一律適用にしない**: `due-action-sheet` / `home.session-start` ではタップ不可・モーダル遷移の不安定化が再現したため、起動helperは共通化しつつ suite ごとに synced/unsynced を選ぶ。

## Detox ビルド反映

1. **JS変更後の実機挙動差分は `e2e:build:ios` で再バンドル確認する**: `ios.sim.debug` でも既存バンドルを参照して古い挙動が残るケースがあるため、導線変更直後は再ビルド後に対象スイートを再実行する。

## Detox タップ安定化（ScrollView）

1. **`toExist()` だけでタップしない**: ScrollView 内の要素は存在していても画面外にあることがあり、`View is not hittable` につながる。`toBeVisible()` と必要最小限の `scroll()` をセットで使う。

## FocusCore の導線回帰防止

1. **モーダル表示中でも親画面を `null` で潰さない**: `presentation: 'modal'` を使う画面で親を空描画にすると、戻る操作で空画面に落ちる経路が発生する。
2. **導線変更時は副作用契約を追従確認する**: 画面遷移先を差し替えるときは、旧導線で実行されていたカウンタ更新（例: manual focus change count）を失っていないかを必ず確認する。

## Expo modulemap ビルドエラー（Xcode GUI クリーンビルド時）

1. **症状**: Xcode GUI からのクリーンビルドで `No such module 'Expo'` / `module map file ... not found` が発生する。`xcodebuild` CLI からは同一 workspace/scheme で **BUILD SUCCEEDED** になる。
2. **根本原因**: Xcode GUI の DerivedData が壊れた状態（Pod 出力ゼロ、app.app のみ存在）になると、暗黙的依存検出が機能せず Pod ターゲットがビルドされない。CLI は別の DerivedData を新規生成するため成功する。
3. **正しい復旧手順**: `rm -rf ~/Library/Developer/Xcode/DerivedData/app-*` → Xcode で Clean Build Folder (⌘⇧K) → Build (⌘B)。
4. **予防策**: Podfile `post_install` で `SWIFT_ENABLE_EXPLICIT_MODULES = NO` を xcconfig に追記済み。Xcode 16 デフォルトの `YES` だと `PrecompileSwiftBridgingHeader` が Pod 完了前に走り警告が出る。
5. **誤ったアプローチ（やってはいけない）**: `OTHER_SWIFT_FLAGS` の `-fmodule-map-file` パスを `${PODS_CONFIGURATION_BUILD_DIR}` から `${PODS_ROOT}/Headers/Public/` に置換する。ObjC modulemap は見つかるが Swift 型（`.swiftmodule`）は静的パスに存在しないため `ExpoAppDelegate` 等が "Cannot find type" になり悪化する。
6. **CLI フォールバック**: Xcode GUI が復旧しない場合、`xcodebuild -workspace app.xcworkspace -scheme app -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 17 Pro' build` → `xcrun simctl install/launch` で開発継続可能。

## SF Native キャプチャ（xcodebuild）

1. **CocoaPods 構成では `xcodebuild` を `-workspace` 優先で実行する**: `-project` で app 単体ビルドすると Expo/Pods の modulemap 不足で失敗しやすい。
2. **`e2e:capture:docs` の失敗切り分けは flow と sf:native を分離して確認する**: flow 側の Detox fail と sf:native 側の build/simctl fail は原因が異なるため、先に失敗フェーズを確定してから修正する。

## XCUI 通知権限テストの安定化

1. **`denied` ケース前に設定状態を正規化する**: 前ケースの設定値が残ると、同じ `e2e_notification_permission=denied` でも UI が `enabled` 分岐になる。Settings 経由で事前に OFF に揃える。
2. **失敗理由は `.xcresult` から行番号で特定する**: `XCTAssertTrue failed` だけでは原因が見えないため、`xcresulttool` で失敗行とメッセージを先に確定してから修正する。
