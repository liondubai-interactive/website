import { expect, test, type Page } from "@playwright/test";
import type { ModelViewerElement } from "@google/model-viewer";

test("animations resume on page return without a focus event or click", async ({ page }) => {
  await mock(page);
  await page.goto("/");
  const hero = page.locator(".hero-visual model-viewer");
  const logo = page.locator(".brand-symbol model-viewer");
  const pixels = () => page.locator(".background-particles").evaluate(el => (el as HTMLCanvasElement).toDataURL());
  await expect(page.locator(".hero-visual")).toHaveAttribute("data-moving", "true", { timeout: 30_000 });
  await expect(page.locator(".brand-symbol")).toHaveAttribute("data-moving", "true");
  for (const lifecycle of ["visibility", "history"]) {
    await page.evaluate(kind => {
      // Reproduce the old stale-focus path, plus a scroll timer suspended by the browser.
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("blur"));
      if (kind === "visibility") {
        Object.defineProperty(document, "hidden", { configurable: true, value: true });
        document.dispatchEvent(new Event("visibilitychange"));
      } else window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true }));
    }, lifecycle);
    await expect(hero).toHaveJSProperty("paused", true);
    await expect(logo).toHaveJSProperty("paused", true);
    const pausedPixels = await pixels();
    await page.waitForTimeout(180);
    expect(await pixels()).toBe(pausedPixels);
    await page.evaluate(kind => {
      if (kind === "visibility") {
        Object.defineProperty(document, "hidden", { configurable: true, value: false });
        document.dispatchEvent(new Event("visibilitychange"));
      } else window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
    }, lifecycle);
    await expect(hero).toHaveJSProperty("paused", false);
    await expect(logo).toHaveJSProperty("paused", false);
    const time = await hero.evaluate(el => (el as ModelViewerElement).currentTime);
    await expect.poll(() => hero.evaluate(el => (el as ModelViewerElement).currentTime)).not.toBe(time);
    await expect.poll(pixels).not.toBe(pausedPixels);
  }
  // Focusing browser chrome / another window while this page stays visible cannot latch a pause.
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  const time = await hero.evaluate(el => (el as ModelViewerElement).currentTime);
  await expect.poll(() => hero.evaluate(el => (el as ModelViewerElement).currentTime)).not.toBe(time);
});

test("solid header symbol turns in reverse and resumes after hidden tabs", async ({ page }) => {
  await page.goto("/games/");
  const symbol = page.locator(".brand-symbol");
  const model = symbol.locator("model-viewer");
  await expect(symbol).toHaveAttribute("data-ready", "true");
  expect(await model.evaluate(el => (el as ModelViewerElement).duration)).toBeCloseTo(28, 1);
  await expect(model).toHaveJSProperty("timeScale", -1);
  await expect.poll(() => model.evaluate(el => (el as ModelViewerElement).currentTime)).toBeGreaterThan(0);
  const initial = await model.evaluate(el => (el as ModelViewerElement).currentTime);
  await expect.poll(() => model.evaluate(el => (el as ModelViewerElement).currentTime)).toBeLessThan(initial);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(symbol).not.toHaveAttribute("data-moving", "true");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(symbol).toHaveAttribute("data-moving", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(symbol).not.toHaveAttribute("data-moving", "true");
  await expect(symbol.locator("img")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(symbol).toHaveAttribute("data-moving", "true");
  await expect(symbol).toHaveAttribute("data-ready", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const requests: string[] = [];
  page.on("request", request => { if (request.url().endsWith("brand-symbol-v1.glb")) requests.push(request.url()); });
  await page.reload();
  await expect(symbol.locator("img")).toBeVisible();
  await expect(symbol.locator("model-viewer")).toHaveCount(0);
  expect(requests).toHaveLength(0);
});

test("header renders at zoom resolution and its solid model has a vector fallback", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 5 });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3100/games/");
    const symbol = page.locator(".brand-symbol");
    await expect(symbol).toHaveAttribute("data-ready", "true");
    const resolution = await symbol.locator("model-viewer").evaluate(el => ({
      displayWidth: el.getBoundingClientRect().width,
      pixels: el.shadowRoot!.querySelector("canvas")!.width,
    }));
    expect(resolution.pixels).toBeGreaterThanOrEqual(resolution.displayWidth * 5);
    await page.route("**/models/encoded/brand-symbol-v1.glb", route => route.abort());
    await page.reload();
    await expect(symbol.locator("img")).toBeVisible();
    await expect(symbol.locator("model-viewer")).toHaveCount(0);
  } finally { await context.close(); }
});

