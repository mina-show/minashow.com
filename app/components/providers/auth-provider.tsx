import { createContext, useContext, type ReactNode } from "react";
import { useFetcher } from "react-router";
import type { SessionUser } from "~/lib/auth/types";

/** Re-export so consumers don't need to import from two places */
export type { SessionUser as User };

interface AuthContextType {
  user: SessionUser | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  /** Submits to /logout — deletes the session cookie server-side. */
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children, user }: { children: ReactNode; user: SessionUser | null }) {
  const fetcher = useFetcher();

  const logout = () => {
    fetcher.submit({}, { method: "post", action: "/logout" });
  };

  return (
    <AuthContext.Provider
      value={{ user, logout, isAdmin: user?.role === "admin", isLoggedIn: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
