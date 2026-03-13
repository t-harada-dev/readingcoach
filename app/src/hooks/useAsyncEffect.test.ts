import { describe, expect, it } from 'vitest';
import { createAsyncEffectSignal, deactivateAsyncEffectSignal } from './useAsyncEffect';

describe('useAsyncEffect signal helpers', () => {
  it('marks signal as not alive on cleanup', () => {
    const signal = createAsyncEffectSignal();
    expect(signal.alive).toBe(true);

    deactivateAsyncEffectSignal(signal);
    expect(signal.alive).toBe(false);
  });
});
