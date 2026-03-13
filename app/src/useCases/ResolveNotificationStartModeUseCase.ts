import type { SessionMode } from './StartSessionUseCase';
import { runFindPlanByIdUseCase } from './FindPlanUseCase';
import { resolvePrimaryActiveSessionScreenId } from '../domain/entryRoutePolicy';

export function resolvePrimaryStartModeByMissedDays(continuousMissedDays: number): Exclude<SessionMode, 'rehab_3m'> {
  const target = resolvePrimaryActiveSessionScreenId(continuousMissedDays);
  return target === 'SC-14' ? 'ignition_1m' : 'normal_15m';
}

export async function runResolveNotificationStartModeUseCase(planId: string): Promise<Exclude<SessionMode, 'rehab_3m'>> {
  const plan = await runFindPlanByIdUseCase(planId);
  return resolvePrimaryStartModeByMissedDays(plan?.continuousMissedDaysSnapshot ?? 0);
}
