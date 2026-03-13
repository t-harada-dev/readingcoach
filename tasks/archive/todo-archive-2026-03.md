# todo archive (2026-03)


## Archived on 2026-03-12


## 2026-03-12: Screen Catalog 追加画面実装（SC-05/12/14/15/20/21）

- [x] 既存 Screen/View 実装を調査し、再利用可能な View を確定（SC-14/15 は CompletionView 共通利用）
- [x] fixture を拡張（books/scenarios + 必要最小の session/library fixture）
- [x] adapter を追加（SC-05/12/14/15/20/21）
- [x] types/screenRegistry/scenarioRegistry を拡張し、6画面を Catalog に登録
- [x] `npm run typecheck` と `npm test -- src/dev/screenCatalog/screenCatalog.test.ts` を実行


## 2026-03-11: Screen Catalog 視認性改善（最小差分）

- [x] Playground header を compact デフォルト + 詳細トグルへ変更
- [x] Playground 表示時にフローティング CATALOG ボタンを非表示化
- [x] SC-04 fixture の現実化（書名/著者/補助文）
- [x] SC-06 rehab / due の視覚差強化（fixture + adapter）
- [x] SC-07 の圧迫感軽減（タイポ/余白）
- [x] `npm run typecheck` と `npm test -- src/dev/screenCatalog/screenCatalog.test.ts` を実行


## 2026-03-11: Screen Catalog 差分監査と最小修正

- [x] 既存 `src/dev/screenCatalog`（registry/scenario/catalog/playground）を要件差分監査
- [x] 要件未達箇所のみ最小変更で修正（本番ルート非破壊を優先）
- [x] `npm run typecheck` と `npm test -- src/dev/screenCatalog/screenCatalog.test.ts` で検証
- [x] 監査結果・変更点・完了判定を報告
- [x] 既存基盤が存在するため、まず差分監査を行い、要件未達が確認できた箇所のみを最小変更で修正すること。不要な新規ディレクトリ作成や重複実装は禁止。


## 2026-03-11: リグレッションテスト実施

- [x] `npm run check`（`npm test` + `npm run typecheck`）を実行
- [x] 実行ログと exit code を確認して結果を報告


## 2026-03-11: 既存 typecheck エラー2件修正（テストモック型）

- [x] `FinishedBookFailure.integration.test.ts` の `saveBook` モックを引数付き呼び出しと整合させる
- [x] `StartSessionUseCase.integration.test.ts` の `resolveStart` 呼び出しを型安全に修正
- [x] `npm run typecheck` を再実行し、exit code 0 を確認


## 2026-03-11: BookSearchUseCase 型不整合修正（レビュー指摘対応）

- [x] `mapGoogleBooksItems` の map/filter を型整合する実装へ修正
- [x] `npm test -- src/useCases/BookSearchUseCase.test.ts` と `npm run typecheck` を実行して結果確認（当時は既存の別ファイル2件で失敗、後続タスクで解消）


## 2026-03-11: AddBookScreen 小規模リファクタ

- [x] 手入力保存 / 候補保存の重複している保存ハンドリング（saving制御・error表示・遷移）を共通化
- [x] レイアウト崩れを伴う手入力セクションのインデントを整理し、`npm test` で回帰確認


## 2026-03-11: Google Books API 連携（AddBook検索）

- [x] 既存 `runBookSearchUseCase` のモック分岐を維持しつつ、通常時は Google Books API を呼ぶ実装へ切替
- [x] Google Books レスポンスを `BookSearchCandidate` へ正規化（title/author/pageCount/thumbnail/google id）
- [x] 失敗ケース（timeout/429/5xx/offline）を既存エラーコードにマップして導線互換を維持
- [x] ユースケーステストを追加し、モック分岐・実API分岐・エラーマッピングを検証
- [x] `npm test` で回帰確認


## 2026-03-11: E2E終了時のSimulator自動停止

