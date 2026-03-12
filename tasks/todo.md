# 積読コーチ Expo アプリ実装計画

## 2026-03-12: 書影優先順位固定 + SC-14/15/20/23 UI再整理

- [x] `BookDTO` に `coverSource` を追加し、保存時に manual/google_books/placeholder を保持
- [x] 共通書影解決 `resolveCoverForDisplay` を追加し、URL欠損/取得失敗時に placeholder へフォールバック
- [x] `BookCoverImage` に `onError` フォールバックを実装し、SC-21/23（加えて SC-20/12）へ適用
- [x] SC-14/15 の表示レイアウトを統一し、表示順を「完了タイトル→補助文→読書時間→読書本」に固定
- [x] SC-23 に書影ベース背景（低不透明）を追加し、CTA を下部配置へ調整
- [x] Screen Catalog シナリオを拡張（SC-20 empty, SC-21 no_cover/cover_removed, SC-14/15 normal+rehab, SC-23 rehab）
- [x] 検証実行
  - [x] `cd app && npm run typecheck`（exit code 0）
  - [x] `cd app && npm test -- src/domain/coverDisplay.test.ts src/screens/DueActionSheetScreen.test.ts src/screens/CompletionScreen.test.ts src/dev/screenCatalog/screenCatalog.test.ts`（exit code 0, 4 files / 13 tests passed）

## 2026-03-12: SC-21/SC-23 UI再設計 + プレースホルダー共通化 + VirtualizedList警告解消

- [x] SC-21 本詳細UIを単一レイアウトへ統一（書影あり/なし分岐廃止、既定プレースホルダー画像表示、項目順を「タイトル→著者→総ページ数→現在ページ→進捗設定→表紙操作」に変更）
- [x] SC-21 の進捗設定を「現在の有効/無効が視認でき、その場で切替可能」なトグルUIへ変更
- [x] SC-23 Due Action Sheet に対象書籍情報（書影/タイトル/著者）を追加し、書影欠損時は既定プレースホルダー画像を表示
- [x] SC-21/SC-23 で共通利用する書影コンポーネント（既定プレースホルダー画像内包）を追加し、グレー空枠フォールバックを廃止
- [x] Screen Catalog/モック定義を更新し、変更後UIを SC-21/SC-23 のモックに反映
- [x] 不足画面候補（本登録完了/空ライブラリ/書影再設定・削除/現在ページ更新/書籍削除/読書セッション中/読書完了分岐）を整理し、追加要否を docs に明記
- [x] `VirtualizedLists should never be nested inside plain ScrollViews` 警告を解消（Screen Catalog の ScrollView 構造を見直し）
- [x] 影響範囲のテスト実行（最低: typecheck + 対象ユニットテスト）と結果記録
  - [x] `cd app && npm run typecheck`（exit code 0）
  - [x] `cd app && npm test -- src/screens/DueActionSheetScreen.test.ts src/dev/screenCatalog/screenCatalog.test.ts`（exit code 0, 2 files / 6 tests passed）

## 2026-03-12: 引き継ぎ資料作成（本日時点）

- [x] ここまでの作業内容（実施済み/未完/検証結果）を整理
- [x] 次にやるべきこと（優先順位付き）を整理
- [x] `docs/testing/handover-2026-03-12.md` を作成

## 2026-03-12: Detox同期制御の全E2E横展開（setSyncSettings/isReady再発防止）

- [x] `device.disableSynchronization` / `device.enableSynchronization` の残存箇所を helpers + suites で撤去
- [x] launch経路を helper 経由へ統一（標準は `launchAppUnsynced`、タップ不安定が再現する `due-action-sheet` / `home.session-start` は `launchAppSynced` へ切替）
- [x] 代表スイート（smoke/home/due/completion/snapshot）を再実行して exit code と失敗件数を記録
  - [x] `cd app && npx detox test -c ios.sim.debug e2e/smoke.e2e.js e2e/home.navigation.e2e.js e2e/due-action-sheet.e2e.js e2e/completion-flow.e2e.js e2e/snapshots/home-snapshots.e2e.js -- --watchman=false`（exit code 0, 5 suites / 16 tests passed）

## 2026-03-12: Detox同期タイムアウト解消（home.rehab / library-detail / session-consistency）

