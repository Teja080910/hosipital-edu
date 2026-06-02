export interface ExamDto {
  id: string;
  slug: string;
  name: Record<string, string>;
  description: Record<string, string>;
  isActive: boolean;
}

export interface SpecialtyDto {
  id: string;
  examId: string;
  name: Record<string, string>;
  slug: string;
}

export interface TopicDto {
  id: string;
  specialtyId: string;
  name: Record<string, string>;
  slug: string;
}

export interface SubtopicDto {
  id: string;
  topicId: string;
  name: Record<string, string>;
  slug: string;
}