"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle, Clock, Loader2, Lock } from "lucide-react";
import { Link } from "@/routing";
import { useRouter } from "@/routing";

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
  locked?: boolean;
}

export function CourseCard({ course, enrolled, onEnroll, isEnrolling, locked }: CourseCardProps) {
  const t = useTranslations("courses");
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (locked) {
      e.preventDefault();
      router.push("/dashboard/subscribe");
    }
  };

  return (
    <Card className="overflow-hidden relative">
      <div onClick={handleClick}>
        <Link href={locked ? "#" : `/dashboard/courses/${course.slug || course.id}`}>
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="h-12 w-12 text-primary/40" />
            )}
          </div>
        </Link>
      </div>
      <CardHeader>
        <div onClick={handleClick}>
          <Link href={locked ? "#" : `/dashboard/courses/${course.slug || course.id}`}>
            <CardTitle className="text-base hover:text-primary transition-colors">{course.title}</CardTitle>
          </Link>
        </div>
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
        ) : locked ? (
          <Button className="w-full" size="sm" onClick={() => router.push("/dashboard/subscribe")}>
            <Lock className="h-4 w-4 mr-2" /> {t("subscribe_to_access")}
          </Button>
        ) : onEnroll && (
          <Button className="w-full" size="sm" onClick={onEnroll} disabled={isEnrolling}>
            {isEnrolling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t("enroll_now")}
          </Button>
        )}
      </CardContent>
      {locked && (
        <div className="absolute inset-0 backdrop-blur-[2px] bg-background/10 rounded-xl pointer-events-none" />
      )}
    </Card>
  );
}