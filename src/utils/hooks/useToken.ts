"use client";

import { useCallback } from "react";

const ACCESS_TOKEN_KEY = "access_token";

export function useToken() {
  const getToken = useCallback(() => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }, []);

  const setToken = useCallback((token: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }, []);

  const removeToken = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }, []);

  return { getToken, setToken, removeToken };
}
