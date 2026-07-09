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
import { examsApi } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSpecialtiesPage() {
  const t = useTranslations("admin");
  const c = useTranslations("common");
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examData, setExamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingExam, setLoadingExam] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"specialty" | "topic" | "subtopic">("specialty");
  const [editing, setEditing] = useState<any | null>(null);
  const [parentId, setParentId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);
  const [expandedSpecs, setExpandedSpecs] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ nameEn: "", nameEs: "", sortOrder: 0 });

  useEffect(() => {
    examsApi.list().then(({ data }) => {
      setExams(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadExam = useCallback(async (examId: string) => {
    if (!examId) { setExamData(null); return; }
    setLoadingExam(true);
    try {
      const { data } = await examsApi.get(examId);
      setExamData(data);
    } catch {
      toast.error(t("failed_to_load_exam"));
    } finally {
      setLoadingExam(false);
    }
  }, []);

  useEffect(() => {
    if (selectedExamId) loadExam(selectedExamId);
    else setExamData(null);
  }, [selectedExamId, loadExam]);

  const openCreate = (type: "specialty" | "topic" | "subtopic", parentId = "") => {
    setDialogType(type);
    setEditing(null);
    setParentId(parentId);
    setForm({ nameEn: "", nameEs: "", sortOrder: 0 });
    setDialogOpen(true);
  };

  const openEdit = (type: "specialty" | "topic" | "subtopic", item: any, parentId = "") => {
    setDialogType(type);
    setEditing(item);
    setParentId(parentId);
    setForm({
      nameEn: item.name?.en || "",
      nameEs: item.name?.es || "",
      sortOrder: item.sortOrder || 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nameEn.trim()) return;
    setSaving(true);
    try {
      const payload = { name: { en: form.nameEn, es: form.nameEs || form.nameEn }, sortOrder: form.sortOrder };
      if (editing) {
        if (dialogType === "specialty") await examsApi.updateSpecialty(editing.id, payload);
        else if (dialogType === "topic") await examsApi.updateTopic(editing.id, payload);
        else await examsApi.updateSubtopic(editing.id, payload);
        toast.success(t("updated"));
      } else {
        if (dialogType === "specialty") await examsApi.createSpecialty(selectedExamId, payload);
        else if (dialogType === "topic") await examsApi.createTopic(parentId, payload);
        else await examsApi.createSubtopic(parentId, payload);
        toast.success(t("created"));
      }
      setDialogOpen(false);
      loadExam(selectedExamId);
    } catch {
      toast.error(t("failed_to_save"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "specialty") await examsApi.deleteSpecialty(deleteTarget.id);
      else if (deleteTarget.type === "topic") await examsApi.deleteTopic(deleteTarget.id);
      else await examsApi.deleteSubtopic(deleteTarget.id);
      toast.success(t("deleted"));
      setDeleteTarget(null);
      loadExam(selectedExamId);
    } catch {
      toast.error(t("failed_to_delete"));
    }
  };

  const toggleSpec = (id: string) => {
    setExpandedSpecs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleTopic = (id: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("specialty_mgmt_title")}</h1>
          <p className="text-muted-foreground">{t("specialty_mgmt_subtitle")}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-80">
            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
              <SelectTrigger className="w-full bg-muted/20 border-border/80 rounded-xl h-11 px-4">
                <SelectValue placeholder={t("select_exam_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {exams.map((e: any) => (
                  <SelectItem key={e.id} value={e.id}>{e.name?.en || e.slug}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedExamId && (
            <>
              <Button onClick={() => openCreate("specialty")}><Plus className="h-4 w-4 mr-2" /> {t("add_specialty")}</Button>
              {["enurm", "enarm"].includes(exams.find((e: any) => e.id === selectedExamId)?.slug) && (() => {
                const mirExam = exams.find((e: any) => e.slug === "mir");
                if (!mirExam) return null;
                return (
                  <Button variant="outline" onClick={async () => {
                    try {
                      const { data } = await examsApi.copyQuestions(mirExam.id, selectedExamId);
                      toast.success(data.message || `Copied ${data.copied} questions`);
                    } catch { toast.error("Failed to copy questions"); }
                  }}>
                    <Loader2 className="h-4 w-4 mr-2" /> Copy questions from MIR
                  </Button>
                );
              })()}
            </>
          )}
        </div>

        {loadingExam && (
          <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        )}

        {!loadingExam && examData && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              {(!examData.specialties || examData.specialties.length === 0) ? (
                <p className="text-center text-muted-foreground py-8">{t("no_specialties_yet")}</p>
              ) : (
                examData.specialties.map((spec: any) => (
                  <div key={spec.id} className="border border-border/60 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button onClick={() => toggleSpec(spec.id)} className="text-muted-foreground hover:text-foreground">
                          {expandedSpecs.has(spec.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                        <span className="font-medium">{spec.name?.en || spec.name}</span>
                        {spec.name?.es && <span className="text-xs text-muted-foreground">({spec.name.es})</span>}
                        <Badge variant="outline" className="text-xs">Sort: {spec.sortOrder ?? 0}</Badge>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openCreate("topic", spec.id)} title="Add topic">
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit("specialty", spec)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeleteTarget({ type: "specialty", id: spec.id, name: spec.name?.en || spec.name })}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {expandedSpecs.has(spec.id) && (
                      <div className="border-t border-border/50 pl-8 pr-4 py-3 space-y-2">
                        {(!spec.topics || spec.topics.length === 0) ? (
                          <p className="text-sm text-muted-foreground">{t("no_topics_yet")}</p>
                        ) : (
                          spec.topics.map((topic: any) => (
                            <div key={topic.id} className="border border-border/40 rounded-lg overflow-hidden">
                              <div className="flex items-center justify-between p-3 bg-muted/10 hover:bg-muted/20 transition-colors">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <button onClick={() => toggleTopic(topic.id)} className="text-muted-foreground hover:text-foreground">
                                    {expandedTopics.has(topic.id) ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                  </button>
                                  <span className="text-sm font-medium">{topic.name?.en || topic.name}</span>
                                  {topic.name?.es && <span className="text-xs text-muted-foreground">({topic.name.es})</span>}
                                  <Badge variant="outline" className="text-xs">Sort: {topic.sortOrder ?? 0}</Badge>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openCreate("subtopic", topic.id)} title="Add subtopic">
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit("topic", topic)}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteTarget({ type: "topic", id: topic.id, name: topic.name?.en || topic.name })}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {expandedTopics.has(topic.id) && (
                                <div className="border-t border-border/40 pl-8 pr-4 py-2 space-y-1">
                                  {(!topic.subtopics || topic.subtopics.length === 0) ? (
                                    <p className="text-xs text-muted-foreground">{t("no_subtopics_yet")}</p>
                                  ) : (
                                    topic.subtopics.map((sub: any) => (
                                      <div key={sub.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/10 transition-colors">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <span className="text-sm">{sub.name?.en || sub.name}</span>
                                          {sub.name?.es && <span className="text-xs text-muted-foreground">({sub.name.es})</span>}
                                          <Badge variant="outline" className="text-xs">Sort: {sub.sortOrder ?? 0}</Badge>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => openEdit("subtopic", sub)}>
                                            <Pencil className="h-3 w-3" />
                                          </Button>
                                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => setDeleteTarget({ type: "subtopic", id: sub.id, name: sub.name?.en || sub.name })}>
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader className="p-6 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {editing ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </div>
              <div className="text-left">
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {editing ? c("edit") : c("create")} {dialogType === "specialty" ? t("type_specialty") : dialogType === "topic" ? t("type_topic") : t("type_subtopic")}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("name_english")}</label>
              <Input
                autoFocus
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm outline-none"
                placeholder={t("placeholder_name_english")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("name_spanish")}</label>
              <Input
                value={form.nameEs}
                onChange={(e) => setForm({ ...form, nameEs: e.target.value })}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm outline-none"
                placeholder={t("placeholder_name_spanish")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("sort_order")}</label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 border-t border-border/60 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl px-6 h-10 text-sm font-medium">{c("cancel")}</Button>
            <Button onClick={handleSave} disabled={saving || !form.nameEn.trim()} className="rounded-xl px-6 h-10 text-sm font-medium shadow-md">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? c("save") : c("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("delete_type_title", { type: deleteTarget?.type || "" })}
        description={t("delete_type_desc", { name: deleteTarget?.name || "" })}
        confirmLabel={c("delete")}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </PageTransition>
  );
}
