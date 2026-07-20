"use client";

import { useTranslations } from "next-intl";
import { PageTransition } from "@/components/page-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { coursesApi, certificatesApi } from "@/lib/api";
import { CourseQuiz } from "@/components/courses/course-quiz";
import { ChevronRight, Clock, DollarSign, FileQuestion, FileText, Loader2, Play, Award, ClipboardCheck, BarChart3 } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "@/routing";
import { useEffect, useRef, useState, Suspense } from "react";
import { toast } from "sonner";
import { localizedText } from "@/lib/utils";

export default function CourseDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <CourseDetail />
    </Suspense>
  );
}

function CourseDetail() {
  const t = useTranslations("courses");
  const c = useTranslations("common");
  const { slug, locale } = useParams<{ slug: string; locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState<{ completed: number; total: number; percentage: number; lessons: any[] } | null>(null);
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [generatingCert, setGeneratingCert] = useState(false);

  const [preTest, setPreTest] = useState<any>(null);
  const [postTest, setPostTest] = useState<any>(null);
  const [testResults, setTestResults] = useState<{ pre_test?: any; post_test?: any } | null>(null);
  const [showPreTest, setShowPreTest] = useState(false);
  const [showPostTest, setShowPostTest] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

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

  useEffect(() => {
    if (searchParams.get("enroll") === "success") {
      setIsEnrolled(true);
      toast.success(t("enrolled"));
      const url = new URL(window.location.href);
      url.searchParams.delete("enroll");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.toString());
      coursesApi.getProgress(slug).then(({ data: p }) => setProgress(p)).catch(() => {});
      coursesApi.getPreTest(slug).then(({ data }) => setPreTest(data)).catch(() => {});
      coursesApi.getPostTest(slug).then(({ data }) => setPostTest(data)).catch(() => {});
      coursesApi.getTestResults(slug).then(({ data }) => setTestResults(data)).catch(() => {});
    }
  }, [searchParams, slug, t]);

  useEffect(() => {
    if (!isEnrolled || !slug) return;
    coursesApi.getPreTest(slug).then(({ data }) => setPreTest(data)).catch(() => {});
    coursesApi.getPostTest(slug).then(({ data }) => setPostTest(data)).catch(() => {});
    coursesApi.getTestResults(slug).then(({ data }) => setTestResults(data)).catch(() => {});
  }, [isEnrolled, slug]);

  const autoGenerateCert = useRef(false);
  useEffect(() => {
    if (progress && progress.percentage === 100 && course?.hasCertificate && !autoGenerateCert.current) {
      autoGenerateCert.current = true;
      certificatesApi.list().then(({ data: certs }) => {
        const existing = certs.find((c: any) => c.courseId === course.id);
        if (existing) {
          setCertificateId(existing.id);
        } else {
          certificatesApi.generate(course.id).then(({ data }) => {
            setCertificateId(data.id);
            toast.success(t("certificate_generated"));
          }).catch(() => {});
        }
      }).catch(() => {});
    }
  }, [progress, course, t]);

  const handleGenerateCertificate = async () => {
    if (!course) return;
    setGeneratingCert(true);
    try {
      const { data } = await certificatesApi.generate(course.id);
      setCertificateId(data.id);
      toast.success(t("certificate_generated"));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("certificate_failed"));
    } finally {
      setGeneratingCert(false);
    }
  };

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
    try {
      const { data } = await coursesApi.enroll(slug);
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setIsEnrolled(true);
      toast.success(t("enrolled"));
      coursesApi.getProgress(slug).then(({ data: p }) => setProgress(p)).catch(() => {});
      coursesApi.getPreTest(slug).then(({ data }) => setPreTest(data)).catch(() => {});
      coursesApi.getPostTest(slug).then(({ data }) => setPostTest(data)).catch(() => {});
      coursesApi.getTestResults(slug).then(({ data }) => setTestResults(data)).catch(() => {});
    } catch (err: any) {
      toast.error(err?.response?.data?.message?.[0] || err?.response?.data?.message || t("enroll_failed"));
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

  const title = course.title?.en || "";
  const description = course.description?.en || "";
  const totalLessons = course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;
  const contentTypeIcon: Record<string, any> = { video: Play, pdf: FileText, text: FileText, quiz: FileQuestion };
  const progressCompleted = progress ? (progress.completed || 0) : 0;
  const progressTotal = progress ? (progress.total || 0) : 0;
  const progressPct = progress ? (progress.percentage || 0) : 0;
  const allLessonsCompleted = progressTotal > 0 && progressCompleted >= progressTotal;

  const renderQuizCard = (quiz: any, type: "pre_test" | "post_test") => {
    const result = testResults?.[type];
    const label = type === "pre_test" ? t("pre_test") : t("post_test");
    const Icon = type === "pre_test" ? ClipboardCheck : BarChart3;

    if (showPreTest && type === "pre_test") {
      return (
        <CourseQuiz
          quiz={quiz}
          onComplete={(passed, score) => {
            setShowPreTest(false);
            coursesApi.getTestResults(slug).then(({ data }) => setTestResults(data)).catch(() => {});
            if (passed) toast.success(t("pre_test_passed"));
          }}
        />
      );
    }

    if (showPostTest && type === "post_test") {
      return (
        <CourseQuiz
          quiz={quiz}
          onComplete={(passed, score) => {
            setShowPostTest(false);
            coursesApi.getTestResults(slug).then(({ data }) => setTestResults(data)).catch(() => {});
            if (passed) toast.success(t("post_test_passed"));
          }}
        />
      );
    }

    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">{label}</p>
              {result ? (
                <p className="text-sm text-muted-foreground">
                  {t("score")}: {result.score}% — {new Date(result.completedAt).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {type === "pre_test"
                    ? t("pre_test_desc")
                    : t("post_test_desc")}
                </p>
              )}
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              if (type === "pre_test") setShowPreTest(true);
              else setShowPostTest(true);
            }}
          >
            {result ? t("retake") : t("start")}
          </Button>
        </CardContent>
      </Card>
    );
  };

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

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {showDetails ? <ChevronRight className="h-4 w-4 rotate-90 transition-transform" /> : <ChevronRight className="h-4 w-4 transition-transform" />}
          {t("course_details")}
        </button>

        {showDetails && (
          <Card>
            <CardContent className="space-y-4 p-4">
              {course.introduction?.en && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("introduction")}</h3>
                  <p className="text-sm mt-1">{course.introduction.en}</p>
                </div>
              )}
              {course.objectives?.en && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("objectives")}</h3>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{course.objectives.en}</p>
                </div>
              )}
              {course.targetAudience?.en && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("target_audience")}</h3>
                  <p className="text-sm mt-1">{course.targetAudience.en}</p>
                </div>
              )}
              {course.prerequisites?.en && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("prerequisites")}</h3>
                  <p className="text-sm mt-1">{course.prerequisites.en}</p>
                </div>
              )}
              {course.whatYouWillLearn?.en && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("what_you_will_learn")}</h3>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{course.whatYouWillLearn.en}</p>
                </div>
              )}
              {!course.introduction?.en && !course.objectives?.en && !course.targetAudience?.en && !course.prerequisites?.en && !course.whatYouWillLearn?.en && (
                <p className="text-sm text-muted-foreground">{t("no_details")}</p>
              )}
            </CardContent>
          </Card>
        )}

        {course.preExamInstructions?.en && isEnrolled && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 p-4">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">{t("pre_exam_instructions")}</p>
            <p className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap">{course.preExamInstructions.en}</p>
          </div>
        )}

        {course.postExamInstructions?.en && progressPct === 100 && (
          <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 p-4">
            <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">{t("post_exam_instructions")}</p>
            <p className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap">{course.postExamInstructions.en}</p>
          </div>
        )}

        {!isEnrolled && (
          <Button size="lg" onClick={handleEnroll} disabled={enrolling}>
            {enrolling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {parseFloat(course.price) > 0 ? `${t("enroll")} - $${course.price}` : t("enroll_free")}
          </Button>
        )}
        {isEnrolled && <Badge className="text-sm px-3 py-1">{t("enrolled_badge")}</Badge>}
        {progress && progressPct > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("progress")}</span>
              <span className="font-medium">{progressCompleted}/{progressTotal} ({progressPct}%)</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>
        )}

        {isEnrolled && preTest && renderQuizCard(preTest, "pre_test")}

        {progress && allLessonsCompleted && course?.hasCertificate && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
            <Award className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="font-medium">{t("course_complete")}</p>
              <p className="text-sm text-muted-foreground">{t("certificate_available")}</p>
            </div>
            {certificateId ? (
              <Button variant="outline" asChild>
                <a href={`/${locale}/dashboard/certificates/${certificateId}`} target="_blank">{t("view_certificate")}</a>
              </Button>
            ) : (
              <Button onClick={handleGenerateCertificate} disabled={generatingCert}>
                {generatingCert && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t("get_certificate")}
              </Button>
            )}
          </div>
        )}

        {isEnrolled && testResults?.pre_test && testResults?.post_test && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {t("test_comparison")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t("pre_test")}</p>
                  <p className="text-2xl font-bold text-blue-500">{testResults.pre_test.score}%</p>
                </div>
                <div className="text-2xl text-muted-foreground">→</div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t("post_test")}</p>
                  <p className="text-2xl font-bold text-green-500">{testResults.post_test.score}%</p>
                </div>
                <div className="flex-1" />
                <div className="text-center p-3 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">{t("improvement")}</p>
                  <p className="text-xl font-bold text-primary">
                    +{testResults.post_test.score - testResults.pre_test.score}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isEnrolled && allLessonsCompleted && postTest && renderQuizCard(postTest, "post_test")}

        <Separator />

        <div>
          <h2 className="text-xl font-semibold mb-4">{t("course_content")}</h2>
          {course.modules?.length === 0 && (
            <p className="text-muted-foreground">{t("no_content")}</p>
          )}
          <div className="space-y-4">
            {course.modules?.map((mod: any, mi: number) => {
              const modTitle = localizedText(mod.title, locale) || "";
                      return (
                        <Card key={mod.id}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <span className="text-muted-foreground">{t("module")} {mi + 1}</span>
                              <Separator orientation="vertical" className="h-4" />
                              {modTitle}
                            </CardTitle>
                            {mod.description && (
                              <p className="text-sm text-muted-foreground mt-1">{localizedText(mod.description, locale) || ""}</p>
                            )}
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {mod.lessons?.map((lesson: any) => {
                      const Icon = contentTypeIcon[lesson.contentType] || Play;
                      const lessonTitle = localizedText(lesson.title, locale) || "";
                      const isCompleted = progress?.lessons?.find((l: any) => l.lessonId === lesson.id)?.isCompleted;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => router.push(`/dashboard/courses/${course.slug}/lessons/${lesson.id}`)}
                          className="w-full flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className={`rounded-full p-1.5 ${isCompleted ? "bg-green-100 dark:bg-green-950/30" : "bg-muted"}`}>
                            <Icon className={`h-4 w-4 ${isCompleted ? "text-green-600" : "text-muted-foreground"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{lessonTitle}</p>
                          </div>
                          {isCompleted && <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600 border-green-200">{t("done")}</Badge>}
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
