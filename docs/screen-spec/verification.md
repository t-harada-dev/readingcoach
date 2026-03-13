# Screen Spec Verification Guide

`docs/screen-spec/index.html` の表示確認手順です。  
特に「definition本文（markdown原文）のインライン表示」を確認する場合は、`file://` ではなくローカルサーバー経由で開いてください。

## 1. 直開き確認（file://）

用途: 一覧、検索、フィルタ、画像表示の簡易確認

1. Finder などから `docs/screen-spec/index.html` を直接開く
2. 画面一覧が表示されることを確認する
3. 任意の SC/SF を選び、画像が表示されることを確認する

制約:
- `definition` のインライン本文は表示されません（仕様）

## 2. インライン本文確認（推奨）

用途: `definition` markdown本文のインライン表示を含む完全確認

1. ターミナルで以下を実行する

```bash
cd /Users/haradatakashi/Developer/readingcoach/readingcoach/app
npm run docs:screen-spec:preview
```

2. ブラウザで以下を開く

```text
http://127.0.0.1:4173/
```

3. 任意の SC/SF を選び、右ペインの `definition` 本文が表示されることを確認する

## 3. 便利なハッシュ遷移

- `http://127.0.0.1:4173/#SC-21`
- `http://127.0.0.1:4173/#SF-04`

上記のように `#ID` を付けると対象画面を直接開けます。
