export type NextPlanInput = {
  now: Date;
  dailyTargetTimeMinutes: number;
};

export type NextPlan = {
  planDate: string;
  scheduledAtISO: string;
};

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function buildNextPlan(input: NextPlanInput): NextPlan {
  const tomorrow = new Date(input.now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const h = Math.floor(input.dailyTargetTimeMinutes / 60);
  const m = input.dailyTargetTimeMinutes % 60;
  tomorrow.setHours(h, m, 0, 0);

  return {
    planDate: toDateString(tomorrow),
    scheduledAtISO: tomorrow.toISOString(),
  };
}

