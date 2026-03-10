export type ProgressTrackingSettings = {
  progressTrackingEnabled?: boolean;
  progressPromptShown?: boolean;
};

export function shouldOfferProgressTracking(settings: ProgressTrackingSettings | null): boolean {
  if (!settings) return true;
  if (settings.progressTrackingEnabled) return false;
  if (settings.progressPromptShown) return false;
  return true;
}

