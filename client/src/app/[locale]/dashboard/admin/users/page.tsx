"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageTransition } from "@/components/page-transition";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataGrid } from "@/components/admin/data-grid";
import { usersApi, subscriptionsApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const c = useTranslations("common");
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [subUser, setSubUser] = useState<any | null>(null);
  const [userSub, setUserSub] = useState<any | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [subForm, setSubForm] = useState({ planId: "", status: "active", remainingExamAttempts: "", remainingFlashcardAttempts: "", remainingUses: "" });
  const [savingSub, setSavingSub] = useState(false);

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

  const openSubscription = async (user: any) => {
    setSubUser(user);
    try {
      const { data: plansData } = await subscriptionsApi.plans();
      setPlans(plansData);
    } catch {}
    try {
      const { data } = await usersApi.getSubscription(user.id);
      setUserSub(data);
      setSubForm({
        planId: data?.planId || "",
        status: data?.status || "active",
        remainingExamAttempts: data?.remainingExamAttempts?.toString() || "",
        remainingFlashcardAttempts: data?.remainingFlashcardAttempts?.toString() || "",
        remainingUses: data?.remainingUses?.toString() || "",
      });
    } catch {
      setUserSub(null);
      setSubForm({ planId: "", status: "active", remainingExamAttempts: "", remainingFlashcardAttempts: "", remainingUses: "" });
    }
    setSubDialogOpen(true);
  };

  const saveSubscription = async () => {
    setSavingSub(true);
    try {
      const payload: any = { status: subForm.status };
      if (subForm.planId) payload.planId = subForm.planId;
      if (subForm.remainingExamAttempts) payload.remainingExamAttempts = parseInt(subForm.remainingExamAttempts);
      if (subForm.remainingFlashcardAttempts) payload.remainingFlashcardAttempts = parseInt(subForm.remainingFlashcardAttempts);
      if (subForm.remainingUses) payload.remainingUses = parseInt(subForm.remainingUses);
      await usersApi.updateSubscription(subUser!.id, payload);
      toast.success(t("subscription_updated"));
      setSubDialogOpen(false);
    } catch {
      toast.error(t("subscription_update_failed"));
    } finally {
      setSavingSub(false);
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
          {row.deletedAt ? t("deleted") : c("active")}
        </Badge>
      ),
    },
    { key: "createdAt", header: t("joined"), sortable: true },
    {
      key: "actions",
      header: "",
      render: (row: any) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => openSubscription(row)}>
            <CreditCard className="h-3 w-3" />
          </Button>
          {!row.deletedAt && (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => setDeleteTarget(row)}
            >
              {t("delete_user")}
            </Button>
          )}
        </div>
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

      <Dialog open={subDialogOpen} onOpenChange={setSubDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("subscription_for")} {subUser?.name || subUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {userSub && (
              <div className="text-xs text-muted-foreground space-y-1 mb-2">
                <p>{t("current_plan")}: <span className="font-medium text-foreground">{userSub.plan?.name?.en || userSub.planId}</span></p>
                <p>{t("status")}: <Badge variant={userSub.status === "active" ? "default" : "secondary"} className="text-xs">{userSub.status}</Badge></p>
                <p>{t("period_end")}: {userSub.currentPeriodEnd ? new Date(userSub.currentPeriodEnd).toLocaleDateString() : "—"}</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-medium">{t("plan")}</label>
              <Select value={subForm.planId} onValueChange={(v) => setSubForm({ ...subForm, planId: v })}>
                <SelectTrigger><SelectValue placeholder={t("select_plan")} /></SelectTrigger>
                <SelectContent>
                  {plans.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name?.en || p.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">{t("status")}</label>
              <Select value={subForm.status} onValueChange={(v) => setSubForm({ ...subForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("subscription_active")}</SelectItem>
                  <SelectItem value="canceled">{t("subscription_canceled")}</SelectItem>
                  <SelectItem value="expired">{t("subscription_expired")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">{t("remaining_exam_attempts")}</label>
                <Input type="number" value={subForm.remainingExamAttempts} onChange={(e) => setSubForm({ ...subForm, remainingExamAttempts: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">{t("remaining_flashcard_attempts")}</label>
                <Input type="number" value={subForm.remainingFlashcardAttempts} onChange={(e) => setSubForm({ ...subForm, remainingFlashcardAttempts: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">{t("remaining_uses")}</label>
                <Input type="number" value={subForm.remainingUses} onChange={(e) => setSubForm({ ...subForm, remainingUses: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubDialogOpen(false)}>{c("cancel")}</Button>
            <Button onClick={saveSubscription} disabled={savingSub}>
              {savingSub && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {c("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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