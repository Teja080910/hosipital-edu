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
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Clock, HelpCircle } from "lucide-react";

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
      <div className="mx-auto max-w-6xl space-y-5 px-4 pt-6 pb-20">
        <Button variant="ghost" onClick={() => router.push("/dashboard/exams")}><ArrowLeft className="h-4 w-4 mr-2" /> {t("back_to_exams")}</Button>

        <Card><CardContent className="flex items-center justify-between py-4">
          <div><p className="text-lg font-bold">{t("review")}</p><p className="text-sm text-muted-foreground">{attempt.mode} {t("mode")} &middot; {attempt.questionCount} {t("questions_count", { count: attempt.questionCount })} &middot; {t("score")}: {percentage}%</p></div>
          <Badge variant={percentage >= 70 ? "default" : "secondary"} className={percentage >= 70 ? "" : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"}>{percentage >= 70 ? t("passed") : t("failed")}</Badge>
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
                    {currentAnswer.isCorrect ? <Badge className="bg-blue-500"><CheckCircle2 className="h-3 w-3 mr-1" /> {t("correct")}</Badge> : <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"><HelpCircle className="h-3 w-3 mr-1" /> {t("incorrect")}</Badge>}
                    <Badge variant="secondary" className="rounded-full">{question.difficulty}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-5 sm:p-6">
              <QuestionPenOverlay questionId={`${attemptId}-${currentAnswer.id || currentIndex}`}>
              <div className="text-lg font-semibold leading-8 text-foreground sm:text-xl space-y-2 overflow-hidden break-words [&_p]:mb-2 last:[&_p]:mb-0" dangerouslySetInnerHTML={{ __html: question.text }} />
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
                  if (isCorrectOption) optionClass = "border-blue-400 bg-blue-50 shadow-subtle dark:bg-blue-950/20";
                  else if (isSelected && !isCorrectOption) optionClass = "border-blue-300 bg-blue-50/50 shadow-subtle dark:bg-blue-950/10";
                  else if (isSelected) optionClass = "border-primary bg-primary/10 shadow-subtle";
                  return (
                    <div key={option.id} className={`group w-full rounded-2xl border p-4 text-left transition-all duration-200 ${optionClass}`}>
                      <div className="flex items-start gap-4">
                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border text-sm font-semibold transition-colors ${
                          isCorrectOption ? "border-blue-400 bg-blue-500 text-white" :
                          isSelected && !isCorrectOption ? "border-blue-300 bg-blue-400 text-white" :
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
              {question.explanation && (<div className="rounded-2xl border border-blue-100 bg-blue-50/50 dark:bg-blue-950/10 dark:border-blue-900 p-5 overflow-hidden mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10"><span className="text-xs text-blue-600 dark:text-blue-400 font-bold">i</span></div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t("explanation")}</p>
                </div>
                {(() => {
                  const correctOpt = question.options.find((o: any) => o.isCorrect);
                  return correctOpt ? <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-3 bg-green-50 dark:bg-green-950/20 rounded-xl px-3 py-2 border border-green-200 dark:border-green-900">{t("correct_answer")}: {correctOpt.text}</p> : null;
                })()}
                <div className="text-sm leading-7 text-foreground/85 break-words [&_p]:mb-3 [&_p:last-child]:mb-0" dangerouslySetInnerHTML={{ __html: question.explanation }} />
                {question.images?.filter((img: any) => img.section === "explanation").map((img: any) => (<img key={img.id} src={img.url} alt={img.caption || ""} className="mt-4 max-w-full rounded-xl border shadow-subtle" style={{ maxHeight: 300 }} />))}
              </div>)}
              {question.reference && (<div className="rounded-2xl border bg-blue-50 dark:bg-blue-950/20 p-4 overflow-hidden mt-4"><p className="text-sm font-semibold mb-1">{t("reference")}</p><p className="text-sm leading-6 text-muted-foreground break-words [&_p]:mb-2 last:[&_p]:mb-0" dangerouslySetInnerHTML={{ __html: question.reference }} /></div>)}
              <div className="flex items-center justify-between gap-4 mt-6">
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
                      className={`h-10 w-10 rounded-xl border text-sm font-semibold transition-all ${i === currentIndex ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""} ${answers[i]?.isCorrect ? "bg-blue-500 text-white border-blue-500" : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800"}`}>{i + 1}</button>
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
