"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import { DataGrid } from "@/components/admin/data-grid";
import { Plus } from "lucide-react";

const mockCourses = [
  { id: "1", title: "Internal Medicine", lessons: 24, students: 340, status: "published" },
  { id: "2", title: "Cardiology Review", lessons: 18, students: 210, status: "published" },
  { id: "3", title: "Surgery Principles", lessons: 20, students: 0, status: "draft" },
];

export default function AdminCoursesPage() {
  const t = useTranslations("admin");
  const c = useTranslations("common");

  const columns = [
    { key: "title", header: t("title_col"), sortable: true },
    { key: "lessons", header: t("lessons_col") },
    { key: "students", header: t("students") },
    { key: "status", header: t("status"), render: (row: any) => <Badge variant={row.status === "published" ? "default" : "secondary"}>{row.status === "published" ? c("published") : c("draft")}</Badge> },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("course_mgmt_title")}</h1>
            <p className="text-muted-foreground">{t("course_mgmt_subtitle")}</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" /> {t("add_course")}</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <DataGrid data={mockCourses} columns={columns} />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}