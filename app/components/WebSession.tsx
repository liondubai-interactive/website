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
  const [failedAvatar, setFailedAvatar] = useState<string>();
  if (!session) return <Link href="/login/">Sign in</Link>;
  const { displayName, username, avatarUrl } = session.user;
  const name = displayName || username || "Account";
  return (
    <Link className="account-avatar" href="/account/?view=customer" aria-label="Account" title={name}>
      <span aria-hidden="true">{Array.from(name)[0].toUpperCase()}</span>
      {avatarUrl && avatarUrl !== failedAvatar && (
        // Provider images are already sized; static hosting has no image optimizer.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" width="36" height="36" referrerPolicy="no-referrer" onError={() => setFailedAvatar(avatarUrl)} />
      )}
    </Link>
  );
}
