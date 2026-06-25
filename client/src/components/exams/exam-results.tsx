"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Target, XCircle, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface ExamResultsProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  onReview: () => void;
  onRetry: () => void;
  onGoHome: () => void;
}

export function ExamResults({
  score,
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  timeSpent,
  onReview,
  onRetry,
  onGoHome,
}: ExamResultsProps) {
  const t = useTranslations("exams");
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onGoHome}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("back_to_exams")}
        </Button>
      </div>
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">{t("your_results")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="relative h-32 w-32">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--muted)"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeDasharray={`${percentage}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{percentage}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <Target className="h-5 w-5 mx-auto text-muted-foreground" />
              <p className="text-2xl font-bold mt-1">{score}</p>
              <p className="text-xs text-muted-foreground">{t("score")}</p>
            </div>
            <div className="text-center">
              <CheckCircle className="h-5 w-5 mx-auto text-green-500" />
              <p className="text-2xl font-bold mt-1 text-green-500">{correctAnswers}</p>
              <p className="text-xs text-muted-foreground">{t("correct")}</p>
            </div>
            <div className="text-center">
              <XCircle className="h-5 w-5 mx-auto text-destructive" />
              <p className="text-2xl font-bold mt-1 text-destructive">{incorrectAnswers}</p>
              <p className="text-xs text-muted-foreground">{t("incorrect")}</p>
            </div>
            <div className="text-center">
              <Clock className="h-5 w-5 mx-auto text-muted-foreground" />
              <p className="text-2xl font-bold mt-1">{minutes}:{String(seconds).padStart(2, "0")}</p>
              <p className="text-xs text-muted-foreground">{t("time")}</p>
            </div>
          </div>

          <Progress value={percentage} className="h-2" />

          <div className="flex justify-center gap-4">
            <button onClick={onReview} className="text-sm text-primary hover:underline">{t("review_answers")}</button>
            <button onClick={onRetry} className="text-sm text-primary hover:underline">{t("try_again")}</button>
            <button onClick={onGoHome} className="text-sm text-primary hover:underline">{t("go_home")}</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}