test("local mobile URLs work directly and follow navigation inside the phone frame", async ({ page }, testInfo) => {
  for (const host of ["localhost", "127.0.0.1"]) {
    for (const path of ["/mobile", "/mobile/", "/mobile/games/"]) {
      const response = await page.request.get(`http://${host}:3100${path}`);
      expect(response.status()).toBe(200);
      expect(await response.text()).toContain('aria-label="Mobile website preview"');
    }
  }
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("http://localhost:3100/mobile/");
  const phone = page.frameLocator("iframe");
  await expect(phone.locator("h1")).toHaveText("InteractiveStreaming");
  expect(await phone.locator("body").evaluate(() => innerWidth)).toBe(390);
  await expect(phone.locator("html")).toHaveCSS("scrollbar-width", "none");
  expect(await phone.locator("html").evaluate(el => el.clientWidth)).toBe(390);
  for (const size of [{ width: 485, height: 927 }, { width: 320, height: 600 }, { width: 1440, height: 600 }, { width: 1440, height: 960 }]) {
    await page.setViewportSize(size);
    await expect.poll(async () => {
      const box = (await page.locator(".phone").boundingBox())!;
      return Math.max(Math.abs(box.x + box.width / 2 - size.width / 2), Math.abs(box.y + box.height / 2 - size.height / 2));
    }).toBeLessThan(1);
    const box = (await page.locator(".phone").boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(23);
    expect(box.y).toBeGreaterThanOrEqual(23);
    expect(box.x + box.width).toBeLessThanOrEqual(size.width - 23);
    expect(box.y + box.height).toBeLessThanOrEqual(size.height - 23);
  }
  const screen = (await page.locator("iframe").boundingBox())!;
  await page.mouse.move(screen.x + 40, screen.y + screen.height - 80);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => phone.locator("html").evaluate(() => scrollY)).toBeGreaterThan(100);
  await phone.locator("html").evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await phone.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Games", exact: true }).click();
  await expect(page).toHaveURL("http://localhost:3100/mobile/games/");
  await expect(phone.getByRole("searchbox", { name: "Search games" })).toBeVisible();
  await page.reload();
  await expect(phone.getByRole("searchbox", { name: "Search games" })).toBeVisible();
  await expect(phone.locator("html")).toHaveCSS("scrollbar-width", "none");
  await phone.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Home", exact: true }).click();
  await expect(page).toHaveURL("http://localhost:3100/mobile/");
  await page.goBack();
  await expect(page).toHaveURL("http://localhost:3100/mobile/games/");
  await expect(phone.getByRole("searchbox", { name: "Search games" })).toBeVisible();
  await page.goto("http://localhost:3100/mobile/privacy/?preview=1#main-content");
  await expect(phone.getByRole("heading", { name: "Privacy Policy", exact: true })).toBeVisible();
  await expect(page).toHaveURL("http://localhost:3100/mobile/privacy/?preview=1#main-content");
  await page.screenshot({ path: testInfo.outputPath("local-phone-preview.png") });
});

