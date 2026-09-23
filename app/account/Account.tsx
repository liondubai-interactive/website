"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSession } from "../components/WebSession";
import { PluginImage } from "../components/PluginImage";
import { integrations } from "../integrations";
import { api, ApiError, errorMessage, navigateTo, type Billing } from "../web-api";

export function Account() {
  const { session, loading, error: sessionError, clear } = useWebSession();
  const [billing, setBilling] = useState<(Billing & { receivedAt: number }) | null>(null);
  const [tick, setTick] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [trial, setTrial] = useState<{ id: string; name: string } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);

  const fail = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) clear();
      else setError(errorMessage(error));
    },
    [clear],
  );

  useEffect(() => {
    if (!session) return;
    if (
      session.user.role === "admin" &&
      session.adminUrl &&
      new URLSearchParams(window.location.search).get("view") !== "customer"
    ) {
      // An invalid staff destination must leave the customer account usable.
      try {
        navigateTo(session.adminUrl, "admin");
      } catch {}
    }
    let current = true;
    api<Billing>("/billing").then(
      (value) => {
        if (current) setBilling({ ...value, receivedAt: performance.now() });
      },
      (error) => {
        if (current) fail(error);
      },
    );
    return () => {
      current = false;
    };
  }, [session, fail]);

  useEffect(() => {
    if (!billing) return;
    const update = () => setTick(performance.now());
    const timer = window.setInterval(update, 1_000);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, [billing]);

  useEffect(() => {
    if (trial) {
      dialog.current?.showModal();
      cancel.current?.focus();
    } else dialog.current?.close();
  }, [trial]);

  async function act(
    action: "trial" | "checkout" | "portal" | "refresh",
    pluginId?: string,
  ) {
    if (!session || busy) return;
    setBusy(`${action}:${pluginId ?? ""}`);
    setError("");
    setTrial(null);
    try {
      const result = await api<Billing | { url: string }>(
        `/billing/${action}`,
        {
          body: pluginId ? { pluginId } : {},
          csrf: session.csrfToken,
        },
      );
      if ("url" in result) navigateTo(result.url, "billing");
      else setBilling({ ...result, receivedAt: performance.now() });
    } catch (error) {
      fail(error);
    } finally {
      setBusy("");
    }
  }

  if (loading)
    return (
      <p role="status" className="account-loading">
        Loading your account…
      </p>
    );
  if (!session)
    return (
      <section className="login-card">
        <h1>Your account</h1>
        <p>{sessionError || "Sign in to view your plugins and subscriptions."}</p>
        <Link className="button button-primary" href="/login/">
          Sign in with TikTok
        </Link>
      </section>
    );

  return (
    <>
      <section aria-labelledby="plugins-title">
        <div className="account-section-heading">
          <h1 id="plugins-title">Your plugins</h1>
          <button
            className="text-button"
            disabled={Boolean(busy)}
            onClick={() => void act("refresh")}
          >
            {busy.startsWith("refresh") ? "Refreshing…" : "Refresh"}
          </button>
        </div>
        {error && (
          <p role="alert" className="notice notice-error">
            {error}
          </p>
        )}
        {!billing && !error && <p role="status">Loading plugins…</p>}
        {billing && (
          <>
            {billing.mode === "sandbox" && (
              <p className="notice">Sandbox · Test payments only. No real charges.</p>
            )}
            <div className="account-plugins">
              {integrations.map((plugin) => {
                const id = `minecraft-${plugin.id}`;
                const access = billing.plugins.find((entry) => entry.pluginId === id);
                // Server time anchors the display; device clock changes cannot extend it.
                const now = Date.parse(billing.serverTime) + Math.max(0, tick - billing.receivedAt);
                const remaining = access?.expiresAt ? Math.max(0, Date.parse(access.expiresAt) - now) : 0;
                const active = Boolean(access && access.access !== "locked" && remaining > 0);
                const trialActive = active && access?.access === "trial";
                const minutes = Math.ceil(remaining / 60_000);
                const available = Boolean(access?.price);
                return (
                  <article className="account-plugin" key={id}>
                    <div className="plugin-summary">
                      <PluginImage id={plugin.id} />
                      <div className="account-plugin-info">
                        <h3>
                          <span
                            className="access-symbol"
                            data-active={active || undefined}
                            role="img"
                            aria-label={active ? "Active" : "Locked"}
                          >
                            {active ? (
                              "✓"
                            ) : (
                              <svg
                                aria-hidden="true"
                                width="16"
                                height="16"
                                viewBox="0 0 20 20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.4"
                              >
                                <rect x="4.5" y="9" width="11" height="8" rx="2" />
                                <path d="M7 9V6a3 3 0 0 1 6 0v3" />
                              </svg>
                            )}
                          </span>
                          {plugin.name}
                        </h3>
                        <p>{plugin.description}</p>
                      </div>
                    </div>
                    <div className="account-plugin-billing">
                      <strong>{priceLabel(access?.price)}</strong>
                      <div className="account-plugin-actions">
                        <button
                          className="button button-secondary"
                          data-trial-active={trialActive || undefined}
                          aria-label={trialActive ? `Free trial: ${Math.floor(minutes / 60)} hours ${minutes % 60} minutes left` : undefined}
                          disabled={
                            !access ||
                            !available ||
                            active ||
                            access.trialUsed ||
                            access.subscribed ||
                            Boolean(busy)
                          }
                          onClick={() => setTrial({ id, name: plugin.name })}
                        >
                          {trialActive
                            ? <>
                                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
                                  <circle cx="10" cy="10" r="7.5" />
                                  <path d="M10 5v5l3 2" />
                                </svg>
                                {Math.floor(minutes / 60)}:{String(minutes % 60).padStart(2, "0")} left
                              </>
                            : access?.trialUsed
                              ? "Trial used"
                              : "24-hour free trial"}
                        </button>
                        <button
                          className="button button-primary"
                          disabled={!access || (!available && !access.subscribed) || Boolean(busy)}
                          onClick={() => void act(access?.subscribed ? "portal" : "checkout", id)}
                        >
                          {busy.endsWith(`:${id}`)
                            ? "Opening…"
                            : access?.subscribed
                              ? "Manage"
                              : "Subscribe"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <p className="account-footnote">
              One free 24-hour trial per plugin. No card required. Payments and billing details are
              managed by Paddle.
            </p>
          </>
        )}
      </section>
      <details className="account-details">
        <summary>Account details</summary>
        <p>Your permanent LionDubai ID</p>
        <code>{session.user.id}</code>
      </details>
      <dialog
        ref={dialog}
        className="trial-dialog"
        aria-labelledby="trial-title"
        onCancel={() => setTrial(null)}
        onClose={() => setTrial(null)}
      >
        <p className="eyebrow">FREE TRIAL</p>
        <h2 id="trial-title">Start your free trial?</h2>
        <p className="trial-plugin-name">{trial?.name}</p>
        <p>24 hours, starting now. One free trial per plugin. No card required.</p>
        <div className="dialog-actions">
          <button
            className="icon-button button-primary"
            aria-label="Start free trial"
            onClick={() => {
              if (trial) void act("trial", trial.id);
            }}
          >
            ✓
          </button>
          <button
            ref={cancel}
            className="icon-button button-secondary"
            aria-label="Cancel"
            onClick={() => setTrial(null)}
          >
            ×
          </button>
        </div>
      </dialog>
    </>
  );
}

function priceLabel(price: Billing["plugins"][number]["price"] | undefined) {
  if (!price) return "";
  try {
    const format = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: price.currency,
    });
    const amount =
      Number(price.amount) / 10 ** (format.resolvedOptions().maximumFractionDigits ?? 2);
    if (!Number.isFinite(amount)) return "";
    return `${format.format(amount)} / ${price.frequency === 1 ? price.interval : `${price.frequency} ${price.interval}s`}`;
  } catch {
    return "";
  }
}
