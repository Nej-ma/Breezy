"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UrlInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValue?: string;
  onValidate: (url: string) => void;
}

export function UrlInputDialog({
  open,
  onOpenChange,
  title,
  initialValue,
  onValidate,
}: UrlInputDialogProps) {
  const [value, setValue] = useState(initialValue || "");

  useEffect(() => {
    setValue(initialValue || "");
  }, [open, initialValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          type="url"
          placeholder="https://..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mb-2"
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Annuler
          </Button>
          <Button
            onClick={() => {
              onValidate(value.trim());
              onOpenChange(false);
            }}
            disabled={!value.trim()}
            type="button"
          >
            Valider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
