import { create } from "zustand";

interface QuestionFilters {
  examId: string | null;
  specialty: string | null;
  topic: string | null;
  difficulty: string | null;
  setExamId: (examId: string | null) => void;
  setSpecialty: (specialty: string | null) => void;
  setTopic: (topic: string | null) => void;
  setDifficulty: (difficulty: string | null) => void;
  reset: () => void;
}

export const useQuestionStore = create<QuestionFilters>((set) => ({
  examId: null,
  specialty: null,
  topic: null,
  difficulty: null,
  setExamId: (examId) => set({ examId }),
  setSpecialty: (specialty) => set({ specialty }),
  setTopic: (topic) => set({ topic }),
  setDifficulty: (difficulty) => set({ difficulty }),
  reset: () => set({ examId: null, specialty: null, topic: null, difficulty: null }),
}));