import {
  getNotificationResponseEmitter,
  type NotificationResponsePayload,
  ACTION_ID_START,
  ACTION_ID_RESCUE_5M,
  ACTION_ID_SNOOZE_30M,
  ACTION_ID_DEFAULT,
} from '../bridge/NotificationBridge';

export type NotificationResponseCallback = (payload: NotificationResponsePayload) => void;

/**
 * 論理仕様: 通知タップ・アクションをルーティングする。
 * - START → 15分開始（StartSessionUseCase）
 * - RESCUE_5M → 5分救済（SelectRescueModeUseCase 等）
 * - SNOOZE_30M → 30分延期（SnoozePlanUseCase）
 * - __DEFAULT__ → 通知体タップ。DueActionSheet（開始ボタン最大化）を表示し、既定は 15 分開始。
 *
 * 必ず Reconcile 完了 → ready() の後に登録すること。二重処理防止のため。
 */
export function subscribeNotificationResponse(callback: NotificationResponseCallback): (() => void) | null {
  const emitter = getNotificationResponseEmitter();
  if (!emitter) return null;

  const sub = emitter.addListener(
    'NotificationResponse',
    (payload: NotificationResponsePayload) => {
      callback(payload);
    }
  );
  return () => sub.remove();
}

export function routeActionId(actionId: string): 'start' | 'rescue_5m' | 'snooze' | 'default' {
  switch (actionId) {
    case ACTION_ID_START:
      return 'start';
    case ACTION_ID_RESCUE_5M:
      return 'rescue_5m';
    case ACTION_ID_SNOOZE_30M:
      return 'snooze';
    case ACTION_ID_DEFAULT:
    default:
      return 'default';
  }
}
