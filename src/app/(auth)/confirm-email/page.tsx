"use client";

// ui components
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// services
import { authService } from "@/services/authService";

// hooks
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

export default function ValidateEmailPage() {
  const { t } = useTranslation();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValid(false);
        setIsLoading(false);
        return;
      }

      try {
        // get token from URL
        console.log("Token from URL:", token);

        const result = await authService.validateEmail(token);
        console.log("Validation result:", result);
        setIsValid(true);
      } catch (error) {
        console.error("Error validating email:", error);
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary">
        <div className="max-w-md w-full p-6 flex flex-col text-center gap-5">
          <p className="font-bold">
            {t("auth.validateEmail.loading", "Validating your email...")}
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

  return (
    <>
      {/* Display success message after validation */}
      {isValid && (
        <div className="flex items-center justify-center h-screen bg-secondary">
          <div className="max-w-md w-full p-6 flex flex-col text-center gap-5">
            <p className="font-bold">
              {t("auth.validateEmail.successText", "Email validé avec succès!")}
            </p>
            <img
              src="/illu_validate_email_page.svg"
              alt="Breezy Logo"
              className="mt-4 w-2/3 mx-auto"
            />
            <Link href="/sign-in">
              <Button className="w-full">
                {t("auth.validateEmail.goToSignIn", "Se connecter")}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Display error message if validation fails */}
      {isValid === false && (
        <div className="flex items-center justify-center h-screen bg-secondary">
          <div className="max-w-md w-full p-6 flex flex-col text-center gap-5">
            <p className="font-bold">
              {t("auth.validateEmail.errorText", "La validation a échoué")}
            </p>
            <img
              src="/illu_oops.svg"
              alt="Breezy Oops"
              className="mt-4 w-2/3 mx-auto"
            />
            <Link href="/sign-up">
              <Button className="w-full">
                {t("auth.validateEmail.goToSignUp", "S'inscrire")}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
