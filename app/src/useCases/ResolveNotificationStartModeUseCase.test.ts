import { beforeEach, describe, expect, it, vi } from 'vitest';

const findPlanMock = vi.hoisted(() => ({
  runFindPlanByIdUseCase: vi.fn(),
}));

vi.mock('./FindPlanUseCase', () => findPlanMock);

import {
  resolvePrimaryStartModeByMissedDays,
  runResolveNotificationStartModeUseCase,
} from './ResolveNotificationStartModeUseCase';

describe('ResolveNotificationStartModeUseCase', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('連続未達 0 日なら normal_15m', () => {
    expect(resolvePrimaryStartModeByMissedDays(0)).toBe('normal_15m');
  });

  it('連続未達 3 日以上なら ignition_1m', () => {
    expect(resolvePrimaryStartModeByMissedDays(3)).toBe('ignition_1m');
    expect(resolvePrimaryStartModeByMissedDays(8)).toBe('ignition_1m');
  });

  it('plan から missed days を解決できる', async () => {
    findPlanMock.runFindPlanByIdUseCase.mockResolvedValue({
      planId: 'p1',
      continuousMissedDaysSnapshot: 4,
    });
    await expect(runResolveNotificationStartModeUseCase('p1')).resolves.toBe('ignition_1m');
  });
});
