import { expect, test, type Page } from "@playwright/test";

const user = {
  id: "30000000-0000-4000-8000-000000000001",
  username: "test.streamer",
  displayName: "Test Streamer",
  role: "user",
  avatarUrl: null,
};
const state = () => ({
  mode: "sandbox",
  serverTime: "2026-09-23T12:00:00Z",
  plugins: ["survival", "battle-simulator", "clash-royale"].map((id) => ({
    pluginId: `minecraft-${id}`,
    access: "locked",
    expiresAt: null as string | null,
    trialUsed: false,
    subscribed: false,
    cancelScheduled: false,
    price: { amount: "100", currency: "USD", interval: "month", frequency: 1 },
  })),
});

async function mock(
  page: Page,
  options: { signedIn?: boolean; admin?: boolean; loginEnabled?: boolean; support?: boolean } = {},
) {
  const calls: { path: string; method: string; body: unknown; csrf: string | undefined }[] = [];
  const billing = state();
  if (options.support) Object.assign(billing.plugins[0], { access: "support", expiresAt: "2026-09-24T12:00:00Z" });
  let signedIn = options.signedIn ?? false;
  await page.route("https://api.liondubai.net/api/liondubai/web/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace("/api/liondubai/web", "");
    const method = request.method();
    const headers = {
      "Access-Control-Allow-Origin": "http://127.0.0.1:3100",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "content-type,x-csrf-token",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    };
    if (method === "OPTIONS") return route.fulfill({ status: 204, headers });
    calls.push({
      path,
      method,
      body: method === "POST" ? request.postDataJSON() : null,
      csrf: request.headers()["x-csrf-token"],
    });
    let status = 200;
    let json: unknown;
    if (path === "/me") {
      status = signedIn ? 200 : 401;
      json = signedIn
        ? {
            ok: true,
            user: { ...user, role: options.admin ? "admin" : "user" },
            csrfToken: "session-csrf",
            adminUrl: options.admin ? "https://api.liondubai.net/admin/" : null,
          }
        : { ok: false };
    } else if (path === "/config")
      json = { loginEnabled: options.loginEnabled ?? true, adminUrl: null };
    else if (path === "/auth/tiktok/start")
      json = { url: "https://www.tiktok.com/v2/auth/authorize/?state=fixture" };
    else if (path === "/billing/trial") {
      const id = request.postDataJSON().pluginId;
      const plugin = billing.plugins.find((p) => p.pluginId === id)!;
      Object.assign(plugin, {
        access: "trial",
        trialUsed: true,
        expiresAt: "2026-09-24T12:00:00Z",
      });
      json = billing;
    } else if (path === "/billing/checkout")
      json = { url: "https://api.liondubai.net/api/liondubai/billing/checkout?_ptxn=fixture" };
    else if (path === "/logout") {
      signedIn = false;
      json = { ok: true };
    } else json = billing;
    await route.fulfill({ status, json, headers });
  });
  return calls;
}

test("download-first home remains honest and fits desktop/mobile", async ({ page }, testInfo) => {
  const calls = await mock(page);
  for (const width of [1366, 390]) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Download for Windows" })).toBeDisabled();
    await expect(page.getByText("Limited testing · Public download coming soon")).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`home-${width}.png`), fullPage: true });
  }
  expect(calls.filter((call) => call.method === "POST")).toHaveLength(0);
});

test("sign-in calls backend once and navigates to TikTok", async ({ page }) => {
  const calls = await mock(page);
  await page.route("https://www.tiktok.com/**", (route) =>
    route.fulfill({ body: "TikTok test authorization" }),
  );
  await page.goto("/login/");
  await page.getByRole("button", { name: "Continue with TikTok" }).click();
  await expect(page).toHaveURL(/www\.tiktok\.com/);
  expect(calls.filter((call) => call.path === "/auth/tiktok/start")).toHaveLength(1);
});

test("disabled config exposes a useful state", async ({ page }) => {
  await mock(page, { loginEnabled: false });
  await page.goto("/login/");
  await expect(page.getByRole("button", { name: "Continue with TikTok" })).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("Website sign-in is not available yet");
});

test("callback failure is concise and unsafe payment redirects are rejected", async ({ page }) => {
  await mock(page);
  await page.goto("/login/?error=provider_failure");
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "Sign-in was not completed. Please try again.",
  );
  await page.unroute("https://api.liondubai.net/api/liondubai/web/**");
  const calls = await mock(page, { signedIn: true });
  await page.route("**/web/billing/checkout", (route) =>
    route.request().method() === "OPTIONS"
      ? route.fallback()
      : route.fulfill({
          headers: {
            "Access-Control-Allow-Origin": "http://127.0.0.1:3100",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "content-type,x-csrf-token",
          },
          json: { url: "https://untrusted.example/checkout" },
        }),
  );
  await page.goto("/account/");
  await page.getByRole("button", { name: "Subscribe", exact: true }).first().click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Please try again");
  await expect(page).toHaveURL(/127\.0\.0\.1:3100\/account/);
  expect(calls.filter((call) => call.path === "/billing/trial")).toHaveLength(0);
});

test("trial requires confirmation, uses CSRF, updates once; logout clears account", async ({
  page,
}, testInfo) => {
  const calls = await mock(page, { signedIn: true });
  await page.goto("/account/");
  await expect(page.getByRole("heading", { name: "Test Streamer" })).toBeVisible();
  const survival = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: /Survival$/ }) });
  await survival.getByRole("button", { name: "24-hour free trial" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(calls.filter((call) => call.path === "/billing/trial")).toHaveLength(0);
  await survival.getByRole("button", { name: "24-hour free trial" }).click();
  await page.getByRole("button", { name: "Start free trial", exact: true }).click();
  await expect(survival.getByRole("button", { name: "Trial active" })).toBeDisabled();
  expect(calls.filter((call) => call.path === "/billing/trial")).toEqual([
    {
      path: "/billing/trial",
      method: "POST",
      body: { pluginId: "minecraft-survival" },
      csrf: "session-csrf",
    },
  ]);
  await page.screenshot({ path: testInfo.outputPath("account.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 850 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: testInfo.outputPath("account-mobile.png"), fullPage: true });
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("heading", { name: "Your account", exact: true })).toBeVisible();
  expect(calls.filter((call) => call.path === "/billing")).toHaveLength(1);
  expect(calls.find((call) => call.path === "/logout")?.csrf).toBe("session-csrf");
});

test("admin uses the existing sign-in for its dashboard while customer view remains available", async ({
  page,
}) => {
  await mock(page, { signedIn: true, admin: true, support: true });
  await page.route("https://api.liondubai.net/admin/**", (route) =>
    route.fulfill({ body: "Staff verification" }),
  );
  await page.goto("/account/");
  await expect(page).toHaveURL("https://api.liondubai.net/admin/");
  await page.goto("/account/?view=customer");
  await expect(page.getByRole("heading", { name: "Test Streamer" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Admin", exact: true })).toBeVisible();
  await expect(page.getByText(/^Support access until/)).toBeVisible();
});
