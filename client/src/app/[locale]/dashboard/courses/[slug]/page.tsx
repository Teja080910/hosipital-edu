"use client";

import { useTranslations } from "next-intl";
import { PageTransition } from "@/components/page-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { coursesApi } from "@/lib/api";
import { ChevronRight, Clock, DollarSign, FileQuestion, FileText, Loader2, Play } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CourseDetailPage() {
  const t = useTranslations("courses");
  const c = useTranslations("common");
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState<{ completed: number; total: number; percentage: number } | null>(null);

  useEffect(() => {
    coursesApi.get(slug).then(({ data }) => {
      setCourse(data);
      if (user) {
        coursesApi.checkEnrollment(slug).then(({ data: enrollment }) => {
          setIsEnrolled(enrollment.enrolled);
          if (enrollment.enrolled) {
            coursesApi.getProgress(slug).then(({ data: p }) => setProgress(p)).catch(() => {});
          }
        }).catch(() => {});
      }
    }).catch(() => toast.error(t("not_found"))).finally(() => setLoading(false));
  }, [slug, t, user]);

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
    try {
      await coursesApi.enroll(slug);
      setIsEnrolled(true);
      toast.success(t("enrolled"));
    } catch {
      toast.error(t("enroll_failed"));
    } finally {
      setEnrolling(false);
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
          <h2 className="text-xl font-semibold">{t("not_found")}</h2>
          <Button variant="link" onClick={() => router.back()}>{t("go_back")}</Button>
        </div>
      </PageTransition>
    );
  }

  const title = course.title?.en || course.title;
  const description = course.description?.en || "";
  const totalLessons = course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;
  const contentTypeIcon: Record<string, any> = { video: Play, pdf: FileText, text: FileText, quiz: FileQuestion };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground mt-1">{description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{totalLessons} {t("lessons")}</Badge>
          <Badge variant="secondary">{course.durationDays} {t("days_access")}</Badge>
          {course.hasCertificate && <Badge variant="outline">{t("certificate")}</Badge>}
          {parseFloat(course.price) > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> ${course.price}
            </Badge>
          )}
        </div>

        {!isEnrolled && (
          <Button size="lg" onClick={handleEnroll} disabled={enrolling}>
            {enrolling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {parseFloat(course.price) > 0 ? `Enroll - $${course.price}` : t("enroll_free")}
          </Button>
        )}
        {isEnrolled && <Badge className="text-sm px-3 py-1">{t("enrolled_badge")}</Badge>}
        {progress && progress.percentage > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("progress")}</span>
              <span className="font-medium">{progress.completed}/{progress.total} ({progress.percentage}%)</span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
          </div>
        )}

        <Separator />

        <div>
          <h2 className="text-xl font-semibold mb-4">{t("course_content")}</h2>
          {course.modules?.length === 0 && (
            <p className="text-muted-foreground">{t("no_content")}</p>
          )}
          <div className="space-y-4">
            {course.modules?.map((mod: any, mi: number) => {
              const modTitle = mod.title?.en || mod.title;
              return (
                <Card key={mod.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="text-muted-foreground">{t("module")} {mi + 1}</span>
                      <Separator orientation="vertical" className="h-4" />
                      {modTitle}
                    </CardTitle>
                    {mod.description && (
                      <p className="text-sm text-muted-foreground mt-1">{mod.description?.en || mod.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {mod.lessons?.map((lesson: any) => {
                      const Icon = contentTypeIcon[lesson.contentType] || Play;
                      const lessonTitle = lesson.title?.en || lesson.title;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => router.push(`/dashboard/courses/${course.slug}/lessons/${lesson.id}`)}
                          className="w-full flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="rounded-full bg-muted p-1.5">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{lessonTitle}</p>
                          </div>
                          {lesson.duration > 0 && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                              <Clock className="h-3 w-3" />
                              {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, "0")}
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}