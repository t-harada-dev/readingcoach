import type { SessionMode } from './StartSessionUseCase';
import { resolveHomeActionPlan } from '../domain/homeActionPolicy';
import { runFindPlanByIdUseCase } from './FindPlanUseCase';

export function resolvePrimaryStartModeByMissedDays(continuousMissedDays: number): SessionMode {
  return resolveHomeActionPlan({ continuousMissedDays }).primaryMode;
}

export async function runResolveNotificationStartModeUseCase(planId: string): Promise<SessionMode> {
  const plan = await runFindPlanByIdUseCase(planId);
  return resolvePrimaryStartModeByMissedDays(plan?.continuousMissedDaysSnapshot ?? 0);
}
