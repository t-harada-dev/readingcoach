import { describe, expect, it } from 'vitest';
import { resolveCoverForDisplay } from './coverDisplay';

describe('resolveCoverForDisplay', () => {
  it('keeps manual cover at highest priority when URL exists', () => {
    const result = resolveCoverForDisplay({
      thumbnailUrl: 'https://example.com/manual.jpg',
      coverSource: 'manual',
    });

    expect(result).toEqual({
      displayUri: 'https://example.com/manual.jpg',
      source: 'manual',
    });
  });

  it('uses google cover when source is google_books', () => {
    const result = resolveCoverForDisplay({
      thumbnailUrl: 'https://example.com/google.jpg',
      coverSource: 'google_books',
    });

    expect(result).toEqual({
      displayUri: 'https://example.com/google.jpg',
      source: 'google_books',
    });
  });

  it('falls back to placeholder when URL is missing', () => {
    const result = resolveCoverForDisplay({
      thumbnailUrl: '',
      coverSource: 'google_books',
    });

    expect(result).toEqual({
      source: 'placeholder',
      fallbackReason: 'missing_url',
    });
  });

  it('falls back to placeholder when image loading fails', () => {
    const result = resolveCoverForDisplay({
      thumbnailUrl: 'https://example.com/broken.jpg',
      coverSource: 'manual',
      imageLoadFailed: true,
    });

    expect(result).toEqual({
      source: 'placeholder',
      fallbackReason: 'load_failed',
    });
  });
});
