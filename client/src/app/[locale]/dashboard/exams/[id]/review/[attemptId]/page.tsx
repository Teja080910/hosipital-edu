"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/routing";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import { attemptsApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

export default function ReviewPage({ params }: { params: { id: string; attemptId: string } }) {
  const { id, attemptId } = params;
  const router = useRouter();
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    attemptsApi.get(attemptId)
      .then(({ data }) => setAttempt(data))
      .catch(() => toast.error("Failed to load attempt"))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageTransition>
    );
  }

  if (!attempt) {
    return (
      <PageTransition>
        <div className="text-center py-12 text-muted-foreground">Attempt not found.</div>
      </PageTransition>
    );
  }

  const answers = attempt.answers || [];
  const currentAnswer = answers[currentIndex];

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => router.push("/dashboard/exams")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Exams
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Exam Review</h1>
            <p className="text-sm text-muted-foreground">{attempt.mode} mode · {attempt.questionCount} questions</p>
          </div>
          <Badge variant={attempt.status === "completed" ? "default" : "secondary"}>
            {attempt.status}
          </Badge>
        </div>

        {answers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">No answers recorded.</CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Question {currentIndex + 1} of {answers.length}
                  </span>
                  <div className="flex items-center gap-1">
                    {currentAnswer?.isCorrect ? (
                      <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Correct</Badge>
                    ) : (
                      <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Incorrect</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg font-medium">{currentAnswer.questionId}</p>
                <p className="text-sm text-muted-foreground">
                  Selected option: {currentAnswer.selectedOptionId || "None"}
                </p>
                {currentAnswer.timeSpent > 0 && (
                  <p className="text-sm text-muted-foreground">Time: {currentAnswer.timeSpent}s</p>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))} disabled={currentIndex === 0}>
                Previous
              </Button>
              <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.min(i + 1, answers.length - 1))} disabled={currentIndex >= answers.length - 1}>
                Next
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {answers.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-8 w-8 rounded text-xs font-medium ${
                    i === currentIndex ? "ring-2 ring-primary ring-offset-2" : ""
                  } ${
                    answers[i]?.isCorrect ? "bg-green-500 text-white" :
                    "bg-destructive text-destructive-foreground"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