- [x] 失敗の共通原因（`disableSynchronization` / `enableSynchronization` 競合）をE2Eコード上で整理
- [x] 同期制御の共通ヘルパーを追加し、対象スイートへ適用
- [x] `home.rehab` / `library-detail` / `session-completion-consistency` を再実行し、exit code と失敗件数を記録
  - [x] `cd app && npm run typecheck`（exit code 0）
  - [x] `cd app && npm run e2e:build:ios`（exit code 0, BUILD SUCCEEDED）
  - [x] `cd app && npx detox test -c ios.sim.debug e2e/home.rehab.e2e.js -- --watchman=false`（exit code 0, 1 suite/2 tests passed）
  - [x] `cd app && npx detox test -c ios.sim.debug e2e/library-detail.e2e.js -- --watchman=false`（exit code 0, 1 suite/5 tests passed）
  - [x] `cd app && npx detox test -c ios.sim.debug e2e/session-completion-consistency.e2e.js -- --watchman=false`（exit code 0, 1 suite/2 tests passed）

## 2026-03-12: 手動確認用画面の起動

- [x] 起動手順を確認し、手動確認画面（Screen Catalog）を直接開くコマンドを確定
- [x] Metro / iOS Simulator 上で手動確認画面を起動
- [x] 起動結果（成功/失敗、エラーログ）を記録して報告
  - [x] `cd app && npm run start -- --host localhost --port 8081`（Metro起動）
  - [x] `./run-ios.sh`（権限昇格で実行、exit code 0）
  - [x] `xcrun simctl launch booted com.anonymous.app -e2e_screen_catalog 1 -e2e_screen_catalog_auto_open 1`（exit code 0）

## 2026-03-12: snapshot 対象を10画面へ縮退

- [x] 全UI前提の設計を core10 前提へ変更
- [x] manifest を 10画面（SC-04/05/06/07/12/14/15/20/21/23）のみへ変更
- [x] manifest check を core10 厳格一致へ変更
- [x] release gate / manual commands の文言を core10 に同期
- [x] 検証（manifest check 実行）結果を記録
  - [x] `cd app && npm run e2e:snapshot:manifest:check`（exit code 0, requiredTargets=10）

## 2026-03-12: Catalog分離後のスクリーンショット取得再設計（Flow中心 + 補完起動引数）

- [x] flow snapshot 共通 helper と targets 定義を追加
- [x] flow snapshot Detox テスト群（home/session/library）を追加
- [x] `e2e_state=heavy_day` を iOS `PersistenceStore` に追加
- [x] `e2e:capture:*` scripts を catalog 方式から flow 方式へ置換
- [x] `screenCatalogCapture` の資産/参照を運用から削除
- [x] 関連ドキュメント（manual commands / debug template）を更新
- [x] 検証コマンドを実行して結果を記録
  - [x] `cd app && npm run typecheck`（exit code 0）
  - [x] `cd app && npm run e2e:capture:flows`（exit code 0, 3 suites / 10 tests passed）
  - [x] `cd app && npm run e2e:capture:flows:debug`（exit code 0, 3 suites / 10 tests passed）
  - [x] `cd app && npm run e2e:test:ios`（exit code 0, 23 suites / 64 tests passed）

## 2026-03-12: captureテスト実行

- [x] （廃止）`e2e:capture:catalog` は運用から削除済み
- [x] 置換先 `e2e:capture:flows` で exit code と失敗件数を確認済み

## todo.md 運用ルール

- 未完了（`- [ ]` を含む）トピックは `tasks/todo.md` に残す
- 完了済み（`- [x]` のみ）トピックのみ `tasks/archive/*.md` に退避する
- `todo.md` の肥大化を防ぐため、完了トピックの退避は定期的に実施する

## 2026-03-12: todo.md の未完了優先運用への整理

- [x] `tasks/todo.md` を直近10トピックに圧縮
- [x] 11件目以降を `tasks/archive/todo-archive-2026-03.md` へ退避
- [x] archiveに入ってしまった未完了トピックを `tasks/todo.md` へ復帰

## 2026-03-12: Detox artifacts 増加抑制の自動化

- [x] `app/scripts/prune-detox-artifacts.sh` を追加（保持件数超過分を削除）
- [x] `app/package.json` の E2E 実行前に prune を組み込み
- [x] `docs/testing/manual-test-commands.md` に運用コマンドを追記
- [x] スクリプトの構文/実行確認（`bash -n` / `npm run e2e:artifacts:prune`, exit code 0）