test("page particles drift independently and pause for reduced motion or hidden pages", async ({ page }) => {
  await page.goto("/games/");
  const canvas = page.locator(".background-particles");
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toHaveCSS("pointer-events", "none");
  await expect.poll(() => canvas.evaluate((el) => (el as HTMLCanvasElement).width)).toBeGreaterThan(300);
  const pixels = () => canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL());
  const initial = await pixels();
  await expect.poll(pixels).not.toBe(initial);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(100);
  const still = await pixels();
  await page.mouse.move(300, 300);
  await page.waitForTimeout(250);
  expect(await pixels()).toBe(still);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(pixels).not.toBe(still);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const paused = await pixels();
  await page.waitForTimeout(250);
  expect(await pixels()).toBe(paused);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(pixels).not.toBe(paused);
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Home", exact: true }).click();
  await expect(canvas).toHaveCount(1);
});

test("pushed particles keep travelling after the pointer leaves", async ({ page }) => {
  await page.clock.install();
  await page.goto("/games/");
  const canvas = page.locator(".background-particles");
  await expect.poll(() => canvas.evaluate((el) => (el as HTMLCanvasElement).width)).toBeGreaterThan(300);
  await page.clock.runFor(200);
  const locate = (near: { x: number; y: number } | null = null) => canvas.evaluate((el, target) => {
    const c = el as HTMLCanvasElement;
    const { width, height } = c;
    const ratio = width / c.getBoundingClientRect().width;
    const data = c.getContext("2d")!.getImageData(0, 0, width, height).data;
    let best = Infinity;
    let point: { x: number; y: number } | null = null;
    const margin = target ? 0 : 180;
    for (let y = margin; y < height - margin; y++) {
      for (let x = margin; x < width - margin; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha < 60) continue;
        const distance = target ? (x / ratio - target.x) ** 2 + (y / ratio - target.y) ** 2 : -alpha;
        if (distance < best) { best = distance; point = { x: x / ratio, y: y / ratio }; }
      }
    }
    return point;
  }, near);
  const start = (await locate())!;
  expect(start).not.toBeNull();
  await page.mouse.move(start.x - 20, start.y);
  await page.clock.runFor(800);
  const pushed = (await locate(start))!;
  expect(pushed.x - start.x).toBeGreaterThan(5);
  await page.evaluate(() => document.documentElement.dispatchEvent(new PointerEvent("pointerleave")));
  await page.clock.runFor(500);
  const continued = (await locate(pushed))!;
  expect(continued.x - pushed.x).toBeGreaterThan(3);
});

test("hero floats automatically with drag, reduced motion and offscreen suspension", async ({ page }, testInfo) => {
  await mock(page);
  await page.setViewportSize({ width: 1366, height: 850 });
  const modelRequests: string[] = [];
  let releaseModel!: () => void;
  const modelGate = new Promise<void>((resolve) => { releaseModel = resolve; });
  await page.route("**/models/encoded/*.glb", async (route) => {
    await modelGate;
    await route.continue();
  });
  page.on("request", (request) => { if (request.url().endsWith("hero-v31.glb")) modelRequests.push(request.url()); });
  await page.goto("/");
  const viewer = page.locator(".hero-visual model-viewer");
  await expect(viewer).toHaveCSS("opacity", "0");
  await expect(page.locator(".hero-poster")).toHaveCount(0);
  const loadingBox = await page.locator(".hero-visual").boundingBox();
  releaseModel();
  await expect(page.locator(".hero-visual")).toHaveAttribute("data-ready", "true", { timeout: 30_000 });
  await expect(viewer).toHaveCSS("opacity", "1");
  expect(await page.locator(".hero-visual").boundingBox()).toEqual(loadingBox);
  await expect(page.locator(".hero-visual")).toHaveAttribute("data-moving", "true");
  const initialTime = await viewer.evaluate(el => (el as ModelViewerElement).currentTime);
  await expect.poll(() => viewer.evaluate(el => (el as ModelViewerElement).currentTime)).not.toBe(initialTime);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pagehide")));
  await expect(page.locator(".hero-visual")).not.toHaveAttribute("data-moving", "true");
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
  await expect(page.locator(".hero-visual")).toHaveAttribute("data-moving", "true");
  const orbit = await viewer.evaluate((el) => (el as ModelViewerElement).getCameraOrbit().theta);
  const box = (await viewer.boundingBox())!;
  await page.mouse.move(box.x + box.width * .5, box.y + box.height * .5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .75, box.y + box.height * .5, { steps: 12 });
  await page.mouse.up();
  await expect.poll(() => viewer.evaluate((el) => (el as ModelViewerElement).getCameraOrbit().theta)).not.toBe(orbit);
  await expect(page.getByRole("button", { name: /floating animation/ })).toHaveCount(0);
  await expect(page.getByText("Drag to explore")).toHaveCount(0);
  await expect(page.locator(".hero-visual")).toHaveAttribute("data-moving", "true");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(page.locator(".hero-visual")).not.toHaveAttribute("data-moving", "true");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(page.locator(".hero-visual")).toHaveAttribute("data-moving", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".hero-visual")).not.toHaveAttribute("data-moving", "true");
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
  await expect.poll(() => page.locator(".hero-visual model-viewer").evaluate((el) => (el as ModelViewerElement).paused)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("hero-mobile.png") });
  await page.route("**/models/encoded/*.glb", (route) => route.abort());
  await page.reload();
  await page.locator(".hero-visual").scrollIntoViewIfNeeded();
  await expect(page.locator(".hero-poster")).toBeVisible();
  await expect(page.locator(".hero-visual model-viewer")).toHaveCount(0);
});

