# Completed Plans Log

## 2026-03-13

### Screen Spec 確認手順の可視化（index導線 + 実行コマンド）

- `docs/screen-spec/verification.md` を追加し、`file://` 確認とローカルサーバー確認手順を分離して記載。
- `docs/screen-spec/index.html` のヘッダに確認手順リンクと preview コマンドを追加。
- `app/scripts/serve-screen-spec.sh` と `npm run docs:screen-spec:preview` を追加。
- 実行検証:
  - `cd app && npm run docs:screen-spec:preview` で `http://127.0.0.1:4173/` の待受開始を確認。
  - 停止は `Ctrl+C` を確認。

### 画面定義書再編の完了確認 + 直開き表示復旧 + 計画永続化運用

- 現状監査を実施し、`index.html` 空表示の主因を `file://` 上の `fetch` 依存と特定。
- `tasks/plans/current.md` / `tasks/plans/completed.md` を追加し、最新計画と完了済み計画を分離。
- `docs/screen-spec/index.html` を `screen-index.js` 優先読込へ変更し、直開き時も一覧表示可能に修正。
- `app/scripts/sync-screen-spec-metadata.js` / `app/scripts/refresh-screen-spec-assets.js` を更新し、`screen-index.json` と `screen-index.js` を同時再生成。
- `cd app && npm run docs:screen-spec:refresh` を再実行し、SC/SF 正本画像を再同期（copied=32, missing=0）。
- 検証:
  - `cd app && npm run e2e:snapshot:manifest:check`（exit code 0, required=32, implemented=32）
  - `cd app && npm run typecheck`（exit code 0）

### E2E回帰 + docs capture 復旧（全回帰+docs）

- `tasks/todo.md` の `2026-03-13: E2E回帰 + docs capture 復旧（全回帰+docs）` セクションを完了ログとして参照。
- 検証ログ（exit code / failed suites/tests）は同セクション記録を正とする。

### 画面定義書再編 + 全対象スクリーンショット基盤（SC+SF）

- `tasks/todo.md` の `2026-03-13: 画面定義書再編 + 全対象スクリーンショット基盤（SC+SF）` セクションを完了ログとして参照。
- 追加運用の進捗はこのファイルに「日付 + 計画名」で追記する。
