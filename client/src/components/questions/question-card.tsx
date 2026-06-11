"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("questions");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const handleSelect = (optionId: string) => {
    if (selectedOptionId) return;
    setSelectedOptionId(optionId);
  };

  const handleToggle = () => {
    if (showAnswer) setSelectedOptionId(null);
    onToggleAnswer();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" /> {t("back")}
          </Button>
          <div className="flex gap-2">
            {question.specialty && <Badge variant="secondary">{question.specialty}</Badge>}
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

        {question.images && question.images.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {question.images.map((img) => (
              <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer">
                <img src={img.url} alt={img.caption || "Question image"} className="max-w-full rounded-lg border" style={{ maxHeight: 400 }} />
              </a>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {question.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const showCorrect = showAnswer || (selectedOptionId && option.isCorrect);
            const showWrong = selectedOptionId && isSelected && !option.isCorrect;

            let borderClass = "border-input hover:bg-muted/50 cursor-pointer";
            let bgClass = "";
            if (showAnswer && option.isCorrect) { borderClass = "border-green-500"; bgClass = "bg-green-50 dark:bg-green-950/20"; }
            else if (showWrong) { borderClass = "border-destructive"; bgClass = "bg-red-50 dark:bg-red-950/20"; }
            else if (isSelected) { borderClass = "border-primary"; }

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={showAnswer}
                className={`w-full text-left rounded-lg border p-4 transition-colors ${borderClass} ${bgClass}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    showAnswer && option.isCorrect ? "border-green-500 bg-green-500" :
                    showWrong ? "border-destructive bg-destructive" :
                    isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                  }`}>
                    {(showAnswer && option.isCorrect) && <div className="h-2 w-2 rounded-full bg-white" />}
                    {showWrong && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <span className={showWrong ? "line-through text-muted-foreground" : ""}>{option.text}</span>
                  {showWrong && <span className="text-xs text-muted-foreground ml-auto">{t("incorrect")}</span>}
                  {showAnswer && option.isCorrect && !isSelected && <span className="text-xs text-green-600 ml-auto">{t("correct_answer")}</span>}
                </div>
              </button>
            );
          })}
        </div>

        {(selectedOptionId || showAnswer) && (
          <Button variant="outline" onClick={handleToggle} className="w-full">
            {showAnswer ? (
              <><EyeOff className="h-4 w-4 mr-2" /> {t("hide_answer")}</>
            ) : (
              <><Eye className="h-4 w-4 mr-2" /> {t("show_answer")}</>
            )}
          </Button>
        )}

        {showAnswer && question.explanation && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium mb-1">{t("explanation")}:</p>
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}