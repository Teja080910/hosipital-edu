"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/routing";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import { AccountTypeGate } from "@/components/account-type-gate";
import { attemptsApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function ReviewPage({ params }: { params: { id: string; attemptId: string } }) {
  const { attemptId } = params;
  const t = useTranslations("exams");
  const router = useRouter();
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    attemptsApi.get(attemptId)
      .then(({ data }) => setAttempt(data))
      .catch(() => toast.error(t("load_failed")))
      .finally(() => setLoading(false));
  }, [attemptId, t]);

  if (loading) return <PageTransition><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></PageTransition>;
  if (!attempt) return <PageTransition><div className="text-center py-12 text-muted-foreground">{t("no_exams")}</div></PageTransition>;

  const answers = attempt.answers || [];
  const currentAnswer = answers[currentIndex];
  const question = currentAnswer?.question;
  const percentage = attempt.questionCount > 0 ? Math.round((attempt.correctCount / attempt.questionCount) * 100) : 0;

  if (answers.length === 0) {
    return (
      <AccountTypeGate>
      <PageTransition>
        <div className="max-w-3xl mx-auto space-y-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard/exams")}><ArrowLeft className="h-4 w-4 mr-2" /> {t("back_to_exams")}</Button>
          <Card><CardContent className="text-center py-8 text-muted-foreground">{t("no_questions")}</CardContent></Card>
        </div>
      </PageTransition>
      </AccountTypeGate>
    );
  }

  if (!question) {
    return (
      <AccountTypeGate>
      <PageTransition>
        <div className="max-w-3xl mx-auto space-y-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard/exams")}><ArrowLeft className="h-4 w-4 mr-2" /> {t("back_to_exams")}</Button>
          <Card><CardContent className="text-center py-8 text-muted-foreground">{t("no_questions")}</CardContent></Card>
        </div>
      </PageTransition>
      </AccountTypeGate>
    );
  }

  return (
    <AccountTypeGate>
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-4 pb-12">
        <Button variant="ghost" onClick={() => router.push("/dashboard/exams")}><ArrowLeft className="h-4 w-4 mr-2" /> {t("back_to_exams")}</Button>

        <Card><CardContent className="flex items-center justify-between py-4">
          <div><p className="text-lg font-bold">{t("review")}</p><p className="text-sm text-muted-foreground">{attempt.mode} {t("mode")} &middot; {attempt.questionCount} {t("questions_count", { count: attempt.questionCount })} &middot; {t("score")}: {percentage}%</p></div>
          <Badge variant={percentage >= 70 ? "default" : "destructive"}>{percentage >= 70 ? t("passed") : t("failed")}</Badge>
        </CardContent></Card>

        <> 
          <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("question_of", { current: currentIndex + 1, total: answers.length })}</span>
                  <div className="flex items-center gap-2">
                    {currentAnswer.isCorrect ? <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> {t("correct")}</Badge> : <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> {t("incorrect")}</Badge>}
                    <Badge variant="secondary">{question.difficulty}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg font-medium break-words" dangerouslySetInnerHTML={{ __html: question.text }} />
                <div className="space-y-3">
                  {question.options.map((option: any) => {
                    const isSelected = currentAnswer.selectedOptionId === option.id;
                    const isCorrectOption = option.isCorrect;
                    let borderClass = "border-input"; let bgClass = "";
                    if (isCorrectOption) { borderClass = "border-green-500"; bgClass = "bg-green-50 dark:bg-green-950/20"; }
                    else if (isSelected && !isCorrectOption) { borderClass = "border-destructive"; bgClass = "bg-red-50 dark:bg-red-950/20"; }
                    return (
                      <div key={option.id} className={`rounded-lg border p-4 ${borderClass} ${bgClass}`}>
                        <div className="flex items-center gap-3">
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isCorrectOption ? "border-green-500 bg-green-500" : isSelected ? "border-destructive bg-destructive" : "border-muted-foreground"}`}>
                            {isCorrectOption && <CheckCircle2 className="h-3 w-3 text-white" />}{isSelected && !isCorrectOption && <XCircle className="h-3 w-3 text-white" />}
                          </div>
                           <span className={`${isSelected && !isCorrectOption ? "line-through text-muted-foreground" : ""} break-words`}>{option.text}</span>
                          {isSelected && <span className="text-xs text-muted-foreground ml-auto">{t("your_answer")}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {currentAnswer.timeSpent > 0 && <div className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-4 w-4" /><span>{currentAnswer.timeSpent}s {t("spent")}</span></div>}
                <div className="rounded-lg bg-muted p-4"><p className="text-sm font-medium mb-1">{t("explanation")}</p><p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: question.explanation }} /></div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))} disabled={currentIndex === 0}><ArrowLeft className="h-4 w-4 mr-2" /> {t("previous")}</Button>
              <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.min(i + 1, answers.length - 1))} disabled={currentIndex >= answers.length - 1}>{t("next")} <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {answers.map((_: any, i: number) => (
                <button key={i} onClick={() => setCurrentIndex(i)} className={`h-8 w-8 rounded text-xs font-medium ${i === currentIndex ? "ring-2 ring-primary ring-offset-2" : ""} ${answers[i]?.isCorrect ? "bg-green-500 text-white" : "bg-destructive text-destructive-foreground"}`}>{i + 1}</button>
              ))}
            </div>
          </>
        </div>
      </PageTransition>
      </AccountTypeGate>
    );
  }