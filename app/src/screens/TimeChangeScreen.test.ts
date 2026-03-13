import { describe, expect, it } from 'vitest';
import { normalizeTimeField, TIME_CHANGE_PRESETS } from './timeChangeHelpers';

describe('TimeChangeScreen helpers', () => {
  it('normalizes numeric time fields within bounds', () => {
    expect(normalizeTimeField('07', 23)).toBe(7);
    expect(normalizeTimeField('59', 59)).toBe(59);
    expect(normalizeTimeField('21.9', 23)).toBe(21);
  });

  it('returns null for invalid values', () => {
    expect(normalizeTimeField('', 23)).toBeNull();
    expect(normalizeTimeField('  ', 23)).toBeNull();
    expect(normalizeTimeField('-1', 23)).toBeNull();
    expect(normalizeTimeField('24', 23)).toBeNull();
    expect(normalizeTimeField('abc', 23)).toBeNull();
  });

  it('keeps required preset set for e2e coverage', () => {
    expect(TIME_CHANGE_PRESETS.map((preset) => preset.hour)).toEqual([7, 12, 21, 22]);
    expect(TIME_CHANGE_PRESETS.every((preset) => preset.minute === 0)).toBe(true);
  });
});
