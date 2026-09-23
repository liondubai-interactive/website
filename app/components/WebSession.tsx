"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { api, ApiError, errorMessage, type WebSession } from "../web-api";

const SessionContext = createContext<{
  session: WebSession | null;
  loading: boolean;
  error: string;
  clear: () => void;
} | null>(null);

export function WebSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    session: WebSession | null;
    loading: boolean;
    error: string;
  }>({ session: null, loading: true, error: "" });
  useEffect(() => {
    let current = true;
    api<WebSession>("/me").then(
      (session) => {
        if (current) setState({ session, loading: false, error: "" });
      },
      (error) => {
        if (current)
          setState({
            session: null,
            loading: false,
            error: error instanceof ApiError && error.status === 401 ? "" : errorMessage(error),
          });
      },
    );
    return () => {
      current = false;
    };
  }, []);
  const clear = useCallback(() => setState({ session: null, loading: false, error: "" }), []);
  return <SessionContext.Provider value={{ ...state, clear }}>{children}</SessionContext.Provider>;
}

export function useWebSession() {
  const state = useContext(SessionContext);
  if (!state) throw new Error("WebSessionProvider is missing");
  return state;
}

export function AccountLink() {
  const { session } = useWebSession();
  return (
    <Link href={session ? "/account/?view=customer" : "/login/"}>
      {session ? "Account" : "Sign in"}
    </Link>
  );
}
