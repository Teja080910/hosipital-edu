export type ContentType = "video" | "pdf" | "quiz" | "text";
export type QuizType = "pre_test" | "post_test" | "lesson_quiz";
export type EnrollmentStatus = "active" | "expired" | "refunded";

export interface CourseDto {
  id: string;
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  shortDescription?: Record<string, string>;
  coverImage?: string;
  price: number;
  durationDays: number;
  hasCertificate: boolean;
  modules: CourseModuleDto[];
}

export interface CourseModuleDto {
  id: string;
  title: Record<string, string>;
  sortOrder: number;
  lessons: CourseLessonDto[];
}

export interface CourseLessonDto {
  id: string;
  title: Record<string, string>;
  contentType: ContentType;
  videoUrl?: string;
  pdfUrl?: string;
  content?: string;
  duration: number;
  isFreePreview: boolean;
}