import type { BookDTO } from '../bridge/PersistenceBridge';

export type CoverSource = NonNullable<BookDTO['coverSource']>;

export type CoverDisplayInput = {
  thumbnailUrl?: string | null;
  coverSource?: BookDTO['coverSource'];
  imageLoadFailed?: boolean;
};

export type CoverDisplayResult = {
  displayUri?: string;
  source: CoverSource;
  fallbackReason?: 'missing_url' | 'load_failed' | 'explicit_placeholder';
};

export function resolveCoverForDisplay(input: CoverDisplayInput): CoverDisplayResult {
  const normalizedUrl = input.thumbnailUrl?.trim() ?? '';

  if (input.imageLoadFailed) {
    return {
      source: 'placeholder',
      fallbackReason: 'load_failed',
    };
  }

  if (input.coverSource === 'placeholder') {
    return {
      source: 'placeholder',
      fallbackReason: 'explicit_placeholder',
    };
  }

  if (!normalizedUrl) {
    return {
      source: 'placeholder',
      fallbackReason: 'missing_url',
    };
  }

  return {
    displayUri: normalizedUrl,
    source: input.coverSource ?? 'google_books',
  };
}
