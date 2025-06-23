"use client";
import { useAuth } from "@/app/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  roles?: string[];
}

export function AuthGuard({ children, roles }: AuthGuardProps) {
  const router = useRouter();
  const { user, loading, isInitialized } = useAuth();

  useEffect(() => {
    // Only redirect after initialization is complete
    if (!loading && isInitialized && !user) {
      // If not authenticated, redirect to sign-in
      router.replace("/sign-in"); // Utiliser replace au lieu de push
      return;
    }

    // If roles are specified and user doesn't have the required role
    if (!loading && isInitialized && user && roles && !roles.includes(user.role)) {
      // Redirect to unauthorized or home page
      router.replace("/home");
      return;
    }
  }, [user, loading, isInitialized, router, roles]);

  // Show loading state during initialization
  if (loading || !isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, don't render children
  if (!user) {
    return null;
  }

  // If roles are specified and user doesn't have the required role, don't render children
  if (roles && !roles.includes(user.role)) {
    return null;
  }

  // If authenticated and has the required role, render children
  return <>{children}</>;
}