- [x] 現行 `e2e:test:ios` 実行経路を確認し、終了時クリーンアップ方針を確定
- [x] Detox 標準 `--cleanup` オプション採用へ方針変更（ラッパー不要）
- [x] `app/package.json` の `e2e:test:ios` を `detox test -c ios.sim.debug --cleanup` に切り替え
- [x] `npm run e2e:test:ios -- --help` でオプション経由の実行確認


## 2026-03-11: Batch 8 Completion 残ギャップ対応と完走確認

- [x] 既存 Completion 系 E2E / integration 実装を確認し、TC-CMP-01N/01R/07I/09F/10E の未充足差分を確定
- [x] 必要最小限のテスト実装・安定化修正（E2E: 01N/01R/10E、integration: 07I/09F）を追加
- [x] `docs/testing/completion-final-gap-notes.md` を追加し、今回の自動化範囲と残ギャップを記録
- [x] `npm run e2e:build:ios` / `npm run e2e:test:ios` / `npm test` を実行して結果を確定


## 2026-03-11: Batch 8 残件クローズ（CMP）

- [x] TC-CMP-10E を「SC-19確定後にホーム表示 + FocusCore次本反映」まで E2E で安定化
- [x] 読了保存失敗時の UI リカバリ導線（メッセージ可視化または再試行導線）の自動化を追加
- [x] `docs/testing/completion-final-gap-notes.md` を更新し、残ギャップを再判定
- [x] `npm run e2e:build:ios` / `npm run e2e:test:ios` / `npm test` で回帰確認


## 2026-03-11: DRYリファクタリング（俯瞰改善）

- [x] 重複棚卸し結果に基づき、リファクタ対象を 2 系統に限定（Completion系E2E helper / settings保存デフォルト埋め）
- [x] `app/e2e/helpers` に Completion 共通 helper を新設し、重複している E2E（completion/progress/finished/next-focus）を置換
- [x] settings 保存の共通化 helper を導入し、`ProgressTrackingUseCases` / `UpdateDailyTargetTimeUseCase` / `OnboardingTimeScreen` / `BookDetailScreen` の重複ロジックを置換
- [x] 影響範囲テストを実行して回帰確認（`npm run e2e:test:ios -- e2e/completion-flow.e2e.js e2e/finished-book.e2e.js e2e/progress-optin.e2e.js e2e/next-focus-visible.e2e.js` / `npm test`）


## 2026-03-11: Batch 9 Native Acceptance / Release Readiness 整理

- [x] 既存 gap note（SUR/ABN/ONB/BOOK）との対応表を作成し、TC-SUR/ABN/ONB/BOOK-NA を checklist へ統合
- [x] `docs/testing/native-acceptance-checklist.md` を追加（前提/手順/期待結果/blocker判定/証跡/triage）
- [x] `docs/testing/release-readiness-matrix.md` を追加（レイヤ・実装状態・blocker・代替確認・owner）
- [x] `docs/testing/native-acceptance-gap-notes.md` を追加（自動化境界と最終受入の線引き）
- [x] 可能な最小 XCUITest 雛形を追加（`app/ios/appUITests/AcceptanceSmokeUITests.swift` / `app/ios/appUITests/InterruptionHandling.swift`）
- [x] production コード非変更を確認し、作成物の実施順序・blocker一覧を報告


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


## Archived on 2026-03-12 (keep-10 trim)


## 2026-03-12: run-ios.sh を Expo 依存から xcodebuild/simctl へ切替

- [x] `run-ios.sh` を `xcodebuild + simctl` ベースへ置換（Debug固定、Metro 8081既存利用）
- [x] `run-ios.sh` に引数対応を追加（無指定: 自動選択 / 指定: 厳密一致）
- [x] 失敗時終了コードを固定（2: simulator解決, 3: build, 4: Metro未起動, 5: install/launch）
- [x] `bash -n run-ios.sh` を実行
- [x] `cd app && npm run typecheck` を実行
- [x] `cd app && npm test -- src/dev/screenCatalog/screenCatalog.test.ts` を実行
