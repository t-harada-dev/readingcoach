# ACT Integration Gap Notes

## 対象
- ACT-07: 同一planの多重開始（冪等開始）
- ACT-08: active中kill後の復旧
- ACT-09: 完了保存失敗時の再試行冪等

## 今回自動化できた範囲
- ACT-07:
  - 同一 `planId` の同時 `start` 呼び出しを integration で再現
  - 単一 `startSession` 呼び出しに集約されることを確認
  - 戻り値の `sessionId` / `startedAt` が一致することを確認
- ACT-08:
  - persisted active session を mock repository で再現
  - `reconcile_plans` 後に start 要求しても既存 active を再利用することを確認
  - 新規 session 作成が発生しないことを確認
- ACT-09:
  - complete 保存の1回失敗を fault inject で再現
  - 再試行で収束し、重複完了書き込みが発生しないことを確認

## まだ native / E2E で補完すべき点
- iOS SwiftData 実装での厳密な競合制御（同時トランザクション競合）
- 実プロセス kill/relaunch を跨ぐ restore のシステム統合検証
- complete 時の永続層トランザクション境界（plan/session/result再計算の原子性）を native 側で実測確認

## start 冪等化の前提
- truth source は persisted active session（`getActiveSession`）
- 同一 `planId` への同時開始は in-flight coalescing で単一化
- active が既に存在する場合は `startSession` を新規発行しない

## restore 判定の truth source
- persisted `SessionLog(outcome=active, endedAt=nil)` と plan の `startedAt`
- in-memory state は参照せず、復旧判定は永続化済みデータ優先

## completion idempotency の設計メモ
- `completeSession` は at-least-once 呼び出しを許容する前提
- 同一 session への2回目以降の完了は no-op として扱える実装が必要
- daily result 再計算・加算は「単一確定」を前提に重複防止ガードを持つこと
