# lessons

- （初回作成。教訓は随時追記）

## 通知再整合（NotificationBridge / NotificationScheduler）

1. **非同期の順序**: SwiftData の `context.save()` が完了した後にのみ通知再整合を走らせる。Reconcile の流れでは「RN が reconcilePlans を呼ぶ → ネイティブで save 完了 → 戻る → RN が resyncAfterReconcile を呼ぶ」なので、データは保存済み。
2. **カテゴリとアクション**: 本通知の「開始」「5分だけ」「30分延期」は `UNNotificationCategory` で登録し、`UNNotificationContent.categoryIdentifier` で紐づける。ずれると通知は届くがボタンが効かない。
3. **prep_success 後の取消**: 準備だけ完了した計画は `.finalized` のため期待集合に含めない。結果、当該 plan の pending は削除され、追い打ち通知が届かなくなる。

## 通知レスポンス（NotificationResponse）

1. **二重処理の禁止**: 必ず Reconcile 完了後に ready() を呼ぶ。`runReconcileThenNotifyReady` で順序を保証する。古い状態に対して「開始」を出さない。
2. **通知の消去**: レスポンス処理の最初の一手はネイティブ側で `cancelForPlan(planId)`。同一 plan の再通知などが通知センターに残らないようにする。
3. **__DEFAULT__（通知体タップ）**: 「何しに来たんだっけ？」と選ばせない。DueActionSheet は開始ボタン最大化で、既定は 15 分開始。
