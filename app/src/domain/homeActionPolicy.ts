import type { SessionMode } from './sessionMode';

export type HomeSurface = 'normal' | 'heavy_day' | 'rehab' | 'restart';

export type HomeActionPlan = {
  surface: HomeSurface;
  primaryMode: SessionMode;
  secondaryMode: SessionMode | null;
  rehabMode: SessionMode | null;
};

export type HomeActionPolicyInput = {
  continuousMissedDays: number;
  heavyDaySignal?: boolean;
};

export function resolveHomeActionPlan(input: HomeActionPolicyInput): HomeActionPlan {
  const { continuousMissedDays, heavyDaySignal = false } = input;

  if (continuousMissedDays >= 7) {
    return {
      surface: 'restart',
      primaryMode: 'ignition_1m',
      secondaryMode: 'rescue_5m',
      rehabMode: null,
    };
  }

  if (continuousMissedDays >= 3) {
    return {
      surface: 'rehab',
      primaryMode: 'ignition_1m',
      secondaryMode: 'rescue_5m',
      rehabMode: null,
    };
  }

  return {
    surface: heavyDaySignal ? 'heavy_day' : 'normal',
    primaryMode: 'normal_15m',
    secondaryMode: 'rescue_5m',
    rehabMode: null,
  };
}
