"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";

const mockHistory = [
  { id: "1", examTitle: "ENARM", score: 145, totalQuestions: 200, correctAnswers: 145, timeSpent: 7200, completedAt: "2024-03-15" },
  { id: "2", examTitle: "Cardiology Quiz", score: 18, totalQuestions: 25, correctAnswers: 18, timeSpent: 1800, completedAt: "2024-03-14" },
  { id: "3", examTitle: "Anatomy Review", score: 42, totalQuestions: 50, correctAnswers: 42, timeSpent: 3600, completedAt: "2024-03-10" },
];

export function ExamHistory() {
  return (
    <div className="space-y-3">
      {mockHistory.map((attempt) => {
        const percentage = Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100);
        const hours = Math.floor(attempt.timeSpent / 3600);
        const minutes = Math.floor((attempt.timeSpent % 3600) / 60);

        return (
          <Card key={attempt.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{attempt.examTitle}</p>
                <p className="text-sm text-muted-foreground">{attempt.completedAt}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold">{percentage}%</p>
                  <p className="text-xs text-muted-foreground">
                    {attempt.correctAnswers}/{attempt.totalQuestions}
                  </p>
                </div>
                <Badge variant={percentage >= 70 ? "default" : "destructive"}>
                  {percentage >= 70 ? "Passed" : "Failed"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}