"use client";

import { useUser } from "@/utils/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const { getUser } = useUser();
  
  useEffect(() => {
    // Use a simpler check that executes immediately
    const user = getUser();
    const isAuthenticated = Boolean(user);
    
    if (isAuthenticated) {
      // If authenticated, redirect to home page immediately
      router.replace("/home");
    }
  }, [router, getUser]);
  
  // Immediately render children - don't show a loader
  // This makes the authentication UI visible faster
  // If user is authenticated, they'll be redirected anyway
  return <>{children}</>;
}