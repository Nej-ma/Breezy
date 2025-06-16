"use client";

import { createContext, useState, useEffect } from "react";
import { useUser } from "@/utils/hooks/useUser";
import { useToken } from "@/utils/hooks/useToken";

const AuthContext = createContext<{
  user: { role: string } | null;
  token?: string | null;
}>({
  user: null,
  token: null,
});

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const { getUser } = useUser();
  const { getToken } = useToken();

  useEffect(() => {
    setUser(getUser());
    setToken(getToken());
  }, [getUser, getToken]);

  return (
    <AuthContext.Provider value={{ user, token }}>
      {children}
    </AuthContext.Provider>
  );
}
