"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import { DataGrid } from "@/components/admin/data-grid";
import { Plus } from "lucide-react";

const mockArticles = [
  { id: "1", title: "Understanding Hypertension Guidelines", author: "Dr. Maria Garcia", publishedAt: "2024-03-15", status: "published" },
  { id: "2", title: "New Advances in Cardiology", author: "Dr. James Wilson", publishedAt: "2024-03-10", status: "published" },
  { id: "3", title: "Study Tips for Medical Students", author: "Admin", publishedAt: "", status: "draft" },
];

export default function AdminArticlesPage() {
  const columns = [
    { key: "title", header: "Title", sortable: true },
    { key: "author", header: "Author", sortable: true },
    { key: "publishedAt", header: "Published" },
    { key: "status", header: "Status", render: (row: any) => <Badge variant={row.status === "published" ? "default" : "secondary"}>{row.status}</Badge> },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
            <p className="text-muted-foreground">Manage blog posts and educational articles</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" /> New Article</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <DataGrid data={mockArticles} columns={columns} />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}