## 2026-03-12: Detox capture生成物の管理方針反映

- [x] `app/.gitignore` に `artifacts/` を追加（Detox生成物をGit管理対象外へ）

## 2026-03-12: screenCatalogCapture の scroll/tap 修正

- [x] `app/e2e/screenCatalogCapture.e2e.js` の scroll フローを簡素化（NaN 起点回避）
- [x] `back-to-catalog` タップ前に `scrollTo('top')` + 可視待機を追加
- [x] 関連コマンドで構文確認（`jest` 単体実行, exit code 0）

## 2026-03-12: 手動テスト起動コマンド集の整理

- [x] 既存の手動テスト起動コマンド（unit/typecheck/e2e/個別e2e）を抽出
- [x] `docs/testing/manual-test-commands.md` を新規作成し、実行手順を整理
- [x] `cd app && npm run typecheck` を実行（exit code 0）

## 2026-03-12: E2E実行安定化（ビルド失敗/ログ欠落対策）

- [x] `app/scripts/e2e-build-ios.sh` に preflight 追加（xcode-select / xcodebuild -version / simctl / workspace動的検出）
- [x] `app/package.json` に debug scripts 追加（teeで /tmp ログ保存、watchman false）
- [x] `app/e2e/jest.config.js` を調整（`default` reporter追加 + `watchman: false`）
- [x] `docs/testing` に失敗時ログ報告テンプレートを追加
- [x] `cd app && npm run e2e:build:ios:debug` を実行（preflight が CoreSimulator 不達で即 fail、/tmp/e2e-build-ios.log へ出力）
- [x] `cd app && npm run e2e:build:ios` を実行（同上で exit 1）
- [x] `cd app && npm run e2e:capture:catalog:debug` を実行（trace ログが /tmp/e2e-catalog-capture.log に保存）
- [x] `cd app && npx jest --watchman=false --config e2e/jest.config.js e2e/screenCatalogCapture.e2e.js` を実行（exit 0、この環境では標準出力は最小）

## 2026-03-12: Detox Catalog起動安定化の実装検証

- [x] `cd app && npm run typecheck` を実行
- [x] `cd app && npm test -- src/dev/screenCatalog/screenCatalog.test.ts` を実行
- [x] `cd app && npx jest --watchman=false --config e2e/jest.config.js e2e/screenCatalogCapture.e2e.js` を実行
- [x] `cd app && npm run e2e:build:ios` を実行（この環境では CoreSimulatorService 接続不可で exit 1）
- [x] `cd app && npm run e2e:capture:catalog` を実行（exit 0）
- [x] `app/artifacts`（または `artifacts`）の生成物を確認（この環境では未生成）

## 2026-03-12: Detox Catalog起動安定化（launchArgs + onReady遷移）

- [x] `App.tsx` で `e2e_screen_catalog` / `e2e_screen_catalog_auto_open` を読み取り、Catalog表示条件へ反映
- [x] `NavigationContainer onReady` 内でのみ Catalog 自動遷移を実行
- [x] `e2e/screenCatalogCapture.e2e.js` を launchArgs 起動 + Catalog画面待機へ変更（`disableSynchronization` 削除）
- [x] `npm run typecheck` と `npm test -- src/dev/screenCatalog/screenCatalog.test.ts` を実行
- [x] `npx jest --watchman=false --config e2e/jest.config.js e2e/screenCatalogCapture.e2e.js` を実行

## 2026-03-12: Screen Catalog manifest の E2E 参照を JSON に戻す

- [x] `screenCatalogManifest.json` を復元
- [x] `screenCatalogManifest.ts` を JSON ラッパーへ戻す
- [x] `e2e/screenCatalogCapture.e2e.js` の manifest 読み込みを JSON に戻す
- [x] `npm run typecheck` と `npm test -- src/dev/screenCatalog/screenCatalog.test.ts` を実行

## 2026-03-12: Screen Catalog 全画面キャプチャ基盤（manifest + Detox）

- [x] `screenCatalogManifest` を正本として追加し、screenRegistry を manifest 由来へ移行
- [x] `ScreenPlayground` に `back-to-catalog` testID 導線を追加
- [x] `e2e/screenCatalogCapture.e2e.js` を追加（describe(screenId) 分割、3桁命名、scroll fallback、stagnation判定）
- [x] `screenCatalog.test.ts` に manifest/registry 整合テストを追加
- [x] `npm run typecheck` と `npm test -- src/dev/screenCatalog/screenCatalog.test.ts` を実行



