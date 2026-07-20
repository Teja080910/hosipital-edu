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
import { coursesApi, uploadApi } from "@/lib/api";
import { ChevronLeft, FileText, Film, FolderOpen, Loader2, Pencil, Plus, Trash2, Upload, ClipboardCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminCourseContentPage() {
  const t = useTranslations("admin");
  const c = useTranslations("common");
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
  const [lessonForm, setLessonForm] = useState({ title: "", contentType: "video", content: "", videoUrl: "", pdfUrl: "", imageUrl: "", duration: "0" });
  const [savingLesson, setSavingLesson] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);

  const uploadFileToR2 = async (file: File, field: "pdfUrl" | "videoUrl" | "imageUrl") => {
    setUploadingFile(file.name);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1] || "");
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const key = `courses/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { data } = await uploadApi.uploadFile(key, base64, file.type);
      setLessonForm((p) => ({ ...p, [field]: data.url }));
      toast.success(`${file.name} uploaded`);
    } catch {
      toast.error(t("upload_failed"));
    } finally {
      setUploadingFile(null);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteType, setDeleteType] = useState<"module" | "lesson">("module");

  const [quizOpen, setQuizOpen] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizForm, setQuizForm] = useState<{ title: string; passingScore: number; questions: { question: string; options: string[]; correctIndex: number }[] }>({
    title: "",
    passingScore: 70,
    questions: [{ question: "", options: ["", ""], correctIndex: 0 }],
  });

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
        toast.error(t("course_not_found"));
      }
    } catch {
      toast.error(t("load_failed_course"));
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
        toast.success(t("module_updated"));
      } else {
        await coursesApi.createModule(id, payload);
        toast.success(t("module_created"));
      }
      setModuleDialogOpen(false);
      fetchCourse();
    } catch {
      toast.error(t("module_save_failed"));
    } finally {
      setSavingModule(false);
    }
  };

  const deleteModule = async () => {
    if (!deleteTarget) return;
    try {
      await coursesApi.deleteModule(deleteTarget.id);
      toast.success(t("module_deleted"));
      setDeleteTarget(null);
      fetchCourse();
    } catch {
      toast.error(t("module_delete_failed"));
    }
  };

  const deleteLesson = async () => {
    if (!deleteTarget) return;
    try {
      await coursesApi.deleteLesson(deleteTarget.id);
      toast.success(t("lesson_deleted"));
      setDeleteTarget(null);
      fetchCourse();
    } catch {
      toast.error(t("lesson_delete_failed"));
    }
  };

  const openCreateLesson = (moduleId: string) => {
    setLessonModuleId(moduleId);
    setEditingLesson(null);
    setLessonForm({ title: "", contentType: "video", content: "", videoUrl: "", pdfUrl: "", imageUrl: "", duration: "0" });
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
      imageUrl: lesson.imageUrl || "",
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
      if (lessonForm.contentType === "image") payload.imageUrl = lessonForm.imageUrl;
      if (lessonForm.contentType === "text") payload.content = lessonForm.content;

      if (editingLesson) {
        await coursesApi.updateLesson(editingLesson.id, payload);
        toast.success(t("lesson_updated"));
      } else {
        await coursesApi.createLesson(lessonModuleId!, payload);
        toast.success(t("lesson_created"));
      }
      setLessonDialogOpen(false);
      fetchCourse();
    } catch {
      toast.error(t("lesson_save_failed"));
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
          <h2 className="text-xl font-semibold">{t("course_not_found")}</h2>
          <Button variant="link" onClick={() => router.push("/dashboard/admin/courses")}>{c("back")}</Button>
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
            <p className="text-muted-foreground text-sm">{t("manage_modules_lessons")}</p>
          </div>
          <Button onClick={openCreateModule}>
            <Plus className="mr-2 h-4 w-4" /> {t("new_module")}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            setQuizLoading(true);
            setQuizOpen(true);
            coursesApi.adminGetQuiz(id, "post_test").then(({ data }) => {
              if (data) {
                setQuizForm({
                  title: data.title?.en || "",
                  passingScore: data.passingScore || 70,
                  questions: Array.isArray(data.questions) ? data.questions.map((q: any) => ({
                    question: q.question || "",
                    options: Array.isArray(q.options) ? q.options : ["", ""],
                    correctIndex: q.correctIndex ?? 0,
                  })) : [{ question: "", options: ["", ""], correctIndex: 0 }],
                });
                setQuizData(data);
              } else {
                setQuizForm({ title: "", passingScore: 70, questions: [{ question: "", options: ["", ""], correctIndex: 0 }] });
                setQuizData(null);
              }
            }).catch(() => {
              setQuizForm({ title: "", passingScore: 70, questions: [{ question: "", options: ["", ""], correctIndex: 0 }] });
              setQuizData(null);
            }).finally(() => setQuizLoading(false));
          }}>
            <ClipboardCheck className="mr-2 h-4 w-4" /> {t("post_test")}
          </Button>
        </div>

        <div className="space-y-4">
          {course.modules?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">{t("no_modules_yet")}</p>
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
                      <span className="text-muted-foreground text-sm font-normal">{t("module_label")} {mi + 1}</span>
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
                    <span className="text-sm text-muted-foreground">{mod.lessons?.length || 0} {t("lessons_count")}</span>
                    <Button size="sm" variant="outline" onClick={() => openCreateLesson(mod.id)}>
                      <Plus className="mr-1 h-4 w-4" /> {t("add_lesson")}
                    </Button>
                  </div>
                  {mod.lessons?.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">{t("no_lessons_in_module")}</p>
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
          <DialogHeader><DialogTitle>{editingModule ? t("edit_module") : t("new_module")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">{t("title_english")}</label>
              <Input value={moduleForm.title} onChange={(e) => setModuleForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("description")}</label>
              <Textarea value={moduleForm.description} onChange={(e) => setModuleForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>{c("cancel")}</Button>
            <Button onClick={saveModule} disabled={savingModule || !moduleForm.title}>
              {savingModule && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingModule ? c("save") : c("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingLesson ? t("edit_lesson") : t("new_lesson")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">{t("title_english")}</label>
              <Input value={lessonForm.title} onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("content_type")}</label>
              <Select value={lessonForm.contentType} onValueChange={(v) => setLessonForm((p) => ({ ...p, contentType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">{t("content_type_video")}</SelectItem>
                  <SelectItem value="text">{t("content_type_text")}</SelectItem>
                  <SelectItem value="pdf">{t("content_type_pdf")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {lessonForm.contentType === "video" && (
              <div>
                <label className="text-sm font-medium">{t("video_url")}</label>
                <Input value={lessonForm.videoUrl} onChange={(e) => setLessonForm((p) => ({ ...p, videoUrl: e.target.value }))} placeholder={t("video_url_placeholder")} />
              </div>
            )}
            {lessonForm.contentType === "pdf" && (
              <div>
                <label className="text-sm font-medium">{t("pdf_file")}</label>
                <label className="flex h-10 w-full cursor-pointer items-center overflow-hidden rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    disabled={uploadingFile !== null}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadFileToR2(file, "pdfUrl");
                    }}
                  />
                  {uploadingFile ? (
                    <span className="flex items-center gap-2 min-w-0 w-full"><Loader2 className="h-4 w-4 shrink-0 animate-spin" /><span className="truncate">{uploadingFile}</span></span>
                  ) : (
                    <span className="truncate">{"Choose file"}</span>
                  )}
                </label>
                {lessonForm.pdfUrl && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate flex-1">{lessonForm.pdfUrl.split("/").pop()?.split("?")[0]}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setLessonForm((p) => ({ ...p, pdfUrl: "" }))}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}
            {lessonForm.contentType === "image" && (
              <div>
                <label className="text-sm font-medium">{t("image_file")}</label>
                <label className="flex h-10 w-full cursor-pointer items-center overflow-hidden rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingFile !== null}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadFileToR2(file, "imageUrl");
                    }}
                  />
                  {uploadingFile ? (
                    <span className="flex items-center gap-2 min-w-0 w-full"><Loader2 className="h-4 w-4 shrink-0 animate-spin" /><span className="truncate">{uploadingFile}</span></span>
                  ) : (
                    <span className="truncate">{"Choose file"}</span>
                  )}
                </label>
                {lessonForm.imageUrl && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate flex-1">{lessonForm.imageUrl.split("/").pop()?.split("?")[0]}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setLessonForm((p) => ({ ...p, imageUrl: "" }))}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}
            {lessonForm.contentType === "text" && (
              <div>
                <label className="text-sm font-medium">{t("content_html")}</label>
                <Textarea value={lessonForm.content} onChange={(e) => setLessonForm((p) => ({ ...p, content: e.target.value }))} rows={6} />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">{t("duration_seconds")}</label>
              <Input type="number" value={lessonForm.duration} onChange={(e) => setLessonForm((p) => ({ ...p, duration: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>{c("cancel")}</Button>
            <Button onClick={saveLesson} disabled={savingLesson || !lessonForm.title}>
              {savingLesson && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingLesson ? c("save") : c("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("post_test")}</DialogTitle></DialogHeader>
          {quizLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">{t("title_english")}</label>
                <Input value={quizForm.title} onChange={(e) => setQuizForm((p) => ({ ...p, title: e.target.value }))} placeholder="Course Post-Test" />
              </div>
              <div>
                <label className="text-sm font-medium">{t("passing_score")}</label>
                <Input type="number" value={quizForm.passingScore} onChange={(e) => setQuizForm((p) => ({ ...p, passingScore: parseInt(e.target.value) || 70 }))} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">{t("questions")}</label>
                  <Button size="sm" variant="outline" onClick={() => setQuizForm((p) => ({ ...p, questions: [...p.questions, { question: "", options: ["", ""], correctIndex: 0 }] }))}>
                    <Plus className="mr-1 h-4 w-4" /> {t("add_question")}
                  </Button>
                </div>
                {quizForm.questions.map((q, qi) => (
                  <div key={qi} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-muted-foreground shrink-0 mt-2">{t("question_number", { n: qi + 1 })}</span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 shrink-0 text-destructive" onClick={() => setQuizForm((p) => ({ ...p, questions: p.questions.filter((_, i) => i !== qi) }))}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input value={q.question} onChange={(e) => {
                      const updated = [...quizForm.questions];
                      updated[qi] = { ...updated[qi], question: e.target.value };
                      setQuizForm((p) => ({ ...p, questions: updated }));
                    }} placeholder={t("question_placeholder")} />
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input type="radio" name={`correct-${qi}`} checked={q.correctIndex === oi} onChange={() => {
                          const updated = [...quizForm.questions];
                          updated[qi] = { ...updated[qi], correctIndex: oi };
                          setQuizForm((p) => ({ ...p, questions: updated }));
                        }} className="h-4 w-4" />
                        <Input value={opt} onChange={(e) => {
                          const updated = [...quizForm.questions];
                          const opts = [...updated[qi].options];
                          opts[oi] = e.target.value;
                          updated[qi] = { ...updated[qi], options: opts };
                          setQuizForm((p) => ({ ...p, questions: updated }));
                        }} placeholder={`${t("option")} ${oi + 1}`} className="flex-1" />
                        {q.options.length > 2 && (
                          <Button size="sm" variant="ghost" className="h-6 w-6 shrink-0 text-destructive" onClick={() => {
                            const updated = [...quizForm.questions];
                            const opts = updated[qi].options.filter((_, i) => i !== oi);
                            let ci = updated[qi].correctIndex;
                            if (oi === ci) ci = 0;
                            else if (oi < ci) ci--;
                            updated[qi] = { ...updated[qi], options: opts, correctIndex: ci };
                            setQuizForm((p) => ({ ...p, questions: updated }));
                          }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button size="sm" variant="ghost" onClick={() => {
                      const updated = [...quizForm.questions];
                      updated[qi] = { ...updated[qi], options: [...updated[qi].options, ""] };
                      setQuizForm((p) => ({ ...p, questions: updated }));
                    }}>
                      <Plus className="mr-1 h-3 w-3" /> {t("add_option")}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuizOpen(false)}>{c("cancel")}</Button>
            {quizData && <Button variant="destructive" onClick={async () => {
              try { await coursesApi.adminDeleteQuiz(id, "post_test"); setQuizOpen(false); toast.success(t("quiz_deleted")); fetchCourse(); } catch { toast.error(t("save_failed")); }
            }}>{c("delete")}</Button>}
            <Button onClick={async () => {
              try {
                await coursesApi.adminSaveQuiz(id, {
                  type: "post_test",
                  title: { en: quizForm.title },
                  passingScore: quizForm.passingScore,
                  questions: quizForm.questions.map((q) => ({
                    question: q.question,
                    options: q.options.filter(Boolean),
                    correctIndex: q.correctIndex,
                  })),
                });
                setQuizOpen(false);
                toast.success(t("quiz_saved"));
                fetchCourse();
              } catch { toast.error(t("save_failed")); }
            }} disabled={!quizForm.title || quizForm.questions.some((q) => !q.question)}>
              {c("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        onConfirm={deleteType === "module" ? deleteModule : deleteLesson}
        title={deleteType === "module" ? t("delete_module") : t("delete_lesson")}
        description={deleteType === "module" ? t("delete_module_confirm") : t("delete_lesson_confirm")}
        confirmLabel={c("delete")}
      />
    </PageTransition>
  );
}