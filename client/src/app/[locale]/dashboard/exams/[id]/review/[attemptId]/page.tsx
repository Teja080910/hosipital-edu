"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/routing";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import { AccountTypeGate } from "@/components/account-type-gate";
import { QuestionPenOverlay } from "@/components/exams/question-pen-overlay";
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

  if (answers.length === 0 || !question) {
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
      <div className="mx-auto max-w-6xl space-y-5 px-4 p-20">
        <Button variant="ghost" onClick={() => router.push("/dashboard/exams")}><ArrowLeft className="h-4 w-4 mr-2" /> {t("back_to_exams")}</Button>

        <Card><CardContent className="flex items-center justify-between py-4">
          <div><p className="text-lg font-bold">{t("review")}</p><p className="text-sm text-muted-foreground">{attempt.mode} {t("mode")} &middot; {attempt.questionCount} {t("questions_count", { count: attempt.questionCount })} &middot; {t("score")}: {percentage}%</p></div>
          <Badge variant={percentage >= 70 ? "default" : "destructive"}>{percentage >= 70 ? t("passed") : t("failed")}</Badge>
        </CardContent></Card>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Card className="overflow-hidden border-border/70 shadow-card hover:translate-y-0">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-subtle">
                  {currentIndex + 1}
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t("question_of", { current: currentIndex + 1, total: answers.length })}</span>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {currentAnswer.isCorrect ? <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> {t("correct")}</Badge> : <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> {t("incorrect")}</Badge>}
                    <Badge variant="secondary" className="rounded-full">{question.difficulty}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-5 sm:p-6">
              <QuestionPenOverlay questionId={`${attemptId}-${currentAnswer.id || currentIndex}`}>
              <div className="text-lg font-semibold leading-8 text-foreground sm:text-xl space-y-2 overflow-hidden break-words" dangerouslySetInnerHTML={{ __html: question.text }} />
              {question.images && question.images.filter((img: any) => img.section === "title").length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {question.images.filter((img: any) => img.section === "title").map((img: any) => (
                    <img key={img.id} src={img.url} alt={img.caption || ""} className="max-w-full rounded-xl border shadow-subtle" style={{ maxHeight: 400 }} />
                  ))}
                </div>
              )}
              <div className="space-y-3">
                {question.options.map((option: any, optionIndex: number) => {
                  const isSelected = currentAnswer.selectedOptionId === option.id;
                  const isCorrectOption = option.isCorrect;
                  let optionClass = "border-border bg-background hover:border-primary/50 hover:bg-primary/5 hover:shadow-subtle";
                  if (isCorrectOption) optionClass = "border-green-500 bg-green-50 text-green-950 shadow-subtle dark:bg-green-950/20 dark:text-green-100";
                  else if (isSelected && !isCorrectOption) optionClass = "border-destructive bg-red-50 text-red-950 shadow-subtle dark:bg-red-950/20 dark:text-red-100";
                  else if (isSelected) optionClass = "border-primary bg-primary/10 shadow-subtle";
                  return (
                    <div key={option.id} className={`group w-full rounded-2xl border p-4 text-left transition-all duration-200 ${optionClass}`}>
                      <div className="flex items-start gap-4">
                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border text-sm font-semibold transition-colors ${
                          isCorrectOption ? "border-green-500 bg-green-500 text-white" :
                          isSelected && !isCorrectOption ? "border-destructive bg-destructive text-white" :
                          isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-muted-foreground group-hover:border-primary/50 group-hover:text-primary"
                        }`}>
                          {isCorrectOption ? <CheckCircle2 className="h-4 w-4" /> :
                            isSelected && !isCorrectOption ? <XCircle className="h-4 w-4" /> :
                            String.fromCharCode(65 + optionIndex)}
                        </div>
                        <span className="pt-1.5 leading-6 break-words">{option.text}</span>
                        {isSelected && <span className="text-xs text-muted-foreground ml-auto mt-2">{t("your_answer")}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {currentAnswer.timeSpent > 0 && <div className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-4 w-4" /><span>{currentAnswer.timeSpent}s {t("spent")}</span></div>}
              {question.explanation && (<div className="rounded-2xl border bg-muted/50 p-4 overflow-hidden mt-4">
                <p className="text-sm font-semibold mb-1">{t("explanation")}</p>
                {(() => {
                  const correctOpt = question.options.find((o: any) => o.isCorrect);
                  return correctOpt ? <p className="text-sm font-medium mb-2">{correctOpt.text}</p> : null;
                })()}
                <div className="text-sm leading-6 text-muted-foreground space-y-2 break-words" dangerouslySetInnerHTML={{ __html: question.explanation }} />
                {question.images?.filter((img: any) => img.section === "explanation").map((img: any) => (<img key={img.id} src={img.url} alt={img.caption || ""} className="mt-3 max-w-full rounded-lg border" style={{ maxHeight: 300 }} />))}
              </div>)}
              {question.reference && (<div className="rounded-2xl border bg-blue-50 dark:bg-blue-950/20 p-4 overflow-hidden mt-4"><p className="text-sm font-semibold mb-1">{t("reference")}</p><p className="text-sm leading-6 text-muted-foreground break-words">{question.reference}</p></div>)}
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))} disabled={currentIndex === 0} className="rounded-xl"><ArrowLeft className="h-4 w-4 mr-2" /> {t("previous")}</Button>
                <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.min(i + 1, answers.length - 1))} disabled={currentIndex >= answers.length - 1} className="rounded-xl">{t("next")} <ArrowRight className="h-4 w-4 ml-2" /></Button>
              </div>
              </QuestionPenOverlay>
            </CardContent>
          </Card>

          <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <Card className="border-border/70 shadow-card hover:translate-y-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("questions")}</CardTitle>
                <CardDescription>{answers.filter((a: any) => a.isCorrect).length}/{answers.length} {t("correct")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {answers.map((_: any, i: number) => (
                    <button key={i} onClick={() => setCurrentIndex(i)}
                      className={`h-10 w-10 rounded-xl border text-sm font-semibold transition-all ${i === currentIndex ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""} ${answers[i]?.isCorrect ? "bg-green-500 text-white border-green-500" : "bg-destructive text-destructive-foreground border-destructive"}`}>{i + 1}</button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </PageTransition>
    </AccountTypeGate>
  );
}
