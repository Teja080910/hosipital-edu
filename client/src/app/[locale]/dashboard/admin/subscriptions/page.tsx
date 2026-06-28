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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageTransition } from "@/components/page-transition";
import { DataGrid } from "@/components/admin/data-grid";
import { subscriptionsApi, examsApi, coursesApi } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

export default function AdminSubscriptionsPage() {
  const t = useTranslations("admin");
  const c = useTranslations("common");
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "0",
    interval: "monthly",
    currency: "USD",
    isVisible: true,
    examId: "",
    isCourseOnly: false,
    maxDays: 0,
    courseId: "",
  });

  useEffect(() => {
    examsApi.list().then(({ data }) => setExams(Array.isArray(data) ? data : [])).catch(() => {});
    coursesApi.list().then(({ data }) => setCourses(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const { data } = await subscriptionsApi.plans();
      setPlans(data);
    } catch {
      toast.error(t("load_failed_plans"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", price: "0", interval: "monthly", currency: "USD", isVisible: true, examId: "", isCourseOnly: false, maxDays: 0, courseId: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name?.en || p.name || "",
      description: p.description?.en || p.description || "",
      price: p.price || "0",
      interval: p.interval || "monthly",
      currency: p.currency || "USD",
      isVisible: p.isVisible ?? true,
      examId: p.examId || "",
      isCourseOnly: p.isCourseOnly ?? false,
      maxDays: p.maxDays || 0,
      courseId: p.courseId || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: { en: form.name },
        description: { en: form.description },
        price: form.price,
        interval: form.interval,
        currency: form.currency,
        isVisible: form.isVisible,
        examId: form.examId || null,
        isCourseOnly: form.isCourseOnly,
        maxDays: form.maxDays || null,
        courseId: form.courseId || null,
      };
      if (editing) {
        await subscriptionsApi.updatePlan(editing.id, payload);
        toast.success(t("plan_updated"));
      } else {
        await subscriptionsApi.createPlan(payload);
        toast.success(t("plan_created"));
      }
      setDialogOpen(false);
      fetchPlans();
    } catch {
      toast.error(t("plan_save_failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await subscriptionsApi.removePlan(deleteTarget.id);
      toast.success(t("plan_deleted"));
      setDeleteTarget(null);
      fetchPlans();
    } catch {
      toast.error(t("plan_delete_failed"));
    }
  };

  const columns = [
    { key: "name", header: t("title_col"), sortable: true, render: (row: any) => row.name?.en || row.name },
    { key: "price", header: t("price"), render: (row: any) => `$${row.price}` },
    { key: "interval", header: t("plan"), render: (row: any) => <Badge variant="outline" className="capitalize">{row.interval}</Badge> },
    { key: "exam", header: t("exam"), render: (row: any) => {
      const exam = exams.find((e: any) => e.id === row.examId);
      return exam ? (exam.name?.en || exam.slug) : <span className="text-muted-foreground italic">Any</span>;
    }},
    { key: "isVisible", header: t("status"), render: (row: any) => <Badge variant={row.isVisible ? "default" : "secondary"}>{row.isVisible ? c("active") : c("draft")}</Badge> },
    {
      key: "actions",
      header: "",
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
            <h1 className="text-3xl font-bold tracking-tight">{t("subscription_mgmt_title")}</h1>
            <p className="text-muted-foreground">{t("subscription_mgmt_subtitle")}</p>
          </div>
          <Button variant="outline" onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> {t("add_plan")}</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <DataGrid data={plans} columns={columns} />
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
                  {editing ? t("edit_plan") : t("add_plan")}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{t("configure_plan")}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto pr-3 scrollbar-thin">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("name_english")}</label>
              <Input
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm outline-none"
                placeholder={t("plan_name_placeholder")}
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

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("price")}</label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("interval")}</label>
                <Select value={form.interval} onValueChange={(v) => setForm({ ...form, interval: v })}>
                  <SelectTrigger className="bg-muted/20 border-border/80 rounded-xl h-11 px-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">{t("monthly")}</SelectItem>
                    <SelectItem value="quarterly">{t("quarterly")}</SelectItem>
                    <SelectItem value="annual">{t("annual")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("currency")}</label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger className="bg-muted/20 border-border/80 rounded-xl h-11 px-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="MXN">MXN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("exam")}</label>
              <Select value={form.examId || "all"} onValueChange={(v) => setForm({ ...form, examId: v === "all" ? "" : v })}>
                <SelectTrigger className="bg-muted/20 border-border/80 rounded-xl h-11 px-4">
                  <SelectValue placeholder={t("select_exam_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all_exams")}</SelectItem>
                  {exams.map((exam: any) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name?.en || exam.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/60">
              <input
                type="checkbox"
                checked={form.isVisible}
                onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <div>
                <label className="text-sm font-medium">{t("visible_label")}</label>
                <p className="text-xs text-muted-foreground">{t("visible_desc")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/60">
              <input
                type="checkbox"
                checked={form.isCourseOnly}
                onChange={(e) => setForm({ ...form, isCourseOnly: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <div>
                <label className="text-sm font-medium">{t("is_course_only")}</label>
                <p className="text-xs text-muted-foreground">{t("is_course_only_desc")}</p>
              </div>
            </div>

            {form.isCourseOnly && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("course")}</label>
                <Select value={form.courseId || "__none__"} onValueChange={(v) => setForm({ ...form, courseId: v === "__none__" ? "" : v })}>
                  <SelectTrigger className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 rounded-xl h-11 px-4 transition-all duration-300 focus:border-primary/50 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.12)]">
                    <SelectValue placeholder={t("select_course_placeholder")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="__none__">{t("none")}</SelectItem>
                    {courses.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title?.en || c.title || c.slug}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("max_days")}</label>
              <Input
                type="number"
                value={form.maxDays}
                onChange={(e) => setForm({ ...form, maxDays: Number(e.target.value) })}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm outline-none"
              />
              <p className="text-xs text-muted-foreground">{t("max_days_desc")}</p>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 border-t border-border/60 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl px-6 h-10 text-sm font-medium">{c("cancel")}</Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="rounded-xl px-6 h-10 text-sm font-medium shadow-md">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? c("save") : c("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("delete_plan_title")}
        description={t("delete_plan_confirm")}
        confirmLabel={c("delete")}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </PageTransition>
  );
}