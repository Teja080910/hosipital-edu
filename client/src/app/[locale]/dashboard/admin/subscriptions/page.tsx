"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import { DataGrid } from "@/components/admin/data-grid";

const mockSubscriptions = [
  { id: "1", user: "John Doe", plan: "annual", status: "active", startDate: "2024-01-15", endDate: "2025-01-15" },
  { id: "2", user: "Jane Smith", plan: "monthly", status: "active", startDate: "2024-03-01", endDate: "2024-04-01" },
  { id: "3", user: "Bob Wilson", plan: "quarterly", status: "canceled", startDate: "2024-02-01", endDate: "2024-05-01" },
];

export default function AdminSubscriptionsPage() {
  const t = useTranslations("admin");
  const c = useTranslations("common");

  const columns = [
    { key: "user", header: t("user_col"), sortable: true },
    { key: "plan", header: t("plan"), render: (row: any) => <Badge variant="outline" className="capitalize">{row.plan}</Badge> },
    { key: "status", header: t("status"), render: (row: any) => <Badge variant={row.status === "active" ? "default" : "destructive"}>{row.status === "active" ? c("active") : row.status}</Badge> },
    { key: "startDate", header: t("start_date"), sortable: true },
    { key: "endDate", header: t("end_date"), sortable: true },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("subscription_mgmt_title")}</h1>
          <p className="text-muted-foreground">{t("subscription_mgmt_subtitle")}</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <DataGrid data={mockSubscriptions} columns={columns} />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}