"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/routing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import { AccountTypeGate } from "@/components/account-type-gate";
import { ExamHistory } from "@/components/exams/exam-history";
import { examsApi } from "@/lib/api";
import { Check, GraduationCap, Loader2, Play, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

function localized(obj: Record<string, string> | string | null | undefined, locale = "en"): string {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[locale] || Object.values(obj)[0] || "";
}

export default function ExamsPage() {
  const t = useTranslations("exams");
  const n = useTranslations("nav");
  const router = useRouter();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExams, setSelectedExams] = useState<Record<string, string[]>>({});
  const [expandedExam, setExpandedExam] = useState<string | null>(null);
  const [examDetails, setExamDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    examsApi.subscribedList()
      .then((res) => setExams(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const groups = exams.reduce<Record<string, any[]>>((acc, exam) => {
    const g = exam.group || "residency";
    if (!acc[g]) acc[g] = [];
    acc[g].push(exam);
    return acc;
  }, {});

  const groupLabels: Record<string, string> = {
    residency: t("residency_exams"),
    usmle: t("usmle_exams"),
  };

  const groupOrder = ["residency", "usmle"];

  const toggleExam = (examId: string) => {
    setSelectedExams((prev) => {
      const next = { ...prev };
      if (next[examId]) {
        delete next[examId];
      } else {
        next[examId] = [];
      }
      return next;
    });
    if (!examDetails[examId]) {
      examsApi.get(examId).then((res) => {
        setExamDetails((prev) => ({ ...prev, [examId]: res.data }));
      }).catch(() => {});
    }
  };

  const toggleSpecialty = (examId: string, specialtyId: string) => {
    setSelectedExams((prev) => {
      const current = prev[examId] || [];
      const next = current.includes(specialtyId)
        ? current.filter((id) => id !== specialtyId)
        : [...current, specialtyId];
      return { ...prev, [examId]: next };
    });
  };

  const selectedCount = Object.keys(selectedExams).length;

  const handleStartCombined = () => {
    const params = new URLSearchParams();
    for (const [examId, specialtyIds] of Object.entries(selectedExams)) {
      params.append("examIds", examId);
      if (specialtyIds.length > 0) {
        specialtyIds.forEach((sid) => params.append("specialtyIds", sid));
      }
    }
    const firstExamId = Object.keys(selectedExams)[0];
    router.push(`/dashboard/exams/${firstExamId}?${params.toString()}`);
  };

  return (
    <AccountTypeGate>
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{n("exams")}</h1>
          {selectedCount > 0 && (
            <Button onClick={handleStartCombined}>
              <Play className="h-4 w-4 mr-2" />
              {t("start_combined", { count: selectedCount })}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">{t("no_exams")}</div>
        ) : (
          <div className="space-y-8">
            {groupOrder.filter((g) => groups[g]).map((group) => (
              <div key={group}>
                <h2 className="text-xl font-semibold mb-4">{groupLabels[group] || group}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {groups[group].map((exam: any) => {
              const isSelected = !!selectedExams[exam.id];
              const specs = examDetails[exam.id]?.specialties || [];
              const selectedSpecs = selectedExams[exam.id] || [];
              return (
                <Card key={exam.id} className={`overflow-hidden ${isSelected ? "ring-2 ring-primary" : ""}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="break-words">{localized(exam.name)}</CardTitle>
                        <CardDescription className="break-words">{localized(exam.description)}</CardDescription>
                      </div>
                      <button
                        onClick={() => toggleExam(exam.id)}
                        className={`flex-shrink-0 h-6 w-6 rounded border flex items-center justify-center ${isSelected ? "bg-primary border-primary" : "border-input"}`}
                      >
                        {isSelected && <Check className="h-4 w-4 text-primary-foreground" />}
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <GraduationCap className="h-4 w-4" />
                        <span>{t("questions_count", { count: exam._questionCount ?? "—" })}</span>
                      </div>
                    </div>
                    {isSelected && specs.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-muted-foreground">{t("specialty")}</span>
                          {selectedSpecs.length > 0 && (
                            <button
                              onClick={() => setSelectedExams((prev) => ({ ...prev, [exam.id]: [] }))}
                              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                            >
                              <X className="h-3 w-3" /> {t("clear")}
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {specs.map((s: any) => {
                            const isSpecSelected = selectedSpecs.includes(s.id);
                            return (
                              <button
                                key={s.id}
                                onClick={() => toggleSpecialty(exam.id, s.id)}
                                className={`text-xs px-2 py-1 rounded-full border ${
                                  isSpecSelected
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-muted-foreground border-border"
                                }`}
                              >
                                {localized(s.name)}
                              </button>
                            );
                          })}
                        </div>
                        {selectedSpecs.length === 0 && (
                          <p className="text-xs text-muted-foreground mt-1">{t("all_specialties")}</p>
                        )}
                      </div>
                    )}
                    <Button
                      className="w-full"
                      onClick={() => {
                        const params = new URLSearchParams();
                        const specs = selectedExams[exam.id];
                        if (specs && specs.length > 0) {
                          specs.forEach((sid) => params.append("specialtyIds", sid));
                        }
                        const qs = params.toString();
                        router.push(`/dashboard/exams/${exam.id}${qs ? `?${qs}` : ""}`);
                      }}
                      disabled={!exam._questionCount}
                      variant={isSelected ? "outline" : "default"}
                    >
                      {exam._questionCount ? t("start") : t("no_questions")}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
                  </div>
                </div>
              ))}
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">{t("history")}</h2>
          <ExamHistory />
        </div>
      </div>
    </PageTransition>
    </AccountTypeGate>
  );
}
