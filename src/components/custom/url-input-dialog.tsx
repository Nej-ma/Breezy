"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
  const [showConfirm, setShowConfirm] = useState(false);

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
        <DialogFooter className="flex flex-row items-center justify-between gap-2">
          {/* Bouton Retirer avec confirmation AlertDialog */}
          <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:bg-red-50"
                title="Retirer"
                aria-label="Retirer"
                disabled={value === ""}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Retirer l'image ?</AlertDialogTitle>
              </AlertDialogHeader>
              <p>Voulez-vous vraiment retirer cette image ?</p>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onValidate("");
                    onOpenChange(false);
                  }}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Retirer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex gap-2 ml-auto">
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
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
