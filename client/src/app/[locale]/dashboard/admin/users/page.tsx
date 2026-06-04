"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import { DataGrid } from "@/components/admin/data-grid";
import { Plus } from "lucide-react";

const mockUsers = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "user", status: "active", joined: "2024-01-15" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "user", status: "active", joined: "2024-02-20" },
  { id: "3", name: "Admin User", email: "admin@hospitaledu.com", role: "admin", status: "active", joined: "2024-01-01" },
];

export default function AdminUsersPage() {
  const columns = [
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email", sortable: true },
    { key: "role", header: "Role", render: (row: any) => <Badge variant={row.role === "admin" ? "default" : "secondary"}>{row.role}</Badge> },
    { key: "status", header: "Status", render: (row: any) => <Badge>{row.status}</Badge> },
    { key: "joined", header: "Joined", sortable: true },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage platform users</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" /> Add User</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <DataGrid data={mockUsers} columns={columns} />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}