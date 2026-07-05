"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { BookOpen, Brain, GraduationCap, Target, Loader2, ChevronRight, Clock, CheckCircle2, XCircle, Lock } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { Link, useRouter } from "@/routing";
import { analyticsApi, examsApi, attemptsApi } from "@/lib/api";
import { localizedText as localized } from "@/lib/utils";

const PAGE_SIZE = 5;

export default function DashboardPage() {
  const t = useTranslations("nav");
  const td = useTranslations("dashboard");
  const tp = useTranslations("progress");
  const te = useTranslations("exams");
  const { user } = useAuth();
  const router = useRouter();
  const isFull = user?.accountType === "full" || user?.role === "admin" || user?.role === "super_admin";
  const [stats, setStats] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const promises: Promise<any>[] = [];
    if (isFull) {
      promises.push(analyticsApi.userStats().then(({ data }) => setStats(data)).catch(() => {}));
      promises.push(examsApi.list().then((res) => setExams((res.data || []).slice(0, 4))).catch(() => {}));
      promises.push(attemptsApi.list().then((res) => setRecentAttempts((res.data || []).slice(0, PAGE_SIZE))).catch(() => {}));
    }
    Promise.all(promises).finally(() => setLoading(false));
  }, [user, isFull]);

  const statCards = stats
    ? [
        { label: tp("questions_answered"), value: stats.questions?.totalAnswered ?? "—", icon: BookOpen, color: "text-blue-500" },
        { label: tp("accuracy"), value: stats.questions?.totalAnswered ? `${Math.round((stats.questions.totalCorrect / stats.questions.totalAnswered) * 100)}%` : "—", icon: Target, color: "text-green-500" },
        { label: tp("exams_completed"), value: stats.attempts?.completed ?? "—", icon: GraduationCap, color: "text-orange-500" },
        { label: tp("flashcards_reviewed"), value: stats.flashcards?.totalReviewed ?? "—", icon: Brain, color: "text-purple-500" },
      ]
    : [];

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {td("welcome_back", { name: user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "" })}
            </h1>
            <p className="text-muted-foreground">{td("continue_education")}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{td("your_exams")}</CardTitle>
              <Link href="/dashboard/exams"><Button variant="ghost" size="sm">{td("view_all")} <ChevronRight className="h-4 w-4 ml-1" /></Button></Link>
            </CardHeader>
            <CardContent>
              {exams.length === 0 ? (
                <p className="text-sm text-muted-foreground">{td("no_exams_available")}</p>
              ) : (
                <div className="space-y-3">
                  {exams.map((exam: any) => (
                    exam.hasAccess === false ? (
                      <Card key={exam.id} className="cursor-pointer" onClick={() => router.push("/dashboard/subscribe")}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <p className="font-medium">{localized(exam.name)}</p>
                            <p className="text-sm text-muted-foreground">{te("questions_count", { count: exam._questionCount ?? "—" })}</p>
                          </div>
                          <div className="flex items-center gap-2"><Lock className="h-5 w-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">{te("subscribe")}</span></div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Link key={exam.id} href={`/dashboard/exams/${exam.id}`}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                          <CardContent className="flex items-center justify-between p-4">
                            <div>
                              <p className="font-medium">{localized(exam.name)}</p>
                              <p className="text-sm text-muted-foreground">{te("questions_count", { count: exam._questionCount ?? "—" })}</p>
                            </div>
                            <GraduationCap className="h-5 w-5 text-muted-foreground" />
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{td("quick_actions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/exams">
                <Button className="w-full justify-start" variant="outline">
                  <GraduationCap className="mr-2 h-4 w-4" /> {td("take_an_exam")}
                </Button>
              </Link>
              <Link href="/dashboard/flashcards">
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" /> {td("review_flashcards")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {recentAttempts.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{td("recent_attempts")}</CardTitle>
              <Link href="/dashboard/progress"><Button variant="ghost" size="sm">{td("view_all")} <ChevronRight className="h-4 w-4 ml-1" /></Button></Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAttempts.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      {a.status === "completed" ? (
                        a.correctCount / a.questionCount >= 0.6 ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{a.examName?.en || a.examName || te("exam")}</p>
                        <p className="text-xs text-muted-foreground">{a.correctCount}/{a.questionCount} {te("correct")} · <Badge variant="outline" className="text-xs">{a.mode}</Badge></p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">{a.status === "completed" ? `${Math.round((a.correctCount / a.questionCount) * 100)}%` : te("in_progress")}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}