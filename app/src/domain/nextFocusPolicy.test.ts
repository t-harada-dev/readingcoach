import { describe, expect, it } from 'vitest';
import { buildNextPlan } from './nextFocusPolicy';

describe('buildNextPlan', () => {
  it('翌日の planDate と scheduledAt を返す', () => {
    const now = new Date(2026, 2, 10, 10, 30, 0, 0);
    const result = buildNextPlan({ now, dailyTargetTimeMinutes: 21 * 60 });
    expect(result.planDate).toBe('2026-03-11');
    const scheduled = new Date(result.scheduledAtISO);
    expect(scheduled.getFullYear()).toBe(2026);
    expect(scheduled.getMonth()).toBe(2);
    expect(scheduled.getDate()).toBe(11);
    expect(scheduled.getHours()).toBe(21);
    expect(scheduled.getMinutes()).toBe(0);
  });

  it('設定時刻が早朝でも翌日へ設定する', () => {
    const now = new Date(2026, 2, 10, 23, 59, 0, 0);
    const result = buildNextPlan({ now, dailyTargetTimeMinutes: 7 * 60 + 30 });
    expect(result.planDate).toBe('2026-03-11');
    const scheduled = new Date(result.scheduledAtISO);
    expect(scheduled.getFullYear()).toBe(2026);
    expect(scheduled.getMonth()).toBe(2);
    expect(scheduled.getDate()).toBe(11);
    expect(scheduled.getHours()).toBe(7);
    expect(scheduled.getMinutes()).toBe(30);
  });
});
