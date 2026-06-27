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
import { flashcardsApi, examsApi } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Copy, Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminFlashcardsPage() {
  const t = useTranslations("admin");
  const c = useTranslations("common");
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [form, setForm] = useState({
    front: "",
    back: "",
    reference: "",
    examId: "",
    examIds: [] as string[],
    specialtyId: "",
    topicId: "",
    quantity: 1,
  });

  useEffect(() => {
    examsApi.list().then(({ data }) => setExams(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.examIds.length === 0) {
      setSpecialties([]);
      setTopics([]);
      return;
    }
    Promise.all(
      form.examIds.map((examId) =>
        examsApi.get(examId).then(({ data }) => data.specialties || []).catch(() => [])
      )
    ).then((results) => {
      const merged = results.flat().filter(
        (s: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === s.id) === i
      );
      setSpecialties(merged);
      setTopics([]);
    });
  }, [form.examIds]);

  useEffect(() => {
    if (form.specialtyId) {
      const spec = specialties.find((s: any) => s.id === form.specialtyId);
      setTopics(spec?.topics || []);
    } else {
      setTopics([]);
    }
  }, [form.specialtyId, specialties]);

  const fetchFlashcards = useCallback(async () => {
    try {
      const { data } = await flashcardsApi.list({ limit: "1000" });
      setFlashcards(Array.isArray(data) ? data : data?.data || []);
    } catch {
      toast.error("Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFlashcards(); }, [fetchFlashcards]);

  const openCreate = () => {
    setEditing(null);
    setForm({ front: "", back: "", reference: "", examId: "", examIds: [], specialtyId: "", topicId: "", quantity: 1 });
    setDialogOpen(true);
  };

  const openEdit = (f: any) => {
    setEditing(f);
    setForm({
      front: f.front || "",
      back: f.back || "",
      reference: f.reference || "",
      examId: f.examId || "",
      examIds: f.examIds || [],
      specialtyId: f.specialtyId || "",
      topicId: f.topicId || "",
      quantity: 1,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.front.trim() || !form.back.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await flashcardsApi.update(editing.id, {
          front: form.front,
          back: form.back,
          reference: form.reference,
          examIds: form.examIds,
          specialtyId: form.specialtyId || null,
          topicId: form.topicId || null,
        });
        toast.success("Flashcard updated");
      } else {
        const qty = Math.max(1, form.quantity);
        const promises = Array.from({ length: qty }, () =>
          flashcardsApi.create({
            front: form.front,
            back: form.back,
            reference: form.reference,
            examIds: form.examIds,
            specialtyId: form.specialtyId || null,
            topicId: form.topicId || null,
          })
        );
        await Promise.all(promises);
        toast.success(`${qty} flashcard(s) created`);
      }
      setDialogOpen(false);
      fetchFlashcards();
    } catch {
      toast.error(editing ? "Failed to update flashcard" : "Failed to create flashcard(s)");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await flashcardsApi.remove(deleteTarget.id);
      toast.success("Flashcard deleted");
      setDeleteTarget(null);
      fetchFlashcards();
    } catch {
      toast.error("Failed to delete flashcard");
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    try {
      const lines = importText.trim().split("\n").filter(Boolean);
      const cards = lines.map((line) => {
        const parts = line.split("\t");
        if (parts.length < 2) {
          const m = line.match(/^(.+?)[\t,;]+(.+)$/);
          return m ? { front: m[1].trim(), back: m[2].trim() } : null;
        }
        return { front: parts[0].trim(), back: parts[1].trim() };
      }).filter(Boolean);

      if (cards.length === 0) {
        toast.error("No valid flashcards found. Use tab or comma-separated format: front\tback");
        setImporting(false);
        return;
      }

      const promises = cards.map((c: any) =>
        flashcardsApi.create({
          front: c.front,
          back: c.back,
          reference: "",
          examId: null,
          specialtyId: null,
          topicId: null,
        })
      );
      await Promise.all(promises);
      toast.success(`${cards.length} flashcard(s) imported`);
      setImportOpen(false);
      setImportText("");
      fetchFlashcards();
    } catch {
      toast.error("Failed to import flashcards");
    } finally {
      setImporting(false);
    }
  };

  const columns = [
    { key: "front", header: "Front", sortable: true, render: (row: any) => <span className="line-clamp-2 max-w-[250px]">{row.front}</span> },
    { key: "back", header: "Back", render: (row: any) => <span className="line-clamp-2 max-w-[250px]">{row.back}</span> },
    {
      key: "specialty",
      header: "Specialty",
      render: (row: any) => <span className="text-sm text-muted-foreground">{row.specialty?.en || row.specialty || "—"}</span>,
    },
    {
      key: "topic",
      header: "Topic",
      render: (row: any) => <span className="text-sm text-muted-foreground">{row.topic?.en || row.topic || "—"}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (row: any) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); openEdit(row); }}>
            <Pencil className="h-3.5 w-3.5" />
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
            <h1 className="text-3xl font-bold tracking-tight">Flashcard Management</h1>
            <p className="text-muted-foreground">Create and manage flashcards</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}><Upload className="h-4 w-4 mr-2" /> Import</Button>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Create Flashcard</Button>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <DataGrid data={flashcards} columns={columns} />
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
                  {editing ? "Edit Flashcard" : "Create Flashcard"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{editing ? "Update flashcard details" : "Fill in the fields to create one or more flashcards"}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto pr-3 scrollbar-thin">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Front</label>
              <Textarea
                autoFocus
                value={form.front}
                onChange={(e) => setForm({ ...form, front: e.target.value })}
                rows={3}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 min-h-[80px] resize-none outline-none"
                placeholder="Enter the front text (question)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Back</label>
              <Textarea
                value={form.back}
                onChange={(e) => setForm({ ...form, back: e.target.value })}
                rows={3}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 min-h-[80px] resize-none outline-none"
                placeholder="Enter the back text (answer)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Reference</label>
              <Input
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm outline-none"
                placeholder="Optional reference or source"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Exams</label>
                <div className="flex flex-wrap gap-2 p-2 bg-muted/20 rounded-xl border border-border/80 min-h-[44px]">
                  {form.examIds.length === 0 && (
                    <span className="text-sm text-muted-foreground/50 px-2 py-1">None</span>
                  )}
                  {form.examIds.map((eId) => {
                    const exam = exams.find((e: any) => e.id === eId);
                    return (
                      <span key={eId} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                        {exam?.name?.en || exam?.name || eId}
                        <button type="button" onClick={() => setForm({ ...form, examIds: form.examIds.filter((id) => id !== eId), specialtyId: "", topicId: "" })} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {exams.filter((e: any) => !form.examIds.includes(e.id)).map((e: any) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setForm({ ...form, examIds: [...form.examIds, e.id] })}
                      className="px-2.5 py-1 rounded-lg border border-border/60 text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                    >
                      + {e.name?.en || e.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Specialty</label>
                <Select value={form.specialtyId || "__none__"} onValueChange={(v) => setForm({ ...form, specialtyId: v === "__none__" ? "" : v, topicId: "" })}>
                  <SelectTrigger className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 rounded-xl h-11 px-4">
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="__none__">None</SelectItem>
                    {specialties.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name?.en || s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {topics.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Topic</label>
                <Select value={form.topicId || "__none__"} onValueChange={(v) => setForm({ ...form, topicId: v === "__none__" ? "" : v })}>
                  <SelectTrigger className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 rounded-xl h-11 px-4">
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="__none__">None</SelectItem>
                    {topics.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name?.en || t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!editing && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Quantity</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    className="flex-1 accent-primary"
                  />
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={form.quantity || ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      if (v === "") { setForm({ ...form, quantity: 0 }); return; }
                      setForm({ ...form, quantity: Math.min(Number(v), 50) });
                    }}
                    onBlur={() => { if (form.quantity < 1 || isNaN(form.quantity)) setForm({ ...form, quantity: 1 }); }}
                    className="w-20 text-center"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span className="font-medium text-sm">{form.quantity} flashcard{form.quantity !== 1 ? "s" : ""}</span>
                  <span>50</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 pt-4 border-t border-border/60 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl px-6 h-10 text-sm font-medium">{c("cancel")}</Button>
            <Button onClick={handleSave} disabled={saving || !form.front.trim() || !form.back.trim()} className="rounded-xl px-6 h-10 text-sm font-medium shadow-md">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? c("save") : `Create ${form.quantity > 1 ? `${form.quantity} ` : ""}Flashcard${form.quantity !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Flashcard"
        description="Are you sure you want to delete this flashcard?"
        confirmLabel={c("delete")}
        variant="destructive"
        onConfirm={handleDelete}
      />

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-xl font-bold tracking-tight">Import Flashcards</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Paste tab or comma-separated data (front, back) — one per line</p>
              </div>
            </div>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={10}
              className="w-full bg-muted/20 border border-border/80 rounded-xl px-4 py-3 text-sm font-mono"
              placeholder={`front\tback\nExample question\tExample answer`}
            />
            <p className="text-xs text-muted-foreground">
              Format: one flashcard per line, front and back separated by tab or comma
            </p>
          </div>
          <DialogFooter className="p-6 pt-4 border-t border-border/60 flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setImportOpen(false); setImportText(""); }} className="rounded-xl px-6 h-10 text-sm font-medium">{c("cancel")}</Button>
            <Button onClick={handleImport} disabled={importing || !importText.trim()} className="rounded-xl px-6 h-10 text-sm font-medium shadow-md">
              {importing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
