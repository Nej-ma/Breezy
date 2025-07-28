"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

export default function I18nProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render children when component has mounted on client
  // This ensures i18n is initialized only on the client side
  if (!mounted) {
    return null; // Or a loading spinner if preferred
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}