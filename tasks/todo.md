# 積読コーチ Expo アプリ実装計画

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

## 2026-03-11: progress-optin 可視性待機修正と全体E2E緑化

- [x] `e2e/progress-optin.e2e.js` の可視性待機に起因する失敗を最小修正
- [x] `npx detox test -c ios.sim.debug e2e/progress-optin.e2e.js` を再実行して単体PASS確認
- [x] `npm run e2e:test:ios` を再実行して全体PASS確認

## 2026-03-11: テスト件数/カバレッジ確認と gap-note 更新

- [x] E2E 件数（suite/test）と変更前後の差分を整理
- [x] `docs/testing/surface-gap-notes.md` に今回の安定化変更と残ギャップを追記

## 2026-03-11: Batch 6 ABN-02〜12 実装計画

- [x] ABN-02/03 integration: 通知再整合（欠落再構築・重複抑制）を probe ベースで追加
- [x] ABN-04/09/10 integration: stale plan 防止 / plan欠損補完 / 04:00 catch-up を usecase テストで追加
- [x] ABN-05/06/08 E2E: stale widget / widget開始失敗の再試行導線 / book欠損フォールバックを harness で追加
- [x] ABN-07/11/12 を native acceptance 領域として `docs/testing/abnormal-gap-notes.md` に明文化
- [x] `npm run e2e:build:ios` `npm run e2e:test:ios` `npm test` 実行で結果確定

## 2026-03-11: Batch 7 ONB-01〜06 / BOOK-01〜09 実装計画

- [x] Onboarding 導線（SC-01/02/03）用 screen/testID を最小追加し、launchArgs で deterministic 起動導線を追加
- [x] AddBook 検索モック（success/0件/timeout/429/5xx/offline）と手入力縮退導線を追加
- [x] BookDetail / Library の testID を補強し、Focus化後ホーム復帰を実装
- [x] Detox 追加: `onboarding-flow.e2e.js` `add-book-flow.e2e.js` `library-detail.e2e.js`
- [x] gap note 追加: `docs/testing/onboarding-book-gap-notes.md`
- [x] `npm run e2e:build:ios` `npm run e2e:test:ios` `npm test` 実行で結果確定

## 2026-03-11: Batch 4 CMP-01〜10 実装（Completion / Progress / Finished Book）

- [x] SC-15/16/17/19 に必要 testID を最小追加（既存UI構造は維持）
- [x] Detox 追加: `e2e/completion-flow.e2e.js`（CMP-01/02/03）
- [x] Detox 追加: `e2e/progress-optin.e2e.js`（CMP-04/05/06/07）
- [x] Detox 追加: `e2e/finished-book.e2e.js`（CMP-09）
- [x] integration 追加: `src/useCases/__tests__/DailyResultRecomputed.integration.test.ts`（CMP-08, result upgrade only）
- [x] integration 追加: `src/useCases/__tests__/CompletionFlow.integration.test.ts`（CMP-10補完: finished_book 失敗時の扱い含む）
- [x] `docs/testing/completion-flow-gap-notes.md` を追加（自動化範囲/残ギャップ/レイヤ分担）
- [x] `npm test` と `npm run e2e:test:ios` を実行して結果報告（全26 test files PASS / E2E 9 suites PASS）

## 2026-03-11: Batch 3 ACT-07〜09 integration 実装

- [x] 現行 usecase/persistence 実装を確認し、ACT-07/08/09 の最小 test seam を確定
- [x] `StartSessionUseCase.integration.test.ts` を追加し、同一 plan の多重開始冪等を検証（TC-ACT-07）
- [x] `ReconcilePlansUseCase.integration.test.ts` を追加し、active restore 前提（persisted active + reconcile 後復元）を検証（TC-ACT-08）
- [x] `CompleteSessionUseCase.integration.test.ts` を追加し、fault injection + retry 後の単一完了を検証（TC-ACT-09）
- [x] 必要最小限の実装補強（idempotent guard / fault injection seam）を usecase/repository 境界に追加
- [x] `docs/testing/act-integration-gap-notes.md` を追加し、自動化範囲と残ギャップを整理
- [x] `npm test` で回帰確認し、差分要約と保留点を報告

