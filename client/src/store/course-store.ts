import { create } from "zustand";

interface CourseState {
  enrolledIds: string[];
  progressMap: Record<string, number>;
  setEnrolled: (ids: string[]) => void;
  addEnrolled: (id: string) => void;
  setProgress: (id: string, percentage: number) => void;
  reset: () => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  enrolledIds: [],
  progressMap: {},
  setEnrolled: (ids) => set({ enrolledIds: ids }),
  addEnrolled: (id) =>
    set((state) => ({
      enrolledIds: [...state.enrolledIds, id],
    })),
  setProgress: (id, percentage) =>
    set((state) => ({
      progressMap: { ...state.progressMap, [id]: percentage },
    })),
  reset: () => set({ enrolledIds: [], progressMap: {} }),
}));
