"use client";

import { PageTransition } from "@/components/page-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { coursesApi } from "@/lib/api";
import { ChevronLeft, FileText, Film, FolderOpen, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminCourseContentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" });
  const [savingModule, setSavingModule] = useState(false);

  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: "", contentType: "video", content: "", videoUrl: "", pdfUrl: "", duration: "0" });
  const [savingLesson, setSavingLesson] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteType, setDeleteType] = useState<"module" | "lesson">("module");

  const fetchCourse = async () => {
    try {
      const [slugRes] = await Promise.all([
        coursesApi.list(true),
      ]);
      const allCourses = slugRes.data;
      const found = allCourses.find((c: any) => c.id === id);
      if (found) {
        const { data } = await coursesApi.get(found.slug);
        setCourse(data);
      } else {
        toast.error("Course not found");
      }
    } catch {
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourse(); }, [id]);

  const openCreateModule = () => {
    setEditingModule(null);
    setModuleForm({ title: "", description: "" });
    setModuleDialogOpen(true);
  };

  const openEditModule = (mod: any) => {
    setEditingModule(mod);
    setModuleForm({
      title: mod.title?.en ?? mod.title ?? "",
      description: mod.description?.en ?? mod.description ?? "",
    });
    setModuleDialogOpen(true);
  };

  const saveModule = async () => {
    setSavingModule(true);
    try {
      const payload = { title: { en: moduleForm.title }, description: { en: moduleForm.description } };
      if (editingModule) {
        await coursesApi.updateModule(editingModule.id, payload);
        toast.success("Module updated");
      } else {
        await coursesApi.createModule(id, payload);
        toast.success("Module created");
      }
      setModuleDialogOpen(false);
      fetchCourse();
    } catch {
      toast.error("Failed to save module");
    } finally {
      setSavingModule(false);
    }
  };

  const deleteModule = async () => {
    if (!deleteTarget) return;
    try {
      await coursesApi.deleteModule(deleteTarget.id);
      toast.success("Module deleted");
      setDeleteTarget(null);
      fetchCourse();
    } catch {
      toast.error("Failed to delete module");
    }
  };

  const deleteLesson = async () => {
    if (!deleteTarget) return;
    try {
      await coursesApi.deleteLesson(deleteTarget.id);
      toast.success("Lesson deleted");
      setDeleteTarget(null);
      fetchCourse();
    } catch {
      toast.error("Failed to delete lesson");
    }
  };

  const openCreateLesson = (moduleId: string) => {
    setLessonModuleId(moduleId);
    setEditingLesson(null);
    setLessonForm({ title: "", contentType: "video", content: "", videoUrl: "", pdfUrl: "", duration: "0" });
    setLessonDialogOpen(true);
  };

  const openEditLesson = (lesson: any, moduleId: string) => {
    setEditingLesson(lesson);
    setLessonModuleId(moduleId);
    setLessonForm({
      title: lesson.title?.en ?? lesson.title ?? "",
      contentType: lesson.contentType || "video",
      content: lesson.content || "",
      videoUrl: lesson.videoUrl || "",
      pdfUrl: lesson.pdfUrl || "",
      duration: String(lesson.duration || 0),
    });
    setLessonDialogOpen(true);
  };

  const saveLesson = async () => {
    setSavingLesson(true);
    try {
      const payload: any = {
        title: { en: lessonForm.title },
        contentType: lessonForm.contentType,
        duration: parseInt(lessonForm.duration) || 0,
      };
      if (lessonForm.contentType === "video") payload.videoUrl = lessonForm.videoUrl;
      if (lessonForm.contentType === "pdf") payload.pdfUrl = lessonForm.pdfUrl;
      if (lessonForm.contentType === "text") payload.content = lessonForm.content;

      if (editingLesson) {
        await coursesApi.updateLesson(editingLesson.id, payload);
        toast.success("Lesson updated");
      } else {
        await coursesApi.createLesson(lessonModuleId!, payload);
        toast.success("Lesson created");
      }
      setLessonDialogOpen(false);
      fetchCourse();
    } catch {
      toast.error("Failed to save lesson");
    } finally {
      setSavingLesson(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </PageTransition>
    );
  }

  if (!course) {
    return (
      <PageTransition>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Course not found</h2>
          <Button variant="link" onClick={() => router.push("/dashboard/admin/courses")}>Go back</Button>
        </div>
      </PageTransition>
    );
  }

  const title = course.title?.en || course.title;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/admin/courses")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground text-sm">Manage modules and lessons</p>
          </div>
          <Button onClick={openCreateModule}>
            <Plus className="mr-2 h-4 w-4" /> New Module
          </Button>
        </div>

        <div className="space-y-4">
          {course.modules?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">No modules yet. Create your first module to start adding content.</p>
              </CardContent>
            </Card>
          )}
          {course.modules?.map((mod: any, mi: number) => {
            const modTitle = mod.title?.en || mod.title;
            return (
              <Card key={mod.id}>
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-muted-foreground text-sm font-normal">Module {mi + 1}</span>
                      {modTitle}
                    </CardTitle>
                    {mod.description?.en && (
                      <p className="text-sm text-muted-foreground mt-1">{mod.description.en}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModule(mod)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeleteTarget(mod); setDeleteType("module"); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">{mod.lessons?.length || 0} lessons</span>
                    <Button size="sm" variant="outline" onClick={() => openCreateLesson(mod.id)}>
                      <Plus className="mr-1 h-4 w-4" /> Add Lesson
                    </Button>
                  </div>
                  {mod.lessons?.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No lessons in this module</p>
                  ) : (
                    <div className="space-y-2">
                      {mod.lessons?.map((lesson: any) => {
                        const lessonTitle = lesson.title?.en || lesson.title;
                        const contentTypeIcon = lesson.contentType === "video" ? Film : FileText;
                        return (
                          <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50">
                            <div className="rounded-full bg-muted p-1.5">
                              {contentTypeIcon === Film ? <Film className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{lessonTitle}</p>
                              <div className="flex gap-2 mt-0.5">
                                <Badge variant="secondary" className="text-xs">{lesson.contentType}</Badge>
                                {lesson.duration > 0 && <Badge variant="outline" className="text-xs">{lesson.duration}s</Badge>}
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditLesson(lesson, mod.id)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeleteTarget(lesson); setDeleteType("lesson"); }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingModule ? "Edit Module" : "New Module"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Title (English)</label>
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
              {savingModule && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingModule ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingLesson ? "Edit Lesson" : "New Lesson"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Title (English)</label>
              <Input value={lessonForm.title} onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Content Type</label>
              <Select value={lessonForm.contentType} onValueChange={(v) => setLessonForm((p) => ({ ...p, contentType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="text">Text / Article</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {lessonForm.contentType === "video" && (
              <div>
                <label className="text-sm font-medium">Video URL</label>
                <Input value={lessonForm.videoUrl} onChange={(e) => setLessonForm((p) => ({ ...p, videoUrl: e.target.value }))} placeholder="Cloudflare Stream UID or URL" />
              </div>
            )}
            {lessonForm.contentType === "pdf" && (
              <div>
                <label className="text-sm font-medium">PDF URL</label>
                <Input value={lessonForm.pdfUrl} onChange={(e) => setLessonForm((p) => ({ ...p, pdfUrl: e.target.value }))} placeholder="PDF file URL" />
              </div>
            )}
            {lessonForm.contentType === "text" && (
              <div>
                <label className="text-sm font-medium">Content (HTML or Markdown)</label>
                <Textarea value={lessonForm.content} onChange={(e) => setLessonForm((p) => ({ ...p, content: e.target.value }))} rows={6} />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Duration (seconds)</label>
              <Input type="number" value={lessonForm.duration} onChange={(e) => setLessonForm((p) => ({ ...p, duration: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveLesson} disabled={savingLesson || !lessonForm.title}>
              {savingLesson && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingLesson ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        onConfirm={deleteType === "module" ? deleteModule : deleteLesson}
        title={`Delete ${deleteType}`}
        description={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
      />
    </PageTransition>
  );
}