## 2026-03-11: Detox E2E再実施と失敗評価

- [x] `npm run e2e:test:ios` を再実行して最新失敗一覧を取得
- [x] 失敗テストを「テストコード不備 / state injection不整合 / UI可視性 / 同期問題」で分類
- [x] 改修優先度と最小修正方針を報告

## 2026-03-11: Detox失敗9件の一括修正

- [x] `home.rehab.e2e.js` の不正チェーン（`scroll(...).withTimeout`）を修正
- [x] `due-action-sheet.e2e.js` のアンカーを `due-action-sheet` から CTA testID へ切替
- [x] `due-retry.e2e.js` のアンカーを非安定 root View から操作可能要素へ切替
- [x] `npm run e2e:test:ios` 再実行で全件 PASS を確認

## 2026-03-11: テスト結果報告ルールの明文化

- [x] `AGENTS.md` に「未パスをパス報告しない」ルールを追加
- [x] `PASS` 報告条件（exit code 0 かつ fail 0）を明文化
- [x] `tasks/lessons.md` に今回の教訓（報告整合性）を追記

## 2026-03-10: 仕様書・画面モック突合せでの継続実装（SC-07/SC-22）

- [x] 仕様書・画面モック（WF-SC-07, WF-SC-22）を参照し、不足導線を特定
- [x] SC-07（再開専用導線）を実装し、`continuous_missed_days >= 7` で最優先表示にする
- [x] SC-22（時刻変更）を実装し、通常開始時刻（`dailyTargetTime`）を更新できるようにする
- [x] ナビゲーション遷移を統合し、型チェックとテストで回帰確認

## 2026-03-10: 自動テスト実行環境の整備

- [x] 実行方式を統一（`npm run check` で test + typecheck を一括）
- [x] CI（GitHub Actions）を追加し、push / PR で自動検証
- [x] Node バージョン固定（`.nvmrc` + `package.json engines`）で再現性を担保
- [x] README に最短実行手順とトラブルシュートを追記

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

## 2026-03-10: AIエージェント向け索引整備

- [x] プロジェクト構造と正本の整理ドキュメントを追加（`docs/AGENT_INDEX.md`）

## 2026-03-10: DRYリファクタリング（コードベース俯瞰）

- [x] 重複パターンを共通化（`runStartSessionUseCase` 後の `ActiveSession` 遷移パラメータ組み立て）
- [x] 通知スケジュール周辺の重複文言/ペイロード生成を共通関数へ集約
- [x] 画面レベルの共通UI値（背景色/標準余白）を `theme` 定数へ集約し、主要画面へ適用
- [x] DRY化後のテスト修正と `./scripts/check-sandbox.sh` で回帰確認

## 設計原則（最優先）

- **管理ではなく執行**: 本棚・記録UIより「今日の1冊」「今すぐ読む」を前面に出す。ホームは執行画面。
- **OSレベルの導線短縮**: 通知→執行画面の直行、操作手数最小。将来ウィジェット・ロック画面対応の余地を残す。

## フェーズ1: 骨格（MVP コア）

- [x] Expo (React Native) プロジェクト作成（`app/` に配置）
- [x] ストレージ: 書籍一覧・予約・実行ログを AsyncStorage で永続化
- [x] **ホーム = 執行画面**: 今日の1冊 + 予約時刻 + 主CTA「今すぐ読む」+ 救済（5分だけ / 1ページだけ）
- [x] 書籍追加: 最小限（タイトル必須、著者任意）で登録
- [x] 予約フロー: 明日の1冊と時刻を1〜2画面で確定（考えさせない）
- [x] 選定ロジック: 読みかけ優先 → 直近着手優先（MVPはシンプルに）
- [x] 実行記録: 15分/5分/1ページのモードと実行日時のみ記録（長文メモなし）

