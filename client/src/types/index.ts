export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
}

export interface Question {
  id: string;
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  specialty: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  explanation?: string;
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
  title: string;
  description: string;
  questionCount: number;
  timeLimit: number;
  specialties: string[];
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
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