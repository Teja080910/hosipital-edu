export type Difficulty = "easy" | "medium" | "hard";
export type ExamMode = "study" | "exam";
export type AttemptStatus = "in_progress" | "completed";

export interface QuestionDto {
  id: string;
  examId?: string;
  specialtyId: string;
  topicId: string;
  subtopicId?: string;
  text: string;
  explanation: string;
  difficulty: Difficulty;
  options: QuestionOptionDto[];
  images?: QuestionImageDto[];
}

export interface QuestionOptionDto {
  id: string;
  text: string;
  isCorrect: boolean;
  sortOrder: number;
}

export interface QuestionImageDto {
  id: string;
  url: string;
  caption?: string;
}

export interface ExamAttemptDto {
  id: string;
  examId: string;
  mode: ExamMode;
  status: AttemptStatus;
  questionCount: number;
  answeredCount: number;
  correctCount: number;
  timeLimit?: number;
  timeSpent: number;
  startedAt: string;
  completedAt?: string;
}

export interface ExamAnswerDto {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId?: string;
  isCorrect: boolean;
  timeSpent: number;
  isFlagged: boolean;
}

export interface QuestionFilterDto {
  examId?: string;
  specialtyId?: string;
  topicId?: string;
  subtopicId?: string;
  difficulty?: Difficulty;
  search?: string;
  page?: number;
  limit?: number;
}