import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../out/", import.meta.url);
const basePath = "";

test("hero stays small, self-contained and keeps all eight animated objects", async () => {
  const data = await readFile(new URL("models/hero-v30.glb", outputRoot));
  assert.ok(data.length < 500_000, "Keep the complete model below 500 KB");
  const gltf = JSON.parse(data.subarray(20, 20 + data.readUInt32LE(12)).toString());
  assert.equal(gltf.animations.length, 1);
  const names = new Set(gltf.animations[0].channels.map((channel) => gltf.nodes[channel.target.node].name));
  assert.deepEqual([...names].sort(), ["Coin.01", "Kick", "Laptop", "Phone", "Twitch", "TwitchGift", "TwitchStar", "YouTube"]);
  // Validate the exported loop itself: a mismatched endpoint causes a visible snap.
  const binaryOffset = 28 + data.readUInt32LE(12);
  function sample(accessorIndex, index) {
    const accessor = gltf.accessors[accessorIndex];
    assert.equal(accessor.componentType, 5126, "Animation samples must be floats");
    assert.ok(!accessor.sparse, "Animation samples must have explicit storage");
    const components = { SCALAR: 1, VEC3: 3, VEC4: 4 }[accessor.type];
    assert.ok(components);
    const view = gltf.bufferViews[accessor.bufferView];
    const offset = binaryOffset + (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0)
      + index * (view.byteStride ?? components * 4);
    return Array.from({ length: components }, (_, component) => data.readFloatLE(offset + component * 4));
  }
  for (const sampler of gltf.animations[0].samplers) {
    assert.equal(sampler.interpolation ?? "LINEAR", "LINEAR");
    const count = gltf.accessors[sampler.input].count;
    assert.equal(gltf.accessors[sampler.output].count, count);
    assert.equal(sample(sampler.input, 0)[0], 0);
    assert.equal(sample(sampler.input, count - 1)[0], 8);
    const first = sample(sampler.output, 0);
    const last = sample(sampler.output, count - 1);
    assert.ok(first.every((value, index) => Math.abs(value - last[index]) < 0.00001),
      "Every animated object must return to its starting pose");
  }
  assert.equal(gltf.images?.length ?? 0, 0);
  assert.ok(gltf.buffers.every((buffer) => !buffer.uri));
  assert.ok(!(gltf.extensionsRequired ?? []).some((name) => /draco|meshopt/i.test(name)));
  const poster = await readFile(new URL("models/hero-v30.webp", outputRoot));
  assert.ok(poster.length < 30_000);
  assert.match(await readFile(new URL("_headers", outputRoot), "utf8"), /max-age=31536000, immutable/);
});

async function readPage(relativePath) {
  return readFile(new URL(relativePath, outputRoot), "utf8");
}

test("exports the product home with visible policy links", async () => {
  const html = await readPage("index.html");

  assert.match(html, /<title>LionDubai Interactive<\/title>/i);
  assert.match(html, /<h1>Inter<span>active<\/span><br\s*\/>Streaming<\/h1>/);
  assert.match(html, new RegExp(`href="${basePath}/privacy/"`));
  assert.match(html, new RegExp(`href="${basePath}/terms/"`));
  assert.match(html, /aria-label="Contact"/);
  assert.match(html, /24-hour free trial/);
  assert.match(html, /Go live on any streaming platform and bind any type of donation to in-game events\./);
  assert.doesNotMatch(html, /Turn live interactions into in-game actions\./);
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

  assert.match(html, new RegExp(`${origin}${basePath}/og-v3\\.png`));
  assert.match(html, new RegExp(`src="${basePath}/app-icon\\.png"`));
  assert.doesNotMatch(html, /localhost/);
});

test("ships valid portal and social images", async () => {
  const appIcon = await readFile(new URL("app-icon.png", outputRoot));
  const socialCard = await readFile(new URL("og-v3.png", outputRoot));

  assert.equal(appIcon.readUInt32BE(16), 192);
  assert.equal(appIcon.readUInt32BE(20), 192);
  assert.ok(appIcon.length < 50_000, "Shared browser/header icon should stay small");
  assert.equal(socialCard.readUInt32BE(16), 1200);
  assert.equal(socialCard.readUInt32BE(20), 800);
});

test("retains the shared social image on every page with its own metadata", async () => {
  for (const route of ["", "privacy/", "terms/"]) {
    const html = await readPage(`${route}index.html`);
    assert.match(
      html,
      /property="og:image" content="https:\/\/liondubai\.net\/og-v3\.png"/,
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

test("downloads are only offered on home when a release is configured", async () => {
  await assert.rejects(readPage("download/index.html"), { code: "ENOENT" });
  const redirects = await readFile(new URL("_redirects", outputRoot), "utf8");
  assert.match(redirects, /^\/download \/ 301$/m);
  assert.match(redirects, /^\/download\/ \/ 301$/m);
  const html = await readPage("index.html");
  assert.doesNotMatch(html, /href="\/download\/?"/);
  const header = html.match(/<header[\s\S]*?<\/header>/)?.[0];
  assert.ok(header);
  assert.doesNotMatch(header, /Download/);
  assert.match(html, /Download for Windows/);
  if (!process.env.NEXT_PUBLIC_WINDOWS_DOWNLOAD_URL) {
    assert.match(html, /Download unavailable/);
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
