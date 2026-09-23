export const apiBase = "https://api.liondubai.net/api/liondubai";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, options?: { body: unknown; csrf?: string }): Promise<T> {
  const response = await fetch(`${apiBase}/web${path}`, {
    credentials: "include",
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
    ...(options && {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options.csrf && { "X-CSRF-Token": options.csrf }),
      },
      body: JSON.stringify(options.body),
    }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      response.status,
      typeof payload?.error?.message === "string"
        ? payload.error.message
        : "Could not complete this request. Please try again.",
    );
  if (!payload)
    throw new ApiError(502, "The service returned an invalid response. Please try again.");
  return payload as T;
}

export function navigateTo(url: string, kind: "login" | "admin" | "billing") {
  const target = new URL(url);
  const hosts = {
    login: ["www.tiktok.com"],
    admin: ["api.liondubai.net"],
    billing: [
      "api.liondubai.net",
      "customer-portal.paddle.com",
      "sandbox-customer-portal.paddle.com",
    ],
  };
  if (
    target.protocol !== "https:" ||
    target.username ||
    target.password ||
    target.port ||
    !hosts[kind].includes(target.hostname) ||
    (kind === "admin" && target.pathname !== "/admin/")
  ) {
    throw new Error("This destination is unavailable. Please try again later.");
  }
  window.location.assign(target.href);
}

export function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Could not connect. Please try again.";
}

export type WebSession = {
  ok: true;
  user: {
    id: string;
    role: "user" | "admin";
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  csrfToken: string;
  adminUrl: string | null;
};

export type Billing = {
  mode: "disabled" | "sandbox" | "live";
  serverTime: string;
  plugins: {
    pluginId: string;
    access: "locked" | "trial" | "paid" | "support";
    expiresAt: string | null;
    trialUsed: boolean;
    subscribed: boolean;
    cancelScheduled: boolean;
    price: { amount: string; currency: string; interval: string; frequency: number } | null;
  }[];
};
