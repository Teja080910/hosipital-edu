"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { streamApi, uploadApi } from "@/lib/api";
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

    setUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1] || "");
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data: result } = await uploadApi.uploadVideo("direct", base64, file.type);
      const uid = result.uid;
      if (!uid) throw new Error("No UID returned");
      toast.success(t("uploading_video"));

      setPolling(true);
      const poll = setInterval(async () => {
        try {
          const { data: video } = await streamApi.getVideo(uid);
          if (video.readyToStream) {
            clearInterval(poll);
            setPolling(false);
            onUploadComplete({ uid, thumbnail: video.thumbnail, duration: video.duration });
            onOpenChange(false);
            toast.success(t("video_ready"));
          }
        } catch {
          clearInterval(poll);
          setPolling(false);
        }
      }, 2000);

      setTimeout(() => {
        clearInterval(poll);
        setPolling(false);
      }, 60000);
    } catch (err: any) {
      toast.error(err?.message || t("upload_failed"));
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