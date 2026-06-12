"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/page-transition";
import { TrendingUp, Target, Clock, BookOpen, Zap } from "lucide-react";
import { analyticsApi } from "@/lib/api/analytics";

const WeeklyChart = dynamic(() => import("./weekly-chart"), { ssr: false });
const SpecialtyChart = dynamic(() => import("./specialty-chart"), { ssr: false });

interface ProgressData {
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
  totalHours: number;
  streak: number;
  weeklyData: { date: string; count: number }[];
  specialtyData: { specialtyId: string; name: Record<string, string>; totalAnswered: number; totalCorrect: number }[];
}

export default function ProgressPage() {
  const t = useTranslations("progress");
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.progress().then(({ data: d }) => setData(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const overallStats = data ? [
    { key: "questions_answered" as const, value: data.totalAnswered.toLocaleString(), icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { key: "overall_accuracy" as const, value: `${data.accuracy}%`, icon: Target, color: "text-green-500", bg: "bg-green-500/10" },
    { key: "study_streak" as const, value: `${data.streak} days`, icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10" },
    { key: "total_hours" as const, value: `${data.totalHours}h`, icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
  ] : [];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {overallStats.map((stat) => (
                <Card key={stat.key}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{t(stat.key)}</CardTitle>
                    <div className={`rounded-full p-2 ${stat.bg}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("weekly_activity")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <WeeklyChart data={data?.weeklyData} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("accuracy_by_specialty")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <SpecialtyChart data={data?.specialtyData} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("streak_calendar")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-8 w-8 rounded-sm flex items-center justify-center text-xs ${
                        i < data?.streak
                          ? "bg-primary text-primary-foreground"
                          : i === data?.streak
                          ? "border-2 border-primary bg-primary/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageTransition>
  );
}