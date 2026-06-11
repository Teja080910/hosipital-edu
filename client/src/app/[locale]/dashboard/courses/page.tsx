"use client";

import { CourseCard } from "@/components/courses/course-card";
import { PageTransition } from "@/components/page-transition";
import { useAuth } from "@/hooks/use-auth";
import { coursesApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
        if (slugs.length > 0) {
          const progressResults = await Promise.allSettled(
            slugs.map((s) => coursesApi.getProgress(s))
          );
          const pmap: Record<string, number> = {};
          let idx = 0;
          for (const id of enrolled) {
            const res = progressResults[idx];
            if (res.status === "fulfilled") {
              pmap[id] = res.value.data.percentage || 0;
            }
            idx++;
          }
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
      await coursesApi.enroll(slug);
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
              />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}