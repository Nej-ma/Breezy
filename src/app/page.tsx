'use client'

import Image from "next/image";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // check if the user is authenticated
  const isAuthenticated = Boolean(
    typeof window !== "undefined" && localStorage.getItem("token")
  );

  // if authenticated, redirect to dashboard
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <p>Connected !!</p>
    </div>
  );
}
