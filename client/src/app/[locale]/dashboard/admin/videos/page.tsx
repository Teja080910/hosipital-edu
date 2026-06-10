"use client";

import { PageTransition } from "@/components/page-transition";
import { StreamVideoPlayer } from "@/components/stream/stream-video-player";
import { VideoUploader } from "@/components/stream/video-uploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { streamApi } from "@/lib/api";
import { FolderOpen, Loader2, Pencil, Play, Plus, Trash2, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminVideosPage() {
  const t = useTranslations("admin");
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" });
  const [savingModule, setSavingModule] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteType, setDeleteType] = useState<"module" | "lesson">("module");
  const [selectedModule, setSelectedModule] = useState<any | null>(null);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: "", description: "", videoUrl: "", duration: "0" });
  const [savingLesson, setSavingLesson] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  const [previewUid, setPreviewUid] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    try {
      const { data } = await streamApi.listModules();
      setModules(data);
      if (data.length > 0) setSelectedModule((prev: any) => prev ?? data[0]);
    } catch {
      toast.error("Failed to load modules");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchModules(); }, []);

  const openCreateModule = () => {
    setEditingModule(null);
    setModuleForm({ title: "", description: "" });
    setModuleDialogOpen(true);
  };

  const openEditModule = (mod: any) => {
    setEditingModule(mod);
    setModuleForm({ title: mod.title?.en ?? mod.title ?? "", description: mod.description?.en ?? mod.description ?? "" });
    setModuleDialogOpen(true);
  };

  const saveModule = async () => {
    setSavingModule(true);
    try {
      const payload = {
        title: { en: moduleForm.title },
        description: { en: moduleForm.description },
      };
      if (editingModule) {
        await streamApi.updateModule(editingModule.id, payload);
        toast.success("Module updated");
      } else {
        await streamApi.createModule(payload);
        toast.success("Module created");
      }
      setModuleDialogOpen(false);
      fetchModules();
    } catch {
      toast.error("Failed to save module");
    } finally {
      setSavingModule(false);
    }
  };

  const deleteModule = async () => {
    if (!deleteTarget) return;
    try {
      await streamApi.deleteModule(deleteTarget.id);
      toast.success("Module deleted");
      setDeleteTarget(null);
      if (selectedModule?.id === deleteTarget.id) setSelectedModule(null);
      fetchModules();
    } catch {
      toast.error("Failed to delete module");
    }
  };

  const deleteLesson = async () => {
    if (!deleteTarget) return;
    try {
      await streamApi.deleteLesson(deleteTarget.id);
      toast.success("Lesson deleted");
      setDeleteTarget(null);
      fetchModules();
    } catch {
      toast.error("Failed to delete lesson");
    }
  };

  const openCreateLesson = (moduleId: string) => {
    setLessonModuleId(moduleId);
    setEditingLesson(null);
    setLessonForm({ title: "", description: "", videoUrl: "", duration: "0" });
    setLessonDialogOpen(true);
  };

  const openEditLesson = (lesson: any) => {
    setEditingLesson(lesson);
    setLessonModuleId(null);
    setLessonForm({
      title: lesson.title?.en ?? lesson.title ?? "",
      description: lesson.description?.en ?? lesson.description ?? "",
      videoUrl: lesson.videoUrl || "",
      duration: String(lesson.duration || 0),
    });
    setLessonDialogOpen(true);
  };

  const saveLesson = async () => {
    setSavingLesson(true);
    try {
      const payload = {
        title: { en: lessonForm.title },
        description: { en: lessonForm.description },
        videoUrl: lessonForm.videoUrl,
        duration: parseInt(lessonForm.duration) || 0,
      };
      if (editingLesson) {
        await streamApi.updateLesson(editingLesson.id, payload);
        toast.success("Lesson updated");
      } else {
        await streamApi.createLesson({ ...payload, moduleId: lessonModuleId! });
        toast.success("Lesson created");
      }
      setLessonDialogOpen(false);
      fetchModules();
    } catch {
      toast.error("Failed to save lesson");
    } finally {
      setSavingLesson(false);
    }
  };

  const onUploadComplete = (result: { uid: string; thumbnail: string; duration: number }) => {
    setLessonForm((prev) => ({
      ...prev,
      videoUrl: result.uid,
      duration: String(result.duration || 0),
    }));
  };

  const extractUid = (url: string) => {
    if (!url) return null;
    const parts = url.split("/");
    return parts[parts.length - 1] || url;
  };

  const renderTitle = (v: any) => (typeof v === "string" ? v : v?.en ?? v?.es ?? "");
  const moduleColumns = [
    { key: "title", label: "Title", render: renderTitle },
    { key: "lessons", label: "Lessons", render: (v: any[]) => v?.length || 0 },
  ];

  const lessonColumns = [
    { key: "title", label: "Title", render: renderTitle },
    { key: "duration", label: "Duration (s)", render: (v: number) => `${v}s` },
    { key: "videoUrl", label: "Video", render: (v: string) => v ? <Badge variant="outline">Uploaded</Badge> : <Badge variant="secondary">None</Badge> },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Video Manager</h1>
          <Button onClick={openCreateModule}>
            <Plus className="mr-2 h-4 w-4" /> New Module
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FolderOpen className="h-5 w-5" /> Modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : modules.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No modules yet</p>
              ) : (
                <div className="space-y-2">
                  {modules.map((mod) => (
                    <div
                      key={mod.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-colors ${
                        selectedModule?.id === mod.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                      }`}
                      onClick={() => setSelectedModule(mod)}
                    >
                      <div>
                        <p className="font-medium text-sm">{mod.title?.en ?? mod.title}</p>
                        <p className="text-xs text-muted-foreground">{mod.lessons?.length || 0} lessons</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openEditModule(mod); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteTarget(mod); setDeleteType("module"); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Video className="h-5 w-5" /> Lessons
                {selectedModule && (
                  <Button size="sm" className="ml-auto" onClick={() => openCreateLesson(selectedModule.id)}>
                    <Plus className="mr-1 h-4 w-4" /> Add Lesson
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedModule ? (
                <p className="text-sm text-muted-foreground text-center py-8">Select a module</p>
              ) : selectedModule.lessons?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No lessons in this module</p>
              ) : (
                <div className="space-y-3">
                  {selectedModule.lessons?.map((lesson: any) => (
                    <div key={lesson.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{lesson.title?.en ?? lesson.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{lesson.description?.en ?? lesson.description}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{lesson.duration}s</Badge>
                          {lesson.videoUrl && (
                            <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => setPreviewUid(extractUid(lesson.videoUrl))}>
                              <Play className="mr-1 h-3 w-3" /> Preview
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditLesson(lesson)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeleteTarget(lesson); setDeleteType("lesson"); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingModule ? "Edit Module" : "New Module"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={moduleForm.title} onChange={(e) => setModuleForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={moduleForm.description} onChange={(e) => setModuleForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveModule} disabled={savingModule || !moduleForm.title}>
                {savingModule ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingModule ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingLesson ? "Edit Lesson" : "New Lesson"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={lessonForm.title} onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={lessonForm.description} onChange={(e) => setLessonForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Video UID</label>
                <div className="flex gap-2">
                  <Input value={lessonForm.videoUrl} onChange={(e) => setLessonForm((p) => ({ ...p, videoUrl: e.target.value }))} placeholder="Cloudflare Stream UID" />
                  <Button variant="outline" size="sm" onClick={() => { setUploadOpen(true); }}>
                    Upload
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Duration (seconds)</label>
                <Input type="number" value={lessonForm.duration} onChange={(e) => setLessonForm((p) => ({ ...p, duration: e.target.value }))} />
              </div>
              {lessonForm.videoUrl && (
                <div className="rounded-lg overflow-hidden border">
                  <StreamVideoPlayer uid={lessonForm.videoUrl} />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveLesson} disabled={savingLesson || !lessonForm.title}>
                {savingLesson ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingLesson ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {uploadOpen && (
          <VideoUploader
            open={uploadOpen}
            onOpenChange={setUploadOpen}
            onUploadComplete={onUploadComplete}
          />
        )}

        {previewUid && (
          <Dialog open={!!previewUid} onOpenChange={() => setPreviewUid(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Video Preview</DialogTitle>
              </DialogHeader>
              <StreamVideoPlayer uid={previewUid} />
            </DialogContent>
          </Dialog>
        )}

        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={() => setDeleteTarget(null)}
          onConfirm={deleteType === "module" ? deleteModule : deleteLesson}
          title={`Delete ${deleteType}`}
          description={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
        />
      </div>
    </PageTransition>
  );
}