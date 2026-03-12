# Core 10 UI Snapshot Design

更新日: 2026-03-12

## 目的

- 自動スクリーンショットの対象を 10 画面に固定する。
- `Screen Catalog`（手動レビュー）と回帰証跡（Detox snapshot）を分離する。
- 10画面の欠落を `manifest check` で機械検出する。

## スコープ（固定）

対象は次の 10 画面のみ。

- `SC-04` normal
- `SC-05` heavy_day
- `SC-06` rehab
- `SC-07` long_absence
- `SC-12` normal
- `SC-14` rehab
- `SC-15` rehab
- `SC-20` normal
- `SC-21` normal
- `SC-23` due

本設計では `SC-01..03/08..11/13/16..19/22/24` と `SF-*` は対象外。

## 正本ファイル

- `app/e2e/snapshots/snapshotTargets.json`（10画面ターゲット定義）
- `app/e2e/snapshots/uiSnapshotManifest.v1.json`（運用メタ情報）
- `app/scripts/check-ui-snapshot-manifest.js`（整合チェック）

## ルール

1. `uiSnapshotManifest.v1.json` の `targetId` は `snapshotTargets.json` と 1:1 一致させる。
2. `baseline` は全件 `true`。
3. `status` は全件 `implemented`。
4. `captureMode` は `detox_flow` または `detox_injected` のみ。
5. 10画面以外を自動snapshot対象に追加する場合は、別タスクで明示合意する。

## 実行コマンド

```bash
cd app
npm run e2e:snapshot:manifest:check
npm run e2e:capture:flows
```

## Release Gate 連携

- Gate-SNAP-1: `npm run e2e:snapshot:manifest:check` が exit code 0
- Gate-SNAP-2: `npm run e2e:capture:flows` が exit code 0
