"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  // Route based on authentication status - execute immediately
  useEffect(() => {
    // Check authentication status
    const isAuthenticated = Boolean(user);

    // Use replace instead of push for cleaner history
    if (isAuthenticated) {
      router.replace("/home");
    } else {
      router.replace("/sign-in");
    }
  }, [router, user]);

  // Return minimal loading indicator or nothing at all
  // This component will be unmounted immediately after redirect
  return null;
}

