"use client";

// hooks
import { useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/auth-provider";

import { toast } from "sonner";

// components UI
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteUserProps {
  userId: string;
  username: string;
}

export function DeleteUser({ userId, username }: DeleteUserProps) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    console.log("Deleting user with ID:", userId);

    try {
      setIsDeleting(true);
      await userService.deleteUser(userId);
      toast.success(t("users.deleteSuccess", "Compte supprimé avec succès"));
      setIsOpen(false);
      // Rediriger vers la page de connexion après la suppression

      await logout();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(
        t(
          "users.deleteError",
          "Une erreur est survenue lors de la suppression du compte"
        )
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full text-red-500 hover:bg-red-50">
          <Trash2 className="w-4 h-4 mr-2 text-red-500" />
          {t("users.deleteAccount", "Supprimer le compte")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("users.deleteConfirmTitle", "Supprimer le compte")}
          </DialogTitle>
          <DialogDescription>
            {t("users.deleteConfirmDescription", {
              username: username,
              defaultValue:
                "Êtes-vous sûr de vouloir supprimer le compte de {{username}} ? Cette action est irréversible et supprimera toutes vos données.",
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            {t("common.cancel", "Annuler")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("common.deleting", "Suppression en cours...")}
              </>
            ) : (
              t("users.confirmDelete", "Oui, supprimer le compte")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
