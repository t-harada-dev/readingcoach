import type { SessionMode } from '../../../useCases/StartSessionUseCase';

export const fixtureActiveSession = {
  normal: {
    bookTitle: '深く考える技術',
    mode: 'normal_15m' as SessionMode,
    remainingSeconds: 9 * 60 + 42,
  },
  rehab: {
    bookTitle: '1分で戻る読書習慣',
    mode: 'ignition_1m' as SessionMode,
    remainingSeconds: 42,
  },
};

export const fixtureCompletion = {
  sc14: {
    result: 'soft_success' as const,
    elapsedSeconds: 10 * 60,
    bookTitle: '1分で戻る読書習慣',
  },
  sc15: {
    result: 'hard_success' as const,
    elapsedSeconds: 15 * 60,
    bookTitle: '深く考える技術',
  },
};
