import { describe, expect, it } from 'vitest';
import { buildCompletionFeedback, toExecutionResult } from './completionFeedback';

describe('toExecutionResult', () => {
  it('15分は hard_success', () => {
    expect(toExecutionResult('normal_15m')).toBe('hard_success');
  });

  it('5分と3分は soft_success', () => {
    expect(toExecutionResult('rescue_5m')).toBe('soft_success');
    expect(toExecutionResult('rehab_3m')).toBe('soft_success');
  });

  it('1分は prep_success', () => {
    expect(toExecutionResult('ignition_1m')).toBe('prep_success');
  });
});

describe('buildCompletionFeedback', () => {
  it('hard_success は通常の前進メッセージ', () => {
    const feedback = buildCompletionFeedback({
      result: 'hard_success',
      bookTitle: 'テスト本',
    });
    expect(feedback.title).toBe('今日のセッションを完了しました');
    expect(feedback.progressRatio).toBeNull();
  });

  it('prep_success は進捗率を返さない', () => {
    const feedback = buildCompletionFeedback({
      result: 'prep_success',
      bookTitle: 'テスト本',
      progressTrackingEnabled: true,
      currentPage: 120,
      pageCount: 300,
    });
    expect(feedback.title).toBe('今日はつながりを保てました');
    expect(feedback.progressRatio).toBeNull();
  });

  it('progress tracking有効かつページ情報ありなら進捗率を返す', () => {
    const feedback = buildCompletionFeedback({
      result: 'soft_success',
      bookTitle: 'テスト本',
      progressTrackingEnabled: true,
      currentPage: 120,
      pageCount: 300,
    });
    expect(feedback.progressRatio).toBeCloseTo(0.4);
  });

  it('finishedBook を優先して読了メッセージを返す', () => {
    const feedback = buildCompletionFeedback({
      result: 'hard_success',
      bookTitle: 'テスト本',
      finishedBook: true,
    });
    expect(feedback.title).toBe('やりとげました');
    expect(feedback.progressRatio).toBeNull();
  });
});
