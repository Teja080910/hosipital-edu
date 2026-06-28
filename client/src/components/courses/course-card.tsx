"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

interface CourseCardProps {
  course: {
    id: string;
    slug?: string;
    title: string;
    description: string;
    thumbnail: string;
    progress: number;
    lessons: number;
    duration: string;
  };
  enrolled?: boolean;
  onEnroll?: () => void;
  isEnrolling?: boolean;
}

export function CourseCard({ course, enrolled, onEnroll, isEnrolling }: CourseCardProps) {
  const t = useTranslations("courses");
  return (
    <Card className="overflow-hidden">
      <Link href={`/dashboard/courses/${course.slug || course.id}`}>
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="h-12 w-12 text-primary/40" />
          )}
        </div>
      </Link>
      <CardHeader>
        <Link href={`/dashboard/courses/${course.slug || course.id}`}>
          <CardTitle className="text-base hover:text-primary transition-colors">{course.title}</CardTitle>
        </Link>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {course.progress > 0 && <Progress value={course.progress} className="h-2" />}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {course.duration}
          </span>
          {course.lessons > 0 && <span>{course.lessons} {t("lessons")}</span>}
          {course.progress > 0 && <span>{course.progress}% {t("complete")}</span>}
        </div>
        {enrolled ? (
          <Button className="w-full" size="sm" variant="secondary" disabled>
            <CheckCircle className="h-4 w-4 mr-2" /> {t("enrolled_badge")}
          </Button>
        ) : onEnroll && (
          <Button className="w-full" size="sm" onClick={onEnroll} disabled={isEnrolling}>
            {isEnrolling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t("enroll_now")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}