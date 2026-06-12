import { create } from "zustand";

interface CourseState {
  enrolledIds: Set<string>;
  progressMap: Record<string, number>;
  setEnrolled: (ids: Set<string>) => void;
  addEnrolled: (id: string) => void;
  setProgress: (id: string, percentage: number) => void;
  reset: () => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  enrolledIds: new Set(),
  progressMap: {},
  setEnrolled: (ids) => set({ enrolledIds: ids }),
  addEnrolled: (id) =>
    set((state) => ({
      enrolledIds: new Set(state.enrolledIds).add(id),
    })),
  setProgress: (id, percentage) =>
    set((state) => ({
      progressMap: { ...state.progressMap, [id]: percentage },
    })),
  reset: () => set({ enrolledIds: new Set(), progressMap: {} }),
}));
