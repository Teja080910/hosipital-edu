"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import type { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  showAnswer: boolean;
  onToggleAnswer: () => void;
  onBack: () => void;
}

export function QuestionCard({ question, showAnswer, onToggleAnswer, onBack }: QuestionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="flex gap-2">
            <Badge variant="secondary">{question.specialty}</Badge>
            <Badge
              variant={
                question.difficulty === "easy" ? "default" :
                question.difficulty === "medium" ? "secondary" : "destructive"
              }
            >
              {question.difficulty}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">{question.text}</h3>
        </div>

        <div className="space-y-3">
          {question.options.map((option) => (
            <div
              key={option.id}
              className={`rounded-lg border p-4 transition-colors ${
                showAnswer && option.isCorrect
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                  showAnswer && option.isCorrect ? "border-green-500 bg-green-500" : "border-muted-foreground"
                }`}>
                  {showAnswer && option.isCorrect && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <span>{option.text}</span>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={onToggleAnswer} className="w-full">
          {showAnswer ? (
            <><EyeOff className="h-4 w-4 mr-2" /> Hide Answer</>
          ) : (
            <><Eye className="h-4 w-4 mr-2" /> Show Answer</>
          )}
        </Button>

        {showAnswer && question.explanation && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium mb-1">Explanation:</p>
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}