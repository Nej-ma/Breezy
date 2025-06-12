"use client";

// service
import { userService } from "@/services/authService";

// hooks
import { useTranslation } from "react-i18next";
import * as React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// ui components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { DialogTrigger } from "@radix-ui/react-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define the initial schema without translations
const createForgotPasswordSchema = (t: any) =>
  yup.object().shape({
    email: yup
      .string()
      .email(t("auth.form.invalidEmail", "Email invalide"))
      .required(t("auth.form.required", "Ce champ est requis")),
  });

export default function RequestPasswordDialog() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordSchema, setForgotPasswordSchema] = useState(() =>
    createForgotPasswordSchema(t)
  );

  // Update validation schema when language changes
  useEffect(() => {
    setForgotPasswordSchema(createForgotPasswordSchema(t));
  }, [t, i18n.language]);

  // Define form values type
  type ForgotPasswordFormValues = yup.InferType<typeof forgotPasswordSchema>;

  const form = useForm<ForgotPasswordFormValues>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);

    try {
      const success = await userService.requestNewPassword(data.email);

      if (success) {
        toast.success(
          t(
            "auth.forgotPassword.successMessage",
            "Un email de réinitialisation a été envoyé à votre adresse email."
          )
        );
        setOpen(false);
        form.reset();
      } else {
        toast.error(
          t(
            "auth.forgotPassword.errorMessage",
            "Impossible d'envoyer l'email de réinitialisation."
          )
        );
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      toast.error(
        t(
          "auth.forgotPassword.errorMessage",
          "Une erreur s'est produite. Veuillez réessayer."
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full m-4">
          {t("auth.signin.forgotPassword", "Mot de passe oublié ?")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("auth.forgotPassword.title", "Réinitialisation du mot de passe")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.signup.email", "Email")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("auth.signup.email", "Email")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.loading", "Chargement...")}
                  </>
                ) : (
                  t(
                    "auth.forgotPassword.sendResetLink",
                    "Envoyer le lien de réinitialisation"
                  )
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
