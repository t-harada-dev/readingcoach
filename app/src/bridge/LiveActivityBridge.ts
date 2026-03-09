import { NativeModules, Platform } from 'react-native';

/**
 * 論理仕様書 11.4 session_start_* / 17: Live Activity の開始・更新・終了。
 * iOS のみ。Expo Go などネイティブ未搭載の環境では no-op（Mock）で落とさない。
 */
const Native: any = (NativeModules as any)?.LiveActivityBridge;

export interface LiveActivityBridgeAPI {
  startSession(params: {
    planId: string;
    bookTitle: string;
    endTimeISO: string;
    durationSeconds: number;
  }): Promise<string>;
  updateRemaining(planId: string, remainingSeconds: number): Promise<void>;
  endActivity(planId: string): Promise<void>;
}

function getBridge(): LiveActivityBridgeAPI | null {
  if (Platform.OS !== 'ios') return null;
  if (!Native || typeof Native.startSession !== 'function') return null;
  return {
    async startSession(params) {
      return Native.startSession(
        params.planId,
        params.bookTitle,
        params.endTimeISO,
        params.durationSeconds
      );
    },
    async updateRemaining(planId, remainingSeconds) {
      return Native.updateRemaining(planId, remainingSeconds);
    },
    async endActivity(planId) {
      return Native.endActivity(planId);
    },
  };
}

export const liveActivityBridge: LiveActivityBridgeAPI = getBridge() ?? {
  async startSession() {
    return '';
  },
  async updateRemaining() {},
  async endActivity() {},
};
