"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, Target, Clock, BookOpen, Zap } from "lucide-react";

const weeklyData = [
  { day: "Mon", minutes: 45 }, { day: "Tue", minutes: 60 }, { day: "Wed", minutes: 30 },
  { day: "Thu", minutes: 75 }, { day: "Fri", minutes: 50 }, { day: "Sat", minutes: 90 },
  { day: "Sun", minutes: 20 },
];

const specialtyData = [
  { specialty: "Cardiology", accuracy: 82 },
  { specialty: "Internal Med", accuracy: 75 },
  { specialty: "Pediatrics", accuracy: 88 },
  { specialty: "Surgery", accuracy: 65 },
  { specialty: "Neurology", accuracy: 70 },
];

const overallStats = [
  { label: "Questions Answered", value: "1,247", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Overall Accuracy", value: "78%", icon: Target, color: "text-green-500", bg: "bg-green-500/10" },
  { label: "Study Streak", value: "12 days", icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10" },
  { label: "Total Hours", value: "48h", icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" className="text-xs text-muted-foreground" />
                    <YAxis className="text-xs text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Bar dataKey="minutes" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accuracy by Specialty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={specialtyData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" domain={[0, 100]} className="text-xs text-muted-foreground" />
                    <YAxis dataKey="specialty" type="category" className="text-xs text-muted-foreground" width={90} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Bar dataKey="accuracy" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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