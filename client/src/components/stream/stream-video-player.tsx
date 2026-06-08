"use client";

import { useEffect, useRef } from "react";
import { streamApi } from "@/lib/api";

interface StreamVideoPlayerProps {
  uid: string;
  className?: string;
}

export function StreamVideoPlayer({ uid, className }: StreamVideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    streamApi.getSignedToken(uid)
      .then(({ data }) => {
        if (iframeRef.current) {
          iframeRef.current.src = `https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${uid}/iframe?token=${data.token}`;
        }
      })
      .catch(() => {
        if (iframeRef.current) {
          iframeRef.current.src = `https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${uid}/iframe`;
        }
      });
  }, [uid]);

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