"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/page-transition";
import { DataGrid } from "@/components/admin/data-grid";
import { FileQuestion, Plus } from "lucide-react";

const mockQuestions = [
  { id: "1", text: "What is the most common cause of CAP?", specialty: "Internal Medicine", difficulty: "medium", status: "active" },
  { id: "2", text: "First-line treatment for hypertension in diabetics?", specialty: "Cardiology", difficulty: "easy", status: "active" },
  { id: "3", text: "ST elevation in V1-V4 indicates?", specialty: "Cardiology", difficulty: "hard", status: "active" },
];

export default function AdminQuestionsPage() {
  const t = useTranslations("admin");
  const c = useTranslations("common");

  const columns = [
    { key: "text", header: t("question_col"), sortable: true },
    { key: "specialty", header: t("specialty"), sortable: true },
    { key: "difficulty", header: t("difficulty") },
    { key: "status", header: t("status"), render: (row: any) => <Badge variant={row.status === "active" ? "default" : "secondary"}>{c("active")}</Badge> },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("question_mgmt_title")}</h1>
            <p className="text-muted-foreground">{t("question_mgmt_subtitle")}</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> {t("add_question")}
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <DataGrid data={mockQuestions} columns={columns} />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}