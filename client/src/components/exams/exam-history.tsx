"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { attemptsApi } from "@/lib/api";
import { Clock, Loader2 } from "lucide-react";
import { localizedText as localized } from "@/lib/utils";

export function ExamHistory() {
  const t = useTranslations("exams");
  const router = useRouter();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attemptsApi.list()
      .then((res) => setAttempts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (attempts.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">{t("no_history")}</p>;
  }

  return (
    <div className="space-y-3">
      {attempts.map((attempt) => {
        const percentage = attempt.correctCount > 0 && attempt.questionCount > 0
          ? Math.round((attempt.correctCount / attempt.questionCount) * 100) : 0;
        const hours = Math.floor((attempt.timeSpent || 0) / 3600);
        const minutes = Math.floor(((attempt.timeSpent || 0) % 3600) / 60);
        const examTitle = localized(attempt.examName) || t("exam");

        return (
          <Card key={attempt.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="overflow-hidden">
                <p className="font-medium break-words">{examTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {attempt.mode} {t("mode")} &middot; {attempt.answeredCount ?? 0}/{attempt.questionCount} {t("answered")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {attempt.status === "completed" && (
                  <>
                    <div className="text-right">
                      <p className="text-lg font-bold">{percentage}%</p>
                      <p className="text-xs text-muted-foreground">
                        {attempt.correctCount}/{attempt.questionCount}
                      </p>
                    </div>
                    <Badge variant={percentage >= 70 ? "default" : "destructive"}>
                      {percentage >= 70 ? t("passed") : t("failed")}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/exams/${attempt.examId}/review/${attempt.id}`)}>
                      {t("review")}
                    </Button>
                  </>
                )}
                {attempt.status !== "completed" && (
                  <Badge variant="secondary">{t("in_progress")}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}