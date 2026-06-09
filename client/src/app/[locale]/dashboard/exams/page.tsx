"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/routing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { ExamHistory } from "@/components/exams/exam-history";
import { examsApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, GraduationCap } from "lucide-react";
import type { Exam } from "@/types";

function localized(obj: Record<string, string> | string | null | undefined, locale = "en"): string {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[locale] || Object.values(obj)[0] || "";
}

export default function ExamsPage() {
  const t = useTranslations("exams");
  const n = useTranslations("nav");
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    examsApi.list()
      .then(({ data }) => setExams(data))
      .catch(() => toast.error(t("load_failed")))
      .finally(() => setLoading(false));
  }, [t]);

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{n("exams")}</h1>
        </div>

        {exams.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">{t("no_exams")}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {exams.map((exam) => (
              <Card key={exam.id}>
                <CardHeader>
                  <CardTitle>{localized(exam.name)}</CardTitle>
                  <CardDescription>{localized(exam.description)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => router.push(`/dashboard/exams/${exam.id}`)}>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    {t("start")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">{t("history")}</h2>
          <ExamHistory />
        </div>
      </div>
    </PageTransition>
  );
}
