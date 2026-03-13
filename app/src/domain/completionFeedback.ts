import type { SessionMode } from './homeActionPolicy';

export type ExecutionResult = 'hard_success' | 'soft_success' | 'prep_success';

export type CompletionFeedbackInput = {
  result: ExecutionResult;
  bookTitle: string;
  progressTrackingEnabled?: boolean;
  currentPage?: number;
  pageCount?: number;
  finishedBook?: boolean;
};

export type CompletionFeedback = {
  title: string;
  message: string;
  progressRatio: number | null;
};

export function toExecutionResult(mode: SessionMode): ExecutionResult {
  switch (mode) {
    case 'normal_15m':
      return 'hard_success';
    case 'rescue_5m':
    case 'rehab_3m':
      return 'soft_success';
    case 'ignition_1m':
    default:
      return 'prep_success';
  }
}

export function buildCompletionFeedback(input: CompletionFeedbackInput): CompletionFeedback {
  if (input.finishedBook) {
    return {
      title: 'やりとげました',
      message: '次に読む本を決めましょう',
      progressRatio: null,
    };
  }

  const progressRatio = resolveProgressRatio(input);

  switch (input.result) {
    case 'hard_success':
      return {
        title: '今日のセッションを完了しました',
        message: `${input.bookTitle} を読み進めました`,
        progressRatio,
      };
    case 'soft_success':
      return {
        title: '今日のセッションを完了しました',
        message: '小さな前進を積み上げています',
        progressRatio,
      };
    case 'prep_success':
    default:
      return {
        title: '今日はつながりを保てました',
        message: '明日につながる準備ができています',
        progressRatio: null,
      };
  }
}

function resolveProgressRatio(input: CompletionFeedbackInput): number | null {
  if (!input.progressTrackingEnabled) return null;
  if (!input.currentPage || !input.pageCount || input.pageCount <= 0) return null;
  return Math.max(0, Math.min(1, input.currentPage / input.pageCount));
}
