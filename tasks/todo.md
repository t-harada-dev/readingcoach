# 積読コーチ Expo アプリ 未完了タスク

最終更新: 2026-03-17（大規模整理実施）

> 完了済みタスクは `tasks/archive/todo-archive-2026-03.md` を参照。
> 現在の実行計画は `tasks/plans/current.md` を参照。

---

## 未実装機能

### フェーズ3: 希望の可視化
- [ ] 短期: 今月の実行回数・今読んでいる1冊の進捗
- [ ] 長期: 積読冊数と「今のペースなら○冊/月」の見込み（絶望より希望を優先した見せ方）

---

## 仕様・ドキュメント

### SC-14 実績定義の明確化（時間実績と進捗の分離）
- [ ] SC-14 文言を修正（「実績カウント対象」の曖昧語を「時間実績/継続実績」に置換）
- [ ] 論理仕様書へ指標分離を追記（`daily_result` / `continuity_credit` / `completed_reading_seconds` / `progress_delta` / `finished_book`）
- [ ] 時間集計ルール（15/5/3/1分加算、attempted 原則0、prep_success の例外）を仕様化
- [ ] ユーザーストーリー・異常系・UIUX 指針の該当文言を同期し、矛盾を解消

---

## テスト基盤

### Detox 端末サイズ差分チェック
- [ ] 小さい iPhone シミュレータ（例: iPhone 16e）向け Detox configuration を追加
- [ ] 大きい iPhone（現行: iPhone 17 Pro Max）と小さい iPhone の2構成をマトリクスとして定義
- [ ] 全 Detox テストを2構成で実行し、端末サイズごとの失敗差分を比較
- [ ] 端末サイズ依存で崩れる要素があれば `docs/testing/*-gap-notes.md` に追記

### gap-notes 全件解消
- [ ] `docs/testing/*-gap-notes.md` を棚卸しし、未解消項目を一覧化（E2E / integration / native acceptance に分類）
- [ ] app 内で解消可能な gap を優先実装（state injection / layout安定化 / testID不足 / clock/probe 接続）
- [ ] Detox 側で解消可能な gap を実装（launchArgs・複数端末マトリクス・scroll/visibility安定化）
- [ ] native acceptance 領域の gap を XCUITest 等の実施計画へ切り出し、境界を明文化

---

## インフラ・ビルド

### expo-config-plugins での Xcode ターゲット自動登録
- [ ] `withXcodeProject` 等で `Bridge/*.swift` / `PersistenceBridge.m` を自動登録し、`npx expo prebuild` 後の手動 Xcode 作業を不要にする

---

## todo.md 運用ルール

- 未完了（`- [ ]` を含む）トピックはこのファイルに残す
- 完了済み（`- [x]` のみ）トピックのみ `tasks/archive/todo-archive-2026-03.md` に退避する
- 現在の実行計画は `tasks/plans/current.md` に記入する（完了後は `tasks/plans/completed.md` へ）