## 2026-03-12: 未完了トピックの復帰（archive→todo）

- [x] archiveに退避されていた未完了トピックを `tasks/todo.md` へ復帰
- [x] 運用ルールを"未完了はtodoに残す"へ変更

## 2026-03-12: Screen Catalog 追加確認と検証（SC-05/12/14/15/20/21）

- [x] SC-05 (`FocusCoreView`) が `book: null` でも UI 崩れなく表示できるかを確認し、必要なら fixture を補う
- [x] SC-14/SC-15 が `CompletionView` 共通利用 + props 分岐で成立していることを確認（View 複製なし）
- [x] `cd app && npm run typecheck` を実行し、exit code と失敗件数を確認
- [x] `cd app && npm test -- src/dev/screenCatalog/screenCatalog.test.ts` を実行し、exit code と失敗件数を確認
- [ ] 可能なら `cd app && npm run ios` でカタログ表示（SC-05/12/14/15/20/21, scenario切替, CTA）を目視確認（この環境では Simulator 未検出で実行不可）


## 2026-03-11: Batch 5 SUR-01〜10 実装（Surface / Widget / Notification / App Intents）

- [x] 既存実装調査（launchArgs / e2e_state / reconcile / notification response）を完了し、最小変更方針を確定
- [x] iOS launchArgs 取得を bridge 経由に追加（`PersistenceStore` 直接変更ではなく `PersistenceBridge.getLaunchArg` で対応）
- [x] TS bridge に surface trigger 取得APIを追加（test-only）
- [x] `SurfaceTriggerCoordinator` を追加し、起動時に surface trigger を app 内で再現
- [x] Detox 追加: `app/e2e/surface-notification.e2e.js`（SUR-01/02/03/04）
- [x] Detox 追加: `app/e2e/surface-widget.e2e.js`（SUR-05/06/07）
- [x] Detox 追加: `app/e2e/surface-app-intent.e2e.js`（SUR-08/09/10）
- [x] integration 追加: `app/src/useCases/__tests__/SurfaceSnapshot.integration.test.ts`（stale/latest 整合）
- [x] gap note 追加: `docs/testing/surface-gap-notes.md`（自動化範囲と native acceptance 分担）
- [ ] `npm run e2e:build:ios` / `npm run e2e:test:ios` / `npm test` 実行と結果確認（`npm run e2e:test:ios` は既存 `progress-optin` 1件FAIL）


## 2026-03-10: SC-14 実績定義の明確化（時間実績と進捗の分離）

- [ ] SC-14 文言を修正（「実績カウント対象」の曖昧語を「時間実績/継続実績」に置換）
- [ ] 論理仕様書へ指標分離を追記（`daily_result` / `continuity_credit` / `completed_reading_seconds` / `progress_delta` / `finished_book`）
- [ ] 時間集計ルール（15/5/3/1分加算、attempted 原則0、prep_successの例外）を仕様化
- [ ] ユーザーストーリー・異常系・UIUX 指針の該当文言を同期し、矛盾を解消


## 2026-03-10: 優先順位更新（画面遷移統一 → 未開始時再通知 → UIテスト）

- [x] 第一優先: 画面遷移を完全統一（SC-04/05/06/07/23 + Surface 起点、状態依存の第一導線を1対1で対応）
- [x] 第二優先: 未開始時再通知を仕様準拠で実装（15分後に1回のみ、最大2回は不採用）
- [ ] 第三優先: 主要画面コンポーネントテストを追加（SC-04/06/07/15/23中心）
  - [x] 代替として画面ポリシーテストを追加（SC-04/06/07/15/23 の画面ID・CTA順序・第一導線を固定）
  - [x] SC-23（DueActionSheet）コンポーネントテストを追加（CTA順序・通知起点 entryPoint を検証）
  - [x] SC-07（RestartRecovery）実コンポーネントテストを追加（CTA順序・Close 遷移）
  - [x] SC-15（Completion）実コンポーネントテストを追加（CTA順序・先頭CTA開始挙動）
  - [ ] SC-04/06 の実コンポーネントテストを追加


## SwiftData + Native Module（論理仕様書準拠）

