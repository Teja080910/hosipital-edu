"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { BookOpen, Brain, GraduationCap, Target, Loader2 } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { Link } from "@/routing";
import { analyticsApi } from "@/lib/api";

export default function DashboardPage() {
  const t = useTranslations("nav");
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    analyticsApi.userStats().then(({ data }) => setStats(data)).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const statCards = stats
    ? [
        { label: "Questions Answered", value: stats.questions?.totalAnswered ?? "—", icon: BookOpen, color: "text-blue-500" },
        { label: "Accuracy", value: stats.questions?.totalAnswered ? `${Math.round((stats.questions.totalCorrect / stats.questions.totalAnswered) * 100)}%` : "—", icon: Target, color: "text-green-500" },
        { label: "Exams Completed", value: stats.attempts?.completed ?? "—", icon: GraduationCap, color: "text-orange-500" },
        { label: "Flashcards Reviewed", value: stats.flashcards?.totalReviewed ?? "—", icon: Brain, color: "text-purple-500" },
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
              Welcome back, {user?.name?.split(" ")[0] || "Student"}
            </h1>
            <p className="text-muted-foreground">Here&apos;s your learning overview</p>
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

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Activity tracking coming soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/questions">
                <Button className="w-full justify-start" variant="outline">
                  <Brain className="mr-2 h-4 w-4" /> Start Study
                </Button>
              </Link>
              <Link href="/dashboard/exams">
                <Button className="w-full justify-start" variant="outline">
                  <GraduationCap className="mr-2 h-4 w-4" /> Take Exam
                </Button>
              </Link>
              <Link href="/dashboard/flashcards">
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" /> Review Flashcards
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}