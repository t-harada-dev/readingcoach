# E2E Debug Log Template

目的:
- E2E 失敗時に、一次切り分けに必要な情報を最小漏れで共有する。

## 1. 実行コマンド

```bash
cd app
npm run e2e:build:ios:debug
npm run e2e:capture:flows:debug
npx detox test -c ios.sim.debug e2e/snapshots/home-snapshots.e2e.js -- --watchman=false
```

## 2. 添付するログファイル

- `/tmp/e2e-build-ios.log`
- `/tmp/e2e-flow-snapshots.log`
- （存在する場合）`app/artifacts` または `artifacts` 配下の該当スクリーンショット

## 3. 報告テンプレート

```md
### 実行日時
- YYYY-MM-DD HH:mm (TZ)

### 実行環境
- macOS:
- Xcode:
- Node:
- npm:

### 実行結果
1. npm run e2e:build:ios:debug
- exit code:
- 失敗箇所（要約）:

2. npm run e2e:capture:flows:debug
- exit code:
- 失敗箇所（要約）:

3. npx detox test -c ios.sim.debug e2e/snapshots/home-snapshots.e2e.js -- --watchman=false
- exit code:
- suite/test fail 件数:

### 主要エラー抜粋
```text
（ここに 20〜60 行程度を貼る）
```

### 備考
- 再現率:
- 直前変更:
```

## 4. 判定の目安

- 環境エラー:
  - `CoreSimulatorService connection became invalid`
  - `xcrun simctl list devices failed`
- 設定エラー:
  - workspace 未検出 / 複数検出
- テスト実装エラー:
  - `TOBEVISIBLE` timeout
  - testID 解決失敗
