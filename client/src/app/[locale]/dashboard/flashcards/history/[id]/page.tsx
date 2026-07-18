"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/routing";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import { AccountTypeGate } from "@/components/account-type-gate";
import { flashcardsApi } from "@/lib/api/flashcards";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { FlashcardExamAttempt, FlashcardExamAnswer } from "@/types";

export default function FlashcardExamReviewPage({ params }: { params: { id: string } }) {
  const t = useTranslations("flashcards");
  const te = useTranslations("exams");
  const router = useRouter();
  const [attempt, setAttempt] = useState<(FlashcardExamAttempt & { answers: FlashcardExamAnswer[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    flashcardsApi.examHistoryDetail(params.id)
      .then(({ data }) => setAttempt(data))
      .catch(() => toast.error(te("load_failed")))
      .finally(() => setLoading(false));
  }, [params.id, te]);

  if (loading) return <PageTransition><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></PageTransition>;
  if (!attempt) return <PageTransition><div className="text-center py-12 text-muted-foreground">{te("no_exams")}</div></PageTransition>;

  const answers = attempt.answers || [];
  const currentAnswer = answers[currentIndex];
  const percentage = attempt.questionCount > 0 ? Math.round((attempt.correctCount / attempt.questionCount) * 100) : 0;

  if (answers.length === 0) {
    return (
      <AccountTypeGate>
      <PageTransition>
        <div className="max-w-3xl mx-auto space-y-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard/flashcards/history")}><ArrowLeft className="h-4 w-4 mr-2" /> {t("back_to_history")}</Button>
          <Card><CardContent className="text-center py-8 text-muted-foreground">{te("no_questions")}</CardContent></Card>
        </div>
      </PageTransition>
      </AccountTypeGate>
    );
  }

  return (
    <AccountTypeGate>
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-4 pb-12">
        <Button variant="ghost" onClick={() => router.push("/dashboard/flashcards/history")}><ArrowLeft className="h-4 w-4 mr-2" /> {t("back_to_history")}</Button>

        <Card><CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="text-lg font-bold">{te("review")}</p>
            <p className="text-sm text-muted-foreground">
              {attempt.mode} {te("mode")} &middot; {attempt.questionCount} {te("questions_count", { count: attempt.questionCount })} &middot; {te("score")}: {percentage}%
            </p>
          </div>
          <Badge variant={percentage >= 70 ? "default" : "destructive"}>{percentage >= 70 ? te("passed") : te("failed")}</Badge>
        </CardContent></Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{te("question_of", { current: currentIndex + 1, total: answers.length })}</span>
              <div className="flex items-center gap-2">
                {currentAnswer.isCorrect ? (
                  <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> {te("correct")}</Badge>
                ) : (
                  <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> {te("incorrect")}</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium text-muted-foreground mb-1">{t("front")}</p>
              <p className="text-lg">{currentAnswer.flashcardFront}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium text-muted-foreground mb-1">{t("back")}</p>
              <p className="text-lg">{currentAnswer.flashcardBack}</p>
            </div>
            {currentAnswer.answeredAt && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{new Date(currentAnswer.answeredAt).toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))} disabled={currentIndex === 0}>
            <ArrowLeft className="h-4 w-4 mr-2" /> {te("previous")}
          </Button>
          <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.min(i + 1, answers.length - 1))} disabled={currentIndex >= answers.length - 1}>
            {te("next")} <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {answers.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-8 w-8 rounded text-xs font-medium ${
                i === currentIndex ? "ring-2 ring-primary ring-offset-2" : ""
              } ${answers[i]?.isCorrect ? "bg-green-500 text-white" : "bg-destructive text-destructive-foreground"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </PageTransition>
    </AccountTypeGate>
  );
}
