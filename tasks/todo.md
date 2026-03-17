# 積読コーチ — 未完了タスク一覧

最終更新: 2026-03-17

> 完了済みタスクは `tasks/archive/todo-archive-2026-03.md` に退避済み。
> 実行計画は `tasks/plans/current.md` / `tasks/plans/completed.md` を参照。

---

## 未完了: リリース前残件

### テスト・品質

- [ ] SC-04/06 の実コンポーネントテストを追加（vitest runner 分離が前提）
- [ ] Detox 小画面マトリクス（iPhone 16e 等）の追加と差分確認
- [ ] `docs/testing/*-gap-notes.md` の未解消項目を棚卸し・ステータス管理
- [ ] CI 統合: `e2e:test:ios` を GitHub Actions で安定実行（Detox ビルド + テスト）

### 仕様・ドキュメント

- [ ] SC-14 文言修正（「実績カウント対象」→「時間実績/継続実績」に分離）
- [ ] 論理仕様書へ時間集計ルール（15/5/3/1分加算、prep_success 例外）を追記

### 機能（バックログ）

- [ ] フェーズ3 — 希望の可視化: 今月の実行回数 + 進捗ペース表示
- [ ] expo-config-plugins で Bridge/*.swift を自動登録（再現性向上）

---

## todo.md 運用ルール

- 未完了（`- [ ]` を含む）トピックは `tasks/todo.md` に残す
- 完了済み（`- [x]` のみ）トピックのみ `tasks/archive/*.md` に退避する
- `todo.md` の肥大化を防ぐため、完了トピックの退避は定期的に実施する
