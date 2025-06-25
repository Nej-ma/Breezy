"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Pencil, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    UserPlaceholderIcon,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Schéma de validation
const editProfileSchema = z.object({
  avatar: z.any().optional(),
  banner: z.any().optional(),
  displayName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(
      /^[\p{L}0-9\s]+$/u,
      "Le nom ne peut contenir que des lettres, chiffres et espaces"
    )
    .optional(),
  bio: z
    .string()
    .max(160, "La bio ne peut pas dépasser 160 caractères")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .max(100, "La localisation ne peut pas dépasser 100 caractères")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val === "") return true;

      // Validation très permissive : au moins un point ou commence par http
      return val.includes(".") || val.startsWith("http");
    }, "Veuillez entrer un site web valide (ex: monsite.com)"),
});

// Types
type EditProfileData = z.infer<typeof editProfileSchema>;

type TextFieldConfig =
  | {
      name: "displayName";
      label: string;
      placeholder: string;
      textarea?: false;
      maxLength: number;
      required: boolean;
    }
  | {
      name: "bio";
      label: string;
      placeholder: string;
      textarea: true;
      maxLength: number;
      required?: boolean;
    };

interface EditProfileProps {
  user: {
    profilePicture?: string;
    coverPicture?: string;
    displayName?: string;
    bio?: string;
    location?: string;
    website?: string;
  };
  onSave: (data: EditProfileData) => void;
}

