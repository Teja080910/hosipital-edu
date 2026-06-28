"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageTransition } from "@/components/page-transition";
import { AccountTypeGate } from "@/components/account-type-gate";
import { QuestionFilter } from "@/components/questions/question-filter";
import { QuestionCard } from "@/components/questions/question-card";
import { ExamHistory } from "@/components/exams/exam-history";
import { EmptyState } from "@/components/empty-state";
import { examsApi, questionsApi } from "@/lib/api";
import type { Question } from "@/types";
import { toast } from "sonner";
import { FileQuestion, Search, Loader2, GraduationCap, Play } from "lucide-react";

const PAGE_SIZE = 20;

export default function QuestionsPage() {
  const t = useTranslations("questions");
  const router = useRouter();
  const [tab, setTab] = useState("bank");
  const [search, setSearch] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState({ specialtyId: "", topicId: "", difficulty: "" });

  useEffect(() => {
    examsApi.subscribedList().then((res) => setExams(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true); setPage(1); setQuestions([]); setHasMore(true);
    const params: Record<string, string> = { limit: String(PAGE_SIZE), page: "1" };
    if (selectedExamId) params.examId = selectedExamId;
    if (filters.specialtyId && filters.specialtyId !== "all") params.specialtyId = filters.specialtyId;
    if (filters.topicId && filters.topicId !== "all") params.topicId = filters.topicId;
    if (filters.difficulty && filters.difficulty !== "all") params.difficulty = filters.difficulty;
    questionsApi.list(params)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setQuestions(data);
        setHasMore(data.length >= PAGE_SIZE);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedExamId, filters]);

  const loadMore = () => {
    const nextPage = page + 1;
    const params: Record<string, string> = { limit: String(PAGE_SIZE), page: String(nextPage) };
    if (selectedExamId) params.examId = selectedExamId;
    if (filters.specialtyId && filters.specialtyId !== "all") params.specialtyId = filters.specialtyId;
    if (filters.topicId && filters.topicId !== "all") params.topicId = filters.topicId;
    if (filters.difficulty && filters.difficulty !== "all") params.difficulty = filters.difficulty;
    questionsApi.list(params)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setQuestions((prev) => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(data.length >= PAGE_SIZE);
      })
      .catch(() => {});
  };

  const filtered = questions.filter(
    (q) =>
      !search ||
      q.text.toLowerCase().includes(search.toLowerCase()) ||
      (q.specialty || "").toLowerCase().includes(search.toLowerCase()) ||
      (q.topic || "").toLowerCase().includes(search.toLowerCase())
  );

  const selectedQuestion = questions.find((q) => q.id === viewingId) || null;

  return (
    <AccountTypeGate>
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="bank">{t("title")}</TabsTrigger>
            <TabsTrigger value="history">{t("exam_history")}</TabsTrigger>
          </TabsList>

          <TabsContent value="bank" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <select
                  className="border rounded-lg px-3 py-2 text-sm"
                  value={selectedExamId}
                  onChange={(e) => { setSelectedExamId(e.target.value); setViewingId(null); }}
                >
                  <option value="">{t("all_exams")}</option>
                  {exams.map((exam: any) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name?.en || exam.name || exam.slug}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { if (!selectedExamId) { toast.error(t("select_exam_first")); return; } router.push(`/dashboard/exams/${selectedExamId}?mode=study`); }}>
                  <GraduationCap className="h-4 w-4 mr-2" /> {t("study_mode")}
                </Button>
                <Button onClick={() => { if (!selectedExamId) { toast.error(t("select_exam_first")); return; } router.push(`/dashboard/exams/${selectedExamId}?mode=exam`); }}>
                  <Play className="h-4 w-4 mr-2" /> {t("exam_mode")}
                </Button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
              <div className="lg:col-span-1">
                {selectedExamId && (
                  <QuestionFilter examId={selectedExamId} filters={filters} onChange={setFilters} />
                )}
                {!selectedExamId && (
                  <Card>
                    <CardContent className="py-8 text-center text-sm text-muted-foreground">
                      {t("select_exam_first")}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="lg:col-span-3 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t("search_questions")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                ) : filtered.length === 0 ? (
                  <EmptyState icon={FileQuestion} title={t("no_questions")} description={t("adjust_filters")} />
                ) : viewingId && selectedQuestion ? (
                  <QuestionCard
                    question={selectedQuestion}
                    showAnswer={showOptions}
                    onToggleAnswer={() => setShowOptions(!showOptions)}
                    onBack={() => setViewingId(null)}
                  />
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {t("showing_count", { count: filtered.length })}
                    </p>
                    {filtered.map((q) => (
                      <Card
                        key={q.id}
                        className="cursor-pointer"
                        onClick={() => { setViewingId(q.id); setShowOptions(false); }}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium line-clamp-2">{q.text}</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {q.specialty && <Badge variant="secondary">{q.specialty}</Badge>}
                                {q.topic && <Badge variant="outline">{q.topic}</Badge>}
                                <Badge variant={q.difficulty === "easy" ? "default" : q.difficulty === "medium" ? "secondary" : "destructive"}>
                                  {q.difficulty}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {hasMore && (
                      <div className="flex justify-center pt-2">
                        <Button variant="outline" onClick={loadMore}>{t("load_more")}</Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <ExamHistory />
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
    </AccountTypeGate>
  );
}
