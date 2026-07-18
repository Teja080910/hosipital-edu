"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageTransition } from "@/components/page-transition";
import { AccountTypeGate } from "@/components/account-type-gate";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { flashcardsApi } from "@/lib/api/flashcards";
import { FlashcardCard } from "@/components/flashcards/flashcard-card";
import { ExamResults } from "@/components/exams/exam-results";
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type PageState = "taking" | "results";

export default function FlashcardExamTakingPage({ params }: { params: { id: string } }) {
  const t = useTranslations("flashcards");
  const te = useTranslations("exams");
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>("taking");
  const [attempt, setAttempt] = useState<any>(null);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [results, setResults] = useState<{ score: number; totalQuestions: number; correctAnswers: number; incorrectAnswers: number; timeSpent: number } | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    flashcardsApi.examHistoryDetail(params.id)
      .then(({ data }) => {
        setAttempt(data);
        setFlashcards(data.flashcards || []);
        if (data.timeLimit) setTimeRemaining(data.timeLimit);
        if (data.status === "completed") {
          setPageState("results");
          setResults({
            score: data.scorePercentage ?? Math.round((data.correctCount / data.questionCount) * 100),
            totalQuestions: data.questionCount,
            correctAnswers: data.correctCount,
            incorrectAnswers: data.questionCount - data.correctCount,
            timeSpent: data.timeSpent || 0,
          });
        }
      })
      .catch(() => toast.error(te("load_failed")))
      .finally(() => setLoading(false));
  }, [params.id, te]);

  const handleTick = useCallback(() => {
    setTimeRemaining((t) => Math.max(t - 1, 0));
  }, []);

  const handleTimeUp = () => setShowTimeWarning(true);

  useEffect(() => {
    if (pageState !== "taking" || !attempt?.timeLimit || attempt?.status === "completed") return;
    const interval = setInterval(handleTick, 1000);
    return () => clearInterval(interval);
  }, [pageState, attempt, handleTick]);

  useEffect(() => {
    if (timeRemaining === 1 && attempt?.timeLimit) handleTimeUp();
  }, [timeRemaining, attempt]);

  const currentCard = flashcards[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const totalQ = flashcards.length;

  const handleAnswer = (isCorrect: boolean) => {
    if (!currentCard || answers[currentCard.id] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [currentCard.id]: isCorrect }));
    setIsFlipped(false);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsFlipped(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (submitting) return;
    submittedRef.current = true;
    setSubmitting(true);
    setShowSubmitDialog(false);
    setShowTimeWarning(false);
    try {
      for (const card of flashcards) {
        const isCorrect = answers[card.id];
        if (isCorrect !== undefined) {
          await flashcardsApi.answerExam(params.id, { flashcardId: card.id, isCorrect });
        }
      }
      const { data } = await flashcardsApi.completeExam(params.id);
      const correct = Object.values(answers).filter(Boolean).length;
      setResults({
        score: totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0,
        totalQuestions: totalQ,
        correctAnswers: correct,
        incorrectAnswers: totalQ - correct,
        timeSpent: data.timeSpent || 0,
      });
      setPageState("results");
    } catch {
      toast.error(te("submit_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </PageTransition>
    );
  }

  if (pageState === "results" && results) {
    return (
      <AccountTypeGate>
      <PageTransition>
        <ExamResults
          score={results.score}
          totalQuestions={results.totalQuestions}
          correctAnswers={results.correctAnswers}
          incorrectAnswers={results.incorrectAnswers}
          timeSpent={results.timeSpent}
          onReview={() => router.push(`/dashboard/flashcards/history/${params.id}`)}
          onRetry={() => router.push("/dashboard/flashcards/exam")}
          onGoHome={() => router.push("/dashboard/flashcards")}
        />
      </PageTransition>
      </AccountTypeGate>
    );
  }

  if (!flashcards.length) {
    return (
      <PageTransition>
        <div className="text-center py-12 text-muted-foreground">{te("no_questions")}</div>
      </PageTransition>
    );
  }

  return (
    <AccountTypeGate>
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/flashcards/exam")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> {t("back_to_study")}
          </Button>
          <div className="flex items-center gap-2">
            {attempt?.timeLimit && (
              <div className="inline-flex items-center rounded-full border bg-background px-3 py-2 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {timeRemaining > 0 ? (
                  <span className={timeRemaining < 120 ? "text-destructive font-medium" : ""}>
                    {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}
                  </span>
                ) : (
                  <span className="text-destructive font-medium">0:00</span>
                )}
              </div>
            )}
            <span className="rounded-full bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
              {answeredCount}/{totalQ} {te("answered")}
            </span>
          </div>
        </div>

        <Progress value={totalQ > 0 ? (answeredCount / totalQ) * 100 : 0} className="h-2" />

        <div className="text-center text-sm text-muted-foreground">
          {te("question_of", { current: currentIndex + 1, total: totalQ })}
        </div>

        <FlashcardCard
          front={currentCard.front}
          back={currentCard.back}
          isFlipped={isFlipped}
          onFlip={() => {
            if (answers[currentCard.id] === undefined) setIsFlipped(!isFlipped);
          }}
        />

        {answers[currentCard.id] === undefined ? (
          isFlipped && (
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleAnswer(false)}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <XCircle className="h-5 w-5 mr-2" /> {t("incorrect")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleAnswer(true)}
                className="border-green-500 text-green-600 hover:bg-green-500/10"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" /> {t("correct")}
              </Button>
            </div>
          )
        ) : (
          <div className="text-center space-y-4">
            <Badge className={answers[currentCard.id] ? "bg-green-500" : "bg-destructive"}>
              {answers[currentCard.id] ? (
                <><CheckCircle2 className="h-4 w-4 mr-1" /> {te("correct")}</>
              ) : (
                <><XCircle className="h-4 w-4 mr-1" /> {te("incorrect")}</>
              )}
            </Badge>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
                {te("previous")}
              </Button>
              {currentIndex < totalQ - 1 ? (
                <Button onClick={handleNext}>{te("next")}</Button>
              ) : (
                <Button onClick={() => setShowSubmitDialog(true)} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {te("submit")}
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center">
          {flashcards.map((_: any, i: number) => {
            const card = flashcards[i];
            const isAnswered = answers[card.id] !== undefined;
            const isCorrect = answers[card.id];
            let stateClass = "bg-muted text-muted-foreground";
            if (isAnswered && isCorrect) stateClass = "bg-green-500 text-white";
            else if (isAnswered && !isCorrect) stateClass = "bg-destructive text-destructive-foreground";
            if (i === currentIndex) stateClass += " ring-2 ring-primary ring-offset-2";
            return (
              <button
                key={i}
                onClick={() => { setCurrentIndex(i); setIsFlipped(false); }}
                className={`h-8 w-8 rounded text-xs font-medium transition-all ${stateClass}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <ConfirmDialog
          open={showSubmitDialog}
          onOpenChange={(open) => { if (!open && !submittedRef.current) setShowSubmitDialog(false); else setShowSubmitDialog(open); }}
          title={te("submit")}
          description={te("submit_confirm")}
          confirmLabel={te("submit")}
          variant="default"
          onConfirm={handleConfirmSubmit}
        />
        <ConfirmDialog
          open={showTimeWarning}
          onOpenChange={setShowTimeWarning}
          title={te("time_up")}
          description={te("time_up_desc")}
          confirmLabel={te("submit")}
          variant="default"
          onConfirm={handleConfirmSubmit}
        />
      </div>
    </PageTransition>
    </AccountTypeGate>
  );
}
