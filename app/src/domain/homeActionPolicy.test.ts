import { describe, expect, it } from 'vitest';
import { resolveHomeActionPlan } from './homeActionPolicy';

describe('resolveHomeActionPlan', () => {
  it('通常日は15分主導線と5分副導線を返す', () => {
    const plan = resolveHomeActionPlan({ continuousMissedDays: 0 });
    expect(plan.surface).toBe('normal');
    expect(plan.primaryMode).toBe('normal_15m');
    expect(plan.secondaryMode).toBe('rescue_5m');
    expect(plan.rehabMode).toBeNull();
  });

  it('heavy_day_signal=true でも主導線は15分を維持する', () => {
    const plan = resolveHomeActionPlan({ continuousMissedDays: 1, heavyDaySignal: true });
    expect(plan.surface).toBe('heavy_day');
    expect(plan.primaryMode).toBe('normal_15m');
    expect(plan.secondaryMode).toBe('rescue_5m');
  });

  it('3日以上未達では1分主導線、5分副導線、3分Rehab提案を返す', () => {
    const plan = resolveHomeActionPlan({ continuousMissedDays: 3 });
    expect(plan.surface).toBe('rehab');
    expect(plan.primaryMode).toBe('ignition_1m');
    expect(plan.secondaryMode).toBe('rescue_5m');
    expect(plan.rehabMode).toBe('rehab_3m');
  });

  it('7日以上未達では再開専用導線に切り替える', () => {
    const plan = resolveHomeActionPlan({ continuousMissedDays: 7 });
    expect(plan.surface).toBe('restart');
    expect(plan.primaryMode).toBe('ignition_1m');
    expect(plan.secondaryMode).toBe('rescue_5m');
    expect(plan.rehabMode).toBeNull();
  });
});

