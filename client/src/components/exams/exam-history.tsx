"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { attemptsApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Eye } from "lucide-react";
import type { ExamAttempt } from "@/types";

export function ExamHistory() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    attemptsApi.list()
      .then(({ data }) => setAttempts(data))
      .catch(() => toast.error("Failed to load exam history"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No exam history yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {attempts.map((attempt) => {
        const percentage = attempt.questionCount > 0
          ? Math.round((attempt.correctCount / attempt.questionCount) * 100)
          : 0;
        const hours = Math.floor(attempt.timeSpent / 3600);
        const minutes = Math.floor((attempt.timeSpent % 3600) / 60);

        return (
          <Card
            key={attempt.id}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => router.push(`/dashboard/exams/${attempt.examId}/review/${attempt.id}`)}
          >
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium">{attempt.mode === "study" ? "Study" : "Exam"}</p>
                  <p className="text-sm text-muted-foreground">
                    {attempt.completedAt
                      ? new Date(attempt.completedAt).toLocaleDateString()
                      : "In progress"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold">{percentage}%</p>
                  <p className="text-xs text-muted-foreground">
                    {attempt.correctCount}/{attempt.questionCount}
                  </p>
                </div>
                {attempt.status === "completed" ? (
                  <Badge variant={percentage >= 70 ? "default" : "destructive"}>
                    {percentage >= 70 ? "Passed" : "Failed"}
                  </Badge>
                ) : (
                  <Badge variant="secondary">In Progress</Badge>
                )}
                {attempt.status === "completed" && (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
