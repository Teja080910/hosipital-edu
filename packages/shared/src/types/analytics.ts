export interface UserStatsDto {
  totalQuestionsAnswered: number;
  overallAccuracy: number;
  studyStreak: number;
  totalStudyTime: number; // minutes
  questionsBySpecialty: { specialtyId: string; name: string; total: number; correct: number }[];
  weeklyActivity: { date: string; questionsAnswered: number; minutesStudied: number }[];
}

export interface AdminStatsDto {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  questionsAnswered: number;
  usersByDay: { date: string; count: number }[];
  revenueByMonth: { month: string; amount: number }[];
}