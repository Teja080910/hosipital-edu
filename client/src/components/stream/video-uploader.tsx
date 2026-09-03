"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { streamApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface VideoUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (result: { uid: string; thumbnail: string; duration: number }) => void;
}

export function VideoUploader({ open, onOpenChange, onUploadComplete }: VideoUploaderProps) {
  const t = useTranslations("videos");
  const [uploading, setUploading] = useState(false);
  const [polling, setPolling] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 200 * 1024 * 1024) {
      toast.error(t("file_too_large"));
      return;
    }

    let uid: string | null = null;
    setUploading(true);
    try {
      const { data: upload } = await streamApi.getUploadUrl();
      uid = upload.uid;
      if (!uid || !upload.uploadURL) throw new Error("No upload URL returned");

      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(upload.uploadURL, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      toast.success(t("uploading_video"));

      setPolling(true);
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      const poll = setInterval(async () => {
        try {
          const { data: video } = await streamApi.getVideo(uid!);
          if (video.readyToStream) {
            clearInterval(poll);
            if (timeoutId) clearTimeout(timeoutId);
            setPolling(false);
            onUploadComplete({ uid: uid!, thumbnail: video.thumbnail, duration: video.duration });
            onOpenChange(false);
            toast.success(t("video_ready"));
          } else if (video.status?.state === "error" || video.status?.errorReasonCode) {
            clearInterval(poll);
            if (timeoutId) clearTimeout(timeoutId);
            setPolling(false);
            await streamApi.deleteVideo(uid!).catch(() => {});
            toast.error(t("upload_failed"));
          }
        } catch {
          clearInterval(poll);
          if (timeoutId) clearTimeout(timeoutId);
          setPolling(false);
          await streamApi.deleteVideo(uid!).catch(() => {});
          toast.error(t("upload_failed"));
        }
      }, 2000);

      timeoutId = setTimeout(() => {
        clearInterval(poll);
        setPolling(false);
        if (uid) {
          streamApi.deleteVideo(uid).catch(() => {});
          toast.error(t("upload_failed"));
        }
      }, 120000);
    } catch (err: any) {
      if (uid) await streamApi.deleteVideo(uid).catch(() => {});
      toast.error(err?.message?.replace(/Error: /, "") || t("upload_failed"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("upload_video")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {uploading || polling ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {polling ? t("processing_video") : t("uploading")}
              </p>
            </div>
          ) : (
            <Input type="file" accept="video/*" onChange={handleUpload} />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading || polling}>
            {t("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}