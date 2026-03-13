# Full SC/SF UI Snapshot Design

更新日: 2026-03-13

## 目的

- 自動スクリーンショット対象を `SC+SF` 全件へ拡張する（`SC-08` は archived）。
- 画面定義書の画像正本を `docs/screen-spec/assets/screenshots/**` に固定する。
- Detox（SC）と native capture（SF）を同一 manifest で管理する。

## スコープ

対象:

- SC: `SC-01..24`（`SC-08` は archived で収集対象外）
- SF: `SF-01..09`

除外:

- archived 画面（現在は `SC-08`）

## 正本ファイル

- `docs/screen-spec/data/screen-index.json`（画面定義のインデックス正本）
- `app/e2e/snapshots/snapshotTargets.json`（収集ターゲット定義）
- `app/e2e/snapshots/uiSnapshotManifest.v1.json`（運用メタ情報）
- `app/scripts/check-ui-snapshot-manifest.js`（整合チェック）

## 収集モード

- `detox_flow`: 通常導線で遷移して取得
- `detox_injected`: launch args で状態注入して取得
- `xctest_simctl`: iOSネイティブ収集（`xcodebuild` + `simctl screenshot`）

## ルール

1. `uiSnapshotManifest.v1.json` の `targetId` は `snapshotTargets.json` と 1:1 一致させる。
2. `manifest.entries[].baseline` は全件 `true`。
3. `manifest.entries[].status` は全件 `implemented`。
4. `captureMode` は `detox_flow` / `detox_injected` / `xctest_simctl` のみ許可。
5. 画像正本は `docs/screen-spec/assets/screenshots/**` へ同期し、`screen-index.json` を更新する。

## 実行コマンド

```bash
cd app
npm run e2e:snapshot:manifest:check
npm run e2e:capture:docs
npm run docs:screen-spec:refresh
```

## Release Gate 連携

- Gate-SNAP-1: `npm run e2e:snapshot:manifest:check` が exit code 0
- Gate-SNAP-2: `npm run e2e:capture:docs` が exit code 0
- Gate-SNAP-3: `npm run docs:screen-spec:refresh` 実行後、`screen-index.json` の `missing` が 0
