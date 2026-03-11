# Abnormal Batch 6 Gap Notes

## ABN-02〜12 で今回自動化できた範囲
- integration
  - ABN-02: 通知期待集合に不足がある場合の不足再構築
  - ABN-03: 同一目的通知の重複収束（stable key: `kind + planId`）
  - ABN-04: stale 通知 planId を信頼せず reconcile 後の当日 plan へ解決
  - ABN-09: 当日 plan 欠損時の補完生成（catch-up usecase）
  - ABN-10: 04:00 ロールオーバー前後の catch-up（fake clock）
- Detox / app harness
  - ABN-05: stale widget 相当起点でも reconcile 後の正しい開始導線
  - ABN-06: widget 開始失敗時の app 内再試行導線（FocusCore 復帰）
  - ABN-08: book 参照欠損時でもクラッシュせず代替導線（Library）へ遷移可能

## integration / Detox / native acceptance の分担
- integration
  - データ整合・再整合アルゴリズム（通知集合差分、stale plan 防止、catch-up）
- Detox
  - 画面上観測可能な縮退（開始失敗後の復帰、book欠損時の主導線維持）
- native acceptance
  - OS UI 押下そのもの（通知バナー/ロック画面/Widgetホーム/Siri）
  - App Group 実障害注入（Extension 側）
  - Notification category/action 設定漏れの実機検証

## 04:00 catch-up の検証方針
- 実時間待ちを使わず、`FakeClock` を `runtimeOverrides` 経由で注入
- 03:xx（ロールオーバー前）/ 04:xx（ロールオーバー後）を明示し、
  - 前日未確定の finalized(missed) 化
  - 業務日（business date）plan 補完生成
  を integration で検証

## App Group / action ID / Live Activity 失敗の扱い
- ABN-07 Live Activity 失敗
  - 表示層の障害として局所化し、セッション本体は失敗扱いにしない
  - 現状は native acceptance で補完（ActivityKit 実失敗注入）
- ABN-11 App Group 不整合
  - app 本体主導線は継続、OS surface 側のみ縮退
  - Extension/Intent 実環境依存のため native acceptance で検証
- ABN-12 action ID 設定漏れ
  - app 起動フォールバックは維持しつつ、CTA 動作不全は blocker 検出対象
  - 通知カテゴリ設定の実機検証を native acceptance へ委譲

## blocker / non-blocker 整理
- blocker
  - stale payload を信頼して誤 plan 開始
  - plan/book 欠損で主導線停止
  - 通知重複/欠落の放置で due 導線が壊れる
- non-blocker（ただし監視対象）
  - Live Activity 表示失敗（セッション本体は継続）
  - App Group/Action ID の OS 接点限定不整合（app 本体は継続）
