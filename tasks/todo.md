# 積読コーチ Expo アプリ実装計画

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
- [ ] 未開始時の再通知（最大2回程度、責めすぎない文言）

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

## 技術スタック

- Expo SDK 52 想定（現行安定版）
- 画面: React Navigation（執行画面を初期ルート）
- 状態: コンテキスト + ローカル永続化（過剰な状態ライブラリは入れない）

## MVPでやらないこと（企画書準拠）

- AI提案、複数カテゴリ、SNS、長文メモ、広告、高度な蔵書管理、複雑サブスク
