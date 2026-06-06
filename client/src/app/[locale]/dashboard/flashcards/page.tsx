"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageTransition } from "@/components/page-transition";
import { FlashcardCard } from "@/components/flashcards/flashcard-card";
import { FlashcardReview } from "@/components/flashcards/flashcard-review";
import { EmptyState } from "@/components/empty-state";
import { Library, BookOpen } from "lucide-react";

const mockFlashcards = [
  { id: "1", front: "What is the most common cause of community-acquired pneumonia?", back: "Streptococcus pneumoniae", specialty: "Internal Medicine", topic: "Infectious Disease", dueDate: "2024-01-01", interval: 1, ease: 2.5, repetitions: 0 },
  { id: "2", front: "What is the first-line treatment for hypertension?", back: "ACE inhibitors or ARBs, especially in diabetic patients", specialty: "Cardiology", topic: "Hypertension", dueDate: "2024-01-01", interval: 1, ease: 2.5, repetitions: 0 },
  { id: "3", front: "What is the mechanism of action of proton pump inhibitors?", back: "Irreversible inhibition of H+/K+ ATPase in gastric parietal cells", specialty: "Gastroenterology", topic: "Pharmacology", dueDate: "2024-01-01", interval: 1, ease: 2.5, repetitions: 0 },
  { id: "4", front: "Which nerve is affected in carpal tunnel syndrome?", back: "Median nerve", specialty: "Neurology", topic: "Peripheral Nerves", dueDate: "2024-01-01", interval: 1, ease: 2.5, repetitions: 0 },
];

export default function FlashcardsPage() {
  const t = useTranslations("flashcards");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = mockFlashcards[currentIndex];

  const handleRate = (rating: string) => {
    if (currentIndex < mockFlashcards.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t("all_specialties")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_specialties")}</SelectItem>
                <SelectItem value="cardiology">Cardiology</SelectItem>
                <SelectItem value="neurology">Neurology</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("review_now")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockFlashcards.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("cards_due")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockFlashcards.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("mastered")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        <Progress value={(currentIndex / mockFlashcards.length) * 100} className="h-2" />

        {currentCard ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <FlashcardCard
              front={currentCard.front}
              back={currentCard.back}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(!isFlipped)}
            />
            {isFlipped && <FlashcardReview onRate={handleRate} />}
          </div>
        ) : (
          <EmptyState icon={Library} title={t("all_caught_up")} description={t("no_cards")} />
        )}
      </div>
    </PageTransition>
  );
}