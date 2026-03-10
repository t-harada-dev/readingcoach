import { describe, expect, it } from 'vitest';
import {
  resolveDueActionScreenId,
  resolveHomeScreenId,
  resolvePrimaryActiveSessionScreenId,
} from './entryRoutePolicy';

describe('entryRoutePolicy', () => {
  it('通常時は SC-04', () => {
    expect(resolveHomeScreenId({ continuousMissedDays: 0 })).toBe('SC-04');
  });

  it('heavy day は SC-05', () => {
    expect(resolveHomeScreenId({ continuousMissedDays: 0, heavyDaySignal: true })).toBe('SC-05');
  });

  it('3日以上未達は SC-06', () => {
    expect(resolveHomeScreenId({ continuousMissedDays: 3 })).toBe('SC-06');
  });

  it('7日以上未達は SC-07', () => {
    expect(resolveHomeScreenId({ continuousMissedDays: 7 })).toBe('SC-07');
  });

  it('Surface 起点の第一導線は 0-2日で SC-12', () => {
    expect(resolvePrimaryActiveSessionScreenId(0)).toBe('SC-12');
    expect(resolvePrimaryActiveSessionScreenId(2)).toBe('SC-12');
  });

  it('Surface 起点の第一導線は 3日以上で SC-14', () => {
    expect(resolvePrimaryActiveSessionScreenId(3)).toBe('SC-14');
    expect(resolvePrimaryActiveSessionScreenId(9)).toBe('SC-14');
  });

  it('通知体タップの承諾画面は SC-23', () => {
    expect(resolveDueActionScreenId()).toBe('SC-23');
  });
});
