"use client";

import { useTranslations } from "next-intl";
import { PageTransition } from "@/components/page-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CourseQuiz } from "@/components/courses/course-quiz";
import { coursesApi } from "@/lib/api";
import { ArrowLeft, CheckCircle, Clock, FileText, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LessonPage() {
  const t = useTranslations("lessons");
  const c = useTranslations("common");
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (!slug || !lessonId) return;
    coursesApi.checkEnrollment(slug).then(({ data }) => {
      if (!data.enrolled) {
        router.push(`/dashboard/courses/${slug}`);
        return;
      }
      setIsEnrolled(true);
    }).catch(() => {
      router.push(`/dashboard/courses/${slug}`);
      return;
    });
    coursesApi.get(slug).then(({ data }) => {
      const found: any[] = [];
      data.modules?.forEach((m: any) => {
        m.lessons?.forEach((l: any) => {
          if (l.id === lessonId) found.push(l);
        });
      });
      if (found.length > 0) {
        setLesson(found[0]);
        if (found[0].contentType === "quiz") {
          coursesApi.getLessonQuiz(slug, lessonId).then(({ data: q }) => setQuiz(q)).catch(() => {});
        }
      }
      else toast.error(t("not_found"));
    }).catch(() => toast.error(t("load_failed"))).finally(() => setLoading(false));
    coursesApi.getProgress(slug).then(({ data: p }) => {
      const done = p.lessons?.find((l: any) => l.lessonId === lessonId);
      if (done?.isCompleted) setIsCompleted(true);
    }).catch(() => {});
  }, [slug, lessonId, t]);

  const handleToggleComplete = async () => {
    setCompleting(true);
    try {
      if (isCompleted) {
        await coursesApi.incompleteLesson(slug, lessonId);
        setIsCompleted(false);
      } else {
        await coursesApi.completeLesson(slug, lessonId);
        setIsCompleted(true);
      }
    } catch {
      toast.error(t("load_failed"));
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </PageTransition>
    );
  }

  if (!lesson) {
    return (
      <PageTransition>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">{t("not_found")}</h2>
          <Button variant="link" onClick={() => router.back()}>{t("go_back")}</Button>
        </div>
      </PageTransition>
    );
  }

  const lessonTitle = lesson.title?.en || lesson.title;

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{lessonTitle}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{lesson.contentType}</Badge>
              {lesson.duration > 0 && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, "0")}
                </span>
              )}
              {lesson.isFreePreview && <Badge variant="outline">{t("free_preview")}</Badge>}
            </div>
          </div>
        </div>

        <Separator />

        <div className="min-h-[400px]">
          {lesson.contentType === "video" && lesson.videoUrl && (() => {
            const url = lesson.videoUrl;
            const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
            const gdriveId = gdriveMatch ? gdriveMatch[1] : null;

            if (gdriveId) {
              return (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <iframe
                    src={`https://drive.google.com/file/d/${gdriveId}/preview`}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              );
            }

            if (url.includes("youtube.com") || url.includes("youtu.be")) {
              const ytMatch = url.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([^&?/]+)/);
              const ytId = ytMatch ? ytMatch[1] : null;
              return (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  {ytId ? (
                    <iframe src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full rounded-lg" allowFullScreen />
                  ) : (
                    <video src={url} controls className="w-full h-full rounded-lg" />
                  )}
                </div>
              );
            }

            if (url.includes("cloudflarestream.com") && !url.includes("drive.google.com")) {
              return (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <iframe src={url} className="w-full h-full rounded-lg" allowFullScreen />
                </div>
              );
            }

            return (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <video src={url} controls className="w-full h-full rounded-lg" />
              </div>
            );
          })()}

          {lesson.contentType === "pdf" && lesson.pdfUrl && (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <a href={lesson.pdfUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary underline">{t("open_pdf")}</a>
            </div>
          )}

          {lesson.contentType === "image" && lesson.imageUrl && (
            <div className="bg-muted rounded-lg flex items-center justify-center p-4">
              <img src={lesson.imageUrl} alt={lessonTitle} className="max-w-full max-h-[600px] rounded-lg object-contain" />
            </div>
          )}

          {lesson.contentType === "text" && lesson.content && (
            <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
          )}

          {lesson.contentType === "quiz" && (
            quiz ? (
              <CourseQuiz
                quiz={quiz}
                onComplete={(passed, score) => {
                  if (passed) setIsCompleted(true);
                }}
              />
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>{t("loading_quiz")}</p>
              </div>
            )
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => router.back()}>{t("back_to_course")}</Button>
          <Button onClick={handleToggleComplete} disabled={completing} variant={isCompleted ? "secondary" : "default"}>
            {completing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {!completing && <CheckCircle className="h-4 w-4 mr-2" />}
            {isCompleted ? t("completed") : t("mark_complete")}
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}