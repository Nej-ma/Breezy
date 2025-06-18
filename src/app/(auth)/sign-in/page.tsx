"use client";

// service
import { authService } from "@/services/authService";
import type * as userType from "@/services/authService";

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
import { Loader2 } from "lucide-react";
import Link from "next/link";

// hooks
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useState, useEffect } from "react";

// Define the initial schema without translations
const createSignInSchema = (t: any) =>
  yup.object().shape({
    email: yup
      .string()
      .email(t("auth.form.invalidEmail", "Email invalide"))
      .required(t("auth.form.required", "Ce champ est requis")),
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
  });

export default function SignInPage() {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [signInSchema, setSignInSchema] = useState(() => createSignInSchema(t));

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

  const onSubmit = (data: SignInFormValues) => {
    setIsLoading(true);

    const loginData: userType.Login = {
      email: data.email,
      password: data.password,
    };

    authService
      .login(loginData)
      .then((response) => {
        // First check if we have a valid response with user and token
        if (!response || !response.user || !response.token) {
          throw new Error(t("auth.signin.errorText"));
        }

        // If we get here, we have a valid response
        toast.success(t("auth.signin.successText"));

        // Redirect to home or dashboard
        window.location.href = "/";
      })
      .catch((error) => {
        console.error("Login error:", error);
        toast.error(
          t(error?.response?.data?.message || "auth.signin.errorText")
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col max-w-md space-y-6"
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
                  <Input
                    type="password"
                    placeholder={t("auth.signup.password")}
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

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : null}
            {t("auth.signin.submit")}
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
