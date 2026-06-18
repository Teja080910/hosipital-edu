"use client";

import { ExamResults } from "@/components/exams/exam-results";
import { PageTransition } from "@/components/page-transition";
import { QuestionTimer } from "@/components/questions/question-timer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { attemptsApi, examsApi, questionsApi } from "@/lib/api";
import { useRouter } from "@/routing";
import type { Question } from "@/types";
import { useExamStore } from "@/store/exam-store";
import {
  AlertTriangle,
  ArrowLeft, ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Flag, FlagOff,
  GraduationCap,
  Loader2,
  Play,
  Settings2,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type PageState = "config" | "taking" | "results";

function localized(obj: Record<string, string> | string | null | undefined, locale = "en"): string {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[locale] || Object.values(obj)[0] || "";
}

export default function ExamTakingPageWrapper({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <ExamTakingPage params={params} />
    </Suspense>
  );
}

function ExamTakingPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const t = useTranslations("exams");
  const tc = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pageState, setPageState] = useState<PageState>("config");
  const [mode, setMode] = useState<"study" | "exam">("exam");
  const [customTitle, setCustomTitle] = useState("");
  const [questionLimit, setQuestionLimitState] = useState(10);
  const questionLimitRef = useRef(questionLimit);
  const setQuestionLimit = (value: number) => { questionLimitRef.current = value; setQuestionLimitState(value); };
  const [exam, setExam] = useState<any>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestionsState] = useState<Question[]>([]);
  const filteredQuestionsRef = useRef<Question[]>([]);
  const setFilteredQuestions = (value: Question[]) => { filteredQuestionsRef.current = value; setFilteredQuestionsState(value); };
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSubtopic, setSelectedSubtopic] = useState("");
  const [showSpecialties, setShowSpecialties] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [showSubtopics, setShowSubtopics] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { optionId: string | null; isCorrect: boolean | null; flagged: boolean }>>({});
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionEntryTime, setQuestionEntryTime] = useState<number>(Date.now());
  const [perQuestionTime, setPerQuestionTime] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLimit, setTimeLimit] = useState(20);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [results, setResults] = useState<{
    score: number; totalQuestions: number; correctAnswers: number;
    incorrectAnswers: number; timeSpent: number;
    topicBreakdown: { topic: string; correct: number; total: number }[];
  } | null>(null);

  useEffect(() => {
    Promise.all([
      examsApi.get(id),
      questionsApi.list({ examId: id }),
    ])
      .then(([examRes, questionsRes]) => {
        setExam(examRes.data);
        setAllQuestions(questionsRes.data);
        setFilteredQuestions(questionsRes.data);
      })
      .catch(() => toast.error(t("load_failed")))
      .finally(() => setLoading(false));
  }, [id, t]);

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "exam" || modeParam === "study") {
      setMode(modeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    return () => { useExamStore.setState({ isActive: false }); };
  }, []);

  const [tabWarnings, setTabWarnings] = useState(0);
  const tabWarningsRef = useRef(0);
  const confirmSubmitRef = useRef<() => Promise<void>>();

  useEffect(() => {
    confirmSubmitRef.current = handleConfirmSubmit;
  });

  useEffect(() => {
    if (pageState !== "taking" || mode !== "exam") return;
    const handleVisibility = () => {
      if (document.hidden) {
        tabWarningsRef.current += 1;
        setTabWarnings(tabWarningsRef.current);
        if (tabWarningsRef.current >= 3) {
          confirmSubmitRef.current?.();
        } else {
          toast.warning(t("tab_warning", { count: tabWarningsRef.current, max: 2 }));
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [pageState, mode, t]);

  useEffect(() => {
    if (pageState !== "taking" || mode !== "exam") return;
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && pageState === "taking" && mode === "exam") {
        setShowSubmitDialog(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [pageState, mode]);

  useEffect(() => {
    let filtered = allQuestions;
    if (selectedSpecialties.length > 0) filtered = filtered.filter((q) => q.specialtyId && selectedSpecialties.includes(q.specialtyId));
    if (selectedTopic) filtered = filtered.filter((q) => q.topicId === selectedTopic);
    if (selectedSubtopic) filtered = filtered.filter((q) => q.subtopicId === selectedSubtopic);
    setFilteredQuestions(filtered);
  }, [selectedSpecialties, selectedTopic, selectedSubtopic, allQuestions]);

  useEffect(() => {
    const maxQ = filteredQuestions.length;
    if (maxQ > 0 && questionLimit > maxQ) {
      setQuestionLimit(maxQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredQuestions.length]);

  const specialties = exam?.specialties || [];
  const currentSpecialties = specialties.filter((s: any) => selectedSpecialties.includes(s.id));
  const topics = currentSpecialties.length > 0 ? currentSpecialties.flatMap((s: any) => s.topics || []) : specialties.flatMap((s: any) => s.topics || []);
  const currentTopic = topics.find((t: any) => t.id === selectedTopic);
  const subtopics = currentTopic?.subtopics || [];

  const displayQuestions = pageState === "taking" || pageState === "results" ? examQuestions : filteredQuestions;
  const currentQuestion = displayQuestions[currentIndex] ?? null;
  const answeredCount = Object.values(answers).filter((a) => a.optionId !== null).length;
  const flaggedCount = Object.values(answers).filter((a) => a.flagged).length;

  const handleStart = async () => {
    const totalQuestions = Math.min(questionLimitRef.current, filteredQuestionsRef.current.length);
    if (totalQuestions === 0) { toast.error(t("no_questions")); return; }
    try {
      const { data: attempt } = await attemptsApi.create({
        examId: id, mode,
        questionCount: totalQuestions,
        timeLimit: mode === "exam" ? timeLimit : undefined,
        customTitle: customTitle || undefined,
      });
      const shuffled = [...filteredQuestionsRef.current].sort(() => Math.random() - 0.5).slice(0, totalQuestions);
      setExamQuestions(shuffled);
      setAttemptId(attempt.id);
      setTimeRemaining(mode === "exam" ? timeLimit * 60 : 0);
      setTotalTimeSpent(0); setAnswers({}); setCurrentIndex(0);
      setSelectedOption(null); setShowAnswer(false);
      setQuestionEntryTime(Date.now()); setPerQuestionTime({});
      setPageState("taking");
      useExamStore.setState({ isActive: true });
      if (mode === "exam") {
        window.history.replaceState({}, "", `${window.location.pathname}?mode=exam`);
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t("start_failed");
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!attemptId || !currentQuestion || !selectedOption) return;
    const isCorrect = currentQuestion.options.find((o) => o.id === selectedOption)?.isCorrect ?? false;
    const elapsed = Math.floor((Date.now() - questionEntryTime) / 1000);
    setPerQuestionTime((prev) => ({ ...prev, [currentQuestion.id]: elapsed }));
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { optionId: selectedOption, isCorrect, flagged: prev[currentQuestion.id]?.flagged ?? false },
    }));
    if (mode === "exam") {
      try { await attemptsApi.answer(attemptId, { questionId: currentQuestion.id, selectedOptionId: selectedOption, timeSpent: elapsed }); } catch { /* silent */ }
    } else {
      setShowAnswer(true);
    }
  };

  const handleFlag = () => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: { ...prev[currentQuestion.id], optionId: prev[currentQuestion.id]?.optionId ?? null, isCorrect: prev[currentQuestion.id]?.isCorrect ?? null, flagged: !(prev[currentQuestion.id]?.flagged ?? false) } }));
  };

  const navigateTo = (index: number) => {
    const targetIndex = Math.max(0, Math.min(index, displayQuestions.length - 1));
    const q = displayQuestions[targetIndex];
    const existing = q ? answers[q.id]?.optionId : null;
    setCurrentIndex(targetIndex);
    setSelectedOption(existing);
    setShowAnswer(false);
    setQuestionEntryTime(Date.now());
  };
  const handleNext = () => navigateTo(currentIndex + 1);
  const handlePrevious = () => navigateTo(currentIndex - 1);
  const handleTick = useCallback(() => { setTimeRemaining((t) => Math.max(t - 1, 0)); setTotalTimeSpent((t) => t + 1); }, []);
  const handleTimeUp = () => setShowTimeWarning(true);
  const handleRequestSubmit = () => setShowSubmitDialog(true);

  const computeTopicBreakdown = () => {
    const topicMap: Record<string, { correct: number; total: number }> = {};
    for (const q of displayQuestions) {
      const tId = q.topicId || "unknown";
      if (!topicMap[tId]) topicMap[tId] = { correct: 0, total: 0 };
      topicMap[tId].total++;
      if (answers[q.id]?.isCorrect) topicMap[tId].correct++;
    }
    const topicNames: Record<string, string> = {};
    for (const spec of specialties) for (const topic of spec.topics || []) { topicNames[topic.id] = localized(topic.name); for (const sub of topic.subtopics || []) topicNames[sub.id] = localized(sub.name); }
    return Object.entries(topicMap).map(([id, data]) => ({ topic: topicNames[id] || id, correct: data.correct, total: data.total }));
  };

  const handleConfirmSubmit = async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true); setShowSubmitDialog(false); setShowTimeWarning(false);
    const correct = Object.values(answers).filter((a) => a.isCorrect === true).length;
    const total = displayQuestions.length;
    setResults({ score: Math.round((correct / total) * 100), totalQuestions: total, correctAnswers: correct, incorrectAnswers: total - correct, timeSpent: totalTimeSpent, topicBreakdown: computeTopicBreakdown() });
    setPageState("results");
    useExamStore.setState({ isActive: false });
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    try { await attemptsApi.complete(attemptId); } catch { /* silent */ }
    setSubmitting(false);
  };

  const handleFinishStudy = async () => {
    if (!attemptId) return;
    try { await attemptsApi.complete(attemptId); } catch { /* silent */ }
    const correct = Object.values(answers).filter((a) => a.isCorrect === true).length;
    const total = displayQuestions.length;
    setResults({ score: Math.round((correct / total) * 100), totalQuestions: total, correctAnswers: correct, incorrectAnswers: total - correct, timeSpent: totalTimeSpent, topicBreakdown: computeTopicBreakdown() });
    setPageState("results");
    useExamStore.setState({ isActive: false });
  };

  if (loading) return <PageTransition><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></PageTransition>;
  if (!exam) return <PageTransition><div className="text-center py-12 text-muted-foreground">{t("no_exams")}</div></PageTransition>;

  if (pageState === "results" && results) {
    return (
      <PageTransition>
        <div className="max-w-2xl mx-auto space-y-6">
          <ExamResults score={results.score} totalQuestions={results.totalQuestions} correctAnswers={results.correctAnswers} incorrectAnswers={results.incorrectAnswers} timeSpent={results.timeSpent}
            onReview={() => { setPageState("taking"); setShowAnswer(true); }}
            onRetry={() => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); window.history.replaceState({}, "", window.location.pathname); setPageState("config"); setResults(null); setAttemptId(null); setExamQuestions([]); }}
            onGoHome={() => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); router.push("/dashboard"); }} />
          {results.topicBreakdown.length > 1 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">{t("topic_breakdown")}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {results.topicBreakdown.map((tb) => (
                  <div key={tb.topic}>
                    <div className="flex justify-between text-sm mb-1"><span>{tb.topic}</span><span className="text-muted-foreground">{tb.correct}/{tb.total} ({Math.round((tb.correct / tb.total) * 100)}%)</span></div>
                    <Progress value={(tb.correct / tb.total) * 100} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </PageTransition>
    );
  }

  if (pageState === "taking") {
    if (!currentQuestion) return <PageTransition><div className="text-center py-12 text-muted-foreground">{t("no_questions")}</div></PageTransition>;
    const answered = answers[currentQuestion.id]?.optionId ?? null;
    const flagged = answers[currentQuestion.id]?.flagged ?? false;
    const currentAnsweredCount = Object.values(answers).filter((a) => a.optionId !== null).length;
    const totalQ = examQuestions.length;

    return (
      <PageTransition>
        <div className="mx-auto max-w-6xl space-y-5 px-4 p-20">
          {mode === "exam" && (
            <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {exam?.title || t("exam")}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    {t("question_of", { current: currentIndex + 1, total: totalQ })}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center rounded-full border bg-background px-3 py-2 text-primary shadow-subtle">
                    <QuestionTimer timeRemaining={timeRemaining} onTick={handleTick} onTimeUp={handleTimeUp} />
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                    {currentAnsweredCount}/{totalQ} {t("answered")}
                  </span>
                  {flaggedCount > 0 && (
                    <span className="rounded-full bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                      {flaggedCount} {t("flagged")}
                    </span>
                  )}
                  {timeRemaining > 0 && timeRemaining < 120 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}
                    </span>
                  )}
                </div>
              </div>
              <Progress value={(currentAnsweredCount / totalQ) * 100} className="h-1 rounded-none" />
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <Card className="overflow-hidden border-border/70 shadow-card hover:translate-y-0 overflow-hidden">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-subtle">
                      {currentIndex + 1}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">{t("question_of", { current: currentIndex + 1, total: totalQ })}</span>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-full">{currentQuestion.difficulty}</Badge>
                        {flagged && <Badge variant="destructive" className="rounded-full">{t("flagged")}</Badge>}
                      </div>
                    </div>
                  </div>
                  <Button variant={flagged ? "destructive" : "outline"} size="sm" onClick={handleFlag} title={t("flag_question")}>
                    {flagged ? <FlagOff className="mr-2 h-4 w-4" /> : <Flag className="mr-2 h-4 w-4" />}
                    {flagged ? t("flagged") : t("flag_question")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-5 sm:p-6">
                <div className="text-lg font-semibold leading-8 text-foreground sm:text-xl space-y-2 overflow-hidden break-words">{currentQuestion.text.split("\n").filter(Boolean).map((p: string, i: number) => <p key={i}>{p}</p>)}</div>
                {currentQuestion.images && currentQuestion.images.length > 0 && (
                  <div className="flex flex-wrap gap-4">
                    {currentQuestion.images.map((img: any) => (
                      <button key={img.id} type="button" onClick={() => setLightboxImage(img.url)} className="text-left">
                        <img src={img.url} alt={img.caption || t("question_image")} className="max-w-full rounded-xl border shadow-subtle cursor-pointer hover:opacity-90 transition-opacity" style={{ maxHeight: 400 }} />
                      </button>
                    ))}
                  </div>
                )}
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, optionIndex) => {
                      const isSelected = answered === option.id;
                      const isOptionSelected = selectedOption === option.id;
                      const isCorrectOption = option.isCorrect;
                      let optionClass = "border-border bg-background hover:border-primary/50 hover:bg-primary/5 hover:shadow-subtle";
                      if (showAnswer) {
                        if (isCorrectOption) optionClass = "border-green-500 bg-green-50 text-green-950 shadow-subtle dark:bg-green-950/20 dark:text-green-100";
                        else if (isSelected && !isCorrectOption) optionClass = "border-destructive bg-red-50 text-red-950 shadow-subtle dark:bg-red-950/20 dark:text-red-100";
                        else if (isSelected) optionClass = "border-primary bg-primary/10 shadow-subtle";
                      } else if (mode === "exam") {
                        if (isSelected || isOptionSelected) optionClass = "border-primary bg-primary/10 shadow-subtle";
                      } else if (isOptionSelected) {
                        optionClass = "border-primary bg-primary/10 shadow-subtle";
                      }
                      return (
                        <button key={option.id} onClick={() => setSelectedOption(option.id)} disabled={showAnswer || answers[currentQuestion.id]?.optionId != null} className={`group w-full rounded-2xl border p-4 text-left transition-all duration-200 ${optionClass}`}>
                        <div className="flex items-start gap-4">
                          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border text-sm font-semibold transition-colors ${
                            showAnswer && isCorrectOption ? "border-green-500 bg-green-500 text-white" :
                            showAnswer && isSelected && !isCorrectOption ? "border-destructive bg-destructive text-white" :
                            isSelected || isOptionSelected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-muted-foreground group-hover:border-primary/50 group-hover:text-primary"
                          }`}>
                            {showAnswer && isCorrectOption ? <CheckCircle2 className="h-4 w-4" /> :
                              showAnswer && isSelected && !isCorrectOption ? <XCircle className="h-4 w-4" /> :
                              String.fromCharCode(65 + optionIndex)}
                          </div>
                           <span className="pt-1.5 leading-6 break-words">{option.text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {showAnswer && currentQuestion.explanation && (<div className="rounded-2xl border bg-muted/50 p-4 overflow-hidden"><p className="text-sm font-semibold mb-1">{t("explanation")}</p><div className="text-sm leading-6 text-muted-foreground space-y-2 break-words">{currentQuestion.explanation.split("\n").filter(Boolean).map((p: string, i: number) => <p key={i}>{p}</p>)}</div></div>)}
                {showAnswer && currentQuestion.reference && (<div className="rounded-2xl border bg-blue-50 dark:bg-blue-950/20 p-4 overflow-hidden"><p className="text-sm font-semibold mb-1">{t("reference")}</p><p className="text-sm leading-6 text-muted-foreground break-words">{currentQuestion.reference}</p></div>)}
                {!showAnswer && selectedOption && !answers[currentQuestion.id]?.optionId && (
                  <Button onClick={handleSubmitAnswer} className="w-full" size="lg">{t("submit")}</Button>
                )}
                {mode === "study" && showAnswer && <Button variant="outline" onClick={handleNext} className="w-full">{t("next")} <ArrowRight className="h-4 w-4 ml-2" /></Button>}
              </CardContent>
            </Card>

            <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              <Card className="border-border/70 shadow-card hover:translate-y-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{t("questions")}</CardTitle>
                  <CardDescription>{currentAnsweredCount}/{totalQ} {t("answered")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mode === "exam" && <Progress value={(currentAnsweredCount / totalQ) * 100} className="h-2" />}
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: totalQ }).map((_, i) => {
                      const q = displayQuestions[i];
                      const a = q ? answers[q.id] : undefined;
                      const isCurrent = i === currentIndex;
                      let stateClass = "border-border bg-muted text-muted-foreground hover:border-primary/50 hover:text-primary";
                      if (a?.flagged) stateClass = "border-destructive bg-destructive text-destructive-foreground";
                      else if (a?.optionId) stateClass = "border-primary bg-primary text-primary-foreground";
                      return (
                        <button key={i} onClick={() => navigateTo(i)}
                          className={`h-10 rounded-xl border text-sm font-semibold transition-all ${stateClass} ${isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}>{i + 1}</button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="rounded-xl bg-muted p-3"><span className="block font-semibold text-foreground">{currentAnsweredCount}</span>{t("answered")}</div>
                    <div className="rounded-xl bg-muted p-3"><span className="block font-semibold text-foreground">{flaggedCount}</span>{t("flagged")}</div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-3 shadow-card">
                <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0} className="flex-1"><ArrowLeft className="h-4 w-4 mr-2" /> {t("previous")}</Button>
                {currentIndex >= totalQ - 1 ? (
                  mode === "exam" ? <Button onClick={handleRequestSubmit} disabled={submitting} className="flex-1">{submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{t("submit")}</Button> : <Button onClick={handleFinishStudy} className="flex-1">{t("submit")}</Button>
                ) : <Button onClick={handleNext} disabled={!answered && mode === "exam"} className="flex-1">{t("next")} <ArrowRight className="h-4 w-4 ml-2" /></Button>}
              </div>
            </aside>
          </div>
        </div>
        <ConfirmDialog open={showSubmitDialog} onOpenChange={(open) => { setShowSubmitDialog(open); if (!open && mode === "exam") { document.documentElement.requestFullscreen().catch(() => {}); } }} title={t("submit")} description={t("submit_confirm")} confirmLabel={t("submit")} cancelLabel={tc("cancel")} variant="default" onConfirm={handleConfirmSubmit} />
        <ConfirmDialog open={showTimeWarning} onOpenChange={setShowTimeWarning} title={t("time_up")} description={t("time_up_desc")} confirmLabel={t("submit")} cancelLabel="" variant="default" onConfirm={handleConfirmSubmit} />
        {lightboxImage && (
          <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
            <DialogContent className="max-w-4xl p-2 bg-black/90">
              <img src={lightboxImage} alt={t("question_image")} className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
            </DialogContent>
          </Dialog>
        )}
      </PageTransition>
    );
  }

  const maxQuestions = filteredQuestions.length;
  const timeOptions = [5, 10, 15, 20, 30, 60];

  return (
    <PageTransition>
      <div className="max-w-xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard/exams")}><ArrowLeft className="h-4 w-4 mr-2" /> {t("back_to_exams")}</Button>
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4"><div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center"><Settings2 className="h-8 w-8 text-primary" /></div></div>
            <CardTitle className="text-2xl">{localized(exam.name)}</CardTitle>
            <CardDescription>{localized(exam.description)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">{t("select_mode")}</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setMode("study")} className={`rounded-lg border-2 p-4 text-center transition-colors ${mode === "study" ? "border-primary bg-primary/5" : "border-input hover:bg-muted/50"}`}>
                  <GraduationCap className="h-5 w-5 mx-auto mb-1" /><p className="font-medium text-sm">{t("study_mode")}</p><p className="text-xs text-muted-foreground mt-1">{t("study_mode_desc")}</p>
                </button>
                <button onClick={() => setMode("exam")} className={`rounded-lg border-2 p-4 text-center transition-colors ${mode === "exam" ? "border-primary bg-primary/5" : "border-input hover:bg-muted/50"}`}>
                  <Play className="h-5 w-5 mx-auto mb-1" /><p className="font-medium text-sm">{t("exam_mode")}</p><p className="text-xs text-muted-foreground mt-1">{t("exam_mode_desc")}</p>
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t("custom_title")}</label>
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={t("custom_title_placeholder")}
                className="w-full"
              />
            </div>

            {specialties.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">{t("specialty")}</label>
                <div className="relative">
                  <button onClick={() => { setShowSpecialties(!showSpecialties); setShowTopics(false); setShowSubtopics(false); }} className="w-full border rounded-lg p-3 text-left flex items-center justify-between">
                    <span className={selectedSpecialties.length > 0 ? "" : "text-muted-foreground"}>
                      {selectedSpecialties.length > 0 ? `${selectedSpecialties.length} ${t("selected")}` : t("all_specialties")}
                    </span><ChevronDown className="h-4 w-4" />
                  </button>
                  {showSpecialties && (
                    <Card className="absolute top-full left-0 right-0 mt-1 z-10 shadow-lg">
                      <ScrollArea className="max-h-48">
                        <CardContent className="p-1">
                          <button onClick={() => { setSelectedSpecialties([]); setSelectedTopic(""); setSelectedSubtopic(""); setShowSpecialties(false); }} className="w-full text-left p-2 rounded hover:bg-muted text-sm flex items-center gap-2">{selectedSpecialties.length === 0 && <Check className="h-4 w-4 text-primary" />}{t("all_specialties")}</button>
                          {specialties.map((s: any) => {
                            const isSelected = selectedSpecialties.includes(s.id);
                            return (
                              <button key={s.id} onClick={() => {
                                setSelectedSpecialties((prev) =>
                                  prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                                );
                                setSelectedTopic("");
                                setSelectedSubtopic("");
                              }} className="w-full text-left p-2 rounded hover:bg-muted text-sm flex items-center gap-2">
                                <div className={`h-4 w-4 rounded border flex items-center justify-center ${isSelected ? "bg-primary border-primary" : "border-input"}`}>
                                  {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                </div>
                                {localized(s.name)}
                              </button>
                            );
                          })}
                        </CardContent>
                      </ScrollArea>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {topics.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">{t("topic")}</label>
                <div className="relative">
                  <button onClick={() => { setShowTopics(!showTopics); setShowSpecialties(false); setShowSubtopics(false); }} className="w-full border rounded-lg p-3 text-left flex items-center justify-between">
                    <span className={selectedTopic ? "" : "text-muted-foreground"}>{selectedTopic ? localized(currentTopic?.name) : t("all_topics")}</span><ChevronDown className="h-4 w-4" />
                  </button>
                  {showTopics && (
                    <Card className="absolute top-full left-0 right-0 mt-1 z-10 shadow-lg">
                      <ScrollArea className="max-h-48">
                        <CardContent className="p-1">
                          <button onClick={() => { setSelectedTopic(""); setSelectedSubtopic(""); setShowTopics(false); }} className="w-full text-left p-2 rounded hover:bg-muted text-sm flex items-center gap-2">{!selectedTopic && <Check className="h-4 w-4 text-primary" />}{t("all_topics")}</button>
                          {topics.map((t: any) => (
                            <button key={t.id} onClick={() => { setSelectedTopic(t.id); setSelectedSubtopic(""); setShowTopics(false); }} className="w-full text-left p-2 rounded hover:bg-muted text-sm flex items-center gap-2">{selectedTopic === t.id && <Check className="h-4 w-4 text-primary" />}{localized(t.name)}</button>
                          ))}
                        </CardContent>
                      </ScrollArea>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {selectedTopic && subtopics.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">{t("subtopic")}</label>
                <div className="relative">
                  <button onClick={() => { setShowSubtopics(!showSubtopics); setShowSpecialties(false); setShowTopics(false); }} className="w-full border rounded-lg p-3 text-left flex items-center justify-between">
                    <span className={selectedSubtopic ? "" : "text-muted-foreground"}>{selectedSubtopic ? localized(subtopics.find((s: any) => s.id === selectedSubtopic)?.name) : t("all_subtopics")}</span><ChevronDown className="h-4 w-4" />
                  </button>
                  {showSubtopics && (
                    <Card className="absolute top-full left-0 right-0 mt-1 z-10 shadow-lg">
                      <ScrollArea className="max-h-48">
                        <CardContent className="p-1">
                          <button onClick={() => { setSelectedSubtopic(""); setShowSubtopics(false); }} className="w-full text-left p-2 rounded hover:bg-muted text-sm flex items-center gap-2">{!selectedSubtopic && <Check className="h-4 w-4 text-primary" />}{t("all_subtopics")}</button>
                          {subtopics.map((s: any) => (
                            <button key={s.id} onClick={() => { setSelectedSubtopic(s.id); setShowSubtopics(false); }} className="w-full text-left p-2 rounded hover:bg-muted text-sm flex items-center gap-2">{selectedSubtopic === s.id && <Check className="h-4 w-4 text-primary" />}{localized(s.name)}</button>
                          ))}
                        </CardContent>
                      </ScrollArea>
                    </Card>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">{t("select_questions")} (max {maxQuestions})</label>
              <div className="flex items-center gap-4">
                <input type="range" min={1} max={Math.max(1, maxQuestions)} step={1} value={Math.min(questionLimit, maxQuestions)} onChange={(e) => setQuestionLimit(Number(e.target.value))} className="flex-1 accent-primary" />
                <Input
                  type="text"
                  inputMode="numeric"
                  value={questionLimit || ""}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    if (v === "") { setQuestionLimit(0); return; }
                    const n = parseInt(v, 10);
                    setQuestionLimit(Math.min(n, maxQuestions));
                  }}
                  onBlur={() => { if (questionLimit < 1 || isNaN(questionLimit)) setQuestionLimit(Math.max(1, maxQuestions)); }}
                  className="w-20 text-center"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span className="font-medium text-sm">{t("questions_count", { count: Math.min(questionLimit, maxQuestions) })}</span>
                <span>{maxQuestions}</span>
              </div>
            </div>

            {mode === "exam" && (
              <div>
                <label className="text-sm font-medium mb-2 block">{t("time_limit")}</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeOptions.map((opt) => (
                    <button key={opt} onClick={() => setTimeLimit(opt)} className={`rounded-lg border p-2 text-center text-sm transition-colors ${timeLimit === opt ? "border-primary bg-primary/5 font-medium" : "border-input hover:bg-muted/50"}`}>{t("minutes", { count: opt })}</button>
                  ))}
                </div>
              </div>
            )}

            <Button className="w-full h-12 text-lg" onClick={handleStart} disabled={maxQuestions === 0}><Play className="h-5 w-5 mr-2" /> {t("begin")}</Button>
            {maxQuestions === 0 && <p className="text-xs text-center text-muted-foreground">{t("no_questions_filter")}</p>}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
