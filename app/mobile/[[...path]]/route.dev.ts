import { readFile } from "node:fs/promises";
import { join } from "node:path";

// next.config.ts discovers *.dev.ts routes only in the development server.
export async function GET() {
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });
  const html = await readFile(join(process.cwd(), "scripts", "mobile-preview.html"), "utf8");
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
