"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
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
import { questionsApi, examsApi, uploadApi } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Check, Eye, BookOpen, Lightbulb, CheckCircle2, XCircle, ImageIcon, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

const EMPTY_OPTIONS = [
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
];

export default function AdminQuestionsPage() {
  const t = useTranslations("admin");
  const c = useTranslations("common");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewQuestion, setViewQuestion] = useState<any | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [form, setForm] = useState({
    text: "",
    explanation: "",
    reference: "",
    difficulty: "medium",
    specialtyId: "",
    examId: "",
    options: EMPTY_OPTIONS,
    images: [] as { url: string; section: string; caption?: string; sortOrder: number }[],
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      const { data } = await questionsApi.list();
      setQuestions(data);
    } catch {
      toast.error(t("load_failed_questions"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);
  useEffect(() => { examsApi.list().then(({ data }) => setExams(data)).catch(() => {}); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ text: "", explanation: "", reference: "", difficulty: "medium", specialtyId: "", examId: "", options: EMPTY_OPTIONS, images: [] });
    setDialogOpen(true);
  };

  // Fix: fetch full question with options before opening edit
  const openEdit = async (q: any) => {
    setLoadingEdit(true);
    try {
      const { data } = await questionsApi.get(q.id);
      setEditing(data);
      const opts = (data.options || []).map((o: any) => ({ text: o.text, isCorrect: o.isCorrect }));
      while (opts.length < 5) opts.push({ text: "", isCorrect: false });
      setForm({
        text: data.text || "",
        explanation: data.explanation || "",
        reference: data.reference || "",
        difficulty: data.difficulty || "medium",
        specialtyId: data.specialtyId || "",
        examId: data.examId || "",
        options: opts,
        images: (data.images || []).map((i: any) => ({ url: i.url, section: i.section || "title", caption: i.caption, sortOrder: i.sortOrder || 0 })),
      });
      setDialogOpen(true);
    } catch {
      toast.error(t("load_failed_question_details"));
    } finally {
      setLoadingEdit(false);
    }
  };

  const openView = async (q: any) => {
    setViewQuestion(null);
    setViewOpen(true);
    setViewLoading(true);
    try {
      const { data } = await questionsApi.get(q.id);
      setViewQuestion(data);
    } catch {
      toast.error(t("load_failed_question"));
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.text.trim()) return;
    setSaving(true);
    try {
      const opts = form.options.filter((o) => o.text.trim());
      const payload: any = {
        text: form.text,
        explanation: form.explanation,
        reference: form.reference,
        difficulty: form.difficulty,
        specialtyId: null,
        topicId: null,
        examId: !form.examId || form.examId === "__none__" || form.examId === "none" ? null : form.examId,
      };
      if (opts.length > 0) payload.options = opts;
      if (form.images.length > 0) payload.images = form.images;
      if (editing) {
        await questionsApi.update(editing.id, payload);
        toast.success(t("question_updated"));
      } else {
        await questionsApi.create(payload);
        toast.success(t("question_created"));
      }
      setDialogOpen(false);
      fetchQuestions();
    } catch {
      toast.error(t("question_save_failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await questionsApi.remove(deleteTarget.id);
      toast.success(t("question_deleted"));
      setDeleteTarget(null);
      fetchQuestions();
    } catch {
      toast.error(t("question_delete_failed"));
    }
  };

  const uploadImage = async (file: File, section: string) => {
    setUploadingImage(true);
    try {
      const key = `questions/${Date.now()}-${file.name}`;
      const { data } = await uploadApi.presignedUrl(key, file.type);
      const res = await fetch(data.url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!res.ok) throw new Error("Upload failed");
      const publicUrl = data.publicUrl || data.url;
      setForm((f) => ({ ...f, images: [...f.images, { url: publicUrl, section, sortOrder: f.images.length }] }));
    } catch {
      toast.error(t("upload_failed"));
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const setOption = (i: number, field: string, value: any) => {
    setForm((f) => {
      const opts = [...f.options];
      opts[i] = { ...opts[i], [field]: value };
      return { ...f, options: opts };
    });
  };

  const difficultyColor = (d: string) =>
    d === "easy" ? "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
    : d === "hard" ? "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800"
    : "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";

  const columns = [
    { key: "text", header: t("question_col"), sortable: true },
    {
      key: "difficulty",
      header: t("difficulty"),
      render: (row: any) => (
        <Badge variant="outline" className={cn("capitalize text-xs font-semibold", difficultyColor(row.difficulty))}>
          {row.difficulty}
        </Badge>
      ),
    },
    {
      key: "isActive",
      header: t("status"),
      render: (row: any) => (
        <Badge variant={row.isActive !== false ? "default" : "secondary"}>
          {row.isActive !== false ? c("active") : c("draft")}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row: any) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); openView(row); }}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); openEdit(row); }} disabled={loadingEdit}>
            {loadingEdit ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
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
            <h1 className="text-3xl font-bold tracking-tight">{t("question_mgmt_title")}</h1>
            <p className="text-muted-foreground">{t("question_mgmt_subtitle")}</p>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> {t("add_question")}</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <DataGrid data={questions} columns={columns} />
          </CardContent>
        </Card>
      </div>

      {/* ─── Edit / Create Dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader className="p-6 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {editing ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </div>
              <div className="text-left">
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {editing ? t("edit_question_details") : t("create_new_question")}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{t("configure_question")}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto pr-3 scrollbar-thin">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("question_text")}</label>
              <Textarea
                autoFocus
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                rows={3}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 min-h-[100px] resize-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.12)] shadow-none"
                placeholder={t("question_placeholder")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("explanation")}</label>
              <Textarea
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                rows={2}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 min-h-[80px] resize-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.12)] shadow-none"
                placeholder={t("explanation_placeholder")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("reference")}</label>
              <Input
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm outline-none"
                placeholder={t("reference_placeholder")}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("difficulty")}</label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-muted/40 rounded-xl border border-border/60 h-11 items-center">
                  {["easy", "medium", "hard"].map((diff) => {
                    const isActive = form.difficulty === diff;
                    return (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setForm({ ...form, difficulty: diff })}
                        className={cn(
                          "py-1.5 px-2 text-xs font-semibold rounded-lg capitalize transition-all duration-200 cursor-pointer text-center select-none",
                          isActive
                            ? diff === "easy"
                              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                              : diff === "medium"
                              ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                              : "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        )}
                      >
                        {diff}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("exam")}</label>
                <Select value={form.examId || "__none__"} onValueChange={(v) => setForm({ ...form, examId: v })}>
                  <SelectTrigger className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 rounded-xl h-11 px-4 transition-all duration-300 focus:border-primary/50 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.12)]">
                    <SelectValue placeholder={t("none")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="__none__">{t("none")}</SelectItem>
                    {exams.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name?.en || e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("images")}</label>
              <div className="flex gap-2 flex-wrap">
                {(["title", "explanation", "reference"] as const).map((section) => (
                  <label key={section} className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border border-border/80 cursor-pointer hover:bg-muted/30 transition-colors text-sm",
                    uploadingImage && "pointer-events-none opacity-60"
                  )}>
                    <Upload className="h-4 w-4" />
                    <span className="capitalize">{section}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file, section);
                        e.target.value = "";
                      }}
                    />
                  </label>
                ))}
              </div>
              {form.images.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img.url} alt="" className="w-24 h-24 rounded-lg border object-cover" />
                      <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded capitalize">{img.section}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {uploadingImage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> {t("uploading")}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 block">
                {t("options")} <span className="text-muted-foreground/50 lowercase font-medium">({t("select_correct")})</span>
              </label>
              <div className="space-y-3">
                {form.options.map((opt, i) => {
                  const isCorrect = opt.isCorrect;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "group flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-300",
                        isCorrect
                          ? "border-emerald-500/35 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.01] shadow-[0_4px_16px_rgba(16,185,129,0.04)]"
                          : "border-border/80 bg-card hover:bg-muted/10 hover:border-border"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const opts = form.options.map((o, j) => ({ ...o, isCorrect: j === i }));
                          setForm({ ...form, options: opts });
                        }}
                        className={cn(
                          "flex items-center justify-center w-6 h-6 rounded-full border cursor-pointer transition-all duration-300 shrink-0",
                          isCorrect
                            ? "border-emerald-500 bg-emerald-500 text-white scale-105 shadow-md shadow-emerald-500/20"
                            : "border-muted-foreground/30 bg-transparent group-hover:border-primary/50"
                        )}
                      >
                        {isCorrect ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-transparent" />
                        )}
                      </button>
                      <Input
                        value={opt.text}
                        onChange={(e) => setOption(i, "text", e.target.value)}
                        placeholder={`${t("option")} ${i + 1}`}
                        className={cn(
                          "flex-1 bg-muted/10 hover:bg-muted/20 border border-border/60 focus:border-primary/50 transition-all duration-300 rounded-lg px-4 h-10 text-sm outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.10)] shadow-none",
                          isCorrect && "bg-background focus:border-emerald-500/60 focus:shadow-[0_0_0_3px_rgb(16_185_129_/_0.12)] border-emerald-500/20"
                        )}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, options: [...form.options, { text: "", isCorrect: false }] })}>
                  + {t("add_option")}
                </Button>
                {form.options.length > 2 && (
                  <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setForm({ ...form, options: form.options.slice(0, -1) })}>
                    {t("remove_last")}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-muted/20 border-t border-border/60 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl border border-border/80 hover:bg-muted/50 h-11 px-6 transition-all duration-200">{c("cancel")}</Button>
            <Button onClick={handleSave} disabled={saving || !form.text.trim()} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 h-11 px-6 transition-all duration-300">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? c("save") : c("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── View Dialog ─── */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-xl font-bold tracking-tight">{t("question_details")}</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{t("readonly_view")}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin space-y-6">
            {viewLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              </div>
            ) : viewQuestion ? (
              <>
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={cn("capitalize text-xs font-semibold", difficultyColor(viewQuestion.difficulty))}>
                    {viewQuestion.difficulty}
                  </Badge>
                  <Badge variant={viewQuestion.isActive !== false ? "default" : "secondary"} className="text-xs">
                    {viewQuestion.isActive !== false ? c("active") : c("draft")}
                  </Badge>
                </div>

                {/* Question text */}
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{t("question_label")}</p>
                  <div className="rounded-xl border border-border/80 bg-muted/20 px-4 py-4 text-sm leading-relaxed">
                    {viewQuestion.text}
                  </div>
                </div>

                {/* Options */}
                {viewQuestion.options?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{t("answer_options")}</p>
                    <div className="space-y-2.5">
                      {viewQuestion.options.map((opt: any, i: number) => (
                        <div
                          key={opt.id || i}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all",
                            opt.isCorrect
                              ? "border-emerald-500/40 bg-emerald-500/[0.05] dark:bg-emerald-500/[0.08]"
                              : "border-border/60 bg-card"
                          )}
                        >
                          <div className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                            opt.isCorrect
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-muted-foreground/30 text-muted-foreground"
                          )}>
                            {opt.isCorrect ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : String.fromCharCode(65 + i)}
                          </div>
                          <span className={cn("flex-1", opt.isCorrect && "font-medium text-emerald-700 dark:text-emerald-400")}>
                            {opt.text}
                          </span>
                          {opt.isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {viewQuestion.explanation && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{t("explanation")}</p>
                    <div className="flex gap-3 rounded-xl border border-amber-200/60 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-800/40 px-4 py-4">
                      <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm leading-relaxed text-foreground/80">{viewQuestion.explanation}</p>
                    </div>
                  </div>
                )}

                {/* Reference */}
                {viewQuestion.reference && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{t("reference")}</p>
                    <div className="rounded-xl border border-blue-200/60 bg-blue-50/60 dark:bg-blue-950/20 dark:border-blue-800/40 px-4 py-3 text-sm leading-relaxed text-foreground/80">
                      {viewQuestion.reference}
                    </div>
                  </div>
                )}

                {/* Images */}
                {viewQuestion.images && viewQuestion.images.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{t("images")}</p>
                    {["title", "explanation", "reference"].filter(s => viewQuestion.images.some((i: any) => i.section === s)).map(section => (
                      <div key={section} className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground capitalize">{section} {t("images")}</p>
                        <div className="flex flex-wrap gap-3">
                          {viewQuestion.images.filter((i: any) => i.section === section).map((img: any) => (
                            <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer">
                              <img src={img.url} alt={img.caption || ""} className="rounded-lg border max-w-[200px] max-h-[200px] object-contain" />
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </div>

          <div className="p-6 bg-muted/20 border-t border-border/60 flex justify-between items-center gap-3">
            <Button
              variant="outline"
              className="rounded-xl border border-border/80 hover:bg-muted/50 h-10 px-5"
              onClick={() => {
                setViewOpen(false);
                if (viewQuestion) openEdit(viewQuestion);
              }}
            >
              <Pencil className="h-3.5 w-3.5 mr-2" /> {t("edit_question")}
            </Button>
            <Button variant="outline" onClick={() => setViewOpen(false)} className="rounded-xl h-10 px-5">
              {c("close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("delete_question_title")}
        description={t("delete_question_confirm")}
        confirmLabel={c("delete")}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </PageTransition>
  );
}