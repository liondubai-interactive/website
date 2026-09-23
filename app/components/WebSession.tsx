"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { api, ApiError, errorMessage, navigateTo, type WebSession } from "../web-api";

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

export function AccountMenu() {
  const { session, clear } = useWebSession();
  const [failedAvatar, setFailedAvatar] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();
  if (!session) return <Link className="sign-in" href="/login/">Sign in</Link>;
  const { displayName, username, avatarUrl } = session.user;
  const name = displayName || username || "Account";

  async function signOut() {
    if (!session || busy) return;
    setBusy(true);
    setError("");
    try {
      await api("/logout", { body: {}, csrf: session.csrfToken });
      clear();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) clear();
      else setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className="account-avatar" popoverTarget={menuId} aria-label="Account menu" title={name}>
        <span aria-hidden="true">{Array.from(name)[0].toUpperCase()}</span>
        {avatarUrl && avatarUrl !== failedAvatar && (
          // Provider images are already sized; static hosting has no image optimizer.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" width="36" height="36" referrerPolicy="no-referrer" onError={() => setFailedAvatar(avatarUrl)} />
        )}
      </button>
      <div ref={menu} id={menuId} popover="auto" className="account-dropdown">
        <Link href="/account/?view=customer" onClick={() => menu.current?.hidePopover()}>My plugins</Link>
        {session.user.role === "admin" && session.adminUrl && (
          <button onClick={() => {
            try { navigateTo(session.adminUrl!, "admin"); }
            catch { setError("Admin access is unavailable."); }
          }}>Admin</button>
        )}
        <button disabled={busy} onClick={() => void signOut()}>{busy ? "Signing out…" : "Sign out"}</button>
        {error && <p role="alert">{error}</p>}
      </div>
    </>
  );
}
