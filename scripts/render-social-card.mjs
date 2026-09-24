import { chromium, expect } from "@playwright/test";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

// Capture the actual hero so shared links stay consistent with the website.
const browser = await chromium.launch({ channel: process.env.CI ? undefined : "chrome" });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, reducedMotion: "reduce" });
  await page.goto(process.argv[2] ?? "http://127.0.0.1:3100/");
  await expect(page.locator(".hero-visual")).toHaveAttribute("data-ready", "true");
  await expect(page.locator("model-viewer")).toHaveCSS("opacity", "1");
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "nextjs-portal { display: none; } html { scrollbar-width: none; scrollbar-gutter: auto; } ::-webkit-scrollbar { display: none; }" });
  const screenshot = await page.screenshot({ animations: "disabled" });
  await sharp(screenshot).png({ compressionLevel: 9 }).toFile(
    fileURLToPath(new URL("../public/og-v4.png", import.meta.url)),
  );
} finally {
  await browser.close();
}
