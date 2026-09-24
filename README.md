# LionDubai Interactive website

Public, static product site for https://liondubai.net. Only publishable website
source belongs here. No private history, credentials or operational records.

## Develop and check

Node.js 24 and npm 11. Run `npm ci`, then `npm run dev`.
Open http://localhost:3000/ (no repository subpath).
Run `npm run lint` and `npm test` to check the complete static export.

On Windows, double-click `Preview Desktop.cmd` or `Preview Mobile.cmd` in this
folder. Both start or reuse the local development server on port 3100, with live
reload. The mobile launcher opens a separate Chrome (or Edge) window with a
centered, framed 390 x 844 phone screen with touch input; the frame scales to fit
the window while the website keeps its mobile layout. Desktop opens a normal
resizable preview. The mobile wrapper exists only inside the launcher's browser;
it is not published with the site. Neither changes your everyday browser profile.
Install dependencies with `npm ci` first. Closing a preview leaves the shared
server running; startup logs stay in the ignored `.artifacts/preview/` folder.

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

Keep the header focused on download, games and account access; contact logos sit beside policy
links in a compact footer row, centered on mobile with copyright below. The retired `/contact` URL redirects
to the footer; support and privacy requests also have direct email links in the policies.
Logo artwork in `public/brands/` matches the desktop assets, sourced from
https://github.com/gilbarbara/logos/tree/main/logos. The Next.js root layout owns the header and footer for
all pages, including missing routes. `app/integrations.ts` owns the public product descriptions
and planned prices displayed on the home plugin cards. `/pricing` redirects to this section.
`/games/` lists Minecraft as the current supported game and links to those plugins;
add other games only when their integrations are ready.
The home plugin cards use a responsive three-column grid with a small image zoom
and highlight on hover or keyboard focus; reduced motion disables transitions.
The Games catalog uses those same cards. Scrollbar space stays reserved so navigation does not shift between pages.
Footer logos retain their original brand colors, with compact 40px click targets.
Shared type, color and surface styles keep public and account pages consistent.
The sticky header uses centered pill navigation, with account and download actions on the right.
It blends into the page at the top and gains a subtle divider when scrolled. The opening section
fills the available viewport; the plugin cards follow below it.
On mobile, the hero places the headline above the scene, followed by the short
description, actions and trial facts. The featured-plugin section uses a compact
heading row, with the trial note stacked beneath it on narrow screens.
The home hero uses a locally bundled, lazy-loaded `@google/model-viewer` for the
interactive scene. Drag or arrow keys rotate it; zoom/pan are disabled so page
scrolling stays normal. Independent floating animation plays automatically while
visible, pausing offscreen and in hidden tabs. Reduced motion stays static.
There is no visible control row. The scene fades in after loading with its camera settled,
so there is no mismatched poster-to-model jump. A small WebP downloads only if 3D fails.
The GLB stays below 500 KB and contains the complete scene and eight-second animation.
It needs no textures, external decoder, environment download, API requests or server rendering.
The built-in studio environment supplies reflections for metal and glass finishes.
Standard-density desktop displays use 1.25x supersampling for smoother diagonal
edges; mobile and high-density screens retain native rendering. The viewer can
still reduce render resolution under load, and pauses when hidden or offscreen.
Cloudflare serves static files only. Versioned `/models/` assets are cached for one
year; change their filenames and component references whenever their contents change.
The viewer runtime is a separate browser chunk, loaded only when the home scene is
visible. Other routes do not initialize a 3D viewer. No external font or tracker is loaded.

The scene has one TikTok coin, a Twitch crystal, gift box and subscription star,
one KICKs gem and one plain rainbow diamond representing YouTube Jewels, each floating independently alongside
the laptop and phone. The symbols retain the original coin motion, staggered in
depth and height with clearance from devices and one another throughout the loop.
Model provenance is in `public/models/LICENSE.txt`. The phone is original geometry
with a continuous back; the earlier royalty-free reference phone is not distributed.
Its height is about 47% of the laptop width, matching a 16 cm phone beside a
roughly 34 cm laptop. The floating symbols keep their approved scale and positions.
Screens retain separate materials for future media. Keep the Blender authoring
files outside this public website repository. To optimize a new GLB export, run:

```sh
npx @gltf-transform/cli@4.3.0 optimize INPUT.glb public/models/hero-vNEXT.glb --compress quantize --flatten false --join false --palette false --instance false --simplify-error 0.0001 --texture-compress false
```

This preserves animated roots and screen materials, reduces repeated geometry and
keyframes, and quantizes vertices without shipping a decoder. Check all animated
objects, the loop boundary, the initial camera framing and a rotated view after updates.

The layout supports narrow screens, keyboard controls, a skip link and
reduced motion. When changing it, check home, download and policy pages
at mobile and desktop widths. Keep availability and payment information accurate.

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
Backend prices (including Sandbox prices) drive account billing. Public product copy
is platform-neutral and avoids development-stage labels; provider-specific sign-in,
privacy disclosures and accurate payment notices remain explicit. Website
login readiness comes from `/web/config`; do not enable public sign-in before the backend
and approved TikTok web callback are ready. `?view=customer` keeps an administrator on
the ordinary account page instead of redirecting to the admin dashboard.

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
