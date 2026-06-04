"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/page-transition";
import { StatsCard } from "@/components/admin/stats-card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
} from "recharts";
import { Users, FileQuestion, GraduationCap, DollarSign } from "lucide-react";

const userGrowth = [
  { month: "Jan", count: 1200 }, { month: "Feb", count: 1400 }, { month: "Mar", count: 1800 },
  { month: "Apr", count: 2200 }, { month: "May", count: 2800 }, { month: "Jun", count: 3500 },
];

const revenueData = [
  { month: "Jan", revenue: 12000 }, { month: "Feb", revenue: 15000 }, { month: "Mar", revenue: 18000 },
  { month: "Apr", revenue: 22000 }, { month: "May", revenue: 28000 }, { month: "Jun", revenue: 35000 },
];

const examCompletion = [
  { name: "ENARM", completed: 1200, started: 1500 },
  { name: "MIR", completed: 800, started: 1100 },
  { name: "USMLE", completed: 600, started: 900 },
  { name: "PLAB", completed: 400, started: 600 },
];

export default function AdminAnalyticsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Platform performance metrics</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard icon={Users} label="Total Users" value="12,450" trend="+12%" color="text-blue-500" />
          <StatsCard icon={FileQuestion} label="Questions Answered" value="89,234" trend="+15%" color="text-green-500" />
          <StatsCard icon={GraduationCap} label="Exams Taken" value="3,210" trend="+8%" color="text-orange-500" />
          <StatsCard icon={DollarSign} label="MRR" value="$38,400" trend="+22%" color="text-purple-500" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs text-muted-foreground" />
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
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs text-muted-foreground" />
                    <YAxis className="text-xs text-muted-foreground" />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Exam Completion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={examCompletion}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs text-muted-foreground" />
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