## フェーズ2: OS接点

- [x] ローカル通知: 予約時刻に「今すぐ読む」通知 → タップでアプリ起動し執行画面を表示
- [x] 未開始時の再通知（15分後に1回のみ、責めすぎない文言）

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

## 2026-03-09: FocusCoreScreen（パフォーマンス・メンター UI）

- [x] `app/src/screens/FocusCoreScreen.tsx` を新規追加し、指定の色・余白・角丸（20pt）でホームUIを実装
- [x] **起動時は必須**: `runReconcileThenNotifyReady('app_launch')` を起点に初期化し、**Reconcile 完了後**にのみ `getPlanForDate` を呼ぶ（UI空振り防止）
- [x] 画面表示時も `runReconcilePlansUseCase('foreground')` → `getPlanForDate` の順で最新化
- [x] `persistenceBridge.getBook(plan.bookId)` で書影（`thumbnailUrl`）を取得し、影つき表示 + 細い琥珀色プログレスバーを配置
- [x] `continuousMissedDays >= 3`（plan の snapshot または reconcile 結果）で CTA を「1分、再点火（Ignition）」へ昇格（15分はサブへ降格）
- [x] **コピー切替**: CTA 昇格時は「なぜ今このCTAか」が伝わる短い補助コピーも切替（非詰問・非罪悪感）
- [x] 「本を切り替える」Ghost Link を書影下に配置（主CTAを邪魔しない）。**1日1回**まで（`MAX_DAILY_MANUAL_FOCUS_CHANGE = 1`）をアプリ側で制限
- [x] セッション開始: `runStartSessionUseCase` 成功後に執行画面へ遷移（`ActiveSessionScreen` を最小実装で追加）
- [x] 命名整合: JS 側の執行モード名は `ignition_1m`（旧 `book_fetch_1m` はネイティブ互換のため内部マッピングで吸収）
- [x] 型エラー/構文エラーの確認

## 2026-03-09: Expo Go 用 Mock Bridge（iPhone 実機で画面確認）

目的: **Expo Go（カスタムネイティブ無し）でもホーム〜セッション開始まで落ちずに動く**ようにする。

- [x] `PersistenceBridge.ts` を「ネイティブ有り→ネイティブ」「ネイティブ無し→Mock(AsyncStorage)」に自動切替
  - [x] Mock: Book/Plan を最低1件シードして `FocusCoreScreen` が表示できる
  - [x] Mock: `upsertPlan` で「本を切り替える」を動かす
  - [x] Mock: `startSession` を成功させ、`ActiveSessionScreen` へ遷移できる
  - [x] Mock: `reconcilePlans` は `todayPlan` を返して UI が plan を掴める
- [x] `LiveActivityBridge.ts` を Expo Go でも安全な no-op / mock 実装に整理（例外・未定義参照を避ける）
- [x] 変更後に TypeScript の型チェック（または `expo` の起動）で確認
 
## 2026-03-09: Git 導入・GitHub 連携

- [ ] `readingcoach` ディレクトリで `git init` し、初期コミットを作成する
- [ ] GitHub 側でリポジトリを作成し、`origin` を追加する
- [ ] `main` ブランチを `git push -u origin main` で初回 push する

## 2026-03-10: SwiftData 移行（PersistenceBridge ネイティブ実装）

