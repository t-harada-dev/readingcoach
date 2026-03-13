import { persistenceBridge, type ReconcileResult, type TriggerSource } from '../bridge/PersistenceBridge';
import { notificationBridge } from '../bridge/NotificationBridge';

async function runBestEffort(
  task: () => Promise<void>,
  timeoutMs = 3000
): Promise<void> {
  try {
    await Promise.race([
      task(),
      new Promise<void>((resolve) => {
        setTimeout(resolve, timeoutMs);
      }),
    ]);
  } catch {
    // Notification sync must not block reconcile-based flows.
  }
}

/**
 * 論理仕様書 9.2 / 11.2: reconcile_plans
 * 発火点: app launch / foreground / notification response / widget / App Intents / background task
 *
 * 処理内容（ネイティブ側で実行）:
 * 1. 最終確定済み日以降 〜 (referenceDate - 1日) の未確定計画を finalized(missed) に
 * 2. 計画が無い日は補完用 DailyExecutionPlan を生成し finalized(missed)
 * 3. 当日分の計画が無ければ FocusBookSelector で自動生成
 * 4. continuous_missed_days を再計算
 * 5. 通知再整合は NotificationBridge.resyncAfterReconcile で実行
 */
export async function runReconcilePlansUseCase(
  triggerSource: TriggerSource
): Promise<ReconcileResult> {
  const referenceDate = new Date();
  const referenceDateISO = referenceDate.toISOString();
  const result = await persistenceBridge.reconcilePlans(referenceDateISO, triggerSource);

  await runBestEffort(() => notificationBridge.resyncAfterReconcile());
  return result;
}

/**
 * アプリ起動時の標準フロー。Reconcile 完了後に ready() を 1 回だけ呼び、通知レスポンスのバッファを放出する。
 * 二重処理防止: 必ずこの順で呼ぶこと（先 Reconcile、後 ready）。
 */
export async function runReconcileThenNotifyReady(triggerSource: TriggerSource): Promise<ReconcileResult> {
  const result = await runReconcilePlansUseCase(triggerSource);
  await runBestEffort(() => notificationBridge.ready());
  return result;
}
