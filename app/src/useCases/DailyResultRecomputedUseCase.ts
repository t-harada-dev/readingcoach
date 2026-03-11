export type DailyResult = 'missed' | 'attempted' | 'prep_success' | 'soft_success' | 'hard_success';

const RESULT_RANK: Record<DailyResult, number> = {
  missed: 0,
  attempted: 1,
  prep_success: 2,
  soft_success: 3,
  hard_success: 4,
};

export function upgradeDailyResultOnly(current: DailyResult, candidate: DailyResult): DailyResult {
  return RESULT_RANK[candidate] > RESULT_RANK[current] ? candidate : current;
}

export function recomputeDailyResultUpgradeOnly(
  current: DailyResult,
  candidates: DailyResult[]
): DailyResult {
  return candidates.reduce((acc, next) => upgradeDailyResultOnly(acc, next), current);
}
