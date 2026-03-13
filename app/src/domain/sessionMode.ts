export type SessionMode = 'normal_15m' | 'rescue_5m' | 'rehab_3m' | 'ignition_1m';
export type NativeSessionMode = 'normal_15m' | 'rescue_5m' | 'rescue_3m' | 'book_fetch_1m';

export const DURATION_SECONDS: Record<SessionMode, number> = {
  normal_15m: 15 * 60,
  rescue_5m: 5 * 60,
  rehab_3m: 3 * 60,
  ignition_1m: 1 * 60,
};

export function toNativeSessionMode(mode: SessionMode): NativeSessionMode {
  if (mode === 'ignition_1m') return 'book_fetch_1m';
  if (mode === 'rehab_3m') return 'rescue_3m';
  return mode;
}

export function fromSessionMode(mode: string | undefined): SessionMode | null {
  if (mode === 'normal_15m') return 'normal_15m';
  if (mode === 'rescue_5m') return 'rescue_5m';
  if (mode === 'rehab_3m' || mode === 'rescue_3m') return 'rehab_3m';
  if (mode === 'ignition_1m' || mode === 'book_fetch_1m') return 'ignition_1m';
  return null;
}
