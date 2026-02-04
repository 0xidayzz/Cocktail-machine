import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initDbIfNeeded } from "../api/db";
import { getSession, getUserById, logout as apiLogout } from "../api/auth";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [me, setMe] = useState(null);

  useEffect(() => {
    initDbIfNeeded();
    const s = getSession();
    setSession(s);
    setMe(s ? getUserById(s.userId) : null);
  }, []);

  const refreshMe = () => {
    const s = getSession();
    setSession(s);
    setMe(s ? getUserById(s.userId) : null);
  };

  const logout = () => {
    apiLogout();
    setSession(null);
    setMe(null);
  };

  const value = useMemo(() => ({ session, me, refreshMe, logout }), [session, me]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
