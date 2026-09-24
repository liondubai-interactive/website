import { spawn } from "node:child_process";
import { mkdirSync, openSync, closeSync, existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);
const url = "http://127.0.0.1:3100/";
const mode = process.argv[2];

async function ready() {
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(3000) });
  } catch {
    return false;
  }
  if (!response.ok || !(await response.text()).includes("LionDubai Interactive")) {
    throw new Error("Port 3100 is serving another page or an error. Check that server before reopening the preview.");
  }
  return true;
}

async function main() {
  if (!["desktop", "mobile"].includes(mode)) throw new Error("Choose desktop or mobile.");
  const { chromium, devices } = await import("@playwright/test").catch(() => {
    throw new Error("Install the website dependencies first: run npm ci in this folder.");
  });

  if (!(await ready())) {
    console.log("Starting the local website...");
    const logDir = join(root, ".artifacts", "preview");
    mkdirSync(logDir, { recursive: true });
    const logPath = join(logDir, "server.log");
    const log = openSync(logPath, "a");
    const server = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", "--hostname", "127.0.0.1", "--port", "3100"], {
      cwd: root,
      detached: true,
      windowsHide: true,
      stdio: ["ignore", log, log],
    });
    closeSync(log);
    let startupError;
    server.once("error", (error) => { startupError = error; });
    server.once("exit", (code) => {
      startupError = new Error(`The local server exited (${code}). See ${logPath}`);
    });
    server.unref();
    const deadline = Date.now() + 90_000;
    while (!(await ready())) {
      if (startupError) throw startupError;
      if (Date.now() > deadline) throw new Error(`The local server did not start. See ${logPath}`);
      await delay(500);
    }
  }

  const chrome = [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], process.env.LOCALAPPDATA]
    .filter(Boolean).some((base) => existsSync(join(base, "Google", "Chrome", "Application", "chrome.exe")));
  const mobile = mode === "mobile";
  // Separate temporary browser profiles keep preview settings out of the user's browser.
  const context = await chromium.launchPersistentContext("", {
    channel: chrome ? "chrome" : "msedge",
    headless: false,
    viewport: null,
    ...(mobile ? { hasTouch: true, userAgent: devices["Pixel 7"].userAgent } : {}),
    args: ["--window-size=1440,960"],
  });
  const page = context.pages()[0] ?? await context.newPage();
  try {
    if (mobile) {
      // Launcher-only wrapper: never add preview chrome to the public website.
      const previewUrl = `${url}__mobile-preview`;
      await context.route(previewUrl, (route) => route.fulfill({
        contentType: "text/html",
        body: readFileSync(join(root, "scripts", "mobile-preview.html"), "utf8"),
      }));
      await page.goto(previewUrl);
    } else {
      await page.goto(url);
    }
  } catch (error) {
    await context.close();
    throw error;
  }
  console.log(`${mobile ? "Mobile (390 x 844, touch enabled)" : "Desktop"} preview: ${page.url()}`);
  console.log("Edits reload automatically. Close the browser when finished; the shared local server stays running.");
  await new Promise((resolve) => context.once("close", resolve));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
