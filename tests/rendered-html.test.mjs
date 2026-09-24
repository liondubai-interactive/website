import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../out/", import.meta.url);
const basePath = "";

async function readPage(relativePath) {
  return readFile(new URL(relativePath, outputRoot), "utf8");
}

test("exports the product home with visible policy links", async () => {
  const html = await readPage("index.html");

  assert.match(html, /<title>LionDubai Interactive<\/title>/i);
  assert.match(html, /Your stream\./);
  assert.match(html, new RegExp(`href="${basePath}/privacy/"`));
  assert.match(html, new RegExp(`href="${basePath}/terms/"`));
  assert.match(html, /aria-label="Contact"/);
  assert.match(html, /24-hour free trial/);
  assert.match(html, /TikTok does not own or operate (?:it|this app)/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);

  const footer = html.match(/<footer[\s\S]*?<\/footer>/i)?.[0];
  assert.ok(footer);
  assert.match(footer, /© 2026 LionDubai Interactive/);
  assert.match(footer, /aria-label="Legal"/);
  for (const route of ["privacy", "terms", "refunds"])
    assert.match(footer, new RegExp(`href="/${route}/"`));
});

test("exports every compliance route", async () => {
  const pages = [
    ["privacy/index.html", /Privacy Policy/, "privacy"],
    ["terms/index.html", /Terms of Use/, "terms"],
    ["refunds/index.html", /Refunds &amp; cancellation/, "refunds"],
  ];

  for (const [relativePath, expected, route] of pages) {
    const html = await readPage(relativePath);
    assert.match(html, expected);
    assert.match(html, /LionDubai Interactive/);
    if (route === "privacy") assert.match(html, /mailto:liondubai\.interactive@gmail\.com/);
    if (route === "privacy" || route === "terms") {
      assert.match(html, /TikTok does not own or operate (?:it|this app)/);
    }
    assert.match(
      html,
      new RegExp(
        `rel="canonical" href="https://liondubai\\.net${basePath}/${route}/"`,
      ),
    );
  }
});

test("uses the custom domain for links, metadata, and images", async () => {
  const html = await readPage("index.html");
  const origin = "https://liondubai.net";

  assert.match(html, new RegExp(`${origin}${basePath}/og\\.png`));
  assert.match(html, new RegExp(`src="${basePath}/app-icon\\.png"`));
  assert.doesNotMatch(html, /localhost/);
});

test("ships valid portal and social images", async () => {
  const appIcon = await readFile(new URL("app-icon.png", outputRoot));
  const socialCard = await readFile(new URL("og.png", outputRoot));

  assert.equal(appIcon.readUInt32BE(16), 1024);
  assert.equal(appIcon.readUInt32BE(20), 1024);
  assert.equal(socialCard.readUInt32BE(16), 1536);
  assert.equal(socialCard.readUInt32BE(20), 1024);
});

test("retains the shared social image on every page with its own metadata", async () => {
  for (const route of ["", "privacy/", "terms/"]) {
    const html = await readPage(`${route}index.html`);
    assert.match(
      html,
      /property="og:image" content="https:\/\/liondubai\.net\/og\.png"/,
      route || "home",
    );
    assert.match(
      html,
      new RegExp(
        `property="og:url" content="https://liondubai\\.net/${route}"`,
      ),
    );
  }
});

test("every exported page has one shared navigation and a working skip target", async () => {
  for (const route of [
    "index.html",
    "privacy/index.html",
    "terms/index.html",
    "refunds/index.html",
    "download/index.html",
    "games/index.html",
    "login/index.html",
    "account/index.html",
    "404.html",
  ]) {
    const html = await readPage(route);
    assert.equal((html.match(/<header class="site-header"/g) ?? []).length, 1, route);
    assert.equal((html.match(/<footer /g) ?? []).length, 1, route);
    assert.equal((html.match(/<main id="main-content"/g) ?? []).length, 1, route);
  }
});

test("exports a real download destination only when a release is configured", async () => {
  const html = await readPage("download/index.html");
  assert.match(html, /Download for Windows/);
  if (!process.env.NEXT_PUBLIC_WINDOWS_DOWNLOAD_URL) {
    assert.match(html, /Public download is not available yet/);
    assert.match(html, /<button[^>]*disabled/);
    assert.doesNotMatch(html, /href="[^"]+\.(exe|msi)/);
  }
  assert.doesNotMatch(html, /github\.com\/liondubai-interactive\/desktop-app\/releases/);
});

test("private pages export no account records and are not indexed", async () => {
  for (const route of ["login", "account"]) {
    const html = await readPage(`${route}/index.html`);
    assert.match(html, /name="robots" content="noindex, nofollow"/);
    assert.doesNotMatch(html, /session-csrf|Test Streamer|client_secret|DATABASE_URL/);
  }
});
