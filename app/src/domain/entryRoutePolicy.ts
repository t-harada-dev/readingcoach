export type HomeScreenId = 'SC-04' | 'SC-05' | 'SC-06' | 'SC-07';
export type ActiveSessionScreenId = 'SC-12' | 'SC-14';
export type DueActionScreenId = 'SC-23';

type ResolveHomeScreenInput = {
  continuousMissedDays: number;
  heavyDaySignal?: boolean;
};

export function resolveHomeScreenId(input: ResolveHomeScreenInput): HomeScreenId {
  const { continuousMissedDays, heavyDaySignal = false } = input;
  if (continuousMissedDays >= 7) return 'SC-07';
  if (continuousMissedDays >= 3) return 'SC-06';
  return heavyDaySignal ? 'SC-05' : 'SC-04';
}

export function resolvePrimaryActiveSessionScreenId(continuousMissedDays: number): ActiveSessionScreenId {
  return continuousMissedDays >= 3 ? 'SC-14' : 'SC-12';
}

export function resolveDueActionScreenId(): DueActionScreenId {
  return 'SC-23';
}
