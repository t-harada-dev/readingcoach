import { toLocalISODateString } from '../date';

export function buildReserveSchedule(baseDate: Date, hour: number, minute: number) {
  const target = new Date(baseDate);
  target.setDate(target.getDate() + 1);
  target.setHours(hour, minute, 0, 0);
  return {
    scheduledAt: target,
    planDate: toLocalISODateString(target),
  };
}
