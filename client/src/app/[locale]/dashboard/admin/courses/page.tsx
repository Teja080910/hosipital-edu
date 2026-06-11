"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { coursesApi } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, BookOpen } from "lucide-react";

export default function AdminCoursesPage() {
  const t = useTranslations("admin");
  const c = useTranslations("common");
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", shortDescription: "", price: "0", durationDays: 30 });
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const { data } = await coursesApi.list(true);
      setCourses(data);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", shortDescription: "", price: "0", durationDays: 30 });
    setDialogOpen(true);
  };

  const openEdit = (course: any) => {
    setEditing(course);
    setForm({
      title: course.title?.en || "",
      description: course.description?.en || "",
      shortDescription: course.shortDescription?.en || "",
      price: course.price || "0",
      durationDays: course.durationDays || 30,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: { en: form.title },
        description: { en: form.description },
        shortDescription: { en: form.shortDescription },
        price: form.price,
        durationDays: form.durationDays,
      };
      if (editing) {
        await coursesApi.update(editing.id, payload);
        toast.success("Course updated");
      } else {
        payload.slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        await coursesApi.create(payload);
        toast.success("Course created");
      }
      setDialogOpen(false);
      fetchCourses();
    } catch {
      toast.error("Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await coursesApi.remove(deleteTarget.id);
      toast.success("Course deleted");
      setDeleteTarget(null);
      fetchCourses();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const columns = [
    { key: "title", header: t("title_col"), sortable: true, render: (row: any) => row.title?.en || row.title },
    { key: "durationDays", header: t("lessons_col"), render: (row: any) => `${row.durationDays}d` },
    { key: "price", header: "Price", render: (row: any) => `$${row.price}` },
    { key: "isActive", header: t("status"), render: (row: any) => <Badge variant={row.isActive ? "default" : "secondary"}>{row.isActive ? c("active") : c("draft")}</Badge> },
    {
      key: "actions",
      header: "",
      render: (row: any) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/admin/courses/${row.id}/content`)}><BookOpen className="h-3 w-3" /></Button>
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
            <h1 className="text-3xl font-bold tracking-tight">{t("course_mgmt_title")}</h1>
            <p className="text-muted-foreground">{t("course_mgmt_subtitle")}</p>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> {t("add_course")}</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <DataGrid data={courses} columns={columns} />
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
                  {editing ? "Edit Course Details" : "Create New Course"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Fill in the fields to configure the course</p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto pr-3 scrollbar-thin">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Title (English)</label>
              <Input
                autoFocus
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.12)] shadow-none"
                placeholder="Enter course title..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 min-h-[100px] resize-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.12)] shadow-none"
                placeholder="Enter course description..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Short Description</label>
              <Input
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.12)] shadow-none"
                placeholder="Brief summary..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Price ($)</label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.12)] shadow-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Duration (days)</label>
                <Input
                  type="number"
                  value={form.durationDays}
                  onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
                  className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.12)] shadow-none"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 border-t border-border/60 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl px-6 h-10 text-sm font-medium">{c("cancel")}</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim()} className="rounded-xl px-6 h-10 text-sm font-medium shadow-md">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? c("save") : c("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Course"
        description="Are you sure you want to delete this course? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </PageTransition>
  );
}