import { describe, expect, it } from 'vitest';
import { recomputeDailyResultUpgradeOnly } from '../DailyResultRecomputedUseCase';

describe('DailyResultRecomputed integration', () => {
  // TC-CMP-08: extra session 後の result は格上げのみ（破壊的な格下げなし）
  it('upgrades result only when extra session outcomes are merged', () => {
    expect(recomputeDailyResultUpgradeOnly('soft_success', ['prep_success'])).toBe('soft_success');
    expect(recomputeDailyResultUpgradeOnly('attempted', ['soft_success'])).toBe('soft_success');
    expect(recomputeDailyResultUpgradeOnly('prep_success', ['hard_success'])).toBe('hard_success');
    expect(recomputeDailyResultUpgradeOnly('hard_success', ['soft_success', 'prep_success'])).toBe('hard_success');
  });
});
