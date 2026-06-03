"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/page-transition";
import { TrendingUp, Target, Clock, BookOpen, Zap } from "lucide-react";

const WeeklyChart = dynamic(() => import("./weekly-chart"), { ssr: false });
const SpecialtyChart = dynamic(() => import("./specialty-chart"), { ssr: false });

const overallStats = [
  { label: "Questions Answered", value: "1,247", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Overall Accuracy", value: "78%", icon: Target, color: "text-green-500", bg: "bg-green-500/10" },
  { label: "Study Streak", value: "12 days", icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10" },
  { label: "Total Hours", value: "48h", icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
];

export default function ProgressPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
          <p className="text-muted-foreground">Track your learning journey</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {overallStats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
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
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <WeeklyChart />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accuracy by Specialty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <SpecialtyChart />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Streak Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-8 w-8 rounded-sm flex items-center justify-center text-xs ${
                    i < 12
                      ? "bg-primary text-primary-foreground"
                      : i === 12
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
      </div>
    </PageTransition>
  );
}