- [x] SwiftData エンティティ（UserSettings, Book, DailyExecutionPlan, SessionLog）— Codex 実装済み
- [x] PersistenceBridge（Native Module）: iOS 側 Swift + ObjC 登録、TS ラッパー `app/src/bridge/PersistenceBridge.ts`
- [x] ReconcilePlansUseCase: ネイティブ側 `ReconcilePlansRunner` + TS エントリ `app/src/useCases/ReconcilePlansUseCase.ts`
- [ ] **iOS ビルド**: `npx expo prebuild` 後、`ios/ReadingCoach/Bridge/*.swift` と `PersistenceBridge.m` を Xcode ターゲットに追加すること。未追加の場合はネイティブモジュールがリンクされない。開発が落ち着いたら **expo-config-plugins**（`withXcodeProject` 等）で .swift / .m を自動登録すると再現性が上がる。
- [x] アプリ起動時に `runReconcilePlansUseCase('app_launch')` を呼ぶ（例: App.tsx または context の useEffect）
- [x] 通知再整合: **NotificationBridge** ネイティブ実装済み。`app/ios/ReadingCoach/Notifications/` に ExpectedSetBuilder、NotificationScheduler、NotificationCategoryRegistration、NotificationBridge（RCT）。prep_success 後は当該計画が期待集合外となり自動で取消。
- [x] **NotificationResponse ハンドリング**: NotificationResponseDelegate（cancelForPlan 第一手・バッファ）、NotificationBridge（RCTEventEmitter + ready()）、ペイロード契約（planId / actionId / triggeredAt / isColdStart）。RN: `runReconcileThenNotifyReady` で Reconcile → ready の順を保証、`subscribeNotificationResponse` と `routeActionId` でルーティング骨格。

---


## 実装評価（論理仕様 v1 照合）

- **Self-healing 完了**: 不整合防止（ready 待ち）、通知追い打ち防止（cancelForPlan 第一手）、既定値勝利（__DEFAULT__ → 開始最大化）により習慣化の死を招くバグを封じ込め済み。
- **MVP 進捗 約 60%**: 基盤層・ロジック層 100%、通信・外部連携 90%、**執行・UI 層 15%**。次は執行フェーズの具体化。

### 次のステップ: 執行（Session Execution）

論理仕様 11.4 session_start_* / 20.7 クラッシュ復旧 / 17.4 SessionLog に準拠。

| 急所 | 内容 |
|------|------|
| **A. 執行中の永続化** | 開始と同時に `SessionLog` 作成し `SessionLog.startedAt` と `DailyExecutionPlan.startedAt` を即永続化。キル後再起動で `active_session_restored` → 残り時間再計算。 |
| **B. Live Activities** | `active` 遷移と同時に ActivityKit で Dynamic Island / ロック画面にタイマー表示（論理仕様 11.4 副作用・17 補助機能）。 |
| **C. 完了と Recompute** | タイマー終了 → 進捗自己申告 → `SessionLog` 追加・`DailyExecutionPlan.result` 格上げのみ（RecomputeDailyResultUseCase）。 |

**着手順（提案）**

1. **Swift: Live Activities ブリッジ** — ActivityKit の起動・更新・終了を Native Module で公開。RN から「何を渡すか」の契約が決まる。
2. **RN: StartSessionUseCase** — タイマー管理とネイティブ呼び出し（SessionLog 永続化 + Live Activity 開始）。必要なら RestoreActiveSessionUseCase でクラッシュ復旧。

- [x] **Live Activities ブリッジ（iOS）**: ActivityKit を用いた開始・更新・終了の Native Module（RCT 経由）。`LiveActivityBridge`（Swift/ObjC）、`ReadingSessionAttributes`、TS ラッパー `LiveActivityBridge.ts`。Widget Extension 用ソースは `app/ios/ReadingCoachWidget/`（Xcode でターゲット追加要）
- [x] **StartSessionUseCase（RN）**: `runStartSessionUseCase({ planId, mode, entryPoint })`。PersistenceBridge.startSession → Live Activity 開始。戻りは `StartSessionResult`（執行画面でタイマー用）
- [x] **執行中画面（ActiveSessionScreen）**: タイマー表示、完了時 CompletionScreen へ
- [ ] **完了フロー**: CompleteSessionUseCase、進捗自己申告、RecomputeDailyResultUseCase


