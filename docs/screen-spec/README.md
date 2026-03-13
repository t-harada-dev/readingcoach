# Screen Spec Asset Guide

このディレクトリは、画面定義書とスクリーンショット正本を分離管理するための専用領域です。

## 構成

- `index.html`
  - 人間向けエントリーポイント（一覧・検索・詳細表示）
- `verification.md`
  - `index.html` 表示確認手順（`file://` とローカルサーバー確認の違い）
- `data/screen-index.json`
  - 機械可読の正本インデックス
  - 必須フィールド: `id`, `type`, `status`, `definitionPath`, `imagePath`, `captureId`
- `data/screen-index.js`
  - `index.html` の直開き（`file://`）用に配布する埋め込みインデックス
  - `window.__SCREEN_SPEC_INDEX__` として同内容を公開
- `definitions/sc/*.md`
  - SC 画面定義書
- `definitions/sf/*.md`
  - SF 画面定義書
- `definitions/archive/SC-08.md`
  - 廃止画面（履歴専用）
- `assets/screenshots/sc/*.png`
  - SC 実画面スクリーンショット正本
- `assets/screenshots/sf/*.png`
  - SF 実画面スクリーンショット正本
- `assets/screenshots/archive/*.png`
  - アーカイブ画像

## 更新フロー

1. スクリーンショット収集

```bash
cd /Users/haradatakashi/Developer/readingcoach/readingcoach/app
npm run e2e:capture:docs
```

2. 必要に応じて定義メタ再生成

```bash
cd /Users/haradatakashi/Developer/readingcoach/readingcoach/app
npm run docs:screen-spec:sync-metadata
```

3. 画像正本化 + index同期（最後に実行）

```bash
cd /Users/haradatakashi/Developer/readingcoach/readingcoach/app
npm run docs:screen-spec:refresh
```

このコマンドで `screen-index.json` と `screen-index.js` の両方が再生成されます。

4. definition本文インライン表示の確認（任意）

```bash
cd /Users/haradatakashi/Developer/readingcoach/readingcoach/app
npm run docs:screen-spec:preview
```

## 注意

- `app/artifacts/` は prune 対象で永続保存されません。
- 画面イメージの正本は必ず `docs/screen-spec/assets/screenshots/**` に保存します。
- `SC-08` は archived 固定（新規実装・自動収集対象外）です。
- `npm run e2e:capture:sf:native` は `appUITests` target が存在しない場合、`xcodebuild build` にフォールバックして `simctl screenshot` を実行します。
- `index.html` は `file://` 直開きでも一覧表示できます（definition本文のインライン表示はローカルサーバー経由時のみ）。
