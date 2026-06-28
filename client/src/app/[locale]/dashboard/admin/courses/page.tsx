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
import { coursesApi } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

export default function AdminCoursesPage() {
  const t = useTranslations("admin");
  const c = useTranslations("common");
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", shortDescription: "",
    introduction: "", objectives: "", targetAudience: "", prerequisites: "", whatYouWillLearn: "",
    preExamInstructions: "", postExamInstructions: "", certificateInstructions: "",
    price: "0", durationDays: 30, hasCertificate: true, coverImage: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      const { data } = await coursesApi.list(true);
      setCourses(data);
    } catch {
      toast.error(t("load_failed_courses"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", shortDescription: "", introduction: "", objectives: "", targetAudience: "", prerequisites: "", whatYouWillLearn: "", preExamInstructions: "", postExamInstructions: "", certificateInstructions: "", price: "0", durationDays: 30, hasCertificate: true, coverImage: "" });
    setDialogOpen(true);
  };

  const openEdit = (course: any) => {
    setEditing(course);
    setForm({
      title: course.title?.en || "",
      description: course.description?.en || "",
      shortDescription: course.shortDescription?.en || "",
      introduction: course.introduction?.en || "",
      objectives: course.objectives?.en || "",
      targetAudience: course.targetAudience?.en || "",
      prerequisites: course.prerequisites?.en || "",
      whatYouWillLearn: course.whatYouWillLearn?.en || "",
      preExamInstructions: course.preExamInstructions?.en || "",
      postExamInstructions: course.postExamInstructions?.en || "",
      certificateInstructions: course.certificateInstructions?.en || "",
      price: course.price || "0",
      durationDays: course.durationDays || 30,
      hasCertificate: course.hasCertificate ?? true,
      coverImage: course.coverImage || "",
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
        introduction: form.introduction ? { en: form.introduction } : null,
        objectives: form.objectives ? { en: form.objectives } : null,
        targetAudience: form.targetAudience ? { en: form.targetAudience } : null,
        prerequisites: form.prerequisites ? { en: form.prerequisites } : null,
        whatYouWillLearn: form.whatYouWillLearn ? { en: form.whatYouWillLearn } : null,
        preExamInstructions: form.preExamInstructions ? { en: form.preExamInstructions } : null,
        postExamInstructions: form.postExamInstructions ? { en: form.postExamInstructions } : null,
        certificateInstructions: form.certificateInstructions ? { en: form.certificateInstructions } : null,
        price: form.price,
        durationDays: form.durationDays,
        hasCertificate: form.hasCertificate,
        coverImage: form.coverImage || null,
      };
      if (editing) {
        await coursesApi.update(editing.id, payload);
        toast.success(t("course_updated"));
      } else {
        payload.slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        await coursesApi.create(payload);
        toast.success(t("course_created"));
      }
      setDialogOpen(false);
      fetchCourses();
    } catch {
      toast.error(t("course_save_failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await coursesApi.remove(deleteTarget.id);
      toast.success(t("course_deleted"));
      setDeleteTarget(null);
      fetchCourses();
    } catch {
      toast.error(t("course_delete_failed"));
    }
  };

  const columns = [
    { key: "title", header: t("title_col"), sortable: true, render: (row: any) => row.title?.en || row.title },
    { key: "durationDays", header: t("lessons_col"), render: (row: any) => `${row.durationDays}d` },
    { key: "price", header: t("price"), render: (row: any) => `$${row.price}` },
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
                  {editing ? t("edit_course_details") : t("create_new_course")}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{t("configure_course")}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto pr-3 scrollbar-thin">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("title_english")}</label>
              <Input
                autoFocus
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 outline-none"
                placeholder={t("course_title_placeholder")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("description")}</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 min-h-[100px] resize-none outline-none"
                placeholder={t("course_description_placeholder")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("short_description")}</label>
              <Input
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 outline-none"
                placeholder={t("short_description_placeholder")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("cover_image")}</label>
              <Input
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 outline-none"
                placeholder={t("cover_image_placeholder")}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
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
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("duration_days")}</label>
                <Input
                  type="number"
                  value={form.durationDays}
                  onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
                  className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/60">
              <input
                type="checkbox"
                checked={form.hasCertificate}
                onChange={(e) => setForm({ ...form, hasCertificate: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <div>
                <label className="text-sm font-medium">{t("has_certificate")}</label>
                <p className="text-xs text-muted-foreground">{t("has_certificate_desc")}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/60 text-sm font-medium"
            >
              {t("course_details")}
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showAdvanced && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("introduction")}</label>
                  <Textarea
                    value={form.introduction}
                    onChange={(e) => setForm({ ...form, introduction: e.target.value })}
                    rows={3}
                    className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 min-h-[80px] resize-none outline-none"
                    placeholder={t("introduction_placeholder")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("objectives")}</label>
                  <Textarea
                    value={form.objectives}
                    onChange={(e) => setForm({ ...form, objectives: e.target.value })}
                    rows={3}
                    className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 min-h-[80px] resize-none outline-none"
                    placeholder={t("objectives_placeholder")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("target_audience")}</label>
                  <Textarea
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                    rows={2}
                    className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 min-h-[60px] resize-none outline-none"
                    placeholder={t("target_audience_placeholder")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("prerequisites")}</label>
                  <Textarea
                    value={form.prerequisites}
                    onChange={(e) => setForm({ ...form, prerequisites: e.target.value })}
                    rows={2}
                    className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 min-h-[60px] resize-none outline-none"
                    placeholder={t("prerequisites_placeholder")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("what_you_will_learn")}</label>
                  <Textarea
                    value={form.whatYouWillLearn}
                    onChange={(e) => setForm({ ...form, whatYouWillLearn: e.target.value })}
                    rows={3}
                    className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 min-h-[80px] resize-none outline-none"
                    placeholder={t("what_you_will_learn_placeholder")}
                  />
                </div>

                <div className="border-t border-border/60 my-2" />

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("pre_exam_instructions")}</label>
                  <Textarea
                    value={form.preExamInstructions}
                    onChange={(e) => setForm({ ...form, preExamInstructions: e.target.value })}
                    rows={3}
                    className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 min-h-[80px] resize-none outline-none"
                    placeholder={t("pre_exam_instructions_placeholder")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("post_exam_instructions")}</label>
                  <Textarea
                    value={form.postExamInstructions}
                    onChange={(e) => setForm({ ...form, postExamInstructions: e.target.value })}
                    rows={3}
                    className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 min-h-[80px] resize-none outline-none"
                    placeholder={t("post_exam_instructions_placeholder")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("certificate_instructions")}</label>
                  <Textarea
                    value={form.certificateInstructions}
                    onChange={(e) => setForm({ ...form, certificateInstructions: e.target.value })}
                    rows={3}
                    className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 min-h-[80px] resize-none outline-none"
                    placeholder={t("certificate_instructions_placeholder")}
                  />
                </div>
              </>
            )}
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
        title={t("delete_course_title")}
        description={t("delete_course_confirm")}
        confirmLabel={c("delete")}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </PageTransition>
  );
}