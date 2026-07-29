import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../out/", import.meta.url);
const basePath = "/website";

async function readPage(relativePath) {
  return readFile(new URL(relativePath, outputRoot), "utf8");
}

test("exports the product home with visible policy links", async () => {
  const html = await readPage("index.html");

  assert.match(html, /<title>LionDubai Interactive<\/title>/i);
  assert.match(html, /TikTok Live meets epic UEBS2 battles\./);
  assert.match(html, new RegExp(`href="${basePath}/privacy/"`));
  assert.match(html, new RegExp(`href="${basePath}/terms/"`));
  assert.match(html, new RegExp(`href="${basePath}/contact/"`));
  assert.match(html, /limited developer sandbox testing/i);
  assert.match(html, /official TikTok LIVE agency/);
  assert.match(html, /TikTok does not own or operate it/);
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
    [
      "contact/index.html",
      /How can we help\?/,
      "contact",
    ],
  ];

  for (const [relativePath, expected, route] of pages) {
    const html = await readPage(relativePath);
    assert.match(html, expected);
    assert.match(html, /LionDubai Interactive/);
    if (route === "contact") {
      assert.match(html, /mailto:liondubai\.interactive@gmail\.com/);
      assert.match(html, /https:\/\/t\.me\/Lion_Dubai/);
      assert.match(html, /@Lion_Dubai/);
      assert.doesNotMatch(html, /aj\.massalkhis@gmail\.com/);
    }
    if (route === "privacy") {
      assert.doesNotMatch(html, /@massalkhis/);
      assert.match(html, new RegExp(`href="${basePath}/contact/"`));
    }
    if (route === "privacy" || route === "terms") {
      assert.match(html, /official TikTok LIVE agency/);
      assert.match(html, /TikTok does not own or operate it/);
    }
    assert.match(
      html,
      new RegExp(
        `rel="canonical" href="https://liondubai-interactive\\.github\\.io${basePath}/${route}/"`,
      ),
    );
  }
});

test("uses the repository path for links, metadata, and images", async () => {
  const html = await readPage("index.html");
  const origin = "https://liondubai-interactive.github.io";

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
