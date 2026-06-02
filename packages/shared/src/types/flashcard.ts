export interface FlashcardDto {
  id: string;
  examId?: string;
  specialtyId: string;
  topicId: string;
  front: string;
  back: string;
}

export interface FlashcardReviewDto {
  flashcardId: string;
  quality: number; // 0-5 for SM-2
}

export interface FlashcardStatsDto {
  totalCards: number;
  cardsDue: number;
  masteredCards: number;
  cardsStudiedToday: number;
}