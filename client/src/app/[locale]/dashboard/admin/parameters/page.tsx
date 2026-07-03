"use client";

import { DataGrid } from "@/components/admin/data-grid";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { parametersApi } from "@/lib/api";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminParametersPage() {
  const t = useTranslations("admin");
  const c = useTranslations("common");
  const [params, setParams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [form, setForm] = useState({ key: "", value: "", description: "" });

  const fetchParams = useCallback(async () => {
    try {
      const { data } = await parametersApi.list();
      setParams(Array.isArray(data) ? data : []);
    } catch {
      toast.error(t("load_failed_params"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchParams(); }, [fetchParams]);

  const openCreate = () => {
    setEditing(null);
    setForm({ key: "", value: "", description: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    const raw = typeof p.value === "object" ? JSON.stringify(p.value, null, 2) : String(p.value || "");
    setForm({ key: p.key, value: raw, description: p.description || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.key.trim()) { toast.error(t("key_required")); return; }
    if (!form.value.trim()) { toast.error(t("value_required")); return; }
    setSaving(true);
    try {
      let parsedValue: any = form.value;
      try { parsedValue = JSON.parse(form.value); } catch { parsedValue = form.value; }
      const payload = { key: form.key, value: parsedValue, description: form.description };
      if (editing) {
        await parametersApi.update(editing.key, { value: parsedValue, description: form.description });
        toast.success(t("param_updated"));
      } else {
        await parametersApi.create(payload);
        toast.success(t("param_created"));
      }
      setDialogOpen(false);
      fetchParams();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("param_save_failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await parametersApi.remove(deleteTarget.key);
      toast.success(t("param_deleted"));
      setDeleteTarget(null);
      fetchParams();
    } catch {
      toast.error(t("param_delete_failed"));
    }
  };

  const columns = [
    { key: "key", header: t("key_col"), sortable: true },
    {
      key: "value",
      header: t("value_col"),
      render: (row: any) => {
        const v = typeof row.value === "object" ? JSON.stringify(row.value) : String(row.value || "");
        return <span className="text-sm text-muted-foreground truncate max-w-[300px] block">{v}</span>;
      },
    },
    { key: "description", header: t("description_col"), render: (row: any) => row.description || "—" },
    {
      key: "updatedAt",
      header: t("updated_col"),
      render: (row: any) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "—",
    },
    {
      key: "actions",
      header: t("actions"),
      render: (row: any) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(row)}><Pencil className="h-3 w-3" /></Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(row)}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("parameters_title")}</h1>
            <p className="text-muted-foreground">{t("parameters_subtitle")}</p>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> {t("add_parameter")}</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <DataGrid data={params} columns={columns} />
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader className="p-6 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {editing ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </div>
              <div className="text-left">
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {editing ? t("edit_parameter") : t("add_parameter")}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{t("configure_parameter")}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto pr-3 scrollbar-thin">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("key_col")}</label>
              <Input
                autoFocus
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                disabled={!!editing}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm outline-none"
                placeholder={t("key_placeholder")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                {t("value_col")} <span className="font-normal lowercase">{t("value_hint")}</span>
              </label>
              <Textarea
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                rows={6}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm outline-none min-h-[120px]"
                placeholder={t("value_placeholder")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("description")}</label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm outline-none"
                placeholder={t("brief_description")}
              />
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 border-t border-border/60 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl px-6 h-10 text-sm font-medium">{c("cancel")}</Button>
            <Button onClick={handleSave} disabled={saving || !form.key.trim() || !form.value.trim()} className="rounded-xl px-6 h-10 text-sm font-medium shadow-md">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? c("save") : c("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("delete_param_title")}
        description={t("delete_param_confirm")}
        confirmLabel={c("delete")}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </PageTransition>
  );
}