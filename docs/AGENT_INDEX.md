# AI Agent Project Index

このファイルは、AIエージェントが最短で正しいコンテキストに到達するための索引です。  
「どこを読むべきか」「どこを編集してよいか」「どこが正本か」を先に固定します。

## 1. 最初に読む順番（推奨）

1. `AGENTS.md`  
2. `tasks/lessons.md`  
3. `tasks/todo.md`  
4. `docs/積読コーチ_論理仕様書_v1.md`（ドメイン正本）  
5. `docs/積読コーチ 画面一覧 兼 画面遷移 兼 画面定義.md`（画面/遷移正本）  
6. `app/App.tsx`（ナビゲーション入口）  
7. `app/src/domain/*` と `app/src/useCases/*`（業務ロジック）

## 2. 正本の定義

- ドメイン仕様: `docs/積読コーチ_論理仕様書_v1.md`
- 画面ID/遷移: `docs/積読コーチ 画面一覧 兼 画面遷移 兼 画面定義.md`
- 画面定義書/画面画像正本: `docs/screen-spec/index.html`（データ正本: `docs/screen-spec/data/screen-index.json`）
- UI/UX原則: `docs/積読コーチ_UIUX統合指針_20260309.md`
- 実装進捗と未完: `tasks/todo.md`
- 再発防止メモ: `tasks/lessons.md`

仕様矛盾がある場合は、まず `論理仕様書 -> 画面定義 -> UIUX指針` の順で解決する。

## 3. ディレクトリ索引（何があるか）

### 3.1 ルート

- `.github/workflows/`  
  CI設定。`app-check.yml` が自動検証の入口。
- `docs/`  
  仕様書、企画書、画面モック。コード変更前の根拠。
- `tasks/`  
  タスク計画/進捗/教訓。
- `app/`  
  実アプリ本体（Expo + React Native + iOSネイティブ橋渡し）。

### 3.2 app/（実装本体）

- `app/App.tsx`  
  画面遷移スタック定義（Screen登録の正本）。
- `app/src/screens/`  
  画面コンポーネント（SC-xx対応）。  
  `screenPolicy.ts` は画面ID/CTA順序の仕様固定ロジック。
- `app/src/domain/`  
  純粋関数のポリシー層（副作用なし）。  
  例: `homeActionPolicy.ts`, `entryRoutePolicy.ts`
- `app/src/useCases/`  
  ユースケース層（副作用あり）。Bridge呼び出しを仲介。
- `app/src/bridge/`  
  Native module境界。`PersistenceBridge`, `NotificationBridge`, `LiveActivityBridge`
- `app/src/config/copy.ts`  
  UI文言の集約先。
- `app/src/notifications.ts`  
  Expo通知管理（予約/再通知/取消）。
- `app/src/app/NotificationResponseCoordinator.tsx`  
  通知応答を画面遷移へ接続する調停点。
- `app/ios/`  
  iOSネイティブ実装（Swift/ObjC, SwiftData, Xcode project）。
- `app/scripts/`  
  サンドボックス向け実行スクリプト。  
  `check-sandbox.sh` が Node同梱 + test + typecheck を実行。

### 3.3 tests の配置ルール（現状）

- ドメイン/ユースケース: `*.test.ts`（Vitest/node）
- 画面: `app/src/screens/*.test.ts`（現状はロジック/構成寄りの軽量テスト中心）
- 統合: `app/src/useCases/SessionFlow.integration.test.ts`

## 4. よく使う実行コマンド

`app/` で実行:

- `./scripts/check-sandbox.sh`  
  ローカル同梱 Node で `npm ci -> npm run check`
- `npm run test`  
  Vitest
- `npm run typecheck`  
  TypeScriptチェック
- `npm run check`  
  test + typecheck

## 5. 編集対象/非対象の目安

### 編集してよい（通常）

- `app/src/**`
- `docs/**`
- `tasks/**`
- `.github/workflows/**`

### 原則直接編集しない

- `app/node_modules/**`
- `app/.tools/**`（ローカル同梱Nodeのキャッシュ）
- `app/ios/Pods/**`, `app/ios/build/**`
- `.DS_Store`

## 6. 変更時チェックリスト（AI向け）

1. `tasks/lessons.md` を先に読む  
2. `tasks/todo.md` に作業項目を追加/更新  
3. 仕様変更なら `docs` を先に更新  
4. 実装後に `./scripts/check-sandbox.sh` 実行  
5. `todo.md` の完了チェックを更新  
6. 影響範囲を最終報告（できた/できない/要判断）