- [x] 現状確認: `app/ios` 既存ブリッジの有無、Xcode ターゲット構成、既存 `PersistenceBridge.ts` との契約を再確認
- [x] SwiftData Entity 実装: `BookEntity` / `ExecutionPlanEntity` / `SettingsEntity` / `SessionLogEntity` を `toDTO()` 付きで追加
- [x] SwiftData ストア層実装: `ModelContainer` 初期化、初期シード投入（Book 0 件時）
- [x] React Native Native Module 実装: `@objc(PersistenceBridge)` + Promise API で JS 契約メソッドを全実装
- [x] Xcode プロジェクト配線: `.swift` / `.m` を target の Sources に追加
- [x] 検証: `xcodebuild -list -project app.xcodeproj` で project 整合を確認（sandbox 由来で simulator build は不完全）
- [x] セルフレビュー: DTO 互換性、日付フォーマット、thread safety（MainActor 利用）を確認
- [x] Data Drift Check: `upsertPlan` / `findPlan` は `planId` 優先・`planDate` フォールバックで mock/native ID 混在を吸収
- [x] Thread Policy: `PersistenceStore` を `@MainActor` で統一し `ModelContext` を単一 actor 上で操作

## 2026-03-10: Git Ignore 見直し（iOS をソース管理）

- [x] `app/.gitignore` から `/ios` 除外を削除
- [x] `ios/build/` `ios/Pods/` `ios/*.xcworkspace` のみ除外に変更
- [x] `git status` で `app/ios` が追跡対象になることを確認

## 2026-03-10: iOS ローカルビルド復旧

- [x] `app/ios` の `Pods` / `build` を再生成前にクリーン
- [x] `pod install` を再実行して CocoaPods 同期（network 制限は昇格実行で解消）
- [x] `xcodebuild -workspace app.xcworkspace -scheme app -configuration Debug -destination 'generic/platform=iOS Simulator' build` で `BUILD SUCCEEDED` を確認
- [ ] `npx expo run:ios` で Simulator 起動まで確認（この環境ではログ取得上、ビルド確認まで）

## 2026-03-10: 文言設定ファイル化 + 軽量リファクタ（疎結合/共通化）

- [x] 文言設定ファイルを新設（例: `app/src/config/copy.ts`）し、画面別に意味が明確なキーで定義
- [x] `FocusCoreScreen` / `ActiveSessionScreen` / `FocusBookPickerScreen` / `AddBookScreen` / `ReserveScreen` の文言を設定ファイル参照へ置換
- [x] 通知文言（`notifications.ts`）を設定ファイル参照へ置換
- [x] 重複しやすい CTA 表示ロジックを最小限共通化（過剰抽象化はしない）
- [x] 型チェックまたはビルドで構文整合を確認

## 2026-03-10: FocusCore 文言調整（Performance Mentor）

- [x] 「今日の1冊」系表現を「今日のセッション」へ統一
- [x] ヘッダー文言とレイアウト（改行 + 中央揃え）を更新
- [x] 日替わり格言（7 quotes）ロジックを追加して表示
- [x] CTA 文言を「15分のセッション開始」「今日は1分だけにする」へ変更
- [x] 型チェックで整合確認

## 2026-03-10: 文言設定 横展開（App ナビゲーション）

- [x] `App.tsx` の `Stack.Screen options.title` 直書き文言を `copy.ts` へ集約
- [x] FocusCore のナビゲーションタイトルを「今日のセッション」に統一
- [x] 型チェックで整合確認

## 2026-03-10: 文言設定 横展開（プロジェクト全体）

- [x] `app/src` 残存文言（Mock seed 含む）を `copy.ts` へ集約
- [x] iOS Native seed 文言を Swift 側設定ファイルへ分離
- [x] 参照置換後に TS 型チェックと iOS ビルド確認

## 2026-03-10: iOS/Android 互換性レビュー（現状診断）

- [x] `PersistenceBridge` / `NotificationBridge` / `LiveActivityBridge` のプラットフォーム依存を確認
- [x] 画面層の iOS 固有挙動（`headerLargeTitle`, `KeyboardAvoidingView` など）が Android で致命傷にならないか確認
- [x] iPhone/Android 両対応に向けた優先修正ポイントを整理

