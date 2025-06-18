"use client";

// service
import { authService } from "@/services/authService";
import type * as userType from "@/services/authService";

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
const createSignUpSchema = (t: any) =>
  yup.object().shape({
    displayName: yup.string().required(t("auth.form.required")),

    username: yup.string().required(t("auth.form.required")),

    email: yup
      .string()
      .email(t("auth.form.invalidEmail"))
      .required(t("auth.form.required")),

    password: yup
      .string()
      .required(t("auth.form.required"))
      .min(8, t("auth.form.minLength"))
      .matches(
        /[a-z]/,
        t("auth.signup.passwordLowercase", "Doit contenir une lettre minuscule")
      )
      .matches(
        /[A-Z]/,
        t("auth.signup.passwordUppercase", "Doit contenir une lettre majuscule")
      )
      .matches(
        /[0-9]/,
        t("auth.signup.passwordNumber", "Doit contenir un chiffre")
      )
      .matches(
        /[@$!%*?&#]/,
        t("auth.signup.passwordSpecial", "Doit contenir un caractère spécial")
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
      .required(t("auth.form.required")),
  });

export default function SignUpPage() {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [signUpSchema, setSignUpSchema] = useState(() => createSignUpSchema(t));

  // Update validation schema when language changes
  useEffect(() => {
    setSignUpSchema(createSignUpSchema(t));
  }, [t, i18n.language]);

  // Define form values type
  type SignUpFormValues = yup.InferType<typeof signUpSchema>;

  const form = useForm<SignUpFormValues>({
    resolver: yupResolver(signUpSchema),
    defaultValues: {
      displayName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: SignUpFormValues) => {
    setIsLoading(true);

    const newUser: userType.Register = {
      displayName: data.displayName,
      username: data.username,
      email: data.email,
      password: data.password,
    };

    authService
      .createUser(newUser)
      .then((success) => {
        if (success) {
          // Handle successful user creation, e.g., redirect to login page or show success message
          console.log("User created successfully");
          toast.success(t("auth.signup.successMessage"));
        } else {
          // Handle failure case
          console.error("Failed to create user");
          toast.error(t("auth.signup.errorMessage"));
        }
      })
      .catch((error) => {
        // Handle error case
        console.error("Error creating user:", error);
        toast.error(t("auth.signup.errorMessage"));
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
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.signup.displayName")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("auth.signup.displayName")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.signup.username")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("auth.signup.username")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.signup.confirmPassword")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("auth.signup.password")}
                    {...field}
                  />
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
            {t("auth.signup.submit")}
          </Button>
        </form>
      </Form>

      <Link href={"/sign-in"}>
        <Button className="m-4" variant={"link"}>
          {t("auth.signup.alreadyHaveAccount")}
        </Button>
      </Link>
    </>
  );
}
