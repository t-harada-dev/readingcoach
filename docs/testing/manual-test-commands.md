# 手動テスト起動コマンド集

## 前提

- 実行ディレクトリ: `app`
- 例:

```bash
cd /Users/haradatakashi/Developer/readingcoach/readingcoach/app
```

## 基本チェック（Unit / Typecheck）

```bash
npm run test
npm run typecheck
npm run check
```

## iOS E2E（Detox）

### 生成物の整理（保持数コントロール）

```bash
npm run e2e:artifacts:prune
```

- `artifacts/` 配下を新しい順で 10 件だけ残し、古い run を削除
- `e2e:test:ios` / `e2e:capture:flows` / `e2e:capture:docs` 実行時にも自動で実行

### `waitForActive` ハング時の復旧手順

```bash
xcrun simctl terminate booted com.anonymous.app || true
xcrun simctl shutdown booted || true
xcrun simctl boot "iPhone 17 Pro Max"
```

- 上記実行後に対象スイートを個別実行し、最後に `npm run e2e:test:ios` を再実行
- 通知許可ポップアップ検証は Detox ではなく XCUI 側を使用する

### ビルド

```bash
npm run e2e:build:ios
```

### 全E2E実行

```bash
npm run e2e:test:ios
```

### 画面定義向けスクリーンショット取得（SC+SF 全対象）

```bash
# target / manifest 整合チェック
npm run e2e:snapshot:manifest:check

# SC(Detox) + SF(native capture) + surface-os(widget/intent)
npm run e2e:capture:docs

# docs/screen-spec/assets へ正本同期
npm run docs:screen-spec:refresh
```

### Detoxのみ（SCフロー）

```bash
npm run e2e:capture:flows
```

### native surface（OS配置キャプチャ）

```bash
npm run e2e:capture:sf:native
npm run e2e:capture:surface:os
```

### XCUI（通知権限）

```bash
# PR向け短縮セット（1,2,3）
npm run e2e:xcui:permission:short

# Nightly / release 前の全8ケース
npm run e2e:xcui:permission:full
```

### デバッグログ付き実行

```bash
npm run e2e:build:ios:debug
npm run e2e:capture:flows:debug
```

## 個別E2E実行

共通フォーマット:

```bash
npx detox test -c ios.sim.debug e2e/<test-file>.e2e.js -- --watchman=false
```

主要ケース:

```bash
npx detox test -c ios.sim.debug e2e/smoke.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/home.navigation.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/home.session-start.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/home.rehab.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/due-action-sheet.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/due-retry.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/completion-flow.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/completion-return.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/progress-optin.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/surface-notification.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/surface-widget.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/surface-app-intent.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/onboarding-flow.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/add-book-flow.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/book-missing-fallback.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/library-detail.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/session-completion-consistency.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/next-focus-visible.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/finished-book.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/finished-book-recovery.e2e.js -- --watchman=false
npx detox test -c ios.sim.debug e2e/widget-fallback.e2e.js -- --watchman=false
```

## Screen Catalog（手動レビュー専用）

- `Screen Catalog` は手動レビュー時の画面確認/操作に限定する
- 画面定義書向けの自動スクリーンショット取得は `e2e:capture:docs` を使用する

## 補助コマンド（iOSアプリ起動）

リポジトリルートで実行:

```bash
./run-ios.sh
./run-ios.sh "iPhone 17 Pro Max"
```

Windows:

```bat
run-ios.bat
```
