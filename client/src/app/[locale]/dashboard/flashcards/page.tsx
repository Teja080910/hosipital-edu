"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageTransition } from "@/components/page-transition";
import { FlashcardCard } from "@/components/flashcards/flashcard-card";
import { FlashcardReview } from "@/components/flashcards/flashcard-review";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Library } from "lucide-react";
import { flashcardsApi } from "@/lib/api/flashcards";

const PAGE_SIZE = 10;

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  reference: string | null;
  specialtyId: string | null;
  topicId: string | null;
  specialty: { en: string; es?: string } | null;
  topic: { en: string; es?: string } | null;
}

interface SpecialtyOption {
  id: string;
  name: { en: string; es?: string };
}

export default function FlashcardsPage() {
  const t = useTranslations("flashcards");
  const c = useTranslations("common");
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [total, setTotal] = useState(0);
  const [totalDue, setTotalDue] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const pageRef = useRef(1);
  const allLoadedRef = useRef(false);

  const fetchCards = useCallback(async (page: number, specialty?: string) => {
    const params: Record<string, string | number> = { page, limit: PAGE_SIZE };
    if (specialty && specialty !== "all") params.specialtyId = specialty;
    const { data } = await flashcardsApi.list(params);
    return data;
  }, []);

  const loadInitial = useCallback(async (specialty?: string) => {
    setLoading(true);
    setError(null);
    pageRef.current = 1;
    allLoadedRef.current = false;
    try {
      const [cardsRes, specsRes, dueRes] = await Promise.all([
        fetchCards(1, specialty),
        flashcardsApi.specialties(),
        flashcardsApi.due(10000),
      ]);
      const items = cardsRes.data ?? [];
      setCards(items);
      setTotal(cardsRes.total ?? items.length ?? 0);
      setTotalDue((dueRes.data ?? dueRes).length ?? 0);
      setSpecialties(specsRes.data ?? []);
      allLoadedRef.current = items.length >= (cardsRes.total ?? 0);
    } catch {
      setError("Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  }, [fetchCards]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const handleSpecialtyChange = useCallback(async (value: string) => {
    setSelectedSpecialty(value);
    setCurrentIndex(0);
    setIsFlipped(false);
    await loadInitial(value);
  }, [loadInitial]);

  const loadNextPage = useCallback(async () => {
    if (loadingMore || allLoadedRef.current) return;
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const data = await fetchCards(nextPage, selectedSpecialty);
      const items = data.data ?? [];
      if (items.length > 0) {
        pageRef.current = nextPage;
        setCards((prev) => [...prev, ...items]);
      }
      allLoadedRef.current = cards.length + items.length >= (data.total ?? 0);
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, selectedSpecialty, fetchCards, cards.length]);

  const currentCard = cards[currentIndex];

  const handleRate = useCallback(async (rating: string) => {
    if (!currentCard) return;
    const qualityMap: Record<string, string | number> = { again: 1, hard: 2, good: 4, easy: 5 };
    const quality = qualityMap[rating] ?? 3;
    try {
      await flashcardsApi.review(currentCard.id, quality as number);
      const dueRes = await flashcardsApi.due(10000);
      setTotalDue((dueRes.data ?? dueRes).length ?? 0);
    } catch {
      // silently fail review submission
    }
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    } else if (!allLoadedRef.current) {
      await loadNextPage();
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  }, [currentCard, currentIndex, cards.length, loadNextPage]);

  if (loading && cards.length === 0) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 sm:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-8 w-16" /></CardContent></Card>
            ))}
          </div>
          <Skeleton className="h-64 w-full max-w-2xl mx-auto rounded-xl" />
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <EmptyState icon={Library} title={c("error")} description={error} />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <div className="flex gap-2">
            <Select value={selectedSpecialty} onValueChange={handleSpecialtyChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t("all_specialties")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_specialties")}</SelectItem>
                {specialties.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("total")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("total_due")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDue}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("review_now")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cards.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("cards_due")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.min(cards.length, totalDue)}</div>
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

        <Progress value={total > 0 ? (currentIndex / total) * 100 : 0} className="h-2" />

        {currentCard ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {currentCard.specialty && (
              <p className="text-sm text-muted-foreground text-center">
                {currentCard.specialty.en}{currentCard.topic ? ` / ${currentCard.topic.en}` : ""}
              </p>
            )}
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
