"use client";

import { useUser } from "@/utils/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { getUser } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check if user is authenticated immediately
    const user = getUser();
    const authenticated = Boolean(user);
    
    setIsAuthenticated(authenticated);
    
    if (!authenticated) {
      // If not authenticated, redirect to sign-in page immediately
      router.replace("/sign-in");
    }
  }, [router, getUser]);
  
  // Show minimal loading state only if still checking
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If authenticated (not null, and true), render children
  return isAuthenticated ? <>{children}</> : null;
}

