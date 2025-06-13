"use client";

// service
import { userService } from "@/services/authService";

// ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import Link from "next/link";

// hooks
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Define the initial schema without translations
const createResetPasswordSchema = (t: any) =>
  yup.object().shape({
    password: yup
      .string()
      .required(t("auth.form.required", "Ce champ est requis"))
      .min(
        8,
        t("auth.form.minLength", "Doit contenir au moins {{min}} caractères", {
          min: 8,
        })
      )
      .matches(
        /[a-z]/,
        t("auth.form.passwordLowercase", "Doit contenir une lettre minuscule")
      )
      .matches(
        /[A-Z]/,
        t("auth.form.passwordUppercase", "Doit contenir une lettre majuscule")
      )
      .matches(
        /[0-9]/,
        t("auth.form.passwordNumber", "Doit contenir un chiffre")
      )
      .matches(
        /[@$!%*?&#]/,
        t("auth.form.passwordSpecial", "Doit contenir un caractère spécial")
      ),
    confirmPassword: yup
      .string()
      .oneOf(
        [yup.ref("password")],
        t(
          "auth.form.passwordMismatch",
          "Les mots de passe ne correspondent pas"
        )
      )
      .required(t("auth.form.required", "Ce champ est requis")),
  });

export default function ResetPasswordPage() {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isTokenChecking, setIsTokenChecking] = useState(true);
  const [resetPasswordSchema, setResetPasswordSchema] = useState(() =>
    createResetPasswordSchema(t)
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Check if token is valid on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        setIsTokenChecking(false);
        return;
      }

      try {
        // In a real implementation, you might want to add an API endpoint to validate reset tokens
        // For now, we'll just assume the token is valid if it exists
        setIsTokenValid(true);
      } catch (error) {
        console.error("Error validating token:", error);
        setIsTokenValid(false);
      } finally {
        setIsTokenChecking(false);
      }
    };

    validateToken();
  }, [token]);

  // Update validation schema when language changes
  useEffect(() => {
    setResetPasswordSchema(createResetPasswordSchema(t));
  }, [t, i18n.language]);

  // Define form values type
  type ResetPasswordFormValues = yup.InferType<typeof resetPasswordSchema>;

  const form = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);

    try {
      if (!token) {
        toast.error(
          t(
            "auth.resetPassword.errorMessage",
            "Token de réinitialisation invalide."
          )
        );
        setIsLoading(false);
        return;
      }

      const result = await userService.resetPassword(token, data.password);

      if (result) {
        toast.success(
          t(
            "auth.resetPassword.successMessage",
            "Votre mot de passe a été réinitialisé avec succès."
          )
        );
        // Redirect to login page after successful password reset
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      } else {
        toast.error(
          t(
            "auth.resetPassword.errorMessage",
            "La réinitialisation du mot de passe a échoué."
          )
        );
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(
        t(
          "auth.resetPassword.errorMessage",
          "Une erreur s'est produite lors de la réinitialisation du mot de passe."
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking token
  if (isTokenChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary">
        <div className="max-w-md w-full p-6 flex flex-col text-center gap-5">
          <p className="font-bold">
            {t(
              "auth.resetPassword.validatingToken",
              "Validation de votre demande..."
            )}
          </p>
          <img
            src="/illu_validate_email_page.svg"
            alt="Breezy Logo"
            className="mt-4 w-2/3 mx-auto"
          />
        </div>
      </div>
    );
  }

  // If token is invalid, show error message
  if (!isTokenValid) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary">
        <div className="max-w-md w-full p-6 flex flex-col text-center gap-5">
          <p className="font-bold">
            {t(
              "auth.resetPassword.invalidToken",
              "Le lien de réinitialisation est invalide ou a expiré."
            )}
          </p>
          <img
            src="/illu_oops.svg"
            alt="Breezy Oops"
            className="mt-4 w-2/3 mx-auto"
          />
          <Link href="/sign-in">
            <Button className="w-full">
              {t("auth.resetPassword.backToLogin", "Retour à la connexion")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // If token is valid, show reset password form
  return (
    <div className="flex items-center justify-center">
      <div className="max-w-md w-full flex flex-col text-center gap-5">
        <h1 className="text-2xl font-bold">
          {t("auth.resetPassword.title", "Réinitialisation du mot de passe")}
        </h1>
        <p className="text-muted-foreground mb-4">
          {t(
            "auth.resetPassword.subtitle",
            "Veuillez choisir un nouveau mot de passe pour votre compte."
          )}
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col max-w-md space-y-6"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("auth.signup.password", "Mot de passe")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t(
                        "auth.resetPassword.newPasswordPlaceholder",
                        "Nouveau mot de passe"
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("auth.signup.passwordDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t(
                      "auth.signup.confirmPassword",
                      "Confirmer le mot de passe"
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t(
                        "auth.resetPassword.confirmPasswordPlaceholder",
                        "Confirmer le nouveau mot de passe"
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.loading", "Chargement...")}
                </>
              ) : (
                t("auth.resetPassword.submit", "Réinitialiser le mot de passe")
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
