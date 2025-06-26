"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MediaUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialImage?: string;
  initialVideo?: string;
  onValidate: (urls: { image: string; video: string }) => void;
}

export function MediaUrlDialog({
  open,
  onOpenChange,
  initialImage = "",
  initialVideo = "",
  onValidate,
}: MediaUrlDialogProps) {
  const [image, setImage] = useState(initialImage);
  const [video, setVideo] = useState(initialVideo);

  useEffect(() => {
    setImage(initialImage || "");
    setVideo(initialVideo || "");
  }, [open, initialImage, initialVideo]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Ajouter des médias</DialogTitle>
        </DialogHeader>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Image (URL)</label>
          <Input
            type="url"
            placeholder="https://..."
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="mb-1"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Vidéo (URL)</label>
          <Input
            type="url"
            placeholder="https://..."
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            className="mb-1"
          />
        </div>
        <DialogFooter className="flex flex-row items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Annuler
          </Button>
          <Button
            onClick={() => {
              onValidate({ image: image.trim(), video: video.trim() });
              onOpenChange(false);
            }}
            disabled={!image.trim() && !video.trim()}
            type="button"
          >
            Valider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
