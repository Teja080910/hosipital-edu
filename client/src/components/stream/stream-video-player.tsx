"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { VideoOff } from "lucide-react";
import { streamApi, videosApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface StreamVideoPlayerProps {
  uid?: string | null;
  lessonId?: string;
  className?: string;
}

export function StreamVideoPlayer({ uid, lessonId, className }: StreamVideoPlayerProps) {
  const t = useTranslations("videos");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const savedRef = useRef<number>(0);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    setMissing(false);

    (async () => {
      try {
        await streamApi.getVideo(uid);
      } catch {
        if (!cancelled) setMissing(true);
        return;
      }

      let seek = 0;
      if (lessonId) {
        try {
          const { data } = await videosApi.getProgress(lessonId);
          if (data?.watchedSeconds) seek = data.watchedSeconds;
        } catch {}
      }

      if (cancelled) return;

      let src = `https://iframe.cloudflarestream.com/${uid}`;
      try {
        const { data } = await streamApi.getSignedToken(uid);
        src += `?token=${data.token}`;
      } catch {}

      if (iframeRef.current) iframeRef.current.src = src;

      // Seek after player loads
      if (seek > 0) {
        let attempts = 0;
        const id = setInterval(() => {
          if (++attempts > 10) { clearInterval(id); return; }
          iframeRef.current?.contentWindow?.postMessage(
            { __privateUnstableMessageType: "setProperty", property: "currentTime", value: seek },
            "https://iframe.cloudflarestream.com",
          );
        }, 1000);
      }
    })();

    const onMessage = (event: MessageEvent) => {
      if (!event.data) return;
      const d = event.data;
      if (d.__privateUnstableMessageType === "propertyChange" && d.property === "currentTime") {
        if (!lessonId) return;
        const seconds = Math.floor(d.value);
        if (seconds % 15 === 0 && seconds > 0 && seconds !== savedRef.current) {
          savedRef.current = seconds;
          videosApi.saveProgress(lessonId, seconds);
        }
      }
    };

    window.addEventListener("message", onMessage);
    return () => {
      cancelled = true;
      window.removeEventListener("message", onMessage);
    };
  }, [uid, lessonId]);

  if (!uid) return null;

  if (missing) {
    return (
      <div className={cn("relative aspect-video bg-muted rounded-lg overflow-hidden flex flex-col items-center justify-center gap-2 text-center p-4", className)}>
        <VideoOff className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">{t("video_not_found")}</p>
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-video bg-black rounded-lg overflow-hidden", className)}>
      <iframe
        ref={iframeRef}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        title={t("video_player")}
      />
    </div>
  );
}

