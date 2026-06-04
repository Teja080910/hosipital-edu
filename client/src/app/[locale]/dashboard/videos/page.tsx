"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import { Play, Clock, BookOpen } from "lucide-react";

const mockVideos = [
  { id: "1", title: "Cardiac Auscultation: Heart Sounds", instructor: "Dr. Maria Garcia", duration: "25:30", category: "Cardiology", views: "2.4k" },
  { id: "2", title: "Interpretation of ABG Made Easy", instructor: "Dr. James Wilson", duration: "18:45", category: "Pulmonology", views: "3.1k" },
  { id: "3", title: "ECG Interpretation: Bundle Branch Blocks", instructor: "Dr. Sarah Chen", duration: "32:10", category: "Cardiology", views: "1.8k" },
  { id: "4", title: "Approach to Abdominal Pain", instructor: "Dr. John Smith", duration: "22:00", category: "Surgery", views: "4.2k" },
  { id: "5", title: "Neurological Examination", instructor: "Dr. Emily Davis", duration: "45:00", category: "Neurology", views: "3.7k" },
  { id: "6", title: "Pediatric Growth Milestones", instructor: "Dr. Lisa Brown", duration: "15:20", category: "Pediatrics", views: "1.5k" },
];

export default function VideosPage() {
  const t = useTranslations("videos");

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden cursor-pointer">
              <div className="aspect-video bg-muted flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-primary/90 flex items-center justify-center">
                    <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-base">{video.title}</CardTitle>
                <CardDescription>{video.instructor}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {video.duration}
                  </span>
                  <Badge variant="secondary" className="text-xs">{video.category}</Badge>
                  <span>{video.views} {t("views")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}