import type { SessionMode } from '../useCases/StartSessionUseCase';
import { resolveHomeActionPlan } from '../domain/homeActionPolicy';
import { resolveHomeScreenId } from '../domain/entryRoutePolicy';

export type FocusCoreScreenPolicy = {
  screenId: 'SC-04' | 'SC-05' | 'SC-06' | 'SC-07';
  primaryMode: SessionMode;
  secondaryMode: SessionMode | null;
  rehabMode: SessionMode | null;
};

export function resolveFocusCoreScreenPolicy(input: {
  continuousMissedDays: number;
  heavyDaySignal?: boolean;
}): FocusCoreScreenPolicy {
  const action = resolveHomeActionPlan(input);
  return {
    screenId: resolveHomeScreenId(input),
    primaryMode: action.primaryMode,
    secondaryMode: action.secondaryMode,
    rehabMode: action.rehabMode,
  };
}

export type CompletionCtaId = 'extra_5m' | 'extra_15m' | 'finished_book' | 'close';

export function completionCtaOrder(): CompletionCtaId[] {
  // SC-15: 追加セッションを主導線、読了/クローズを下段に固定する。
  return ['extra_5m', 'extra_15m', 'finished_book', 'close'];
}

export type DueActionId = 'start' | 'rescue_5m' | 'snooze_30m';

export function dueActionOrder(): DueActionId[] {
  // SC-23: 開始を主CTA、5分/30分延期を副選択として固定。
  return ['start', 'rescue_5m', 'snooze_30m'];
}
