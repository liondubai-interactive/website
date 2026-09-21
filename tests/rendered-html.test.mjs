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
  assert.match(html, new RegExp(`href="${basePath}/contact/"`));
  assert.match(html, /limited testing/i);
  assert.match(html, /TikTok does not own or operate (?:it|this app)/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);

  const footer = html.match(/<footer[\s\S]*?<\/footer>/i)?.[0];
  assert.ok(footer);
  assert.match(footer, /© 2026 LionDubai Interactive/);
  assert.doesNotMatch(footer, /<nav|href=/i);
});

test("exports every compliance route", async () => {
  const pages = [
    ["privacy/index.html", /Privacy Policy/, "privacy"],
    ["terms/index.html", /Terms of Use/, "terms"],
    ["contact/index.html", /How can we help\?/, "contact"],
  ];

  for (const [relativePath, expected, route] of pages) {
    const html = await readPage(relativePath);
    assert.match(html, expected);
    assert.match(html, /LionDubai Interactive/);
    if (route === "contact") {
      assert.match(html, /mailto:liondubai\.interactive@gmail\.com/);
      assert.match(html, /https:\/\/t\.me\/Lion_Dubai/);
      assert.match(html, /@Lion_Dubai/);
    }
    if (route === "privacy") {
      assert.match(html, new RegExp(`href="${basePath}/contact/"`));
    }
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
  for (const route of ["", "privacy/", "terms/", "contact/"]) {
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
