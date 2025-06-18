"use client";

import { useCallback } from "react";

type User = {
  username: string;
  role: string;
};

const USER_KEY = "user";

export function useUser() {
  const getUser = useCallback((): User | null => {
    if (typeof window === "undefined" || !window.localStorage) return null;

    const userString = localStorage.getItem(USER_KEY);
    if (!userString) return null;
    try {
      const user = JSON.parse(userString);
      return { username: user.username, role: user.role };
    } catch {
      return null;
    }
  }, []);

  const setUser = useCallback((user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }, []);

  const removeUser = useCallback(() => {
    localStorage.removeItem(USER_KEY);
  }, []);

  return { getUser, setUser, removeUser };
}
