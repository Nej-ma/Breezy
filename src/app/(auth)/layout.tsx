"use client";

// ui components
import { Card } from "@/components/ui/card";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-screen bg-secondary md:bg-background">
      <div className="hidden md:flex w-1/2 min-h-screen flex-col items-center justify-center bg-secondary">
        <img src={"/illu_auth_page.svg"} alt="Breezy Logo" className="w-3/4" />
      </div>

      <div className="w-full md:w-1/2 min-h-screen flex flex-col items-center justify-center p-5">
        <img
          src={"/breezy_logo_small.svg"}
          alt="Breezy Logo"
          className="mb-4 w-1/3 md:w-1/4"
        />

        <Card className="p-6 md:hidden">{children}</Card>

        <div className="hidden md:flex flex-col items-center justify-center w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
