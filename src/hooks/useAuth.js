import { useState, useCallback } from "react";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);

  const login = useCallback(
    async (usernameOrEmail, password) => {
      setLoading(true);
      setError(null);
      try {
        const data = await authApi.login(usernameOrEmail, password);
        setAuth(data.token, data.user);
        return data;
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Login failed. Please try again.";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setAuth]
  );

  const register = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.register(formData);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please try again.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    logout();
  }, [logout]);

  return { login, register, signOut, loading, error, user, initialized };
}
