"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTransition } from "@/components/page-transition";
import { DataGrid } from "@/components/admin/data-grid";
import { usersApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await usersApi.list();
      setUsers(data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const changeRole = async (userId: string, role: string) => {
    setChangingRole(userId);
    try {
      await usersApi.changeRole(userId, role);
      toast.success(`Role changed to ${role}`);
      fetchUsers();
    } catch {
      toast.error("Failed to change role");
    } finally {
      setChangingRole(null);
    }
  };

  const columns = [
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email", sortable: true },
    {
      key: "role",
      header: "Role",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <Select
            defaultValue={row.role}
            onValueChange={(val) => changeRole(row.id, val)}
            disabled={changingRole === row.id}
          >
            <SelectTrigger className="h-7 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">user</SelectItem>
              <SelectItem value="admin">admin</SelectItem>
            </SelectContent>
          </Select>
          {changingRole === row.id && <Loader2 className="h-3 w-3 animate-spin" />}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: any) => (
        <Badge variant={row.deletedAt ? "destructive" : "default"}>
          {row.deletedAt ? "deleted" : "active"}
        </Badge>
      ),
    },
    { key: "createdAt", header: "Joined", sortable: true },
    {
      key: "actions",
      header: "",
      render: (row: any) =>
        !row.deletedAt && (
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive"
            onClick={async () => {
              if (!confirm("Delete this user?")) return;
              try {
                await usersApi.remove(row.id);
                toast.success("User deleted");
                fetchUsers();
              } catch {
                toast.error("Failed to delete");
              }
            }}
          >
            Delete
          </Button>
        ),
    },
  ];

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage platform users</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <DataGrid data={users} columns={columns} />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}