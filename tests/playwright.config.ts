import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "web.spec.ts",
  outputDir: "../.artifacts/browser",
  use: {
    baseURL: "http://127.0.0.1:3100",
    browserName: "chromium",
    channel: process.env.CI ? undefined : "chrome",
    headless: true,
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    cwd: "..",
  },
});
