"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageTransition } from "@/components/page-transition";
import { QuestionFilter } from "@/components/questions/question-filter";
import { QuestionCard } from "@/components/questions/question-card";
import { EmptyState } from "@/components/empty-state";
import type { Question } from "@/types";
import { FileQuestion, Search } from "lucide-react";

const mockQuestions: Question[] = [
  { id: "1", examId: null, specialtyId: null, topicId: null, subtopicId: null, text: "Which of the following is the most common cause of community-acquired pneumonia?", explanation: "", difficulty: "medium", isActive: true, options: [{ id: "a", questionId: "1", text: "Streptococcus pneumoniae", isCorrect: true, sortOrder: 0 }] },
  { id: "2", examId: null, specialtyId: null, topicId: null, subtopicId: null, text: "What is the first-line treatment for hypertension in diabetic patients?", explanation: "", difficulty: "easy", isActive: true, options: [{ id: "a", questionId: "2", text: "ACE Inhibitors", isCorrect: true, sortOrder: 0 }] },
  { id: "3", examId: null, specialtyId: null, topicId: null, subtopicId: null, text: "A 65-year-old male presents with chest pain radiating to the left arm. ECG shows ST elevation in leads V1-V4. What is the most likely diagnosis?", explanation: "", difficulty: "hard", isActive: true, options: [{ id: "a", questionId: "3", text: "Anterior STEMI", isCorrect: true, sortOrder: 0 }] },
  { id: "4", examId: null, specialtyId: null, topicId: null, subtopicId: null, text: "Which imaging modality is preferred for suspected appendicitis in children?", explanation: "", difficulty: "medium", isActive: true, options: [{ id: "a", questionId: "4", text: "Ultrasound", isCorrect: true, sortOrder: 0 }] },
  { id: "5", examId: null, specialtyId: null, topicId: null, subtopicId: null, text: "What is the mechanism of action of metformin?", explanation: "", difficulty: "easy", isActive: true, options: [{ id: "a", questionId: "5", text: "Decreases hepatic glucose production", isCorrect: true, sortOrder: 0 }] },
];

export default function QuestionsPage() {
  const t = useTranslations("questions");
  const [search, setSearch] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const filtered = mockQuestions.filter(
    (q) =>
      q.text.toLowerCase().includes(search.toLowerCase())
  );

  const selectedQuestion = mockQuestions.find((q) => q.id === viewingId);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <div className="flex gap-2">
            <Button variant="outline">{t("study_mode")}</Button>
            <Button>{t("exam_mode")}</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <QuestionFilter />
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("filter_specialty")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {filtered.length === 0 ? (
              <EmptyState icon={FileQuestion} title={t("no_questions")} description={t("adjust_filters")} />
            ) : viewingId && selectedQuestion ? (
              <QuestionCard
                question={selectedQuestion}
                showAnswer={showOptions}
                onToggleAnswer={() => setShowOptions(!showOptions)}
                onBack={() => setViewingId(null)}
              />
            ) : (
              filtered.map((q) => (
                <Card
                  key={q.id}
                  className="cursor-pointer"
                  onClick={() => setViewingId(q.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium line-clamp-2">{q.text}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge
                            variant={
                              q.difficulty === "easy" ? "default" :
                              q.difficulty === "medium" ? "secondary" : "destructive"
                            }
                          >
                            {q.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}