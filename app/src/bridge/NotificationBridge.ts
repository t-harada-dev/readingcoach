import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

/**
 * 論理仕様書 18.1 NotificationBridge / 15.2 通知ルール
 * - React Native から native iOS (UNUserNotificationCenter) を呼び出す
 * - 通知アクション結果を JS の use case に返す（RCTEventEmitter で NotificationResponse を送出）
 *
 * 再整合: pending request と「期待される request 集合」を比較し、不一致なら再構築。
 * レスポンス: 必ず Reconcile 完了後に ready() を呼び、その後イベントでペイロードを受け取る。
 */

const { NotificationBridge: Native } = NativeModules;

/** ネイティブから送られる通知レスポンスのペイロード契約 */
export interface NotificationResponsePayload {
  planId: string;
  /** START | RESCUE_5M | SNOOZE_30M | __DEFAULT__（通知体タップ＝15分開始確認へ） */
  actionId: string;
  triggeredAt: string;
  isColdStart: boolean;
}

export const ACTION_ID_START = 'START';
export const ACTION_ID_RESCUE_5M = 'RESCUE_5M';
export const ACTION_ID_SNOOZE_30M = 'SNOOZE_30M';
export const ACTION_ID_DEFAULT = '__DEFAULT__';

export interface ResyncOptions {
  /** 対象とする planId のリスト。省略時は「当日＋次回」などネイティブ側の既定範囲で再構築。 */
  planIds?: string[];
}

export interface NotificationBridgeAPI {
  /** Reconcile 完了後に必ず 1 回呼ぶ。冷起動でバッファされていたレスポンスをここで送出する。二重処理防止のため Reconcile の後にだけ呼ぶこと。 */
  ready(): Promise<void>;
  /** Reconcile 完了後に呼ぶ。現在の計画に基づき通知予約を再構築する（期待集合 vs pending の照合）。 */
  resyncAfterReconcile(options?: ResyncOptions): Promise<void>;
  /** 指定計画の通知のみ再スケジュール（schedule_updated 用）。 */
  resyncForPlan(planId: string): Promise<void>;
  /** 指定計画の通知をすべて取消（同日撤退・計画削除用）。 */
  cancelForPlan(planId: string): Promise<void>;
}

function getBridge(): NotificationBridgeAPI | null {
  if (Platform.OS !== 'ios' || !Native) return null;
  return {
    async ready() {
      return Native.ready();
    },
    async resyncAfterReconcile(options?: ResyncOptions) {
      return Native.resyncAfterReconcile(options ?? {});
    },
    async resyncForPlan(planId: string) {
      return Native.resyncForPlan(planId);
    },
    async cancelForPlan(planId: string) {
      return Native.cancelForPlan(planId);
    },
  };
}

export const notificationBridge: NotificationBridgeAPI = getBridge() ?? {
  async ready() {},
  async resyncAfterReconcile() {},
  async resyncForPlan() {},
  async cancelForPlan() {},
};

/** NotificationResponse イベントを購読するための Emitter。ready() の後で addListener すること。 */
export function getNotificationResponseEmitter(): NativeEventEmitter | null {
  if (Platform.OS !== 'ios' || !Native) return null;
  return new NativeEventEmitter(Native);
}
