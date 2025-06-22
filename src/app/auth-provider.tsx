"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'moderator';
  isVerified?: boolean;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  refreshUser: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const refreshUser = async (): Promise<boolean> => {
    try {      
      // Appeler votre API route Next.js qui gère les sessions cookies
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setError(null);
        return true;
      }

      // Si ça échoue, essayer le refresh
      if (response.status === 401) {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.user) {
            setUser(refreshData.user);
            setError(null);
            return true;
          }
        }
      }

      console.log("Authentication failed");
      setUser(null);
      return false;
    } catch (error) {
      console.error("Refresh user error:", error);
      setError("Connection error");
      setUser(null);
      return false;
    }
  };

  // Initialize auth on app load
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      try {
        await refreshUser();
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Appeler votre API route Next.js pour login
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return false;
      }

      console.log("Login successful:", data.user);
      setUser(data.user);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Appeler votre API route Next.js pour logout
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("Logout failed:", data);
        setError(data.error || "Logout failed");
        return false;
      }

      console.log("Logout successful, clearing user state...");
      setUser(null);
      
      // Rediriger vers la page de connexion
      window.location.href = '/sign-in';
      
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      setError("An unexpected error occurred");
      // Nettoyer localement même si ça échoue
      setUser(null);
      window.location.href = '/sign-in';
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    isInitialized,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}