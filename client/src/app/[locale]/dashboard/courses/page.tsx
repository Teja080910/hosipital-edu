"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageTransition } from "@/components/page-transition";
import { CourseCard } from "@/components/courses/course-card";
import { BookOpen } from "lucide-react";

const mockCourses = [
  { id: "1", title: "Internal Medicine Fundamentals", description: "Comprehensive coverage of internal medicine core topics", thumbnail: "", progress: 65, lessons: 24, duration: "12h" },
  { id: "2", title: "Cardiology Board Review", description: "In-depth review of cardiology for board exams", thumbnail: "", progress: 30, lessons: 18, duration: "8h" },
  { id: "3", title: "Surgery Principles", description: "Essential surgical concepts and perioperative care", thumbnail: "", progress: 10, lessons: 20, duration: "10h" },
  { id: "4", title: "Pediatrics Complete", description: "Full pediatrics curriculum from neonatology to adolescence", thumbnail: "", progress: 0, lessons: 30, duration: "15h" },
];

export default function CoursesPage() {
  const t = useTranslations("nav");

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t("courses")}</h1>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}