## 2026-03-10: 仕様書改訂（正本一本化 / OS一等地 / 状態機械統合）

- [x] 改訂方針を確定（企画書・論理仕様書・UIUX指針・現行アーキ整理の境界と優先度を明文化）
- [x] `docs/積読コーチ_論理仕様書_v1.md` を最優先改訂（entitlement抽象化、EventLog必須化、移行規約、OS surface責務）
- [x] `docs/積読コーチ企画書 v1.md` を改訂（北極星を当日達成へ、救済モード統一、OS一等地をMVP受入条件へ、収益方針の拡張可能表現）
- [x] `docs/積読コーチ_UIUX統合指針_20260309.md` を改訂（目的文更新、OS surface別表示規約、copy管理規約）
- [x] `docs/現行アーキテクチャ整理_20260310.md` を移行計画書として追記（cutover criteria / migration policy / DoD）
- [x] 文書間整合レビュー（用語・mode名・MVP境界・優先順位の矛盾検査）

## 2026-03-10: 現行アーキテクチャ整理メモ

- [x] 画面遷移・責務・データフローを1枚の設計メモに整理
- [x] 新実装と旧実装の境界を洗い出し、削除候補を特定

## 2026-03-10: プログレスバー運用方針の仕様反映

- [x] 論理仕様書へ「初回セッション前は非提示 / 初回完了後に任意有効化」の規約を追記
- [x] ユーザーストーリー定義書へ「ソフト案内・任意利用・OFF復帰可能・毎回更新非必須」を反映
- [x] 異常系・縮退運転定義書へ「未設定でも主導線非阻害」を追記
- [x] 表記ゆれ（総ページ数/現在ページ/進捗バー）を統一

## 2026-03-10: 4文書横断同期（モード/CTA/OS surface/progress tracking）

- [x] 論理仕様書を正本として更新（mode命名統一、7日以上=1分主導線、通知/Widget/App Intents CTA、DueActionSheet明示、5分セッション追加、progress tracking event/usecase/受入基準）
- [x] UI/UX統合指針を更新（CTA優先順位の厳密化、OS文言規約、7日以上未達の主導線、`今日は重い` variant、progress tracking正式化）
- [x] 画面一覧文書を更新（SC-04/05/06/07/15/16/17/18/21、SF-01/02/03/04/08、SC-23/SC-24/SF-09とWF追加、遷移同期）
- [x] 企画書を更新（4モードの説明整合、状態別導線説明、progress tracking正式追記、`今日は重い`思想反映）
- [x] 4文書の語彙・CTA辞書を横断検証し、不一致表現を是正

## 2026-03-10: SC-10 / SC-21 仕様拡張（手入力表紙・保存後編集）

- [x] 画面定義書の SC-10 に「表紙画像を追加（任意）」を追加
- [x] 画面定義書の SC-21 を「保存後編集の主戦場」へ更新（表紙差し替え、タイトル/著者/ページ数修正、進捗設定、Focus Book 化）
- [x] 論理仕様書に Book 編集責務（表紙差し替え・書誌修正）の明示を追加
- [x] ユーザーストーリー定義書に「保存後編集」導線を反映

## 2026-03-10: 完了後フロー簡素化（自己進捗入力の縮小）

- [x] 画面定義書の SC-15/状態別出し分け/遷移を「追加セッション主導・読了分岐のみ」に更新
- [x] 論理仕様書の `progress_self_report` と `progress_self_reported` を `none|finished_book` 前提に縮小
- [x] 論理仕様書の完了後フロー・資産化ビュー・代表シーケンス・受入基準を新方針へ同期
- [x] ユーザーストーリーの US-09 を「前進感は入力不要」へ更新
- [x] UI/UX 統合指針に完了後フロー簡素化方針と copy 規約を追加
- [x] 異常系定義書の E-35/E-34 を読了保存失敗とフォールバック中心に更新
- [x] 企画書の完了後価値説明と progress tracking 役割分担を更新

