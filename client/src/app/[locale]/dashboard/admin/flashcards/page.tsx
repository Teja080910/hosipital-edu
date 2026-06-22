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
import { Plus, Pencil, Trash2, Loader2, Copy } from "lucide-react";
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
  const [form, setForm] = useState({
    front: "",
    back: "",
    reference: "",
    examId: "",
    specialtyId: "",
    topicId: "",
    quantity: 1,
  });

  useEffect(() => {
    examsApi.list().then(({ data }) => setExams(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.examId) {
      examsApi.get(form.examId).then(({ data }) => {
        setSpecialties(data.specialties || []);
        setTopics([]);
      }).catch(() => setSpecialties([]));
    } else {
      setSpecialties([]);
      setTopics([]);
    }
  }, [form.examId]);

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
      setFlashcards(Array.isArray(data) ? data : data?.items || []);
    } catch {
      toast.error("Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFlashcards(); }, [fetchFlashcards]);

  const openCreate = () => {
    setEditing(null);
    setForm({ front: "", back: "", reference: "", examId: "", specialtyId: "", topicId: "", quantity: 1 });
    setDialogOpen(true);
  };

  const openEdit = (f: any) => {
    setEditing(f);
    setForm({
      front: f.front || "",
      back: f.back || "",
      reference: f.reference || "",
      examId: f.examId || "",
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
          examId: form.examId || null,
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
            examId: form.examId || null,
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

  const columns = [
    { key: "front", header: "Front", sortable: true, render: (row: any) => <span className="line-clamp-2 max-w-[250px]">{row.front}</span> },
    { key: "back", header: "Back", render: (row: any) => <span className="line-clamp-2 max-w-[250px]">{row.back}</span> },
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
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Create Flashcard</Button>
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
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Exam</label>
                <Select value={form.examId || "__none__"} onValueChange={(v) => setForm({ ...form, examId: v === "__none__" ? "" : v, specialtyId: "", topicId: "" })}>
                  <SelectTrigger className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 rounded-xl h-11 px-4">
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="__none__">None</SelectItem>
                    {exams.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name?.en || e.slug}</SelectItem>)}
                  </SelectContent>
                </Select>
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
    </PageTransition>
  );
}
