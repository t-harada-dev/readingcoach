# Onboarding / Book Batch 7 Gap Notes

## ONB-01〜06 で今回自動化できた範囲
- Detox
  - ONB-01: 検索成功 -> 候補保存 -> SC-02（時刻画面）
  - ONB-02: 検索0件 -> 手入力 -> SC-02
  - ONB-03: オフライン想定 -> 手入力 -> SC-02
  - ONB-04: 時刻保存 -> SC-03（通知案内）
  - ONB-05: 通知有効（app内モック許可）-> SC-04（FocusCore）
  - ONB-06: あとで/拒否 -> SC-04（FocusCore）

## BOOK-01〜09 で今回自動化できた範囲
- Detox
  - BOOK-01: 検索候補保存 -> 呼び出し元（Library）復帰
  - BOOK-02: timeout -> 手入力縮退
  - BOOK-03: 429/5xx -> 手入力縮退（429 を固定）
  - BOOK-04: 書影欠損候補（placeholder）保存
  - BOOK-05: Library から本追加画面へ遷移
  - BOOK-06: Library 一覧から BookDetail 遷移
  - BOOK-07: BookDetail で Focus 化 -> ホーム復帰
  - BOOK-08: BookDetail で current page 更新
  - BOOK-09: BookDetail で title/author/pageCount 更新

## integration / Detox / native acceptance の分担
- Detox
  - ONB-01〜06
  - BOOK-01〜09（検索縮退・Library遷移・BookDetail更新）
- integration
  - `runBookSearchUseCase` の mode 切替（success/empty/timeout/429/5xx/offline）
  - stale snapshot / canonical state 優先の挙動は既存 SUR/ABN integration 群で担保
- native acceptance
  - 通知権限システムダイアログの実UI押下
  - 実デバイス上の検索API実通信品質（RTT/帯域/制限）

## 通知権限UIの扱い
- iOS システム権限ダイアログの押下自体は Detox 対象外
- app 内では `e2e_notification_permission=allowed|denied` で deterministic に代替
- native acceptance では実権限UIの挙動を別途確認

## 検索APIモックの設計
- `runBookSearchUseCase` で launchArgs を参照
  - `e2e_book_search_mode=success|empty|timeout|429|5xx|offline`
  - `e2e_book_candidate_placeholder=1` で書影欠損候補を返す
- screen 層には business rule を持ち込まず、検索結果/失敗だけを受けて画面状態を切替

## placeholder / 0件 / timeout / 429 の扱い
- placeholder: 候補保存を許可（登録阻害しない）
- 0件: 手入力画面へ遷移
- timeout/429/5xx/offline: 手入力へ縮退して主導線継続
- 検索障害は「検索機能のみ劣化」であり、読書開始導線は停止させない

## 保留ギャップ
- 429 と 5xx は同一の縮退動作（手入力遷移）として実装済みだが、Detox ケースは代表値として 429 を固定。5xx 専用ケース追加は次バッチ候補。
- Detox 実行環境で `toBeVisible` が不安定な箇所は `toExist` + retry 待機へ寄せて安定化。実UI可視性の最終保証は native acceptance で補完。
