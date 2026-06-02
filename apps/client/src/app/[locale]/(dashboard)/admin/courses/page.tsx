"use client";

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
  const columns = [
    { key: "title", header: "Title", sortable: true },
    { key: "lessons", header: "Lessons" },
    { key: "students", header: "Students" },
    { key: "status", header: "Status", render: (row: any) => <Badge variant={row.status === "published" ? "default" : "secondary"}>{row.status}</Badge> },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
            <p className="text-muted-foreground">Manage courses and lessons</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" /> Add Course</Button>
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