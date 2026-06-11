export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin" | "super_admin";
  avatar?: string;
}

export interface Question {
  id: string;
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  images?: { id: string; url: string; section?: string; caption?: string; sortOrder: number }[];
  specialtyId?: string;
  topicId?: string;
  subtopicId?: string;
  specialty: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  explanation?: string;
  reference?: string;
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
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  shortDescription: Record<string, string> | null;
  coverImage: string | null;
  price: string;
  durationDays: number;
  hasCertificate: boolean;
  sortOrder: number;
  isActive: boolean;
  lessonCount?: number;
  modules?: CourseModule[];
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: Record<string, string>;
  description: Record<string, string>;
  sortOrder: number;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  moduleId: string;
  title: Record<string, string>;
  contentType: "video" | "pdf" | "text" | "quiz";
  videoUrl: string | null;
  pdfUrl: string | null;
  content: string | null;
  duration: number;
  sortOrder: number;
  isFreePreview: boolean;
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