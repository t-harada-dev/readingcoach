# Home E2E Gap Notes

更新日: 2026-03-11

## 解消済み TC

- TC-HOME-06（SC-06 / continuous_missed_days = 3）
- TC-REHAB-01（SC-06 / 「3分再開」非表示）

## 対応内容

- iOS `PersistenceStore.reconcilePlans` に `launchArgs.e2e_state` を実装。
- `e2e_state=rehab3` で `continuousMissedDays=3` を強制し、SC-06 を deterministic に再現。
- `e2e/home.rehab.e2e.js` で TC-HOME-06 / TC-REHAB-01 を自動化。

## 利用可能な launchArgs

- `e2e_state=rehab3`
- `e2e_state=rehab7`
- `e2e_state=heavy_day`（SC-05 再現用）

## 残課題

- なし（本ファイルで管理していた保留 TC は解消済み）
