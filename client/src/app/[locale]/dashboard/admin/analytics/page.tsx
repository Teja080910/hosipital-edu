"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/page-transition";
import { StatsCard } from "@/components/admin/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
} from "recharts";
import { Users, FileQuestion, GraduationCap, DollarSign } from "lucide-react";
import { analyticsApi } from "@/lib/api/analytics";

export default function AdminAnalyticsPage() {
  const t = useTranslations("admin");
  const [stats, setStats] = useState<any>(null);
  const [dau, setDau] = useState<any[]>([]);
  const [mau, setMau] = useState<any[]>([]);
  const [retention, setRetention] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [examCompletion, setExamCompletion] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.admin(),
      analyticsApi.adminDau(30),
      analyticsApi.adminMau(12),
      analyticsApi.adminRetention(),
      analyticsApi.adminUserGrowth(30),
      analyticsApi.adminExamCompletion(),
    ]).then(([s, d, m, r, g, e]) => {
      setStats(s.data);
      setDau(d.data ?? []);
      setMau(m.data ?? []);
      setRetention(r.data ?? []);
      setUserGrowth(g.data ?? []);
      setExamCompletion(e.data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-[300px]" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("analytics_title")}</h1>
          <p className="text-muted-foreground">{t("analytics_subtitle")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard icon={Users} label={t("total_users")} value={String(stats?.totalUsers ?? 0)} color="text-blue-500" />
          <StatsCard icon={FileQuestion} label={t("questions_answered")} value={String(stats?.totalQuestionsAnswered ?? 0)} color="text-green-500" />
          <StatsCard icon={GraduationCap} label={t("exams_taken")} value={String(stats?.totalAttempts ?? 0)} color="text-orange-500" />
          <StatsCard icon={FileQuestion} label="Flashcards Reviewed" value={String(stats?.totalFlashcardsReviewed ?? 0)} color="text-purple-500" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Daily Active Users (30 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dau}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tickFormatter={(v) => v?.slice(5) || ""} className="text-xs text-muted-foreground" />
                    <YAxis className="text-xs text-muted-foreground" />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }} />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mau}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tickFormatter={(v) => v?.slice(5) || ""} className="text-xs text-muted-foreground" />
                    <YAxis className="text-xs text-muted-foreground" />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }} />
                    <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Growth (30 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tickFormatter={(v) => v?.slice(5) || ""} className="text-xs text-muted-foreground" />
                    <YAxis className="text-xs text-muted-foreground" />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }} />
                    <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cohort Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="text-left p-1">Cohort</th>
                      <th className="p-1">Users</th>
                      <th className="p-1">M0</th>
                      <th className="p-1">M1</th>
                      <th className="p-1">M2</th>
                      <th className="p-1">M3</th>
                      <th className="p-1">M4</th>
                      <th className="p-1">M5</th>
                      <th className="p-1">M6</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retention.map((r: any) => (
                      <tr key={r.cohort} className="border-t border-border">
                        <td className="p-1 font-medium">{r.cohort}</td>
                        <td className="p-1 text-center">{r.total}</td>
                        {["month_0","month_1","month_2","month_3","month_4","month_5","month_6"].map((m) => (
                          <td key={m} className="p-1 text-center">
                            <span className={`inline-block w-8 py-0.5 rounded ${
                              r.retention[m] > 50 ? "bg-green-100 text-green-800" :
                              r.retention[m] > 20 ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-500"
                            }`}>
                              {r.retention[m]}%
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Exam Completion by Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={examCompletion}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="examId" tickFormatter={(v) => v?.slice(0, 8) || ""} className="text-xs text-muted-foreground" />
                  <YAxis className="text-xs text-muted-foreground" />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }} />
                  <Bar dataKey="started" name="Started" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}