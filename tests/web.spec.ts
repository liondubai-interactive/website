import { expect, test, type Page } from "@playwright/test";
import type { ModelViewerElement } from "@google/model-viewer";

test("hero floats automatically with drag, reduced motion and offscreen suspension", async ({ page }, testInfo) => {
  await mock(page);
  await page.setViewportSize({ width: 1366, height: 850 });
  const modelRequests: string[] = [];
  let releaseModel!: () => void;
  const modelGate = new Promise<void>((resolve) => { releaseModel = resolve; });
  await page.route("**/models/*.glb", async (route) => {
    await modelGate;
    await route.continue();
  });
  page.on("request", (request) => { if (request.url().endsWith(".glb")) modelRequests.push(request.url()); });
  await page.goto("/");
  const viewer = page.locator("model-viewer");
  await expect(viewer).toHaveCSS("opacity", "0");
  await expect(page.locator(".hero-poster")).toHaveCount(0);
  const loadingBox = await page.locator(".hero-visual").boundingBox();
  releaseModel();
  await expect(page.locator(".hero-visual")).toHaveAttribute("data-ready", "true", { timeout: 30_000 });
  await expect(viewer).toHaveCSS("opacity", "1");
  expect(await page.locator(".hero-visual").boundingBox()).toEqual(loadingBox);
  await expect.poll(() => viewer.evaluate((el) => (el as ModelViewerElement).paused)).toBe(false);
  const orbit = await viewer.evaluate((el) => (el as ModelViewerElement).getCameraOrbit().theta);
  const box = (await viewer.boundingBox())!;
  await page.mouse.move(box.x + box.width * .5, box.y + box.height * .5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .75, box.y + box.height * .5, { steps: 12 });
  await page.mouse.up();
  await expect.poll(() => viewer.evaluate((el) => (el as ModelViewerElement).getCameraOrbit().theta)).not.toBe(orbit);
  await expect(page.getByRole("button", { name: /floating animation/ })).toHaveCount(0);
  await expect(page.getByText("Drag to explore")).toHaveCount(0);
  await expect.poll(() => viewer.evaluate((el) => (el as ModelViewerElement).paused)).toBe(false);
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect.poll(() => viewer.evaluate((el) => (el as ModelViewerElement).paused)).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect.poll(() => viewer.evaluate((el) => (el as ModelViewerElement).paused)).toBe(false);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => viewer.evaluate((el) => (el as ModelViewerElement).paused)).toBe(true);
  expect(modelRequests).toHaveLength(1);
  await page.screenshot({ path: testInfo.outputPath("hero-interactive.png") });
});

test("mobile hero is static for reduced motion and survives model failure", async ({ page }, testInfo) => {
  await mock(page);
  await page.setViewportSize({ width: 390, height: 850 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator(".hero-visual").scrollIntoViewIfNeeded();
  await expect(page.locator(".hero-visual")).toHaveAttribute("data-ready", "true", { timeout: 30_000 });
  await expect.poll(() => page.locator("model-viewer").evaluate((el) => (el as ModelViewerElement).paused)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("hero-mobile.png") });
  await page.route("**/models/*.glb", (route) => route.abort());
  await page.reload();
  await page.locator(".hero-visual").scrollIntoViewIfNeeded();
  await expect(page.locator(".hero-poster")).toBeVisible();
  await expect(page.locator("model-viewer")).toHaveCount(0);
});

test("hero fits tablet breakpoints and remounts cleanly after navigation", async ({ page }) => {
  await mock(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/games/");
  await expect(page.locator("model-viewer")).toHaveCount(0);
  for (let visit = 0; visit < 2; visit++) {
    await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Home", exact: true }).click();
    await page.locator(".hero-visual").scrollIntoViewIfNeeded();
    await expect(page.locator(".hero-visual")).toHaveAttribute("data-ready", "true", { timeout: 30_000 });
    await expect(page.locator("model-viewer")).toHaveCount(1);
    for (const width of [320, 760, 768, 1000, 1100, 1240, 1366]) {
      await page.setViewportSize({ width, height: 850 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Games", exact: true }).click();
    await expect(page.locator("model-viewer")).toHaveCount(0);
  }
});

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
    await expect(page.getByText(/An independent app\./)).toBeVisible();
    const header = page.locator(".site-header");
    await expect(header).not.toHaveAttribute("data-scrolled", "true");
    const homeNav = await page.getByRole("navigation", { name: "Primary navigation" }).boundingBox();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`home-${width}.png`), fullPage: true });
    await page.getByRole("link", { name: "Games", exact: true }).click();
    await expect(page).toHaveURL(/\/games\/$/);
    await expect(page.getByRole("link", { name: "Games", exact: true })).toHaveAttribute("aria-current", "page");
    expect((await page.getByRole("navigation", { name: "Primary navigation" }).boundingBox())!.x).toBe(homeNav!.x);
    await expect(page.getByRole("heading", { name: "Minecraft", exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`games-${width}.png`), fullPage: true });
    await page.getByRole("link", { name: "Explore Minecraft plugins" }).click();
    await expect(page).toHaveURL(/\/#games$/);
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(65, 16, 27)");
    await expect(page.locator(".game-item").first()).toHaveCSS("background-color", "rgb(82, 27, 41)");
    await expect(header).toHaveAttribute("data-scrolled", "true");
    expect((await header.boundingBox())!.y).toBe(0);
    await page.screenshot({ path: testInfo.outputPath(`header-scrolled-${width}.png`) });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(header).not.toHaveAttribute("data-scrolled", "true");
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

test("public pages and signed-out account fit narrow and desktop screens", async ({ page }) => {
  await mock(page);
  for (const width of [320, 1366]) {
    await page.setViewportSize({ width, height: 850 });
    for (const path of ["/games/", "/download/", "/login/", "/account/", "/privacy/", "/terms/", "/refunds/", "/missing-page/"]) {
      await page.goto(path);
      await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator("body")).toHaveCSS("background-color", "rgb(65, 16, 27)");
      await expect(page.locator(".site-header")).toHaveCSS("background-color", "rgb(65, 16, 27)");
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), { message: `${path} at ${width}px` }).toBe(true);
    }
  }
});

