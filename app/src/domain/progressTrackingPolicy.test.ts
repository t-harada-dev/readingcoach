import { describe, expect, it } from 'vitest';
import { shouldOfferProgressTracking } from './progressTrackingPolicy';

describe('shouldOfferProgressTracking', () => {
  it('settings未作成なら提案する', () => {
    expect(shouldOfferProgressTracking(null)).toBe(true);
  });

  it('progress tracking が有効なら提案しない', () => {
    expect(shouldOfferProgressTracking({ progressTrackingEnabled: true, progressPromptShown: false })).toBe(false);
  });

  it('一度でも案内済みなら提案しない', () => {
    expect(shouldOfferProgressTracking({ progressTrackingEnabled: false, progressPromptShown: true })).toBe(false);
  });

  it('未有効かつ未案内なら提案する', () => {
    expect(shouldOfferProgressTracking({ progressTrackingEnabled: false, progressPromptShown: false })).toBe(true);
  });
});

