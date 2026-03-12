# Screen Catalog 全画面化 実行計画（2026-03-12）

## 目的

- 現在の Screen Catalog が Core10（10画面）固定であり、アプリ画面の全量網羅ではない状態を明文化する。
- 全画面化を次バッチで迷いなく実装できるよう、差分・優先順位・必要シナリオ・段階導入を決定済みにする。

## 1. 正本との差分（画面一覧/遷移定義 vs 現manifest）

正本参照: `docs/積読コーチ 画面一覧 兼 画面遷移 兼 画面定義.md`  
現manifest: `app/src/dev/screenCatalog/screenCatalogManifest.json`

### 現在 manifest に含まれる画面（Core10）

- SC-04, SC-05, SC-06, SC-07, SC-12, SC-14, SC-15, SC-20, SC-21, SC-23

### 未収載の SC 画面

- SC-01, SC-02, SC-03
- SC-09, SC-10, SC-11
- SC-13, SC-16, SC-17, SC-18, SC-19
- SC-22, SC-24

補足:
- SC-08（Focus Book Picker）は 2026-03-12 の導線整理で廃止し、SC-20（Library）へ統合。

### 未収載の SF 画面（Surface 系）

- SF-01, SF-02, SF-03, SF-04
- SF-05, SF-06, SF-07, SF-08, SF-09

## 2. 追加候補の優先順位

優先判断軸:
- 日次導線での操作頻度（ユーザー操作導線）
- 障害時の影響度（デグレ時のリスク）
- E2E/fixture化の実現可能性

### Priority 1（次バッチ必須）

- SC-01/02/03（初回導線）
- SC-09/10/11（本追加導線）
- SC-16/17（進捗案内・進捗入力）
- SC-19（読了後の次本指名）

### Priority 2（続くバッチで追加）

- SC-18（追加セッション選択）
- SC-22（時刻変更）

### Priority 3（運用設計と合わせて追加）

- SC-13/24（Active Session 3分/5分バリアント）
- SF-01..09（Widget/通知/Live Activity/App Intents）

## 3. 画面ごとの必要シナリオ・fixture要件

全画面化の最小要件:
- 各画面に `defaultScenario` を1つ定義
- 分岐画面は最低2シナリオ（normal + 例外/縮退）を付与
- 画面内でデータ有無差分がある場合は `empty` / `no_cover` などを追加

画面群別の必須シナリオ:
- オンボーディング群（SC-01/02/03）: `normal`（初回）/ `already_has_data`（再訪）
- 本追加群（SC-09/10/11）: `normal` / `timeout_or_error` / `no_result`
- 完了後分岐群（SC-16/17/18/19）: `normal` / `rehab` / `finished_book`
- Surface 群（SF-*）: `normal` / `rehab`（少なくとも開始導線差分）

fixture要件:
- Book fixture: 書影あり/なし、ページ情報あり/なし、status差分
- Plan fixture: `scheduled` / `due` / `finalized`
- Session fixture: 1m/3m/5m/15m の表示差分を再現可能

## 4. 段階導入（Phase 1/2/3）と受け入れ条件

### Phase 1: SC 全画面化（Onboarding + AddBook + Completion分岐）

作業:
- `screenCatalogManifest` / `types.ScreenId` / `screenRegistry` を拡張
- 追加画面の adapter/fixture を実装
- `screenCatalog.test.ts` の manifest整合テストを更新

受け入れ条件:
- 追加した SC 画面が Catalog で描画できる
- `npm run typecheck` が pass
- `npm test -- src/dev/screenCatalog/screenCatalog.test.ts` が pass

### Phase 2: SC バリアント補完 + シナリオ統一

作業:
- SC-13/24 等のバリアント画面を追加
- `scenarioRegistry` を拡張し、ラベル/説明を揃える
- 既存画面の不足シナリオ（例: progress_off）を補完

受け入れ条件:
- 追加シナリオが Playground で選択可能
- manifest と registry のシナリオ整合が維持される

### Phase 3: SF 画面の可視化方針確定・反映

作業:
- SF を Catalog でどう表現するか（静的モック/プレビューコンテナ）を定義
- SF 用 adapter/fixture を追加
- 自動snapshotとの責務分離を docs に明記

受け入れ条件:
- SF 画面が少なくとも1シナリオで可視化可能
- Core10 自動snapshot運用を壊さない（現行 gate 維持）
