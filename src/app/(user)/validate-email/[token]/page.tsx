"use client";

// ui components
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { use, Suspense } from "react";

// services
import { validateEmail } from "@/services/userService";


export default function ValidateEmailPage({ params }: { params: Promise<{ token: string }> }) {
    const urlParams = use(params);

    useEffect(() => {
        // get token from URL
        console.log("Token from URL:", urlParams.token);

        validateEmail(urlParams.token)
            .then((isValid) => {
                if (isValid) {
                    console.log("Email validation successful");
                } else {
                    console.error("Email validation failed");
                }
            }
            )
            .catch((error) => {
                console.error("Error validating email:", error);
            }
        );
    }, [urlParams]);

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen bg-secondary">
                <div className="max-w-md w-full p-6 flex flex-col text-center gap-5">
                    <p className="font-bold">Validation de l'email en cours...</p>
                    <img src="/illu_validate_email_page.svg" alt="Breezy Logo" className="mt-4 w-2/3 mx-auto" />
                </div>
            </div>
        }>
            <div className="flex items-center justify-center h-screen bg-secondary">
                <div className="max-w-md w-full p-6 flex flex-col text-center gap-5">
                    <p className="font-bold">Super ! Vous pouvez maintenant accéder à toutes les fonctionnalités de Breezy !</p>
                    <img src="/illu_validate_email_page.svg" alt="Breezy Logo" className="mt-4 w-2/3 mx-auto" />
                    <Button>Aller à la page de connexion</Button>
                </div>
            </div>
        </Suspense>
        
    );
}