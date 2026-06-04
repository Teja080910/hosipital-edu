"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import { ExamHistory } from "@/components/exams/exam-history";
import { GraduationCap, Clock } from "lucide-react";

const mockExams = [
  { id: "1", title: "ENARM", description: "Examen Nacional de Aspirantes a Residencias Médicas", questionCount: 200, timeLimit: 240, specialties: ["All"] },
  { id: "2", title: "MIR", description: "Médico Interno Residente - Spain", questionCount: 150, timeLimit: 180, specialties: ["All"] },
  { id: "3", title: "USMLE Step 1", description: "United States Medical Licensing Examination", questionCount: 280, timeLimit: 420, specialties: ["All"] },
  { id: "4", title: "PLAB", description: "Professional and Linguistic Assessments Board", questionCount: 100, timeLimit: 120, specialties: ["All"] },
];

export default function ExamsPage() {
  const t = useTranslations("nav");

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t("exams")}</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {mockExams.map((exam) => (
            <Card key={exam.id}>
              <CardHeader>
                <CardTitle>{exam.title}</CardTitle>
                <CardDescription>{exam.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span>{exam.questionCount} questions</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{exam.timeLimit} min</span>
                  </div>
                </div>
                <Button className="w-full">Start Exam</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Exam History</h2>
          <ExamHistory />
        </div>
      </div>
    </PageTransition>
  );
}