"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/routing";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageTransition } from "@/components/page-transition";
import { QuestionTimer } from "@/components/questions/question-timer";
import { ExamResults } from "@/components/exams/exam-results";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { examsApi, attemptsApi, questionsApi } from "@/lib/api";
import { toast } from "sonner";
import {
  Loader2, ArrowLeft, ArrowRight, Flag, FlagOff, CheckCircle2, XCircle,
  GraduationCap, Settings2, Play, AlertTriangle,
} from "lucide-react";
import type { Question } from "@/types";

type PageState = "config" | "taking" | "results";

function localized(obj: Record<string, string> | string | null | undefined, locale = "en"): string {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[locale] || Object.values(obj)[0] || "";
}

export default function ExamTakingPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const t = useTranslations("exams");
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>("config");
  const [mode, setMode] = useState<"study" | "exam">("exam");
  const [questionLimit, setQuestionLimit] = useState(10);
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { optionId: string | null; isCorrect: boolean | null; flagged: boolean }>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [timeLimit, setTimeLimit] = useState(20);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  const [results, setResults] = useState<{
    score: number; totalQuestions: number; correctAnswers: number;
    incorrectAnswers: number; timeSpent: number;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      examsApi.get(id),
      questionsApi.list({ examId: id }),
    ])
      .then(([examRes, questionsRes]) => {
        setExam(examRes.data);
        setQuestions(questionsRes.data);
      })
      .catch(() => toast.error("Failed to load exam"))
      .finally(() => setLoading(false));
  }, [id]);

  const currentQuestion = questions[currentIndex] ?? null;
  const answeredCount = Object.values(answers).filter((a) => a.optionId !== null).length;
  const flaggedCount = Object.values(answers).filter((a) => a.flagged).length;

  const handleStart = async () => {
    const totalQuestions = Math.min(questionLimit, questions.length);
    if (totalQuestions === 0) {
      toast.error("No questions available for this exam");
      return;
    }
    try {
      const { data: attempt } = await attemptsApi.create({
        examId: id,
        mode,
        questionCount: totalQuestions,
        timeLimit: mode === "exam" ? timeLimit : undefined,
      });
      setAttemptId(attempt.id);
      setTimeRemaining(mode === "exam" ? timeLimit * 60 : 0);
      setTimeSpent(0);
      setAnswers({});
      setCurrentIndex(0);
      setSelectedOption(null);
      setShowAnswer(false);
      setPageState("taking");
    } catch {
      toast.error("Failed to start exam");
    }
  };

  const handleAnswer = async (optionId: string) => {
    if (!attemptId || !currentQuestion) return;
    const isCorrect = currentQuestion.options.find((o) => o.id === optionId)?.isCorrect ?? false;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { optionId, isCorrect, flagged: prev[currentQuestion.id]?.flagged ?? false },
    }));
    setSelectedOption(optionId);

    if (mode === "exam") {
      try {
        await attemptsApi.answer(attemptId, {
          questionId: currentQuestion.id,
          selectedOptionId: optionId,
          timeSpent,
        });
      } catch {
        // silent - answer saved locally anyway
      }
    } else {
      setShowAnswer(true);
    }
  };

  const handleFlag = () => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        optionId: prev[currentQuestion.id]?.optionId ?? null,
        isCorrect: prev[currentQuestion.id]?.isCorrect ?? null,
        flagged: !(prev[currentQuestion.id]?.flagged ?? false),
      },
    }));
  };

  const handleNext = () => {
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
    setSelectedOption(null);
    setShowAnswer(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
    setSelectedOption(null);
    setShowAnswer(false);
  };

  const handleTick = useCallback(() => {
    setTimeRemaining((t) => Math.max(t - 1, 0));
    setTimeSpent((t) => t + 1);
  }, []);

  const handleTimeUp = () => {
    setShowTimeWarning(true);
  };

  const handleRequestSubmit = () => {
    setShowSubmitDialog(true);
  };

  const handleConfirmSubmit = async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);
    setShowSubmitDialog(false);
    setShowTimeWarning(false);
    try {
      await attemptsApi.complete(attemptId);

      const correctAnswers = Object.values(answers).filter((a) => a.isCorrect === true).length;
      const totalQuestions = Math.min(questionLimit, questions.length);

      setResults({
        score: Math.round((correctAnswers / totalQuestions) * 100),
        totalQuestions,
        correctAnswers,
        incorrectAnswers: totalQuestions - correctAnswers,
        timeSpent,
      });
      setPageState("results");
    } catch {
      toast.error("Failed to submit exam");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishStudy = async () => {
    if (!attemptId) return;
    try {
      await attemptsApi.complete(attemptId);
    } catch {
      // silent
    }
    const correctAnswers = Object.values(answers).filter((a) => a.isCorrect === true).length;
    const totalQuestions = Math.min(questionLimit, questions.length);
    setResults({
      score: Math.round((correctAnswers / totalQuestions) * 100),
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      timeSpent,
    });
    setPageState("results");
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageTransition>
    );
  }

  if (!exam) {
    return (
      <PageTransition>
        <div className="text-center py-12 text-muted-foreground">{t("no_exams")}</div>
      </PageTransition>
    );
  }

  if (pageState === "results" && results) {
    return (
      <PageTransition>
        <ExamResults
          score={results.score}
          totalQuestions={results.totalQuestions}
          correctAnswers={results.correctAnswers}
          incorrectAnswers={results.incorrectAnswers}
          timeSpent={results.timeSpent}
          onReview={() => setPageState("taking")}
          onRetry={() => {
            setPageState("config");
            setResults(null);
            setAttemptId(null);
          }}
        />
      </PageTransition>
    );
  }

  if (pageState === "taking") {
    if (!currentQuestion) {
      return (
        <PageTransition>
          <div className="text-center py-12 text-muted-foreground">{t("no_questions")}</div>
        </PageTransition>
      );
    }

    const answered = answers[currentQuestion.id]?.optionId ?? null;
    const flagged = answers[currentQuestion.id]?.flagged ?? false;
    const currentAnsweredCount = Object.values(answers).filter((a) => a.optionId !== null).length;
    const totalQ = Math.min(questionLimit, questions.length);

    return (
      <PageTransition>
        <div className="space-y-4 max-w-3xl mx-auto pb-20">
          {mode === "exam" && (
            <div className="flex items-center justify-between">
              <QuestionTimer
                timeRemaining={timeRemaining}
                onTick={handleTick}
                onTimeUp={handleTimeUp}
              />
              <div className="text-sm text-muted-foreground">
                {currentAnsweredCount}/{totalQ} {t("answered")}
                {flaggedCount > 0 && ` · ${flaggedCount} ${t("flagged")}`}
              </div>
            </div>
          )}

          <Progress value={(currentAnsweredCount / totalQ) * 100} className="h-1" />

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("question_of", { current: currentIndex + 1, total: totalQ })}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
                  <Button variant="ghost" size="icon" onClick={handleFlag} title={t("flag_question")}>
                    {flagged ? <FlagOff className="h-4 w-4 text-destructive" /> : <Flag className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg font-medium">{currentQuestion.text}</p>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = answered === option.id;
                  const showCorrect = showAnswer || (mode === "exam" && answered !== null && isSelected);
                  const isCorrectOption = option.isCorrect;

                  let borderClass = "border-input hover:bg-muted/50";
                  let bgClass = "";
                  if (showCorrect && isCorrectOption) {
                    borderClass = "border-green-500";
                    bgClass = "bg-green-50 dark:bg-green-950/20";
                  } else if (showCorrect && isSelected && !isCorrectOption) {
                    borderClass = "border-destructive";
                    bgClass = "bg-red-50 dark:bg-red-950/20";
                  } else if (isSelected && mode === "exam") {
                    borderClass = "border-primary";
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => !answered && handleAnswer(option.id)}
                      disabled={answered !== null && mode === "study"}
                      className={`w-full text-left rounded-lg border p-4 transition-colors ${borderClass} ${bgClass} cursor-pointer`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          showCorrect && isCorrectOption ? "border-green-500 bg-green-500" :
                          showCorrect && isSelected && !isCorrectOption ? "border-destructive bg-destructive" :
                          isSelected && mode === "exam" ? "border-primary bg-primary" :
                          "border-muted-foreground"
                        }`}>
                          {(showCorrect && isCorrectOption) && <CheckCircle2 className="h-3 w-3 text-white" />}
                          {(showCorrect && isSelected && !isCorrectOption) && <XCircle className="h-3 w-3 text-white" />}
                        </div>
                        <span>{option.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {showAnswer && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium mb-1">Explanation:</p>
                  <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                </div>
              )}

              {mode === "study" && answered && !showAnswer && (
                <Button variant="outline" onClick={() => setShowAnswer(true)} className="w-full">
                  {t("show_explanation")}
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("previous")}
            </Button>

            {currentIndex >= totalQ - 1 ? (
              mode === "exam" ? (
                <Button onClick={handleRequestSubmit}>
                  {t("submit")}
                </Button>
              ) : (
                <Button onClick={handleFinishStudy}>
                  {t("submit")}
                </Button>
              )
            ) : (
              <Button onClick={handleNext} disabled={!answered && mode === "exam"}>
                {t("next")} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>

          {mode === "exam" && (
            <>
              <div className="flex flex-wrap gap-2 justify-center pt-4">
                {Array.from({ length: totalQ }).map((_, i) => {
                  const q = questions[i];
                  const a = q ? answers[q.id] : undefined;
                  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
                  if (a?.flagged) variant = "destructive";
                  else if (a?.optionId) variant = "default";

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentIndex(i);
                        setSelectedOption(null);
                        setShowAnswer(false);
                      }}
                      className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
                        i === currentIndex ? "ring-2 ring-primary ring-offset-2" : ""
                      } ${
                        variant === "default" ? "bg-primary text-primary-foreground" :
                        variant === "destructive" ? "bg-destructive text-destructive-foreground" :
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-md p-3 z-50">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {currentAnsweredCount}/{totalQ} {t("answered")}
                    {flaggedCount > 0 && ` · ${flaggedCount} ${t("flagged")}`}
                    {timeRemaining > 0 && timeRemaining < 120 && (
                      <span className="ml-2 text-destructive font-medium flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  <Button onClick={handleRequestSubmit} disabled={submitting} size="sm">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                    {t("submit")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <ConfirmDialog
          open={showSubmitDialog}
          onOpenChange={setShowSubmitDialog}
          title={t("submit")}
          description={t("submit_confirm")}
          confirmLabel={t("submit")}
          cancelLabel="Cancel"
          variant="default"
          onConfirm={handleConfirmSubmit}
        />

        <ConfirmDialog
          open={showTimeWarning}
          onOpenChange={setShowTimeWarning}
          title="Time's Up!"
          description="Your time has expired. The exam will be submitted automatically."
          confirmLabel={t("submit")}
          cancelLabel=""
          variant="default"
          onConfirm={handleConfirmSubmit}
        />
      </PageTransition>
    );
  }

  const maxQuestions = questions.length;
  const timeOptions = [5, 10, 15, 20, 30, 60];

  return (
    <PageTransition>
      <div className="max-w-xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard/exams")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> {t("back_to_exams")}
        </Button>

        {maxQuestions === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              {t("no_questions")}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Settings2 className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">{localized(exam.name)}</CardTitle>
              <CardDescription>{localized(exam.description)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">{t("select_mode")}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMode("study")}
                    className={`rounded-lg border-2 p-4 text-center transition-colors ${
                      mode === "study" ? "border-primary bg-primary/5" : "border-input hover:bg-muted/50"
                    }`}
                  >
                    <GraduationCap className="h-5 w-5 mx-auto mb-1" />
                    <p className="font-medium text-sm">{t("study_mode")}</p>
                    <p className="text-xs text-muted-foreground mt-1">Learn with instant feedback</p>
                  </button>
                  <button
                    onClick={() => setMode("exam")}
                    className={`rounded-lg border-2 p-4 text-center transition-colors ${
                      mode === "exam" ? "border-primary bg-primary/5" : "border-input hover:bg-muted/50"
                    }`}
                  >
                    <Play className="h-5 w-5 mx-auto mb-1" />
                    <p className="font-medium text-sm">{t("exam_mode")}</p>
                    <p className="text-xs text-muted-foreground mt-1">Timed simulation</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("select_questions")} (max {maxQuestions})
                </label>
                <input
                  type="range"
                  min={1}
                  max={maxQuestions}
                  step={1}
                  value={Math.min(questionLimit, maxQuestions)}
                  onChange={(e) => setQuestionLimit(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span className="font-medium text-sm">{Math.min(questionLimit, maxQuestions)} {t("questions_count", { count: Math.min(questionLimit, maxQuestions) })}</span>
                  <span>{maxQuestions}</span>
                </div>
              </div>

              {mode === "exam" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("time_limit")}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setTimeLimit(opt)}
                        className={`rounded-lg border p-2 text-center text-sm transition-colors ${
                          timeLimit === opt ? "border-primary bg-primary/5 font-medium" : "border-input hover:bg-muted/50"
                        }`}
                      >
                        {t("minutes", { count: opt })}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full h-12 text-lg" onClick={handleStart}>
                <Play className="h-5 w-5 mr-2" /> {t("begin")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
