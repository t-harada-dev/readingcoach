import { persistenceBridge } from '../bridge/PersistenceBridge';
import { toLocalISODateString } from '../date';
import { runReconcilePlansUseCase } from './ReconcilePlansUseCase';

export type SurfaceSource = 'notification_response' | 'widget_render' | 'app_intent';

export type ResolveSurfaceTodayBookInput = {
  source: SurfaceSource;
  snapshotTitle?: string;
};

export type SurfaceTodayBook = {
  planId: string;
  bookId: string;
  title: string;
};

/**
 * Surface 表示は shared snapshot を参照できるが、正本は永続層。
 * stale snapshot を優先せず、reconcile 後に canonical state で today book を解決する。
 */
export async function runResolveSurfaceTodayBookUseCase(
  input: ResolveSurfaceTodayBookInput
): Promise<SurfaceTodayBook | null> {
  const reconcile = await runReconcilePlansUseCase(input.source);
  const today = toLocalISODateString(new Date());
  const plan = reconcile.todayPlan ?? (await persistenceBridge.getPlanForDate(today));
  if (!plan) return null;

  const canonicalBook = await persistenceBridge.getBook(plan.bookId);
  const canonicalTitle = canonicalBook?.title?.trim();
  const title = canonicalTitle && canonicalTitle.length > 0 ? canonicalTitle : input.snapshotTitle?.trim();
  if (!title) return null;

  return {
    planId: plan.planId,
    bookId: plan.bookId,
    title,
  };
}
