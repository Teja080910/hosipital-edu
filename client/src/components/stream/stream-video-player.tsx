"use client";

import { useEffect, useRef } from "react";
import { streamApi, videosApi } from "@/lib/api";

interface StreamVideoPlayerProps {
  uid?: string | null;
  lessonId?: string;
  className?: string;
}

export function StreamVideoPlayer({ uid, lessonId, className }: StreamVideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const savedRef = useRef<number>(0);

  if (!uid) return null;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let seek = 0;
      if (lessonId) {
        try {
          const { data } = await videosApi.getProgress(lessonId);
          if (data?.watchedSeconds) seek = data.watchedSeconds;
        } catch {}
      }

      if (cancelled) return;

      let src = `https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${uid}/iframe`;
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
            "*",
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

  return (
    <div className={cn("relative aspect-video bg-black rounded-lg overflow-hidden", className)}>
      <iframe
        ref={iframeRef}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        title="Video player"
      />
    </div>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}