"use client";

import { useAuth } from "@/app/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  useEffect(() => {
    // If authenticated, redirect to home page immediately
    if (user) {
      router.replace("/home");
    }
  }, [router, user]);
  
  // Immediately render children - don't show a loader
  // This makes the authentication UI visible faster
  // If user is authenticated, they'll be redirected anyway
  return <>{children}</>;
}