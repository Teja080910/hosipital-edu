"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/page-transition";
import { StatsCard } from "@/components/admin/stats-card";
import { Loader2, Users, FileQuestion, GraduationCap, DollarSign, BookOpen, UserPlus, CreditCard, FileEdit } from "lucide-react";
import { analyticsApi } from "@/lib/api";

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function formatCurrency(val: string): string {
  const n = parseFloat(val);
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

const entityIcon: Record<string, any> = {
  user: UserPlus,
  question: FileQuestion,
  subscription: CreditCard,
  course: BookOpen,
  payment: DollarSign,
  article: FileEdit,
};

export default function AdminPage() {
  const t = useTranslations("admin");
  const locale = useParams().locale as string;
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.admin(),
      analyticsApi.adminRecentActivity(10),
    ]).then(([statsRes, activityRes]) => {
      setStats(statsRes.data);
      setActivity(activityRes.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard_title")}</h1>
          <p className="text-muted-foreground">{t("dashboard_subtitle")}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard icon={Users} label={t("total_users")} value={formatNumber(stats?.totalUsers || 0)} trend={stats?.todayUsers ? `+${stats.todayUsers} today` : undefined} color="text-blue-500" />
              <StatsCard icon={FileQuestion} label={t("questions")} value={formatNumber(stats?.totalQuestions || 0)} color="text-green-500" />
              <StatsCard icon={GraduationCap} label={t("active_exams")} value={String(stats?.activeExams || 0)} color="text-orange-500" />
              <StatsCard icon={DollarSign} label={t("revenue")} value={formatCurrency(stats?.revenue || "0")} trend={stats?.recentRevenue && stats.recentRevenue !== "0" ? `+${formatCurrency(stats.recentRevenue)} 7d` : undefined} color="text-purple-500" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("recent_activity")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {activity.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                  ) : (
                    <div className="space-y-4">
                      {activity.map((item: any) => {
                        const Icon = entityIcon[item.entityType] || Users;
                        const actionText = item.metadata?.description || `${item.action} ${item.entityType}`;
                        return (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="rounded-full bg-muted p-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{actionText}</p>
                              <p className="text-xs text-muted-foreground">{timeAgo(item.createdAt)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("quick_actions")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: t("manage_questions"), href: "/admin/questions" },
                    { label: t("manage_users"), href: "/admin/users" },
                    { label: t("view_analytics"), href: "/admin/analytics" },
                    { label: t("manage_subscriptions"), href: "/admin/subscriptions" },
                  ].map((item) => (
                    <a key={item.label} href={`/${locale}/dashboard${item.href}`}>
                      <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <p className="font-medium">{item.label}</p>
                      </Card>
                    </a>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
