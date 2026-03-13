import { describe, expect, it } from 'vitest';
import { buildReserveSchedule } from './reserveHelpers';

describe('ReserveScreen helpers', () => {
  it('builds a schedule for tomorrow at the selected time', () => {
    const base = new Date(2026, 2, 13, 9, 15, 0, 0);
    const { scheduledAt, planDate } = buildReserveSchedule(base, 22, 0);

    expect(scheduledAt.getFullYear()).toBe(2026);
    expect(scheduledAt.getMonth()).toBe(2);
    expect(scheduledAt.getDate()).toBe(14);
    expect(scheduledAt.getHours()).toBe(22);
    expect(scheduledAt.getMinutes()).toBe(0);
    expect(planDate).toBe('2026-03-14');
  });

  it('rolls over month boundary correctly', () => {
    const base = new Date(2026, 0, 31, 23, 45, 0, 0);
    const { scheduledAt, planDate } = buildReserveSchedule(base, 7, 30);

    expect(scheduledAt.getFullYear()).toBe(2026);
    expect(scheduledAt.getMonth()).toBe(1);
    expect(scheduledAt.getDate()).toBe(1);
    expect(scheduledAt.getHours()).toBe(7);
    expect(scheduledAt.getMinutes()).toBe(30);
    expect(planDate).toBe('2026-02-01');
  });
});