## フェーズ3: 希望の可視化

- [ ] 短期: 今月の実行回数・今読んでいる1冊の進捗
- [ ] 長期: 積読冊数と「今のペースなら○冊/月」の見込み（絶望より希望を優先した見せ方）

---


## 2026-03-09: Git 導入・GitHub 連携

- [ ] `readingcoach` ディレクトリで `git init` し、初期コミットを作成する
- [ ] GitHub 側でリポジトリを作成し、`origin` を追加する
- [ ] `main` ブランチを `git push -u origin main` で初回 push する


## 2026-03-10: iOS ローカルビルド復旧

- [x] `app/ios` の `Pods` / `build` を再生成前にクリーン
- [x] `pod install` を再実行して CocoaPods 同期（network 制限は昇格実行で解消）
- [x] `xcodebuild -workspace app.xcworkspace -scheme app -configuration Debug -destination 'generic/platform=iOS Simulator' build` で `BUILD SUCCEEDED` を確認
- [ ] `npx expo run:ios` で Simulator 起動まで確認（この環境ではログ取得上、ビルド確認まで）


## 2026-03-10: 画面モック準拠でのアプリ完成（TDD / 疎結合 / 共通部品）

- [x] `docs/画面モック` と主要仕様書（論理仕様・画面定義・UI/UX）の差分を洗い出し、実装対象を確定
- [ ] 画面遷移を新仕様へ統一（SC-04/05/06/07/12/13/14/15/16/17/18/19/21/23/24、SF系を含む）
- [x] ドメイン層を整理（Start/Complete/EnableProgress/UpdateProgress/DueAction の use case 化、画面から business rule を分離）
- [x] 共通UI部品を導入（Primary/Secondary CTA、SessionTimer、ProgressPanel、CompletionFeedbackCard など）
- [x] 旧導線の依存除去（`context.tsx` / `storage.ts` / `ExecutionScreen` を移行専用に縮退または無効化）
- [x] TDD基盤を追加（Vitest）し、先に failing test を作成
- [x] ユースケース単体テストを実装（状態分岐、CTA優先順位、`prep_success` と進捗分離、読了分岐）
- [ ] 主要画面のコンポーネントテストを実装（SC-04/06/07/15、DueActionSheet）
- [x] 最低限の結合テストを実装（開始 -> セッション -> 完了 -> 追加セッション/読了）
- [x] TypeScript チェックとテストを通し、未実装差分を todo に再整理

### 進捗メモ（このターン）

- [x] SC-15 相当: `ActiveSession -> CompleteSessionUseCase -> CompletionScreen` を接続
- [x] SC-16/17 相当: `ProgressTrackingPromptScreen` / `ProgressTrackingSetupScreen` を追加し、完了後から遷移
- [x] SC-23 相当: `DueActionSheetScreen` を追加
- [x] SC-19 相当: `NextFocusNominationScreen` と `NominateNextFocusBookUseCase` を追加
- [x] 通知応答ハンドラを実遷移へ接続（`NotificationResponseCoordinator`）
- [x] `AddBookScreen` / `ReserveScreen` の保存経路を `PersistenceBridge` 側に寄せた
- [x] ナビゲーションから `ExecutionScreen` を除外し、`AppProvider` 依存を外した
- [x] Domain + UseCase/Flow テストを 9 ファイル / 28 ケースまで拡張し、`npm run test` + `tsc --noEmit` を通過

### 進捗メモ（継続ターン）

- [x] SC-20（ライブラリ）と SC-21（本詳細）を画面モック準拠で実装
- [x] Focus Book 化（本詳細）を `SetFocusBookForTodayUseCase` で接続
- [x] SC-04/15 から SC-20/21 への導線を追加
- [x] SC-07（再開専用導線）と SC-22（時刻変更）を追加し、`continuous_missed_days >= 7` の優先導線を実装
- [ ] 主要画面コンポーネントテストを追加（`vitest(node)` では `react-native` Flow 構文で失敗するため、runner 分離が必要）
- [x] `npm run test` と `tsc --noEmit` の再実行で回帰確認
- [x] 通知 `開始` を状態依存モードへマップ（normal/ignition 切替）
- [x] 通知/アプリ内 DueActionSheet の `30分延期` を実装（SnoozePlanUseCase）
- [x] 通知起点ロジックの検索・モード解決・延期を use case 分離しテスト追加


