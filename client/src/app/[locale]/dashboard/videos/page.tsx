"use client";

import { PageTransition } from "@/components/page-transition";
import { AccountTypeGate } from "@/components/account-type-gate";
import { StreamVideoPlayer } from "@/components/stream/stream-video-player";
import { Badge } from "@/components/ui/badge";
import { videosApi } from "@/lib/api";
import { BookOpen, Clock, Loader2, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

function localized(obj: Record<string, string> | string | null | undefined, locale = "en"): string {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[locale] || Object.values(obj)[0] || "";
}

export default function VideosPage() {
  const t = useTranslations("videos");
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<any | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);

  useEffect(() => {
    videosApi.list().then(({ data }) => {
      setModules(data);
      if (data.length > 0) {
        setSelectedModule(data[0]);
        if (data[0].lessons?.length > 0) {
          setSelectedLesson(data[0].lessons[0]);
        }
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }

  if (modules.length === 0) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">{t("noVideos")}</h2>
          <p className="text-muted-foreground">{t("noVideosDesc")}</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <AccountTypeGate>
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <div className="space-y-4">
            {modules.map((mod: any) => (
              <div key={mod.id} className="space-y-1">
                <button
                  onClick={() => { setSelectedModule(mod); setSelectedLesson(mod.lessons?.[0] || null); }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedModule?.id === mod.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted border border-transparent"
                  }`}
                >
                  <p className="font-medium text-sm">{localized(mod.title)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("lessons_count", { count: mod.lessons?.length || 0 })}</p>
                </button>
                {selectedModule?.id === mod.id && mod.lessons?.map((lesson: any) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-left pl-6 pr-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                      selectedLesson?.id === lesson.id ? "bg-primary/5 text-primary font-medium" : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Play className="h-3 w-3 shrink-0" />
                    <span className="truncate">{localized(lesson.title)}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div>
            {selectedLesson ? (
              <div className="space-y-4">
                {selectedLesson.videoUrl ? (
                  <StreamVideoPlayer uid={selectedLesson.videoUrl} lessonId={selectedLesson.id} />
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Play className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">{t("video_placeholder")}</p>
                    </div>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold">{localized(selectedLesson.title)}</h2>
                  <p className="text-muted-foreground mt-1">{localized(selectedLesson.description)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {selectedLesson.duration}s
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">{t("select_lesson")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
    </AccountTypeGate>
  );
}