test("scrolling holds decorative frames and resumes them without a jump", async ({ page }) => {
  await mock(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const hero = page.locator(".hero-visual model-viewer");
  const brand = page.locator(".brand-symbol");
  await expect(page.locator(".hero-visual")).toHaveAttribute("data-ready", "true", { timeout: 30_000 });
  await expect(brand).toHaveAttribute("data-moving", "true");
  const held = await page.evaluate(async () => {
    const model = document.querySelector(".hero-visual model-viewer") as ModelViewerElement;
    const logo = document.querySelector(".brand-symbol model-viewer") as ModelViewerElement;
    const particles = document.querySelector(".background-particles") as HTMLCanvasElement;
    const timer = setInterval(() => window.scrollBy({ top: 1, behavior: "instant" }), 20);
    try {
      await new Promise(resolve => setTimeout(resolve, 250));
      const first = { hero: model.currentTime, logo: logo.currentTime, pixels: particles.toDataURL(), width: particles.width };
      particles.style.width = "calc(100% - 10px)";
      await new Promise(resolve => setTimeout(resolve, 250));
      return {
        paused: model.paused,
        logoMoving: logo.parentElement!.hasAttribute("data-moving"),
        heroHeld: first.hero === model.currentTime,
        logoHeld: first.logo === logo.currentTime,
        particlesHeld: first.pixels === particles.toDataURL(),
        resizeDeferred: particles.width === first.width,
        particleWidth: first.width,
        heroTime: model.currentTime,
        logoTime: logo.currentTime,
      };
    } finally { clearInterval(timer); }
  });
  expect(held).toMatchObject({ paused: true, logoMoving: false, heroHeld: true, logoHeld: true, particlesHeld: true, resizeDeferred: true });
  await expect(page.locator(".hero-visual")).toHaveAttribute("data-moving", "true");
  await expect(brand).toHaveAttribute("data-moving", "true");
  const resumedTime = await hero.evaluate(el => (el as ModelViewerElement).currentTime);
  expect(resumedTime - held.heroTime).toBeLessThan(.4);
  const resumedLogo = await brand.locator("model-viewer").evaluate(el => (el as ModelViewerElement).currentTime);
  expect(held.logoTime - resumedLogo).toBeLessThan(.4);
  await expect.poll(() => page.locator(".background-particles").evaluate(el => (el as HTMLCanvasElement).width)).toBeLessThan(held.particleWidth);
  await page.locator(".background-particles").evaluate(el => { (el as HTMLCanvasElement).style.width = ""; });
  const pixels = () => page.locator(".background-particles").evaluate(el => (el as HTMLCanvasElement).toDataURL());
  const initial = await pixels();
  await expect.poll(pixels).not.toBe(initial);
});

test("mobile rendering limits pixel work without shrinking the scene", async ({ browser }, testInfo) => {
  for (const economy of [false, true]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    try {
      await page.addInitScript((limited) => {
        Object.defineProperty(navigator, "hardwareConcurrency", { get: () => limited ? 2 : 8 });
        Object.defineProperty(navigator, "deviceMemory", { get: () => limited ? 2 : 8 });
      }, economy);
      await mock(page);
      await page.goto("http://127.0.0.1:3100/");
      await expect(page.locator(".hero-visual")).toHaveAttribute("data-ready", "true");
      const dimensions = await page.locator(".hero-visual model-viewer").evaluate((el) => {
        const view = el as HTMLElement;
        return { visible: view.getBoundingClientRect().width, host: view.parentElement!.getBoundingClientRect().width,
          density: view.clientWidth * devicePixelRatio / view.getBoundingClientRect().width };
      });
      expect(dimensions.visible).toBeCloseTo(dimensions.host * 1.25, 0);
      expect(dimensions.density).toBeLessThanOrEqual(economy ? 1.51 : 2.01);
      const particleDensity = await page.locator(".background-particles").evaluate((el) => (el as HTMLCanvasElement).width / el.getBoundingClientRect().width);
      expect(particleDensity).toBeCloseTo(economy ? 1 : 1.5);
      await page.screenshot({ path: testInfo.outputPath(`mobile-${economy ? "economy" : "normal"}.png`) });
    } finally { await context.close(); }
  }
});

test("hero fits tablet breakpoints and remounts cleanly after navigation", async ({ page }) => {
  await mock(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/games/");
  await expect(page.locator(".hero-visual model-viewer")).toHaveCount(0);
  for (let visit = 0; visit < 2; visit++) {
    await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Home", exact: true }).click();
    await page.locator(".hero-visual").scrollIntoViewIfNeeded();
    await expect(page.locator(".hero-visual")).toHaveAttribute("data-ready", "true", { timeout: 30_000 });
    await expect(page.locator(".hero-visual model-viewer")).toHaveCount(1);
    for (const width of [320, 760, 768, 1000, 1100, 1240, 1366]) {
      await page.setViewportSize({ width, height: 850 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Games", exact: true }).click();
    await expect(page.locator(".hero-visual model-viewer")).toHaveCount(0);
  }
});

test("language catalogue stays compact and changes only its selected label", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  const menu = page.getByRole("group", { name: "Language", exact: true });
  await page.getByRole("button", { name: "Select language, English" }).click();
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("button", { name: "Show more languages" })).toBeVisible();
  expect(await menu.getByRole("button").count()).toBeLessThanOrEqual(81);
  const box = (await menu.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(320);
  const search = menu.getByRole("searchbox", { name: "Search languages" });
  await search.fill("Arabic");
  await menu.getByRole("button", { name: /^Arabic العربية$/ }).click();
  await expect(menu).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Select language, Arabic" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("h1")).toHaveText("InteractiveStreaming");
  await page.getByRole("button", { name: "Select language, Arabic" }).click();
  await expect(search).toHaveValue("");
  await search.fill("not-a-language-12345");
  await expect(menu.getByRole("status")).toHaveText("No languages found");
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
});

test("game search filters compact cards and recovers from no matches", async ({ page }) => {
  await page.goto("/games/");
  const search = page.getByRole("searchbox", { name: "Search games" });
  const card = page.getByRole("link", { name: "Explore Minecraft plugins" });
  await search.fill("  MINECRAFT  ");
  await expect(card).toBeVisible();
  await expect(card.locator("img")).toHaveJSProperty("naturalWidth", 780);
  await search.fill("unknown game");
  await expect(card).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("No games found.");
  await search.fill("");
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute("href", "/#games");
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
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("InteractiveStreaming");
    const header = page.locator(".site-header");
    await expect(header.getByRole("link", { name: /download/i })).toHaveCount(0);
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
    for (const path of ["/games/", "/login/", "/account/", "/privacy/", "/terms/", "/refunds/", "/missing-page/"]) {
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
