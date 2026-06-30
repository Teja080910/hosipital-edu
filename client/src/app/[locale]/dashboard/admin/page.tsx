"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/page-transition";
import { StatsCard } from "@/components/admin/stats-card";
import { Users, FileQuestion, GraduationCap, DollarSign } from "lucide-react";

export default function AdminPage() {
  const t = useTranslations("admin");
  const locale = useParams().locale as string;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard_title")}</h1>
          <p className="text-muted-foreground">{t("dashboard_subtitle")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard icon={Users} label={t("total_users")} value="12,450" trend="+12%" color="text-blue-500" />
          <StatsCard icon={FileQuestion} label={t("questions")} value="8,230" trend="+180" color="text-green-500" />
          <StatsCard icon={GraduationCap} label={t("active_exams")} value="24" trend="+3" color="text-orange-500" />
          <StatsCard icon={DollarSign} label={t("revenue")} value="$45,200" trend="+8%" color="text-purple-500" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("recent_activity")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "New user registered", time: "2 min ago", icon: Users },
                  { action: "Question bank updated - +45 questions", time: "15 min ago", icon: FileQuestion },
                  { action: "Subscription payment received", time: "1 hour ago", icon: DollarSign },
                  { action: "New course published: Advanced Cardiology", time: "3 hours ago", icon: GraduationCap },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="rounded-full bg-muted p-2">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
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
      </div>
    </PageTransition>
  );
}