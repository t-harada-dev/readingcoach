import { persistenceBridge, type DailyExecutionPlanDTO, type TriggerSource } from '../bridge/PersistenceBridge';
import { toLocalISODateString } from '../date';
import { runFindPlanByIdUseCase } from './FindPlanUseCase';
import { runReconcilePlansUseCase } from './ReconcilePlansUseCase';

type ResolveSurfaceStartPlanInput = {
  requestedPlanId: string;
  triggerSource: TriggerSource;
};

/**
 * stale payload の planId をそのまま信頼せず、reconcile 後に当日計画へ解決する。
 */
export async function runResolveSurfaceStartPlanUseCase(
  input: ResolveSurfaceStartPlanInput
): Promise<DailyExecutionPlanDTO | null> {
  const reconcile = await runReconcilePlansUseCase(input.triggerSource);
  const today = toLocalISODateString(new Date());
  const requested = await runFindPlanByIdUseCase(input.requestedPlanId);
  if (requested && requested.planDate === today) {
    return requested;
  }
  return reconcile.todayPlan ?? (await persistenceBridge.getPlanForDate(today));
}
