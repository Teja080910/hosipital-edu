"use client";

import { useState } from "react";
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
  const [uploading, setUploading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [videoUid, setVideoUid] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 200 * 1024 * 1024) {
      toast.error("File too large. Max 200MB.");
      return;
    }

    setUploading(true);
    try {
      const { data: uploadData } = await streamApi.getUploadUrl();
      const { uploadURL, uid } = uploadData;

      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      setVideoUid(uid);
      toast.success("Uploading video...");

      setPolling(true);
      const poll = setInterval(async () => {
        try {
          const { data: video } = await streamApi.getVideo(uid);
          if (video.readyToStream) {
            clearInterval(poll);
            setPolling(false);
            onUploadComplete({ uid, thumbnail: video.thumbnail, duration: video.duration });
            onOpenChange(false);
            toast.success("Video ready!");
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
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {uploading || polling ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {polling ? "Processing video..." : "Uploading..."}
              </p>
            </div>
          ) : (
            <Input type="file" accept="video/*" onChange={handleUpload} />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading || polling}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}