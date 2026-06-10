"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/routing";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageTransition } from "@/components/page-transition";
import { QuestionTimer } from "@/components/questions/question-timer";
import { ExamResults } from "@/components/exams/exam-results";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { examsApi, attemptsApi, questionsApi } from "@/lib/api";
import { toast } from "sonner";
import {
  Loader2, ArrowLeft, ArrowRight, Flag, FlagOff, CheckCircle2, XCircle,
  GraduationCap, Settings2, Play, AlertTriangle, ChevronDown, Check,
} from "lucide-react";
import type { Question } from "@/types";

type PageState = "config" | "taking" | "results";

function localized(obj: Record<string, string> | string | null | undefined, locale = "en"): string {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[locale] || Object.values(obj)[0] || "";
}

export default function ExamTakingPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const t = useTranslations("exams");
  const tc = useTranslations("common");
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>("config");
  const [mode, setMode] = useState<"study" | "exam">("exam");
  const [questionLimit, setQuestionLimit] = useState(10);
  const [exam, setExam] = useState<any>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSpecialty, setSelectedSpecialty] = useState("");
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
    let filtered = allQuestions;
    if (selectedSpecialty) filtered = filtered.filter((q) => q.specialtyId === selectedSpecialty);
    if (selectedTopic) filtered = filtered.filter((q) => q.topicId === selectedTopic);
    if (selectedSubtopic) filtered = filtered.filter((q) => q.subtopicId === selectedSubtopic);
    setFilteredQuestions(filtered);
  }, [selectedSpecialty, selectedTopic, selectedSubtopic, allQuestions]);

  const specialties = exam?.specialties || [];
  const currentSpecialty = specialties.find((s: any) => s.id === selectedSpecialty);
  const topics = currentSpecialty?.topics || [];
  const currentTopic = topics.find((t: any) => t.id === selectedTopic);
  const subtopics = currentTopic?.subtopics || [];

  const displayQuestions = pageState === "taking" || pageState === "results" ? examQuestions : filteredQuestions;
  const currentQuestion = displayQuestions[currentIndex] ?? null;
  const answeredCount = Object.values(answers).filter((a) => a.optionId !== null).length;
  const flaggedCount = Object.values(answers).filter((a) => a.flagged).length;

  const handleStart = async () => {
    const totalQuestions = Math.min(questionLimit, filteredQuestions.length);
    if (totalQuestions === 0) { toast.error(t("no_questions")); return; }
    try {
      const { data: attempt } = await attemptsApi.create({
        examId: id, mode,
        questionCount: totalQuestions,
        timeLimit: mode === "exam" ? timeLimit : undefined,
      });
      const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5).slice(0, totalQuestions);
      setExamQuestions(shuffled);
      setAttemptId(attempt.id);
      setTimeRemaining(mode === "exam" ? timeLimit * 60 : 0);
      setTotalTimeSpent(0); setAnswers({}); setCurrentIndex(0);
      setSelectedOption(null); setShowAnswer(false);
      setQuestionEntryTime(Date.now()); setPerQuestionTime({});
      setPageState("taking");
    } catch { toast.error(t("start_failed")); }
  };

  const handleAnswer = async (optionId: string) => {
    if (!attemptId || !currentQuestion) return;
    const isCorrect = currentQuestion.options.find((o) => o.id === optionId)?.isCorrect ?? false;
    const elapsed = Math.floor((Date.now() - questionEntryTime) / 1000);
    setPerQuestionTime((prev) => ({ ...prev, [currentQuestion.id]: elapsed }));
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { optionId, isCorrect, flagged: prev[currentQuestion.id]?.flagged ?? false },
    }));
    setSelectedOption(optionId);
    if (mode === "exam") {
      try { await attemptsApi.answer(attemptId, { questionId: currentQuestion.id, selectedOptionId: optionId, timeSpent: elapsed }); } catch { /* silent */ }
    } else { setShowAnswer(true); }
  };

  const handleFlag = () => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: { ...prev[currentQuestion.id], optionId: prev[currentQuestion.id]?.optionId ?? null, isCorrect: prev[currentQuestion.id]?.isCorrect ?? null, flagged: !(prev[currentQuestion.id]?.flagged ?? false) } }));
  };

  const handleNext = () => { setCurrentIndex((i) => Math.min(i + 1, displayQuestions.length - 1)); setSelectedOption(null); setShowAnswer(false); setQuestionEntryTime(Date.now()); };
  const handlePrevious = () => { setCurrentIndex((i) => Math.max(i - 1, 0)); setSelectedOption(null); setShowAnswer(false); setQuestionEntryTime(Date.now()); };
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
    try {
      await attemptsApi.complete(attemptId);
      const correct = Object.values(answers).filter((a) => a.isCorrect === true).length;
      const total = displayQuestions.length;
      setResults({ score: Math.round((correct / total) * 100), totalQuestions: total, correctAnswers: correct, incorrectAnswers: total - correct, timeSpent: totalTimeSpent, topicBreakdown: computeTopicBreakdown() });
      setPageState("results");
    } catch { toast.error(t("submit_failed")); } finally { setSubmitting(false); }
  };

  const handleFinishStudy = async () => {
    if (!attemptId) return;
    try { await attemptsApi.complete(attemptId); } catch { /* silent */ }
    const correct = Object.values(answers).filter((a) => a.isCorrect === true).length;
    const total = displayQuestions.length;
    setResults({ score: Math.round((correct / total) * 100), totalQuestions: total, correctAnswers: correct, incorrectAnswers: total - correct, timeSpent: totalTimeSpent, topicBreakdown: computeTopicBreakdown() });
    setPageState("results");
  };

  if (loading) return <PageTransition><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></PageTransition>;
  if (!exam) return <PageTransition><div className="text-center py-12 text-muted-foreground">{t("no_exams")}</div></PageTransition>;

  if (pageState === "results" && results) {
    return (
      <PageTransition>
        <div className="max-w-2xl mx-auto space-y-6">
          <ExamResults score={results.score} totalQuestions={results.totalQuestions} correctAnswers={results.correctAnswers} incorrectAnswers={results.incorrectAnswers} timeSpent={results.timeSpent}
            onReview={() => { setPageState("taking"); setShowAnswer(true); }}
            onRetry={() => { setPageState("config"); setResults(null); setAttemptId(null); setExamQuestions([]); }} />
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
    const totalQ = displayQuestions.length;

    return (
      <PageTransition>
        <div className="space-y-4 max-w-3xl mx-auto pb-24">
          {mode === "exam" && (
            <div className="flex items-center justify-between">
              <QuestionTimer timeRemaining={timeRemaining} onTick={handleTick} onTimeUp={handleTimeUp} />
              <div className="text-sm text-muted-foreground">{currentAnsweredCount}/{totalQ} {t("answered")}{flaggedCount > 0 && ` · ${flaggedCount} ${t("flagged")}`}</div>
            </div>
          )}
          <Progress value={(currentAnsweredCount / totalQ) * 100} className="h-1" />

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("question_of", { current: currentIndex + 1, total: totalQ })}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
                  <Button variant="ghost" size="icon" onClick={handleFlag} title={t("flag_question")}>{flagged ? <FlagOff className="h-4 w-4 text-destructive" /> : <Flag className="h-4 w-4" />}</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg font-medium">{currentQuestion.text}</p>
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = answered === option.id;
                  const showCorrect = showAnswer || (mode === "exam" && answered !== null && isSelected);
                  const isCorrectOption = option.isCorrect;
                  let borderClass = "border-input hover:bg-muted/50 cursor-pointer";
                  let bgClass = "";
                  if (showCorrect && isCorrectOption) { borderClass = "border-green-500"; bgClass = "bg-green-50 dark:bg-green-950/20"; }
                  else if (showCorrect && isSelected && !isCorrectOption) { borderClass = "border-destructive"; bgClass = "bg-red-50 dark:bg-red-950/20"; }
                  else if (isSelected && mode === "exam") { borderClass = "border-primary"; }
                  return (
                    <button key={option.id} onClick={() => !answered && handleAnswer(option.id)} disabled={answered !== null && mode === "study"} className={`w-full text-left rounded-lg border p-4 transition-colors ${borderClass} ${bgClass}`}>
                      <div className="flex items-center gap-3">
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${showCorrect && isCorrectOption ? "border-green-500 bg-green-500" : showCorrect && isSelected && !isCorrectOption ? "border-destructive bg-destructive" : isSelected && mode === "exam" ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                          {(showCorrect && isCorrectOption) && <CheckCircle2 className="h-3 w-3 text-white" />}
                          {(showCorrect && isSelected && !isCorrectOption) && <XCircle className="h-3 w-3 text-white" />}
                        </div>
                        <span>{option.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {showAnswer && (<div className="rounded-lg bg-muted p-4"><p className="text-sm font-medium mb-1">{t("explanation")}</p><p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p></div>)}
              {mode === "study" && answered && !showAnswer && <Button variant="outline" onClick={() => setShowAnswer(true)} className="w-full">{t("show_explanation")}</Button>}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}><ArrowLeft className="h-4 w-4 mr-2" /> {t("previous")}</Button>
            {currentIndex >= totalQ - 1 ? (
              mode === "exam" ? <Button onClick={handleRequestSubmit}>{t("submit")}</Button> : <Button onClick={handleFinishStudy}>{t("submit")}</Button>
            ) : <Button onClick={handleNext} disabled={!answered && mode === "exam"}>{t("next")} <ArrowRight className="h-4 w-4 ml-2" /></Button>}
          </div>

          {mode === "exam" && (
            <>
              <div className="flex flex-wrap gap-2 justify-center pt-4">
                {Array.from({ length: totalQ }).map((_, i) => {
                  const q = displayQuestions[i];
                  const a = q ? answers[q.id] : undefined;
                  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
                  if (a?.flagged) variant = "destructive";
                  else if (a?.optionId) variant = "default";
                  return (
                    <button key={i} onClick={() => { setCurrentIndex(i); setSelectedOption(null); setShowAnswer(false); }}
                      className={`h-8 w-8 rounded text-xs font-medium transition-colors ${i === currentIndex ? "ring-2 ring-primary ring-offset-2" : ""} ${variant === "default" ? "bg-primary text-primary-foreground" : variant === "destructive" ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</button>
                  );
                })}
              </div>
              <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-md p-3 z-50">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {currentAnsweredCount}/{totalQ} {t("answered")}{flaggedCount > 0 && ` · ${flaggedCount} ${t("flagged")}`}
                    {timeRemaining > 0 && timeRemaining < 120 && <span className="ml-2 text-destructive font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}</span>}
                  </div>
                  <Button onClick={handleRequestSubmit} disabled={submitting} size="sm">{submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}{t("submit")}</Button>
                </div>
              </div>
            </>
          )}
        </div>
        <ConfirmDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog} title={t("submit")} description={t("submit_confirm")} confirmLabel={t("submit")} cancelLabel={tc("cancel")} variant="default" onConfirm={handleConfirmSubmit} />
        <ConfirmDialog open={showTimeWarning} onOpenChange={setShowTimeWarning} title={t("time_up")} description={t("time_up_desc")} confirmLabel={t("submit")} cancelLabel="" variant="default" onConfirm={handleConfirmSubmit} />
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

            {specialties.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Specialty</label>
                <div className="relative">
                  <button onClick={() => { setShowSpecialties(!showSpecialties); setShowTopics(false); setShowSubtopics(false); }} className="w-full border rounded-lg p-3 text-left flex items-center justify-between">
                    <span className={selectedSpecialty ? "" : "text-muted-foreground"}>{selectedSpecialty ? localized(currentSpecialty?.name) : "All Specialties"}</span><ChevronDown className="h-4 w-4" />
                  </button>
                  {showSpecialties && (
                    <Card className="absolute top-full left-0 right-0 mt-1 z-10 shadow-lg">
                      <ScrollArea className="max-h-48">
                        <CardContent className="p-1">
                          <button onClick={() => { setSelectedSpecialty(""); setSelectedTopic(""); setSelectedSubtopic(""); setShowSpecialties(false); }} className="w-full text-left p-2 rounded hover:bg-muted text-sm flex items-center gap-2">{!selectedSpecialty && <Check className="h-4 w-4 text-primary" />}All Specialties</button>
                          {specialties.map((s: any) => (
                            <button key={s.id} onClick={() => { setSelectedSpecialty(s.id); setSelectedTopic(""); setSelectedSubtopic(""); setShowSpecialties(false); }} className="w-full text-left p-2 rounded hover:bg-muted text-sm flex items-center gap-2">{selectedSpecialty === s.id && <Check className="h-4 w-4 text-primary" />}{localized(s.name)}</button>
                          ))}
                        </CardContent>
                      </ScrollArea>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {selectedSpecialty && topics.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Topic</label>
                <div className="relative">
                  <button onClick={() => { setShowTopics(!showTopics); setShowSpecialties(false); setShowSubtopics(false); }} className="w-full border rounded-lg p-3 text-left flex items-center justify-between">
                    <span className={selectedTopic ? "" : "text-muted-foreground"}>{selectedTopic ? localized(currentTopic?.name) : "All Topics"}</span><ChevronDown className="h-4 w-4" />
                  </button>
                  {showTopics && (
                    <Card className="absolute top-full left-0 right-0 mt-1 z-10 shadow-lg">
                      <ScrollArea className="max-h-48">
                        <CardContent className="p-1">
                          <button onClick={() => { setSelectedTopic(""); setSelectedSubtopic(""); setShowTopics(false); }} className="w-full text-left p-2 rounded hover:bg-muted text-sm flex items-center gap-2">{!selectedTopic && <Check className="h-4 w-4 text-primary" />}All Topics</button>
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
                <label className="text-sm font-medium mb-2 block">Subtopic</label>
                <div className="relative">
                  <button onClick={() => { setShowSubtopics(!showSubtopics); setShowSpecialties(false); setShowTopics(false); }} className="w-full border rounded-lg p-3 text-left flex items-center justify-between">
                    <span className={selectedSubtopic ? "" : "text-muted-foreground"}>{selectedSubtopic ? localized(subtopics.find((s: any) => s.id === selectedSubtopic)?.name) : "All Subtopics"}</span><ChevronDown className="h-4 w-4" />
                  </button>
                  {showSubtopics && (
                    <Card className="absolute top-full left-0 right-0 mt-1 z-10 shadow-lg">
                      <ScrollArea className="max-h-48">
                        <CardContent className="p-1">
                          <button onClick={() => { setSelectedSubtopic(""); setShowSubtopics(false); }} className="w-full text-left p-2 rounded hover:bg-muted text-sm flex items-center gap-2">{!selectedSubtopic && <Check className="h-4 w-4 text-primary" />}All Subtopics</button>
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
              <input type="range" min={1} max={Math.max(1, maxQuestions)} step={1} value={Math.min(questionLimit, maxQuestions)} onChange={(e) => setQuestionLimit(Number(e.target.value))} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span className="font-medium text-sm">{Math.min(questionLimit, maxQuestions)} questions</span>
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