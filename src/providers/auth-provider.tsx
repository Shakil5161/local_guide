"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { getAccessToken, logoutLocal, setTokens } from "@/lib/auth-storage";
import { AuthContextType, AuthUser } from "@/types/auth";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchMe = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      setUser(response.data?.data ?? null);
    } catch {
      logoutLocal();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await refetchMe();
      setLoading(false);
    };
    void run();
  }, [refetchMe]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const data = response.data?.data;
    setTokens(data?.accessToken, data?.refreshToken);
    await refetchMe();
  }, [refetchMe]);

  const register = useCallback(
    async (payload: {
      email: string;
      password: string;
      role: "TOURIST" | "GUIDE";
      name: string;
      phone?: string;
      city?: string;
      country?: string;
    }) => {
      const response = await api.post("/auth/register", payload);
      const data = response.data?.data;
      setTokens(data?.accessToken, data?.refreshToken);
      await refetchMe();
    },
    [refetchMe]
  );

  const logout = useCallback(() => {
    logoutLocal();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refetchMe,
    }),
    [user, loading, login, register, logout, refetchMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
