"use client";

import { PageTransition } from "@/components/page-transition";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { BookOpen, ChevronRight, Shield, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

const userGuides = [
  { key: "getting_started", steps: 9 },
  { key: "question_bank", steps: 6 },
  { key: "exam_mode", steps: 6 },
  { key: "flashcards", steps: 6 },
  { key: "video_classes", steps: 5 },
  { key: "courses", steps: 7 },
  { key: "progress", steps: 5 },
  { key: "subscription", steps: 9 },
];

const adminGuides = [
  { key: "content_management", items: 4 },
  { key: "user_management", items: 4 },
  { key: "system_administration", items: 4 },
  { key: "translations", items: 4 },
];

const superAdminGuides = [
  { key: "platform_administration", items: 4 },
  { key: "security", items: 4 },
  { key: "infrastructure", items: 4 },
  { key: "advanced_config", items: 4 },
];

export default function GuidesPage() {
  const t = useTranslations("guides");
  const c = useTranslations("common");
  const { user } = useAuth();
  const role = user?.role || "student";

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("page_title")}</h1>
          <p className="text-muted-foreground">{t("page_subtitle")}</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {t("role_" + role)}
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t("role_" + role + "_desc")}</span>
        </div>

{role === "student" && (
  <div className="grid gap-4 md:grid-cols-2">
    {userGuides.map(({ key, steps }) => (
      <Card key={key}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg">{t(key + ".title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{t(key + ".description")}</p>
          <ol className="space-y-2">
            {Array.from({ length: steps }, (_, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                {t(key + ".step_" + i)}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    ))}
  </div>
)}

        {(role === "admin" || role === "super_admin") && (
          <>
            <div className="pt-4">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                {t("admin_title")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t("admin_subtitle")}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {adminGuides.map(({ key, items }) => (
                <Card key={key}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                        <Shield className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-lg">{t(key + ".title")}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {Array.from({ length: items }, (_, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500/60" />
                          {t(key + ".item_" + i)}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {role === "super_admin" && (
          <>
            <div className="pt-4">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-red-500" />
                {t("super_admin_title")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t("super_admin_subtitle")}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {superAdminGuides.map(({ key, items }) => (
                <Card key={key}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-lg">{t(key + ".title")}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {Array.from({ length: items }, (_, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500/60" />
                          {t(key + ".item_" + i)}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}