"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define user type (compatible with existing system)
interface User {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'moderator'; // More specific role types
  isVerified?: boolean;
  profilePicture?: string;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  refreshUser: () => Promise<boolean>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  // Refresh user data - fonction séparée pour éviter les dépendances circulaires
  const refreshUser = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: 'include', // Important pour les cookies
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Non autorisé - pas d'erreur à afficher
          setUser(null);
          return false;
        }
        // Autres erreurs serveur - ne pas effacer l'utilisateur
        console.warn(`Auth refresh failed: ${response.status}`);
        setError(`Server error: ${response.status}`);
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      setError(null); // Clear previous errors
      return true;
    } catch (error) {
      console.error("Refresh user error:", error);
      // Ne pas setUser(null) en cas d'erreur réseau - garde la session locale
      setError("Connection error");
      return false;
    }
  };
  // Check if user is logged in on initial load
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
  }, []); // Pas de dépendances pour éviter les boucles

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Important pour les cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return false;
      }

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

  // Logout function
  const logout = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: 'include', // Important pour les cookies
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Logout failed");
        return false;
      }

      setUser(null);
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      setError("An unexpected error occurred");
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

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
