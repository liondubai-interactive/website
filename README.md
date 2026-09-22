# LionDubai Interactive website

Public, static product site for https://liondubai.net. Only publishable website
source belongs here. No private history, credentials or operational records.

## Develop and check

Node.js 24 and npm 11. Run `npm ci`, then `npm run dev`.
Open http://localhost:3000/ (no repository subpath).
Run `npm run lint` and `npm test` to check the complete static export.

## Publish

Cloudflare Pages builds and hosts the static export. The `liondubai-website`
project is connected to this repository; pushes to `main` deploy automatically
only after its build command passes. GitHub stores the source; it no longer
publishes the website through GitHub Pages.

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | None (the repository configures Next.js static export) |
| Root directory | Repository root |
| Build command | `npm run lint && npm test` |
| Output directory | `out` |
| Build variables | `NODE_VERSION=24`, `NEXT_TELEMETRY_DISABLED=1` |
| Pages address | `liondubai-website.pages.dev` |
| Custom domains | `liondubai.net`, `www.liondubai.net` |

Use the Pages project's Custom domains flow before pointing DNS at it. The
`www` hostname redirects to the apex through a Cloudflare Single Redirect rule,
preserving the path and query string. Match only `www.liondubai.net`, redirect
to `https://liondubai.net` plus the request path, use status 301 and preserve
query strings. Pages `_redirects` source patterns cannot match hostnames.
HTTPS certificates are managed by Cloudflare. Static hosting uses
the Free plan; no Pages Functions or paid add-ons are needed.

GitHub Actions checks pull requests independently. Production pushes run the
same lint, build and export tests in Cloudflare, avoiding a duplicate main-branch
build. A failed build leaves the last successful deployment available. To undo
a bad release, restore a known-good commit or use Pages' production rollback;
then fix/revert the source so the next push does not reintroduce it.

After publishing, check the home, pricing, contact and policy pages, the TikTok
verification file, image assets, unknown-route 404s and the `www` redirect over
HTTPS. The public site does not host the API or database.

No analytics, tracking scripts, payment keys or account database belong here.
Public downloads and checkout must not be advertised until they are ready.
Provider verification files in `public/` are intentionally public proof files.

## Design

Keep the header focused on integrations, pricing and contact; policy links live
in the shared footer. `app/integrations.ts` owns the public product descriptions
and planned prices used by both the home and pricing pages. The preset preview
is a static illustration, not an interactive product demo. It adds no animation
library, external font, tracker or image download.

The layout supports narrow screens, visible keyboard focus, a skip link and
reduced motion. When changing it, check home, pricing, contact and policy pages
at mobile and desktop widths. Preserve launch-status and billing-policy notices.
