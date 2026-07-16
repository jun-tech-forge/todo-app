"use client";

import { useEffect, useState } from "react";

import apiClient from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import type { LoginPayload, LoginResponse, SessionResponse, UserSummary } from "@/lib/types";

export function useSession(required = false) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<SessionResponse>("/auth/me");
      if (response.data.authenticated) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (sessionError) {
      setUser(null);
      if (required) {
        setError(getErrorMessage(sessionError, "ログイン状態を確認できませんでした。"));
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (payload: LoginPayload): Promise<LoginResponse> => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.post<LoginResponse>("/auth/login", payload);
      setUser(response.data.user);
      return response.data;
    } catch (loginError) {
      const message = getErrorMessage(loginError, "ログインに失敗しました。");
      setError(message);
      throw loginError;
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post("/auth/logout");
      setUser(null);
    } catch (logoutError) {
      const message = getErrorMessage(logoutError, "ログアウトに失敗しました。");
      setError(message);
      throw logoutError;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    void refreshSession();
  }, []);

  return {
    user,
    loading,
    submitting,
    error,
    isAuthenticated: Boolean(user),
    refreshSession,
    login,
    logout,
  };
}
