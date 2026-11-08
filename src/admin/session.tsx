import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

const KEY = "admin-token";

type Ctx = { token: string; setToken: (t: string | null) => void };
const SessionContext = createContext<Ctx | null>(null);

function read() {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState(read);
  const setToken = useCallback((t: string | null) => {
    try {
      if (t) localStorage.setItem(KEY, t);
      else localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setTokenState(t ?? "");
  }, []);
  return <SessionContext.Provider value={{ token, setToken }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession hors de SessionProvider");
  return ctx;
}

/** Raccourci : le jeton à passer à chaque fonction admin. */
export function useToken() {
  return useSession().token;
}
