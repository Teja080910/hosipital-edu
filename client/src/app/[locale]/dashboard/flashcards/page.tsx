"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageTransition } from "@/components/page-transition";
import { AccountTypeGate } from "@/components/account-type-gate";
import { FlashcardCard } from "@/components/flashcards/flashcard-card";
import { FlashcardReview } from "@/components/flashcards/flashcard-review";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Library, RefreshCw, Play } from "lucide-react";
import { flashcardsApi } from "@/lib/api/flashcards";
import { Button } from "@/components/ui/button";
import { Link } from "@/routing";

const SESSION_KEY = "flashcard_session";
const PAGE_SIZE = 20;

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

interface SessionState {
  cards: FlashcardData[];
  currentIndex: number;
  selectedSpecialty: string;
  totalDue: number;
}

function saveSession(state: SessionState) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {}
}

function loadSession(): SessionState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

function shuffle<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardsPage() {
  const t = useTranslations("flashcards");
  const c = useTranslations("common");
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [totalDue, setTotalDue] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [allLoaded, setAllLoaded] = useState(false);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);

  const fetchDueCards = useCallback(async (page: number, specialty?: string) => {
    const params: Record<string, string | number> = { limit: PAGE_SIZE, page };
    if (specialty && specialty !== "all") params.specialtyId = specialty;
    const { data } = await flashcardsApi.list(params);
    return data;
  }, []);

  const loadCards = useCallback(async (specialty?: string, restoreIndex?: number) => {
    setLoading(true);
    setError(null);
    pageRef.current = 1;
    setAllLoaded(true);
    try {
      const specsRes = await flashcardsApi.specialties();
      setSpecialties(specsRes.data ?? []);

      let items: FlashcardData[] = [];
      let total = 0;
      try {
        const dueRes = await flashcardsApi.due(10000);
        items = dueRes.data ?? dueRes ?? [];
        total = items.length;
      } catch {}

      if (items.length === 0) {
        try {
          const cardsRes = await fetchDueCards(1, specialty);
          items = cardsRes.data ?? [];
          total = cardsRes.total ?? 0;
        } catch {}
      }

      setCards(items);
      setTotalDue(total);
      if (restoreIndex !== undefined && restoreIndex < items.length) {
        setCurrentIndex(restoreIndex);
      } else {
        setCurrentIndex(0);
      }
      setIsFlipped(false);
    } catch {
      setError(c("error"));
    } finally {
      setLoading(false);
    }
  }, [fetchDueCards]);

  useEffect(() => {
    const saved = loadSession();
    if (saved && saved.cards.length > 0) {
      setCards(saved.cards);
      setCurrentIndex(saved.currentIndex);
      setSelectedSpecialty(saved.selectedSpecialty);
      setTotalDue(saved.totalDue);
      setLoading(false);
    } else {
      loadCards();
    }
  }, [loadCards]);

  useEffect(() => {
    if (cards.length > 0) {
      saveSession({ cards, currentIndex, selectedSpecialty, totalDue });
    }
  }, [cards, currentIndex, selectedSpecialty, totalDue]);

  const handleSpecialtyChange = useCallback(async (value: string) => {
    setSelectedSpecialty(value);
    clearSession();
    await loadCards(value);
  }, [loadCards]);

  const loadNextPage = useCallback(async () => {
    if (loadingMore || allLoaded || loadingRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const data = await fetchDueCards(nextPage, selectedSpecialty);
      const items = data.data ?? [];
      if (items.length > 0) {
        pageRef.current = nextPage;
        setCards((prev) => {
          const updated = [...prev, ...items];
          setAllLoaded(updated.length >= (data.total ?? 0));
          return updated;
        });
      } else {
        setAllLoaded(true);
      }
    } catch {
    } finally {
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [loadingMore, allLoaded, selectedSpecialty, fetchDueCards]);

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
    }
    if (rating === "again") {
      setIsFlipped(false);
      return;
    }
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    } else if (!allLoaded) {
      await loadNextPage();
      setIsFlipped(false);
    } else {
      setCards([]);
      setCurrentIndex(0);
      setIsFlipped(false);
      clearSession();
    }
  }, [currentCard, currentIndex, cards.length, allLoaded, loadNextPage]);

  const handleRefresh = useCallback(() => {
    setCards((prev) => shuffle(prev));
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

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
    <AccountTypeGate>
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/flashcards/exam">
              <Button variant="default" size="sm" className="gap-2">
                <Play className="h-3.5 w-3.5" />
                {t("start_exam")}
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              {t("reshuffle")}
            </Button>
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
              <CardTitle className="text-sm font-medium">{t("total_due")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDue}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("in_session")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cards.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("current_card")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cards.length > 0 ? currentIndex + 1 : 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("remaining")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.max(0, cards.length - currentIndex - 1)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("mastered")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentIndex}</div>
            </CardContent>
          </Card>
        </div>

        <Progress
          value={totalDue > 0 ? (currentIndex / totalDue) * 100 : 0}
          className="h-2"
        />

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
    </AccountTypeGate>
  );
}
