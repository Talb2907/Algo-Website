import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AlgorithmSlug, QuizScore } from '@/types';

interface QuizState {
  scores: Partial<Record<AlgorithmSlug, QuizScore>>;
  setAnswer: (slug: AlgorithmSlug, questionIdx: number, chosenIdx: number, isCorrect: boolean) => void;
  resetAlgorithm: (slug: AlgorithmSlug) => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      scores: {},
      setAnswer: (slug, questionIdx, chosenIdx, isCorrect) =>
        set((state) => {
          const prev = state.scores[slug] ?? { correct: 0, total: 0, answered: {}, selected: {} };
          if (prev.answered[questionIdx] !== undefined) return state;
          return {
            scores: {
              ...state.scores,
              [slug]: {
                correct: prev.correct + (isCorrect ? 1 : 0),
                total: prev.total + 1,
                answered: { ...prev.answered, [questionIdx]: isCorrect },
                selected: { ...prev.selected, [questionIdx]: chosenIdx },
              },
            },
          };
        }),
      resetAlgorithm: (slug) =>
        set((state) => ({
          scores: { ...state.scores, [slug]: { correct: 0, total: 0, answered: {}, selected: {} } },
        })),
    }),
    { name: 'algo-quiz-scores', skipHydration: true }
  )
);
