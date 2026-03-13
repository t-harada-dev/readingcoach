import type { SessionMode } from '../../../useCases/StartSessionUseCase';

export const fixtureActiveSession = {
  normal: {
    bookTitle: '深く考える技術',
    bookCoverUri: 'https://example.com/cover-standard.png',
    mode: 'normal_15m' as SessionMode,
    durationSeconds: 15 * 60,
    remainingSeconds: 9 * 60 + 42,
  },
  rehab: {
    bookTitle: '1分で戻る読書習慣',
    bookCoverUri: 'https://example.com/cover-light.png',
    mode: 'ignition_1m' as SessionMode,
    durationSeconds: 60,
    remainingSeconds: 42,
  },
};

export const fixtureCompletion = {
  sc14: {
    result: 'soft_success' as const,
    elapsedSeconds: 10 * 60,
    bookTitle: '1分で戻る読書習慣',
  },
  sc14Normal: {
    result: 'soft_success' as const,
    elapsedSeconds: 5 * 60,
    bookTitle: '深く考える技術',
  },
  sc15: {
    result: 'hard_success' as const,
    elapsedSeconds: 15 * 60,
    bookTitle: '深く考える技術',
  },
  sc15Rehab: {
    result: 'hard_success' as const,
    elapsedSeconds: 8 * 60,
    bookTitle: '1分で戻る読書習慣',
  },
};
