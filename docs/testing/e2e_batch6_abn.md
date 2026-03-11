# Batch 6 - Abnormal / Degraded Operations / Release Blockers

参照:
- tsundoku_test_spec_20260310_v2.docx
- 積読コーチ_異常系・縮退運転定義書_20260310
- 積読コーチ_論理仕様書_v1

## 目的
異常系・縮退運転を固定し、「今日の読書達成」主導線が止まらないことを確認する。

## 対象 TC
- ABN-02 通知予約欠落 -> reconcile で不足再構築
- ABN-03 通知重複 -> 安定IDで削除
- ABN-04 stale plan 通知応答 -> reconcile 後開始
- ABN-05 stale widget -> app起動 + reconcile / 誤開始防止
- ABN-06 widget開始失敗 -> app内再試行導線
- ABN-07 Live Activity開始失敗 -> セッション継続
- ABN-08 book参照欠損 -> SC-08 or SC-20 誘導
- ABN-09 当日plan欠損 -> 補完生成
- ABN-10 04:00 またぎ catch-up -> 前日finalized + 当日plan生成
- ABN-11 App Group不整合 -> app本体継続、OS surfaceのみ縮退
- ABN-12 action ID設定漏れ -> app起動フォールバック、blocker検出

## 推奨レイヤ
### integration
- ABN-02
- ABN-03
- ABN-04
- ABN-09
- ABN-10

### Detox / app harness
- ABN-05
- ABN-06
- ABN-08

### native acceptance
- ABN-07
- ABN-11
- ABN-12

## 必要 harness
- expected/pending notification probe
- stale surface payload seed
- broken book seed
- missing plan seed
- fake clock for 04:00
- App Group / action ID override

## 実装順
1. ABN-02
2. ABN-03
3. ABN-04
4. ABN-09
5. ABN-10
6. ABN-08
7. ABN-05
8. ABN-06
9. ABN-07
10. ABN-11
11. ABN-12