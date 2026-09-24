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

After publishing, check the home, download and policy pages, the TikTok
verification file, image assets, unknown-route 404s and the `www` redirect over
HTTPS. The public site does not host the API or database.

No analytics, tracking scripts, payment keys or account database belong here.
Public downloads and checkout must not be advertised until they are ready.
Provider verification files in `public/` are intentionally public proof files.

## Design

Keep the header focused on download, plugins and account access; contact logos sit beside policy
links in a compact footer row, centered on mobile with copyright below. The retired `/contact` URL redirects
to the footer; support and privacy requests also have direct email links in the policies.
Logo artwork in `public/brands/` matches the desktop assets, sourced from
https://github.com/gilbarbara/logos/tree/main/logos. The Next.js root layout owns the header and footer for
all pages, including missing routes. `app/integrations.ts` owns the public product descriptions
and planned prices displayed on the home plugin cards. `/pricing` redirects to this section.
The home plugin cards use a responsive three-column grid with a small image zoom
and highlight on hover or keyboard focus; reduced motion disables transitions.
The preset preview is a static illustration, not an interactive product demo. It adds no animation
library, external font, tracker or image download.

The layout supports narrow screens, visible keyboard focus, a skip link and
reduced motion. When changing it, check home, download and policy pages
at mobile and desktop widths. Preserve launch-status and billing-policy notices.

## Website accounts and releases

The public home now leads with Download for Windows. `/download/` explains installation;
`/login/` uses TikTok and `/account/` displays the authenticated user's plugins and billing.
The website remains a static export: authentication, sessions, prices and access come
from `https://api.liondubai.net/api/liondubai/web`. No secrets or private admin source
belong in this repository. Administrators use their existing website sign-in at `https://api.liondubai.net/admin/`; the backend checks their current role.

One browser session lookup is shared by navigation and account pages. Requests include
credentials; mutations send the session's CSRF token. No periodic polling is used.
The profile-picture dropdown owns account navigation, admin entry and sign-out on
every page. It uses a native popover for keyboard and outside-click dismissal.
Trials require confirmation. Active trial buttons count down locally from server time and expiry using
elapsed browser time, without polling. Public plugin portraits are optimized copies
of the desktop artwork in `public/plugins/`, shared by home and account pages.
Backend prices (including Sandbox prices) drive account billing, while public pricing
remains clearly labeled planned launch pricing. Website
login readiness comes from `/web/config`; do not enable public sign-in before the backend
and approved TikTok web callback are ready. `?view=customer` keeps an administrator on
the ordinary account page instead of redirecting to staff verification.

The download button stays disabled until all three public build variables in
`.env.example` are configured: release URL, version and SHA-256. Configure only an actual
tested, code-signed Windows x64 installer over HTTPS. Those variables are public, and
changing them requires a new Pages build. Do not use a private repository's release URL.
Validate the binary and supported Windows versions before advertising requirements or
publishing the release. An installer download is never proxied through the API.

`npm test` builds and checks the static export. `npm run test:browser` runs isolated
headless browser fixtures for login, trial confirmation, billing navigation, logout and
responsive layout, with no real sign-in or payment. Locally it uses installed Chrome;
CI installs Playwright Chromium. Screenshots stay ignored under `.artifacts/browser/`.
