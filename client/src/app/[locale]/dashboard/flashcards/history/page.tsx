"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import { AccountTypeGate } from "@/components/account-type-gate";
import { flashcardsApi } from "@/lib/api/flashcards";
import { Clock, Loader2, ArrowLeft, Brain } from "lucide-react";
import type { FlashcardExamAttempt } from "@/types";

export default function FlashcardExamHistoryPage() {
  const t = useTranslations("flashcards");
  const te = useTranslations("exams");
  const router = useRouter();
  const [attempts, setAttempts] = useState<FlashcardExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    flashcardsApi.examHistory()
      .then((res) => setAttempts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AccountTypeGate>
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("exam_history")}</h1>
            <p className="text-muted-foreground">{t("exam_history_desc")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/flashcards")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> {t("back_to_study")}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : attempts.length === 0 ? (
          <Card><CardContent className="text-center py-12 text-muted-foreground">{t("no_exam_history")}</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt) => {
              const percentage = attempt.correctCount > 0 && attempt.questionCount > 0
                ? Math.round((attempt.correctCount / attempt.questionCount) * 100) : 0;
              const hours = Math.floor((attempt.timeSpent || 0) / 3600);
              const minutes = Math.floor(((attempt.timeSpent || 0) % 3600) / 60);
              const title = attempt.customTitle || `${t("flashcard_exam")} ${attempt.mode}`;

              return (
                <Card key={attempt.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="overflow-hidden">
                      <p className="font-medium break-words">{title}</p>
                      <p className="text-sm text-muted-foreground">
                        {attempt.mode} {te("mode")} &middot; {attempt.answeredCount ?? 0}/{attempt.questionCount} {te("answered")}
                        {attempt.timeSpent != null && (
                          <span> &middot; {hours > 0 ? `${hours}h ` : ""}{minutes}m</span>
                        )}
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
                            {percentage >= 70 ? te("passed") : te("failed")}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/flashcards/history/${attempt.id}`)}>
                            {te("review")}
                          </Button>
                        </>
                      )}
                      {attempt.status !== "completed" && (
                        <Badge variant="secondary">{te("in_progress")}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
    </AccountTypeGate>
  );
}