## 2026-03-11: Detox 端末サイズ差分チェック

- [ ] 小さい iPhone シミュレータ（例: iPhone 16e）向け Detox configuration を追加
- [ ] 大きい iPhone（現行: iPhone 17 Pro Max）と小さい iPhone（例: iPhone 16e）の2構成を Detox 公式実行マトリクスとして定義
- [ ] 全 Detox テスト（`e2e/**/*.e2e.js`）を大きい iPhone 構成で実行
- [ ] 全 Detox テスト（`e2e/**/*.e2e.js`）を小さい iPhone 構成で実行
- [ ] 端末サイズごとの失敗差分を比較し、レイアウト依存の不安定テストを修正
- [ ] 端末サイズ依存で崩れる要素があれば `docs/testing/*-gap-notes.md` に追記


## 2026-03-11: gap-notes 全件解消（横断）

- [ ] `docs/testing/*-gap-notes.md` を棚卸しし、未解消項目を一覧化（E2E / integration / native acceptance に分類）
- [ ] app 内で解消可能な gap を優先実装（state injection / layout安定化 / testID不足 / clock/probe 接続）
- [ ] Detox 側で解消可能な gap を実装（launchArgs・複数端末マトリクス・scroll/visibility安定化）
- [ ] native acceptance 領域の gap を XCUITest 等の実施計画へ切り出し、境界を明文化
- [ ] 全 gap-notes を更新し、各項目を `resolved / in_progress / blocked` でステータス管理

## 2026-03-12: UI差分反映（SC-04/06/07/12/14/15/20/21/23 + TC追加）

- [ ] SC-04/06/07/23 の文言・導線を仕様差分へ更新（SC-04一本化、SC-06の3分CTA除去、SC-07/23文言更新）
- [ ] SC-12 に読書時間進捗サークルと書影表示を追加
- [ ] SC-14/15 の完了文言・時間表示ラベルを更新し、読書した本表示を追加
- [ ] SC-20 の書影表示と下部CTA配置を実装
- [ ] SC-21 の表紙入力を URL から 画像選択（カメラ/端末）へ置換し、ページ入力群を同一ブロック化
- [ ] `expo-image-picker` 導入と iOS 権限文言設定を反映
- [ ] Screen Catalog / snapshot target から SC-06:due を除去し、SC-04格言fixtureをセネカ固定へ変更
- [ ] Unit/Detox テストを更新・追加（TC-SESSION-01/02, TC-REHAB-01, TC-LIB-01）
- [ ] 関連 docs を更新し、追加TCを反映
- [x] SC-04/06/07/23 の文言・導線を仕様差分へ更新（SC-04一本化、SC-06の3分CTA除去、SC-07/23文言更新）
- [x] SC-12 に読書時間進捗サークルと書影表示を追加
- [x] SC-14/15 の完了文言・時間表示ラベルを更新し、読書した本表示を追加
- [x] SC-20 の書影表示と下部CTA配置を実装
- [x] SC-21 の表紙入力を URL から 画像選択（カメラ/端末）へ置換し、ページ入力群を同一ブロック化
- [x] `expo-image-picker` 導入と iOS 権限文言設定を反映
- [x] Screen Catalog / snapshot target から SC-06:due を除去し、SC-04格言fixtureをセネカ固定へ変更
- [x] Unit/Detox テストを更新・追加（TC-SESSION-01/02, TC-REHAB-01, TC-LIB-01）
- [x] 関連 docs を更新し、追加TCを反映
- [ ] 検証コマンド実行（typecheck / test / manifest check / 対象detox）
  - [x] `npm run typecheck`（exit code 0）
  - [x] `npm run test -- <related>`（exit code 0, 8 files / 29 tests passed）
  - [x] `npm run e2e:snapshot:manifest:check`（exit code 0）
  - [ ] Detox対象3本は環境タイムアウト（`setSyncSettings/isReady`）で再確認が必要

## 2026-03-12: 未コミット差分レビュー指摘の修正（FocusCore）

- [x] P1対応: `plan.state === due` 時にホーム本体を `null` にしない（空画面回避）
- [x] P2対応: `本を変える` 導線で手動変更回数カウントの契約を維持（`FocusBookPicker` 経由へ戻す）
- [x] 回帰確認: `npm run typecheck` と `npm test`
