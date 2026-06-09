export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin" | "super_admin";
  avatar?: string;
}

export interface Question {
  id: string;
  examId: string | null;
  specialtyId: string | null;
  topicId: string | null;
  subtopicId: string | null;
  text: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  isActive: boolean;
  options: QuestionOption[];
  images?: QuestionImage[];
}

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  sortOrder: number;
}

export interface QuestionImage {
  id: string;
  questionId: string;
  url: string;
  caption: string | null;
  sortOrder: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  specialty: string;
  topic: string;
  dueDate: string;
  interval: number;
  ease: number;
  repetitions: number;
}

export interface Exam {
  id: string;
  slug: string;
  name: Record<string, string>;
  description: Record<string, string>;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  specialties?: Specialty[];
}

export interface Specialty {
  id: string;
  examId: string;
  name: Record<string, string>;
  slug: string;
  sortOrder: number;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  examId: string;
  mode: "study" | "exam";
  status: "in_progress" | "completed";
  questionCount: number;
  answeredCount: number;
  correctCount: number;
  timeLimit: number | null;
  timeSpent: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  examName?: Record<string, string>;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  progress: number;
  lessons: number;
  duration: string;
}

export interface ProgressStats {
  questionsAnswered: number;
  accuracy: number;
  streak: number;
  studyTime: number;
  weeklyActivity: { day: string; minutes: number }[];
  accuracyBySpecialty: { specialty: string; accuracy: number }[];
}

export interface Subscription {
  id: string;
  userId: string;
  plan: "monthly" | "quarterly" | "annual";
  status: "active" | "canceled" | "expired";
  startDate: string;
  endDate: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  status: "draft" | "published";
}

export interface Translation {
  id: string;
  key: string;
  en: string;
  es: string;
  namespace: string;
}

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalQuestions: number;
  totalExams: number;
  revenue: number;
  userGrowth: { month: string; count: number }[];
}