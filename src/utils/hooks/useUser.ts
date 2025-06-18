"use client";

import { useCallback } from "react";
import type { LocalUser } from "@/utils/types/userType";

const USER_KEY = "user";

export function useUser() {
  const getUser = useCallback((): LocalUser | null => {
    if (typeof window === "undefined" || !window.localStorage) return null;

    const userString = localStorage.getItem(USER_KEY);
    if (!userString) return null;
    try {
      const user = JSON.parse(userString);
      return user as LocalUser;
    } catch {
      return null;
    }
  }, []);

  const setUser = useCallback((user: LocalUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }, []);

  const removeUser = useCallback(() => {
    localStorage.removeItem(USER_KEY);
  }, []);

  return { getUser, setUser, removeUser };
}
