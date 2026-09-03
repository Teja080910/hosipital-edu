"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);

  const normalizedUid = useMemo<string | undefined>(() => {
    if (!uid) return undefined;
    const s = String(uid);
    if (/^[a-f0-9]{32}$/.test(s)) return s;
    const m = s.match(/[a-f0-9]{32}/);
    return m ? m[0] : undefined;
  }, [uid]);

  useEffect(() => {
    if (!normalizedUid) return;
    let cancelled = false;
    setMissing(false);
    setLoadError(false);

    (async () => {
      let src = `https://iframe.cloudflarestream.com/${normalizedUid}`;
      try {
        const { data } = await streamApi.getSignedToken(normalizedUid);
        src += `?token=${data.token}`;
      } catch (err: any) {
        if (cancelled) return;
        console.error("[StreamVideoPlayer] failed to load video", err);
        if (err?.response?.status === 404) {
          setMissing(true);
        } else {
          setLoadError(true);
        }
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
  }, [normalizedUid, lessonId, retry]);

  if (!normalizedUid) return null;

  if (missing) {
    return (
      <div className={cn("relative aspect-video bg-muted rounded-lg overflow-hidden flex flex-col items-center justify-center gap-2 text-center p-4", className)}>
        <VideoOff className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">{t("video_not_found")}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={cn("relative aspect-video bg-muted rounded-lg overflow-hidden flex flex-col items-center justify-center gap-3 text-center p-4", className)}>
        <VideoOff className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">{t("video_load_failed")}</p>
        <Button size="sm" variant="secondary" onClick={() => { setLoadError(false); setRetry((r) => r + 1); }}>
          <RefreshCw className="h-4 w-4 mr-2" /> {t("retry")}
        </Button>
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

