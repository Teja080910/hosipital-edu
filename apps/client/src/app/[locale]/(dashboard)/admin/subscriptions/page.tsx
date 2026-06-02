"use client";

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
  const columns = [
    { key: "user", header: "User", sortable: true },
    { key: "plan", header: "Plan", render: (row: any) => <Badge variant="outline" className="capitalize">{row.plan}</Badge> },
    { key: "status", header: "Status", render: (row: any) => <Badge variant={row.status === "active" ? "default" : "destructive"}>{row.status}</Badge> },
    { key: "startDate", header: "Start Date", sortable: true },
    { key: "endDate", header: "End Date", sortable: true },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
          <p className="text-muted-foreground">Manage user subscriptions and plans</p>
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