export function EditProfile({ user, onSave }: EditProfileProps) {
  const [open, setOpen] = useState(false);

  const handleSave = async (data: EditProfileData) => {
    try {
      await onSave(data);
      setOpen(false); // Fermer le dialog après succès
    } catch (error) {
      // Le dialog reste ouvert en cas d'erreur
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="rounded-full px-4 py-2 transition shadow-md bg-[var(--primary)] active:scale-95"
        >
          <Pencil className="w-4 h-4" />
          Modifier le profil
        </Button>
      </DialogTrigger>

      <DialogOverlay className="fixed inset-0 bg-[var(--primary)]/20 backdrop-blur-sm">
        <DialogContent
          showCloseButton={false}
          className="w-full sm:max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden rounded-xl border-0 shadow-2xl"
        >
          <EditProfileForm user={user} onSave={handleSave} />
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}

function EditProfileForm({ user, onSave }: EditProfileProps) {
  // État local
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.profilePicture || null
  );
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    user.coverPicture || null
  );

  // Configuration du formulaire
  const form = useForm<EditProfileData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      avatar: avatarPreview || "",
      banner: bannerPreview || "",
      displayName: user.displayName || "",
      bio: user.bio || "",
      location: user.location || "",
      website: user.website || "",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form;

  // Configuration des champs
  const textFields: TextFieldConfig[] = [
    {
      name: "displayName",
      label: "Nom affiché",
      placeholder: "Votre nom public",
      maxLength: 50,
      required: true,
    },
    {
      name: "bio",
      label: "Bio",
      placeholder: "Parlez-nous de vous...",
      textarea: true,
      maxLength: 160,
      required: false,
    },
  ];

  // Handlers
  const onSubmit = handleSubmit(onSave);

  const handleAvatarUrl = useCallback(() => {
    const url = window.prompt("Entrez l'URL de votre avatar :", avatarPreview || "");
    if (url && url.trim()) {
      setAvatarPreview(url.trim());
      form.setValue("avatar", url.trim());
    }
  }, [avatarPreview, form]);

  const handleBannerUrl = useCallback(() => {
    const url = window.prompt("Entrez l'URL de votre bannière :", bannerPreview || "");
    if (url && url.trim()) {
      setBannerPreview(url.trim());
      form.setValue("banner", url.trim());
    }
  }, [bannerPreview, form]);

  return (
    <>
      {/* Bouton de fermeture */}
      <DialogClose asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-20 rounded-full bg-white/50 hover:bg-white/80 transition-colors duration-150 text-gray-500 hover:text-gray-700 shadow-none p-1 w-6 h-6"
          aria-label="Fermer"
          type="button"
          style={{ backdropFilter: "blur(2px)" }}
        >
          <span className="sr-only">Fermer</span>
          <X className="w-4 h-4" />
        </Button>
      </DialogClose>

      {/* Header avec bannière */}
      <div className="relative h-40 bg-gradient-to-r from-blue-400 to-indigo-500">
        {bannerPreview && (
          <img
            src={bannerPreview}
            alt="Bannière"
            className="w-full h-full object-cover"
          />
        )}

        {/* Overlay pour changer la bannière - visible sur mobile, hover sur desktop */}
        <div
          className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-100 md:opacity-0 md:hover:opacity-100 transition-opacity cursor-pointer z-10"
          onClick={handleBannerUrl}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <div className="mb-12">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow"
              >
                <Camera className="w-4 h-4" />
                Changer la bannière
              </Button>
            </div>
          </div>
        </div>

        {/* Avatar avec bouton visible sur mobile */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-[50%] z-30">
          <div
            className="relative group cursor-pointer"
            onClick={handleAvatarUrl}
          >
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-lg">
              <AvatarImage src={avatarPreview || undefined} alt="Avatar" />
              <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white">
                <UserPlaceholderIcon className="w-10 h-10 sm:w-12 sm:h-12" />
              </AvatarFallback>
            </Avatar>
            {/* Overlay avatar - visible sur mobile, hover sur desktop */}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Contenu du formulaire */}
      <div className="flex flex-col h-full">
        {/* DialogHeader à gauche avec padding pour l'avatar */}
        <DialogHeader className="px-6 pt-16 pb-4 text-left">
          <DialogTitle className="text-xl font-bold">
            Modifier votre profil
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Personnalisez vos informations publiques.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <Form {...form}>
            <form
              id="edit-profile-form"
              onSubmit={onSubmit}
              className="space-y-4 pb-4"
            >
              {/* Inputs cachés pour les fichiers */}
              <Input
                type="hidden"
                value={avatarPreview || ""}
                {...form.register("avatar")}
              />
              <Input
                type="hidden"
                value={bannerPreview || ""}
                {...form.register("banner")}
              />

              {/* Champs de formulaire principaux */}
              {textFields.map(
                ({
                  name,
                  label,
                  placeholder,
                  textarea,
                  maxLength,
                  required,
                }) => (
                  <FormField
                    key={name}
                    control={control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold text-gray-700">
                          {label}
                        </FormLabel>
                        <FormControl>
                          {textarea ? (
                            <Textarea
                              {...field}
                              rows={3}
                              maxLength={maxLength}
                              className="rounded-lg border-gray-200 focus-visible:ring-[var(--primary-light)] focus-visible:ring-2 resize-none text-base"
                              placeholder={placeholder}
                              required={required}
                            />
                          ) : (
                            <Input
                              {...field}
                              maxLength={maxLength}
                              className="rounded-lg border-gray-200 focus-visible:ring-[var(--primary-light)] focus-visible:ring-2 text-base"
                              placeholder={placeholder}
                              required={required}
                            />
                          )}
                        </FormControl>
                        {name === "bio" && (
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Décrivez-vous en quelques mots</span>
                            <span>{field.value?.length ?? 0}/160</span>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )
              )}

              {/* Champs optionnels: Localisation / Site Web */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(
                  [
                    {
                      name: "location",
                      label: "Localisation",
                      placeholder: "Paris, France",
                    },
                    {
                      name: "website",
                      label: "Site web",
                      placeholder: "monsite.com",
                    },
                  ] as const
                ).map(({ name, label, placeholder }) => (
                  <FormField
                    key={name}
                    control={control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold text-gray-700">
                          {label}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            maxLength={name === "location" ? 100 : undefined}
                            className="rounded-lg border-gray-200 focus-visible:ring-[var(--primary-light)] focus-visible:ring-2 text-base"
                            placeholder={placeholder}
                            type="text"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </form>
          </Form>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <DialogClose asChild>
            <Button variant="outline" className="rounded-lg">
              Annuler
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="edit-profile-form"
            className="rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] hover:shadow-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </div>
    </>
  );
}

export { type EditProfileData };

