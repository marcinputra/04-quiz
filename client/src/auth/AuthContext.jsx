import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

// Trzyma zalogowanego użytkownika dla całej aplikacji.
// user === undefined -> jeszcze sprawdzamy, null -> niezalogowany
export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  const refresh = useCallback(async () => {
    try {
      const data = await api("/auth/me");
      setUser(data.user);
    } catch {
      // backend niedostępny — traktujemy jak niezalogowanego, quizy z plików dalej działają
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // -> { user } albo { twoFactorRequired: true, email } (wtedy dalej verifyTwoFactor)
  const login = useCallback(async (email, password) => {
    const data = await api("/auth/login", { method: "POST", body: { email, password } });
    if (data.user) setUser(data.user);
    return data;
  }, []);

  // drugi krok logowania — kod z e-maila
  const verifyTwoFactor = useCallback(async (code) => {
    const data = await api("/auth/2fa/verify", { method: "POST", body: { code } });
    setUser(data.user);
    return data.user;
  }, []);

  // rejestracja NIE loguje — najpierw trzeba potwierdzić e-mail
  const register = useCallback(
    (name, email, password) => api("/auth/register", { method: "POST", body: { name, email, password } }),
    []
  );

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading: user === undefined,
      isAdmin: user?.role === "admin",
      login,
      verifyTwoFactor,
      register,
      logout,
      refresh,
      setUser, // po potwierdzeniu e-maila i zmianach 2FA serwer odsyła aktualnego użytkownika
    }),
    [user, login, verifyTwoFactor, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth musi być użyte wewnątrz <AuthProvider>");
  return ctx;
}
