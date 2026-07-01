"use client";

import { CourseCard } from "@/components/courses/course-card";
import { PageTransition } from "@/components/page-transition";
import { useAuth } from "@/hooks/use-auth";
import { coursesApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { localizedText as localized } from "@/lib/utils";

interface Course {
  id: string;
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  shortDescription: Record<string, string> | null;
  coverImage: string | null;
  price: string;
  durationDays: number;
  hasCertificate: boolean;
  lessonCount?: number;
  sortOrder: number;
  examId: string | null;
}

function localized(obj: Record<string, string> | string | null | undefined, locale = "en"): string {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[locale] || Object.values(obj)[0] || "";
}

export default function CoursesPage() {
  const t = useTranslations("courses");
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [lockedSet, setLockedSet] = useState<Set<string>>(new Set());

  const fetchCourses = async () => {
    try {
      const { data } = await coursesApi.list();
      setCourses(data);
      if (user) {
        const checks = await Promise.allSettled(
          data.map((c: Course) => coursesApi.checkEnrollment(c.slug))
        );
        const enrolled = new Set<string>();
        const slugs: string[] = [];
        checks.forEach((res, i) => {
          if (res.status === "fulfilled" && res.value.data.enrolled) {
            enrolled.add(data[i].id);
            slugs.push(data[i].slug);
          }
        });
        setEnrolledIds(enrolled);

        const accessChecks = await Promise.allSettled(
          data.map((c: Course) => coursesApi.checkAccess(c.slug))
        );
        const locked = new Set<string>();
        accessChecks.forEach((res, i) => {
          if (res.status === "fulfilled" && !res.value.data.hasAccess && !enrolled.has(data[i].id)) {
            locked.add(data[i].id);
          }
        });
        setLockedSet(locked);

        // if user has access via subscription (not trial), mark as enrolled
        const subscribed = new Set<string>(enrolled);
        accessChecks.forEach((res, i) => {
          if (res.status === "fulfilled" && res.value.data.hasAccess && !res.value.data.isTrial && !enrolled.has(data[i].id)) {
            subscribed.add(data[i].id);
          }
        });
        setEnrolledIds(subscribed);

        const finalSlugs = data.filter((c: Course) => subscribed.has(c.id)).map((c: Course) => c.slug);
        if (finalSlugs.length > 0) {
          const progressResults = await Promise.allSettled(
            finalSlugs.map((s: string) => coursesApi.getProgress(s))
          );
          const pmap: Record<string, number> = {};
          progressResults.forEach((res, idx) => {
            if (res.status === "fulfilled") {
              const courseId = data.find((c: Course) => c.slug === finalSlugs[idx])?.id;
              if (courseId) pmap[courseId] = res.value.data.percentage || 0;
            }
          });
          setProgressMap(pmap);
        }
      }
    } catch {
      toast.error(t("load_failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleEnroll = async (courseId: string, slug: string) => {
    setEnrolling(courseId);
    try {
      const { data } = await coursesApi.enroll(slug);
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setEnrolledIds((prev) => new Set(prev).add(courseId));
      toast.success(t("enrolled"));
    } catch {
      toast.error(t("enroll_failed"));
    } finally {
      setEnrolling(null);
    }
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        </div>
        {courses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">{t("no_courses")}</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={{
                  id: course.id,
                  slug: course.slug,
                  title: localized(course.title),
                  description: localized(course.shortDescription) || localized(course.description),
                  thumbnail: course.coverImage || "",
                  progress: progressMap[course.id] || 0,
                  lessons: course.lessonCount || 0,
                  duration: `${course.durationDays} ${t("days")}`,
                }}
                enrolled={enrolledIds.has(course.id)}
                onEnroll={() => handleEnroll(course.id, course.slug)}
                isEnrolling={enrolling === course.id}
                locked={lockedSet.has(course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}