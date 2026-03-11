# Batch 3 - Session Execution / Restore / Idempotent Completion

参照:
- tsundoku_test_spec_20260310_v2.docx
- 積読コーチ_論理仕様書_v1
- 積読コーチ_異常系・縮退運転定義書_20260310

## 目的
ACT-07〜09 を integration test で固定し、セッションの多重開始防止、クラッシュ復旧、完了時冪等性を担保する。

---

## 対象 TC

### TC-ACT-07
- 元仕様ID: ACT-07
- 前提: 同一 plan
- 操作: 開始連打 / startSession 二重実行
- 期待:
  - 同一 active 再利用
  - open session は 1 件のみ
  - 二重 session 作成禁止
- 自動化: integration
- 優先度: 高

### TC-ACT-08
- 元仕様ID: ACT-08
- 前提: active session が persisted 済み
- 操作: app kill 相当 -> 再起動 -> reconcile
- 期待:
  - active_session_restored
  - startedAt / endTimeISO から復旧
  - 新規 active を増やさない
- 自動化: integration
- 優先度: 高

### TC-ACT-09
- 元仕様ID: ACT-09
- 前提: 完了直前保存失敗を 1 回 fault inject
- 操作: complete -> retry
- 期待:
  - 単一完了
  - 二重加算しない
  - daily_result / completion 記録が重複しない
- 自動化: integration
- 優先度: 高

---

## 仕様メモ

- `active` 遷移時の `startedAt` は UI 遷移前に永続化し、クラッシュ復旧の truth source とする
- 復旧系:
  - `reconcile_plans + open session found -> active(restored)`
- 異常系:
  - 開始直前失敗時でも同じ plan に対する再試行導線を出す
  - 二重 session 作成を避ける

---

## 推奨テスト対象

- StartSessionUseCase
- CompleteSessionUseCase
- ReconcilePlansUseCase
- persistence repository
- open session lookup
- daily_result recompute

---

## 必要な test seam

### Start idempotency
- 同一 planId の open session lookup
- compare-and-set / unique guard
- concurrent start helper

### Restore
- persisted open session seed
- in-memory reset helper
- reconcile trigger helper

### Completion retry
- save failure injector
- once-fail repository double
- retry helper
- write count assertion

---

## 実装順

1. TC-ACT-07
2. TC-ACT-08
3. TC-ACT-09

---

## ギャップメモ

- app kill を Detox で再現する前に、integration で restore truth source を固定する
- complete retry は UI テストより repository fault injection が本命
- multi-start は race 条件を deterministic に再現できる helper が必要