## 2026-03-10: 金額換算廃止（完了後は前進フィードバックに統一）

- [x] 論理仕様書の `14.5 資産化ビュー` を `14.5 完了後フィードバック` へ置換
- [x] 論理仕様書から `DEFAULT_ASSET_VALUE_PER_PAGE_YEN` と金額推定ロジック記述を削除
- [x] 論理仕様書の受入基準・画面責務・最終要約の資産化表現を削除/置換
- [x] 画面定義 SC-15 に「金額換算を表示しない」備考を追記
- [x] UI/UX 統合指針に「完了後は金額換算を表示しない」を追記
- [x] 企画書の実行後方針に「金額換算なし」を追記

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

## 技術スタック

- Expo SDK 52 想定（現行安定版）
- 画面: React Navigation（執行画面を初期ルート）
- 状態: コンテキスト + ローカル永続化（過剰な状態ライブラリは入れない）

## MVPでやらないこと（企画書準拠）

- AI提案、複数カテゴリ、SNS、長文メモ、広告、高度な蔵書管理、複雑サブスク

## 2026-03-10: Detox smoke アンカー修正（FocusCore openLibrary）

- [x] `FocusCoreScreen` の常時表示 `openLibrary` 導線に `testID="focus-core-open-library"` を追加
- [x] `e2e/smoke.e2e.js` の assertion を `focus-core-open-library` へ変更
- [x] 差分を確認し、実行コマンド（`npm run e2e:build:ios` / `npm run e2e:test:ios`）を共有

## 2026-03-10: Detox smoke 安定化（accessibility + waitFor）

- [x] `focus-core-open-library` ボタンに accessibility 属性（`accessible`, `accessibilityRole`, `accessibilityLabel`）を追加
- [x] `e2e/smoke.e2e.js` を `waitFor(...).toBeVisible().withTimeout(...)` へ変更
- [x] `npm run e2e:test:ios` を再実行し結果確認

## 2026-03-10: Detox idle 待機詰まり回避（Smoke）

- [x] `e2e/smoke.e2e.js` で `device.disableSynchronization()` を使い初期可視確認を実施
- [x] `npm run e2e:test:ios` を再実行し結果確認

## 2026-03-11: E2E Batch 1 テスト設計書作成

- [x] `docs/testing/e2e_batch1_home.md` を新規作成し、指定された TC 一覧・testID・実装順・ギャップメモを記述

## 2026-03-11: E2E Batch 1 実装（HOME主要導線）

- [x] FocusCoreScreen に必要 testID を最小追加（primary/secondary/rehab/change-book/loading/init-error）
- [x] LibraryScreen に必要 testID を最小追加（screen/add-book/row/empty-state）
- [x] ActiveSessionScreen に mode 識別 testID を最小追加（screen/mode-15/5/3/1）
- [x] Detox テスト追加: `e2e/home.navigation.e2e.js`（TC-HOME-04）
- [x] Detox テスト追加: `e2e/home.session-start.e2e.js`（TC-HOME-01/02）
- [x] state injection 未整備の保留事項を `docs/testing/home-e2e-gap-notes.md` に記録（TC-HOME-06/07）
- [x] `npm run e2e:test:ios` で追加テストの実行結果を確認

## 2026-03-11: launchArgs state injection 実装（rehab）

- [x] iOS `reconcilePlans` に `launchArgs.e2e_state`（`rehab3`/`rehab7`）の強制適用を追加
- [x] Detox テスト追加: `e2e/home.rehab.e2e.js`（TC-HOME-06/07）
- [x] gap notes を更新（TC-HOME-06/07 の保留解除）
- [x] `npm run e2e:build:ios` と `npm run e2e:test:ios` を実行して確認

## 2026-03-11: E2E Batch 2 実装（Due Action Sheet / DUE-02〜08）

