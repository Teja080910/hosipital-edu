"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataGrid } from "@/components/admin/data-grid";
import { usersApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const c = useTranslations("common");
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await usersApi.list();
      setUsers(data.items || data);
      setTotal(data.total ?? data.length);
    } catch {
      toast.error(t("load_failed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

const deleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await usersApi.remove(deleteTarget.id);
      toast.success(t("user_deleted"));
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      toast.error(t("delete_failed"));
    }
  };

  const changeRole = async (userId: string, role: string) => {
    setChangingRole(userId);
    try {
      await usersApi.changeRole(userId, role);
      toast.success(t("role_changed", { role }));
      fetchUsers();
    } catch {
      toast.error(t("role_change_failed"));
    } finally {
      setChangingRole(null);
    }
  };

  const columns = [
    { key: "name", header: t("name_col"), sortable: true },
    { key: "email", header: t("email_col"), sortable: true },
    {
      key: "role",
      header: t("role"),
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
              <SelectItem value="student">student</SelectItem>
              <SelectItem value="admin">admin</SelectItem>
              <SelectItem value="super_admin">super_admin</SelectItem>
            </SelectContent>
          </Select>
          {changingRole === row.id && <Loader2 className="h-3 w-3 animate-spin" />}
        </div>
      ),
    },
    {
      key: "status",
      header: t("status"),
      render: (row: any) => (
        <Badge variant={row.deletedAt ? "destructive" : "default"}>
          {row.deletedAt ? "deleted" : c("active")}
        </Badge>
      ),
    },
    { key: "createdAt", header: t("joined"), sortable: true },
    {
      key: "actions",
      header: "",
      render: (row: any) =>
        !row.deletedAt && (
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive"
            onClick={() => setDeleteTarget(row)}
          >
            {t("delete_user")}
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
            <h1 className="text-3xl font-bold tracking-tight">{t("user_mgmt_title")}</h1>
            <p className="text-muted-foreground">{t("user_mgmt_subtitle")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Total: {total}
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <DataGrid data={users} columns={columns} />
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("delete_user")}
        description={t("delete_confirm")}
        confirmLabel={t("delete_user")}
        variant="destructive"
        onConfirm={deleteUser}
      />
    </PageTransition>
  );
}