# lessons

- （初回作成。教訓は随時追記）

## 通知再整合（NotificationBridge / NotificationScheduler）

1. **非同期の順序**: SwiftData の `context.save()` が完了した後にのみ通知再整合を走らせる。Reconcile の流れでは「RN が reconcilePlans を呼ぶ → ネイティブで save 完了 → 戻る → RN が resyncAfterReconcile を呼ぶ」なので、データは保存済み。
2. **カテゴリとアクション**: 本通知の「開始」「5分だけ」「30分延期」は `UNNotificationCategory` で登録し、`UNNotificationContent.categoryIdentifier` で紐づける。ずれると通知は届くがボタンが効かない。
3. **prep_success 後の取消**: 準備だけ完了した計画は `.finalized` のため期待集合に含めない。結果、当該 plan の pending は削除され、追い打ち通知が届かなくなる。

## 通知レスポンス（NotificationResponse）

1. **二重処理の禁止**: 必ず Reconcile 完了後に ready() を呼ぶ。`runReconcileThenNotifyReady` で順序を保証する。古い状態に対して「開始」を出さない。
2. **通知の消去**: レスポンス処理の最初の一手はネイティブ側で `cancelForPlan(planId)`。同一 plan の再通知などが通知センターに残らないようにする。
3. **__DEFAULT__（通知体タップ）**: 「何しに来たんだっけ？」と選ばせない。DueActionSheet は開始ボタン最大化で、既定は 15 分開始。

## SwiftData Bridge（PersistenceBridge）

1. **日付の主語は `planDate` 文字列**: `yyyy-MM-dd` を永続化の正本にし、日付比較は文字列または `Calendar` 補助で扱う。ISO8601 `Date` への過剰変換は「今日判定」のズレを生む。
2. **障害は `resolve(nil)` で隠蔽しない**: Fetch/Save/初期化失敗は Promise `reject` で JS 側へ伝播させる。`try!` の singleton 初期化は禁止。
3. **NSDictionary の手作業マッピングを避ける**: `Decodable` 変換ユーティリティを共通化し、`saveBook` / `upsertPlan` の欠落・型ずれを防ぐ。

## Vitest + React Native

1. **`vitest` の `environment: node` で画面コンポーネントを直接読むと Flow 構文で失敗する**: `react-native` 本体の parse error（`Expected 'from', got 'typeOf'`）が出る。画面テストは runner を分離（jsdom + rn 対応設定 or jest）してから入れる。
2. **`vitest.config.ts` の `include` パターンを先に確認する**: このリポジトリは `src/**/*.test.ts` 固定のため、`.test.tsx` を追加しても実行対象に入らない。新規テストは `.test.ts` で作成するか、include を更新する。

## 通知アクションの開始モード

1. **`START` を固定で 15 分にしない**: 通知・Widget・App Intents の user-facing `開始` は状態依存で第一導線にマップする。少なくとも `continuousMissedDays >= 3` では `ignition_1m` に切り替える。

## ローカル同梱 Node（サンドボックス実行）

1. **`npm` を絶対パスで叩く時も `PATH` に node を入れる**: `npm` の shebang は `#!/usr/bin/env node`。`node` を PATH に通さないと `env: node: No such file or directory` で失敗する。
2. **React Native の最低 Node 要件を満たすバージョンを既定にする**: `20.19.4` 未満だと `EBADENGINE` 警告が大量に出る。`.nvmrc` / bootstrap 既定値 / `engines.node` を揃える。

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
