"use client";

import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { User } from "@/types";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, referralCode?: string, targetExamId?: string, accountType?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const setTokens = useAuthStore((s) => s.setTokens);
  const clearTokens = useAuthStore((s) => s.clearTokens);
  const storedAccessToken = useAuthStore((s) => s.accessToken);
  const router = useRouter();

  const refreshUser = async () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await authApi.me();
      setUser(data);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetched = useRef(false);
  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const { data } = await authApi.login({ email: normalizedEmail, password });
    setTokens(data.access_token ?? data.accessToken, data.refresh_token ?? data.refreshToken);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string, referralCode?: string, targetExamId?: string, accountType?: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const { data } = await authApi.register({
      name: name.trim(),
      email: normalizedEmail,
      password,
      referralCode,
      targetExamId,
      accountType,
    });
    setTokens(data.access_token ?? data.accessToken, data.refresh_token ?? data.refreshToken);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // server logout is best-effort
    }
    clearTokens();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}