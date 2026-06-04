"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { BookOpen, Brain, Clock, GraduationCap, Target, TrendingUp } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { Link } from "@/routing";

export default function DashboardPage() {
  const t = useTranslations("nav");
  const { user } = useAuth();

  const stats = [
    { label: "Questions Answered", value: "1,247", icon: BookOpen, trend: "+12%", color: "text-blue-500" },
    { label: "Accuracy", value: "78%", icon: Target, trend: "+5%", color: "text-green-500" },
    { label: "Day Streak", value: "12", icon: TrendingUp, trend: "+3", color: "text-orange-500" },
    { label: "Study Time", value: "48h", icon: Clock, trend: "+8h", color: "text-purple-500" },
  ];

  const recentActivity = [
    { action: "Completed ENARM Cardiology quiz", time: "2 hours ago", type: "quiz" },
    { action: "Reviewed 20 flashcards", time: "4 hours ago", type: "flashcard" },
    { action: "Started Internal Medicine course", time: "1 day ago", type: "course" },
    { action: "Scored 85% on Anatomy exam", time: "2 days ago", type: "exam" },
  ];

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
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.trend} from last week</p>
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
              <div className="space-y-4">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/questions">
                <Button className="w-full justify-start" variant="outline">
                  <Brain className="mr-2 h-4 w-4" /> Start Study
                </Button>
              </Link>
              <Link href="/exams">
                <Button className="w-full justify-start" variant="outline">
                  <GraduationCap className="mr-2 h-4 w-4" /> Take Exam
                </Button>
              </Link>
              <Link href="/flashcards">
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