"use client";

import { useAuth } from "@/app/auth-provider";

// page
import RequestPasswordDialog from "../(forgot-password)/page";

// ui components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Eye, EyeClosed } from "lucide-react";
import Link from "next/link";

// hooks
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define the initial schema without translations
const createSignInSchema = (t: any) =>
  yup.object().shape({
    email: yup
      .string()
      .email(t("auth.form.invalidEmail", "Email invalide"))
      .required(t("auth.form.required", "Ce champ est requis")),
    password: yup
      .string()
      .required(t("auth.form.required", "Ce champ est requis")),
  });

export default function SignInPage() {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [signInSchema, setSignInSchema] = useState(() => createSignInSchema(t));
  const [showPassword, setShowPassword] = useState(false);

  // ✅ AJOUT : useAuth hook et router
  const { login } = useAuth();
  const router = useRouter();

  // Update validation schema when language changes
  useEffect(() => {
    setSignInSchema(createSignInSchema(t));
  }, [t, i18n.language]);

  // Define form values type
  type SignInFormValues = yup.InferType<typeof signInSchema>;

  const form = useForm<SignInFormValues>({
    resolver: yupResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ✅ MODIFICATION PRINCIPALE : Utilise useAuth().login() au lieu d'authService.login()
  const onSubmit = async (data: SignInFormValues) => {
    setIsLoading(true);

    try {
      // ✅ Utilise la méthode login du context d'authentification
      const success = await login(data.email, data.password);

      if (success) {
        toast.success(t("auth.signin.successText", "Connexion réussie !"));

        // ✅ Utilise router.push au lieu de window.location.href
        router.push("/home");
      } else {
        // Cette erreur sera gérée par le catch si login rejette
        toast.error(
          t("auth.signin.errorText", "Email ou mot de passe incorrect")
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        t(
          "auth.signin.errorText",
          "Une erreur est survenue lors de la connexion"
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col max-w-md space-y-6 w-full"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.signup.email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("auth.signup.email")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.signup.password")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("auth.signup.password")}
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                      tabIndex={-1}
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword
                          ? t(
                              "auth.signup.hidePassword",
                              "Cacher le mot de passe"
                            )
                          : t(
                              "auth.signup.showPassword",
                              "Afficher le mot de passe"
                            )
                      }
                    >
                      {showPassword ? (
                        // You can use an eye-off icon here
                        <EyeClosed className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        // You can use an eye icon here
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : null}
            {t("auth.signin.signInButton", "Se connecter")}
          </Button>
        </form>
      </Form>

      <RequestPasswordDialog />

      <Link href={"/sign-up"}>
        <Button className="m-4" variant={"link"}>
          {t("auth.signin.noAccount")}
        </Button>
      </Link>
    </>
  );
}
