"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWebSession } from "../components/WebSession";
import { api, errorMessage, navigateTo } from "../web-api";

export function LoginForm() {
  const { session, loading } = useWebSession();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let current = true;
    api<{ loginEnabled: boolean }>("/config").then(
      (config) => {
        if (!current) return;
        setEnabled(config.loginEnabled);
        if (new URLSearchParams(window.location.search).has("error"))
          setError("Sign-in was not completed. Please try again.");
      },
      () => {
        if (current) setEnabled(false);
      },
    );
    return () => {
      current = false;
    };
  }, []);
  useEffect(() => {
    if (session) window.location.replace("/account/");
  }, [session]);
  async function signIn() {
    setBusy(true);
    setError("");
    try {
      const { url } = await api<{ url: string }>("/auth/tiktok/start", { body: {} });
      navigateTo(url, "login");
    } catch (error) {
      setError(errorMessage(error));
      setBusy(false);
    }
  }
  return (
    <section className="login-card" aria-labelledby="login-title">
      <p className="eyebrow">YOUR LIONDUBAI ACCOUNT</p>
      <h1 id="login-title">Welcome back.</h1>
      <p>
        One account for your plugins and subscriptions.
        <br />
        No extra password to remember.
      </p>
      <button
        className="button button-primary login-button"
        disabled={!enabled || busy || loading || Boolean(session)}
        onClick={() => void signIn()}
      >
        {busy ? "Opening TikTok…" : "Continue with TikTok"}
        <span aria-hidden="true">↗</span>
      </button>
      {enabled === false && (
        <p className="notice" role="status">
          Website sign-in is unavailable. You can still sign in from the desktop app.
        </p>
      )}
      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}
      <p className="login-privacy">
        TikTok verifies your identity. LionDubai never receives your TikTok password.{" "}
        <Link href="/privacy/">Privacy policy</Link>
      </p>
    </section>
  );
}
