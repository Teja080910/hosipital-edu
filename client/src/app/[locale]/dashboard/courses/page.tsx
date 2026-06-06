"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { CourseCard } from "@/components/courses/course-card";
import { coursesApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, BookOpen } from "lucide-react";

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
}

function localized(obj: Record<string, string> | string | null | undefined, locale = "en"): string {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[locale] || Object.values(obj)[0] || "";
}

export default function CoursesPage() {
  const t = useTranslations("courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    coursesApi.list().then(({ data }) => setCourses(data)).catch(() => toast.error(t("load_failed"))).finally(() => setLoading(false));
  }, [t]);

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    try {
      await coursesApi.enroll(courseId);
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
                  progress: 0,
                  lessons: 0,
                  duration: `${course.durationDays} ${t("days")}`,
                }}
                onEnroll={() => handleEnroll(course.id)}
                isEnrolling={enrolling === course.id}
              />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}