test("account waits for initial billing before enabling refresh", async ({ page }) => {
  await mock(page, { signedIn: true });
  let releaseBilling!: () => void;
  const gate = new Promise<void>((resolve) => { releaseBilling = resolve; });
  await page.route("**/web/billing", async (route) => {
    await gate;
    await route.fallback();
  });
  await page.goto("/account/");
  await expect(page.getByText("Loading plugins…")).toBeVisible();
  await expect(page.getByRole("button", { name: "Refresh", exact: true })).toBeDisabled();
  releaseBilling();
  await expect(page.getByRole("button", { name: "Refresh", exact: true })).toBeEnabled();
});

test("disabled config exposes a useful state", async ({ page }) => {
  await mock(page, { loginEnabled: false });
  await page.goto("/login/");
  await expect(page.getByRole("button", { name: "Continue with TikTok" })).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("Website sign-in is unavailable");
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
  await expect(page.getByRole("heading", { name: "Your plugins", level: 1 })).toBeVisible();
  await expect(page.getByRole("main")).not.toContainText("Test Streamer");
  const survival = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: /Survival$/ }) });
  await survival.getByRole("button", { name: "24-hour free trial" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCSS("background-color", "rgb(82, 27, 41)");
  await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(calls.filter((call) => call.path === "/billing/trial")).toHaveLength(0);
  await survival.getByRole("button", { name: "24-hour free trial" }).click();
  await page.getByRole("button", { name: "Start free trial", exact: true }).click();
  await expect(survival.getByRole("button", { name: "Free trial: 24 hours 0 minutes left" })).toBeDisabled();
  await expect(survival).not.toContainText("Trial until");
  await expect(survival.locator("img")).toHaveJSProperty("naturalWidth", 128);
  expect(calls.filter((call) => call.path === "/billing/trial")).toEqual([
    {
      path: "/billing/trial",
      method: "POST",
      body: { pluginId: "minecraft-survival" },
      csrf: "session-csrf",
    },
  ]);
  await page.screenshot({ path: testInfo.outputPath("account.png"), fullPage: true });
  await page.setViewportSize({ width: 320, height: 850 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.setViewportSize({ width: 390, height: 850 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: testInfo.outputPath("account-mobile.png"), fullPage: true });
  const menu = page.getByRole("button", { name: "Account menu" });
  await expect(page.getByRole("button", { name: "Sign out" })).not.toBeVisible();
  await menu.click();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Admin", exact: true })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Sign out" })).not.toBeVisible();
  await menu.click();
  await page.getByRole("heading", { name: "Your plugins", level: 1 }).click();
  await expect(page.getByRole("button", { name: "Sign out" })).not.toBeVisible();
  await menu.click();
  await page.screenshot({ path: testInfo.outputPath("account-menu-mobile.png") });
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
  await expect(page.getByRole("heading", { name: "Your plugins", level: 1 })).toBeVisible();
  await expect(page.getByRole("main").getByRole("button", { name: "Admin", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Account menu" }).click();
  await expect(page.getByRole("button", { name: "Admin", exact: true })).toBeVisible();
  await expect(page.getByRole("article").first().getByRole("img", { name: "Active", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Admin", exact: true }).click();
  await expect(page).toHaveURL("https://api.liondubai.net/admin/");
});

test("trial countdown uses server time, updates locally and expires without another request", async ({ page }) => {
  await page.clock.install({ time: new Date("2030-01-01T00:00:00Z") });
  const calls = await mock(page, { signedIn: true });
  await page.goto("/account/");
  const plugin = page.getByRole("article").first();
  const trialButton = plugin.getByRole("button", { name: "24-hour free trial" });
  const width = (await trialButton.boundingBox())!.width;
  await trialButton.click();
  await page.getByRole("button", { name: "Start free trial", exact: true }).click();
  const countdown = plugin.getByRole("button", { name: /^Free trial:/ });
  await expect(countdown).toHaveText("24:00 left");
  expect((await countdown.boundingBox())!.width).toBe(width);
  await page.clock.fastForward(60_000);
  await expect(countdown).toHaveText("23:59 left");
  await page.clock.setSystemTime(new Date("2020-01-01T00:00:00Z"));
  await page.clock.fastForward(60_000);
  await expect(countdown).toHaveText("23:58 left");
  await page.clock.fastForward(24 * 60 * 60_000);
  await expect(plugin.getByRole("button", { name: "Trial used" })).toBeDisabled();
  await expect(plugin.getByRole("img", { name: "Locked", exact: true })).toBeVisible();
  expect(calls.filter((call) => call.path === "/billing")).toHaveLength(1);
});