- [x] DueActionSheetScreen に testID 追加（sheet/start/5m/snooze）
- [x] test-only launchArgs bridge を追加し、app 内で SC-23 を deterministic に開ける導線を実装
- [x] due seed/state injection（normal/rehab3/restart7）を launchArgs で固定可能にする
- [x] Detox 追加: `e2e/due-action-sheet.e2e.js`（DUE-02/03/04/05/06/07 の実装可能分）
- [x] Detox 追加: `e2e/due-retry.e2e.js`（DUE-08 の実装可能分、難所は TODO 明記）
- [x] `docs/testing/due-e2e-gap-notes.md` を追加/更新（OS surface・clock・native harness 不足を整理）
- [x] `npm run e2e:build:ios` / `npm run e2e:test:ios` で確認

## 2026-03-11: FocusCore rehab CTA 可視性修正（ScrollView化）

- [x] `FocusCoreScreen` をスクロール可能に変更し、`focus-core-rehab-cta` に到達可能にする
- [x] `focus-core-screen` / 既存 CTA testID を維持し、必要最小限で `focus-core-scroll` を追加
- [x] 必要時のみ `home.rehab.e2e.js` に最小スクロール補助を追加
- [x] `npm run e2e:test:ios` で確認

## 2026-03-11: Detox 端末サイズ差分チェック

- [ ] 小さい iPhone シミュレータ（例: iPhone 16e）向け Detox configuration を追加
- [ ] 大きい iPhone（現行: iPhone 17 Pro Max）と小さい iPhone（例: iPhone 16e）の2構成を Detox 公式実行マトリクスとして定義
- [ ] 全 Detox テスト（`e2e/**/*.e2e.js`）を大きい iPhone 構成で実行
- [ ] 全 Detox テスト（`e2e/**/*.e2e.js`）を小さい iPhone 構成で実行
- [ ] 端末サイズごとの失敗差分を比較し、レイアウト依存の不安定テストを修正
- [ ] 端末サイズ依存で崩れる要素があれば `docs/testing/*-gap-notes.md` に追記

## 2026-03-11: DUE-08 基盤導入（Clock control / Scheduler probe）

- [x] `src/services/time/Clock.ts` を追加（`Clock` interface / `SystemClock` / `FakeClock`）
- [x] `src/services/notifications/NotificationSchedulerProbe.ts` を追加（pending schedule 参照用 interface/type）
- [x] `src/testHarness/runtimeOverrides.ts` を追加し、Clock と Scheduler の test override 導線を実装
- [x] 通知 scheduling 境界を service 化し、probe 対応の pending mirror state を追加（production 影響最小）
- [x] due/retry の時間依存評価ロジックを use case 層へ最小導入（response_timeout / retry_timer_fired / retry上限）
- [x] integration test 追加: `src/useCases/tests/DueRetryFlow.integration.test.ts`（最低3ケース）
- [x] `docs/testing/clock-and-scheduler-harness.md` を追加（使い方/対象範囲/残ギャップ）
- [x] `docs/testing/due-e2e-gap-notes.md` を更新（新基盤で解消した点と未解消点）
- [x] テスト実行（`npm run test`）で回帰確認

## 2026-03-11: gap-notes 全件解消（横断）

- [ ] `docs/testing/*-gap-notes.md` を棚卸しし、未解消項目を一覧化（E2E / integration / native acceptance に分類）
- [ ] app 内で解消可能な gap を優先実装（state injection / layout安定化 / testID不足 / clock/probe 接続）
- [ ] Detox 側で解消可能な gap を実装（launchArgs・複数端末マトリクス・scroll/visibility安定化）
- [ ] native acceptance 領域の gap を XCUITest 等の実施計画へ切り出し、境界を明文化
- [ ] 全 gap-notes を更新し、各項目を `resolved / in_progress / blocked` でステータス管理
