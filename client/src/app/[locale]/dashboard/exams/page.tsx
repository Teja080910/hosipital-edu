"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useRouter } from "@/routing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import { AccountTypeGate } from "@/components/account-type-gate";
import { ExamHistory } from "@/components/exams/exam-history";
import { examsApi } from "@/lib/api";
import { GraduationCap, Loader2, Lock, Play, X } from "lucide-react";

function localized(obj: Record<string, string> | string | null | undefined, locale = "en"): string {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[locale] || Object.values(obj)[0] || "";
}

export default function ExamsPage() {
  const t = useTranslations("exams");
  const n = useTranslations("nav");
  const router = useRouter();
  const locale = useParams().locale as string;
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [examDetails, setExamDetails] = useState<Record<string, any>>({});
  const [selectedSpecialties, setSelectedSpecialties] = useState<Record<string, string[]>>({});

  useEffect(() => {
    examsApi.list()
      .then((res) => {
        setExams(res.data);
        res.data.forEach((exam: any) => loadDetails(exam.id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleSpecialty = (examId: string, specialtyId: string) => {
    setSelectedSpecialties((prev) => {
      const current = prev[examId] || [];
      const next = current.includes(specialtyId)
        ? current.filter((id) => id !== specialtyId)
        : [...current, specialtyId];
      return { ...prev, [examId]: next };
    });
  };

  const loadDetails = (examId: string) => {
    if (!examDetails[examId]) {
      examsApi.get(examId).then((res) => {
        setExamDetails((prev) => ({ ...prev, [examId]: res.data }));
      }).catch(() => {});
    }
  };

  return (
    <AccountTypeGate>
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{n("exams")}</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">{t("no_exams")}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {exams.map((exam) => {
              const specs = examDetails[exam.id]?.specialties || [];
              const selectedSpecs = selectedSpecialties[exam.id] || [];
              return (
                <Card key={exam.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="break-words">{localized(exam.name, locale)}</CardTitle>
                        <CardDescription className="break-words">{localized(exam.description, locale)}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <GraduationCap className="h-4 w-4" />
                        <span>{t("questions_count", { count: exam._questionCount ?? "—" })}</span>
                      </div>
                    </div>
                    {specs.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-muted-foreground">{t("specialty")}</span>
                          {selectedSpecs.length > 0 && (
                            <button
                              onClick={() => setSelectedSpecialties((prev) => ({ ...prev, [exam.id]: [] }))}
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
                                onClick={() => { loadDetails(exam.id); toggleSpecialty(exam.id, s.id); }}
                                className={`text-xs px-2 py-1 rounded-full border ${
                                  isSpecSelected
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-muted-foreground border-border"
                                }`}
                              >
                                {localized(s.name, locale)}
                              </button>
                            );
                          })}
                        </div>
                        {selectedSpecs.length === 0 && (
                          <p className="text-xs text-muted-foreground mt-1">{t("all_specialties")}</p>
                        )}
                      </div>
                    )}
                    {exam.hasAccess === false ? (
                      <Button className="w-full" onClick={() => router.push("/dashboard/subscribe")}>
                        <Lock className="h-4 w-4 mr-2" /> {t("subscribe")}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => {
                          const params = new URLSearchParams();
                          const specs = selectedSpecialties[exam.id];
                          if (specs && specs.length > 0) {
                            specs.forEach((sid) => params.append("specialtyIds", sid));
                          }
                          const qs = params.toString();
                          router.push(`/dashboard/exams/${exam.id}${qs ? `?${qs}` : ""}`);
                        }}
                        disabled={!exam._questionCount}
                      >
                        {exam._questionCount ? t("start") : t("no_questions")}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
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
