"use client";

import { useTranslations } from "next-intl";
import { PageTransition } from "@/components/page-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

  useEffect(() => {
    if (!slug || !lessonId) return;
    coursesApi.get(slug).then(({ data }) => {
      const found: any[] = [];
      data.modules?.forEach((m: any) => {
        m.lessons?.forEach((l: any) => {
          if (l.id === lessonId) found.push(l);
        });
      });
      if (found.length > 0) setLesson(found[0]);
      else toast.error(t("not_found"));
    }).catch(() => toast.error(t("load_failed"))).finally(() => setLoading(false));
  }, [slug, lessonId, t]);

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
          {lesson.contentType === "video" && lesson.videoUrl && (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              {lesson.videoUrl.includes("cloudflare.com") || lesson.videoUrl.includes("stream") ? (
                <iframe src={lesson.videoUrl} className="w-full h-full rounded-lg" allowFullScreen />
              ) : (
                <video src={lesson.videoUrl} controls className="w-full h-full rounded-lg" />
              )}
            </div>
          )}

          {lesson.contentType === "pdf" && lesson.pdfUrl && (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <a href={lesson.pdfUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary underline">{t("open_pdf")}</a>
            </div>
          )}

          {lesson.contentType === "text" && lesson.content && (
            <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
          )}

          {lesson.contentType === "quiz" && (
            <div className="text-center py-16 text-muted-foreground">
              <p>{t("quiz_coming")}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => router.back()}>{t("back_to_course")}</Button>
          <Button>
            <CheckCircle className="h-4 w-4 mr-2" /> {t("mark_complete")}
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}