"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/utils/hooks/useUser";

export default function Home() {
  const router = useRouter();
  const { getUser } = useUser();

  // Route based on authentication status - execute immediately
  useEffect(() => {
    // Get user directly without useState to avoid render cycle
    const user = getUser();
    const isAuthenticated = Boolean(user);

    // Use replace instead of push for cleaner history
    if (isAuthenticated) {
      router.replace("/home");
    } else {
      router.replace("/sign-in");
    }
  }, [router, getUser]);

  // Return minimal loading indicator or nothing at all
  // This component will be unmounted immediately after redirect
  return null;
}

