"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useRouter } from "@/routing";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { AccountTypeGate } from "@/components/account-type-gate";
import { ExamHistory } from "@/components/exams/exam-history";
import { examsApi } from "@/lib/api";
import { GraduationCap, Loader2, Lock, Play } from "lucide-react";
import { localizedText as localized } from "@/lib/utils";

export default function ExamsPage() {
  const t = useTranslations("exams");
  const n = useTranslations("nav");
  const router = useRouter();
  const locale = useParams().locale as string;
  const { user, isLoading: authLoading } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    setLoading(true);
    examsApi.list()
      .then((res) => setExams(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading]);

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
                    {exam.hasAccess === false ? (
                      <Button className="w-full" onClick={() => router.push("/dashboard/subscribe")}>
                        <Lock className="h-4 w-4 mr-2" /> {t("subscribe")}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => {
                          router.push(`/dashboard/exams/${exam.id}`);
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
