import { describe, expect, it } from 'vitest';
import { completionCtaOrder, dueActionOrder, resolveFocusCoreScreenPolicy } from './screenPolicy';

describe('screenPolicy', () => {
  it('SC-04: 通常時は 15分主導線', () => {
    const policy = resolveFocusCoreScreenPolicy({ continuousMissedDays: 0 });
    expect(policy.screenId).toBe('SC-04');
    expect(policy.primaryMode).toBe('normal_15m');
    expect(policy.secondaryMode).toBe('rescue_5m');
  });

  it('SC-06: 3日以上未達は 1分主導線', () => {
    const policy = resolveFocusCoreScreenPolicy({ continuousMissedDays: 3 });
    expect(policy.screenId).toBe('SC-06');
    expect(policy.primaryMode).toBe('ignition_1m');
    expect(policy.secondaryMode).toBe('rescue_5m');
    expect(policy.rehabMode).toBe('rehab_3m');
  });

  it('SC-07: 7日以上未達は再開専用導線', () => {
    const policy = resolveFocusCoreScreenPolicy({ continuousMissedDays: 7 });
    expect(policy.screenId).toBe('SC-07');
    expect(policy.primaryMode).toBe('ignition_1m');
    expect(policy.secondaryMode).toBe('rescue_5m');
    expect(policy.rehabMode).toBeNull();
  });

  it('SC-15: 完了画面 CTA 順序は追加セッション優先', () => {
    expect(completionCtaOrder()).toEqual(['extra_5m', 'extra_15m', 'finished_book', 'close']);
  });

  it('SC-23: DueActionSheet は開始を最上位に固定', () => {
    expect(dueActionOrder()).toEqual(['start', 'rescue_5m', 'snooze_30m']);
  });
});
