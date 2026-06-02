import { create } from "zustand";

interface AnsweredQuestion {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean | null;
  flagged: boolean;
}

interface ExamState {
  currentExamId: string | null;
  questions: string[];
  currentIndex: number;
  answers: Record<string, AnsweredQuestion>;
  startTime: number | null;
  timeRemaining: number;
  isActive: boolean;
  startExam: (examId: string, questionIds: string[], timeLimit: number) => void;
  answerQuestion: (questionId: string, optionId: string, isCorrect: boolean) => void;
  flagQuestion: (questionId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  tick: () => void;
  endExam: () => void;
  reset: () => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  currentExamId: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  startTime: null,
  timeRemaining: 0,
  isActive: false,
  startExam: (examId, questionIds, timeLimit) =>
    set({
      currentExamId: examId,
      questions: questionIds,
      currentIndex: 0,
      answers: {},
      startTime: Date.now(),
      timeRemaining: timeLimit * 60,
      isActive: true,
    }),
  answerQuestion: (questionId, optionId, isCorrect) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: {
          ...state.answers[questionId],
          questionId,
          selectedOptionId: optionId,
          isCorrect,
        },
      },
    })),
  flagQuestion: (questionId) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: {
          ...state.answers[questionId],
          questionId,
          flagged: !state.answers[questionId]?.flagged,
        },
      },
    })),
  nextQuestion: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1),
    })),
  previousQuestion: () =>
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0),
    })),
  tick: () =>
    set((state) => ({
      timeRemaining: Math.max(state.timeRemaining - 1, 0),
    })),
  endExam: () => set({ isActive: false }),
  reset: () =>
    set({
      currentExamId: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      startTime: null,
      timeRemaining: 0,
      isActive: false,
    }),
}));