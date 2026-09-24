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
resizable preview. The phone frame also opens directly at `/mobile/` on the local
server, using either localhost or 127.0.0.1; page navigation uses `/mobile/games/`,
`/mobile/privacy/`, etc. It displays the real website in a 390px iframe, sharing its
assets and live reload. `next.config.ts` discovers `route.dev.ts` only during development;
no mobile preview routes or frame are included in the production export.
Neither launcher changes your everyday browser profile.
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

After publishing, check the home, Games and policy pages, the TikTok
verification file, image assets, unknown-route 404s and the `www` redirect over
HTTPS. The public site does not host the API or database.

No analytics, tracking scripts, payment keys or account database belong here.
Public downloads and checkout must not be advertised until they are ready.
Provider verification files in `public/` are intentionally public proof files.

## Design

The header uses `public/brands/liondubai-symbol-white.svg`: the lion/Burj outline
shared with the device emblems, in white on transparency. Its viewBox fits the
symbol exactly, with no background or padding. It renders at 40px wide on desktop
and 32px on narrow mobile screens; the wordmark stays separate. Browser icons
retain the padded red `public/app-icon-v3.png` app tile.
The solid header symbol is authored in Blender, with white faces and filled rose
edges. `public/models/brand-symbol-v1.glb` is a 16.7 KB texture-free model, with a
continuous 360-degree turn every 28 seconds. It shares the existing model-viewer
package with the hero and renders at the current display/zoom resolution. Small
1x displays get supersampling; reported limited hardware uses native resolution.
The emblem and hero use the renderer's native display-synced animation loop,
with no fixed frame-rate cap or extra JavaScript animation clock. The emblem
plays its 28-second clip in reverse. Playback pauses when hidden or offscreen. Reduced motion, Save-Data, and loading
failures keep the SVG fallback. There is no compressed logo video or custom
canvas drawing code. Private Blender sources stay outside this repo.
Keep the header focused on Home, Games and account access; contact logos sit beside policy
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
The Games catalog starts with a search field that filters game names and editions,
followed by compact landscape cards in an auto-filling grid, with a
260px maximum card width. Minecraft artwork is sourced from the official
[key art update](https://www.minecraft.net/en-us/article/key-art-update)
(`NewKeyArt_Header.jpg`), optimized locally as `public/games/minecraft-cover.webp`.
Artwork remains copyright Mojang/Microsoft. Scrollbar space stays reserved so navigation does not shift between pages.
Footer logos retain their original brand colors, with compact 40px click targets.
Shared type, color and surface styles keep public and account pages consistent.
The sticky header uses centered pill navigation, with account access on the right.
The language selector is a catalogue preview: English is the default, and choosing
another language updates only the selector, never page text, direction or locale.
Its searchable list loads on first opening and renders in batches. The local
`app/data/languages.json` catalogue uses ISO 639-3 codes and reference names from
[SIL's official registry](https://iso639-3.sil.org/code_tables/download_tables)
(retrieved September 24, 2026), excluding special non-language codes. Two-letter
codes are used where available; native names for those entries are supplemental
labels generated with `Intl.DisplayNames`, not part of the ISO dataset.
It blends into the page at the top and gains a subtle divider when scrolled. The opening section
fills the available viewport; the plugin cards follow below it.
Every page uses burgundy with warm white text and a pale rose accent.
A CSS radial glow separates the 3D scene from the background without adding a
texture or affecting drag controls. The hero fades into the shared page color;
catalogue cards, account panels, menus and dialogs use a lighter burgundy surface.
Small warm particles drift slowly in independent, gently changing directions behind
content across all website pages. The mouse nudges nearby particles onto new paths;
they retain that direction and gradually slow to their usual drift speed without
springing back. The decorative canvas ignores pointer
hits, caps its pixel ratio at 1.5 (1 on reported limited hardware) and contains at most
110 particles. Two tiny in-memory sprites are drawn in sync with the display,
with elapsed-time motion
and cached pointer bounds to avoid layout reads on mouse movement. Animation
pauses in hidden or unfocused tabs, and remains
static for reduced-motion preferences. Touch devices retain drift without cursor repulsion. No extra asset or library
is downloaded for the effect.

Scrolling temporarily holds the hero, emblem and particles at their current
frames, resuming 150 ms after the last scroll event without advancing through the
pause. One shared passive listener coordinates them without React state updates.
New model initialization waits until scrolling stops. The particle canvas uses
the stable large viewport height so mobile address-bar movement does not repeatedly
reallocate its bitmap; other size changes are applied after the scroll settles.
Success and error states use colors with contrast against these dark surfaces.
Shared links use a versioned image of this hero. Regenerate it against the local
preview with `node scripts/render-social-card.mjs`; update its versioned filename
and shared metadata when replacing it. Keep older published image URLs available
for cached cards. Open Graph and Twitter metadata use the same image definition.
On mobile, the hero places the headline above the scene, followed by the short
description, actions and trial facts. The mobile scene is centered at 125% of its
layout width, using the render's surrounding space without changing device proportions.
The featured-plugin section uses a compact
heading row, with the trial note stacked beneath it on narrow screens.
The home hero uses a locally bundled, lazy-loaded `@google/model-viewer` for the
interactive scene. Drag or arrow keys rotate it; zoom/pan are disabled so page
scrolling stays normal. Independent floating animation plays automatically while
visible, pausing offscreen and in hidden or unfocused tabs. Reduced motion stays static.
There is no visible control row. The scene fades in after loading with its camera settled,
so there is no mismatched poster-to-model jump. A small WebP downloads only if 3D fails.
The GLB stays below 500 KB and contains the complete scene and eight-second animation.
It needs no textures, external decoder, environment download, API requests or server rendering.
The built-in studio environment supplies reflections for metal and glass finishes.
Standard-density desktops retain 1.25x supersampling for smoother diagonal edges.
Touch-only screens cap effective 3D pixel density at 2; reported limited hardware
or Data Saver caps it at 1.5 and skips supersampling. Browser hints (at most four
logical processors or 4 GB reported memory) select the conservative mode; unknown
hardware retains normal settings. Render scaling preserves the scene's visible
size and camera framing, without changing model assets. The viewer can
still reduce render resolution under load, and pauses when hidden or offscreen.
Cloudflare serves static files only. Versioned `/models/` assets are cached for one
year; change their filenames and component references whenever their contents change.
The viewer runtime is one shared browser chunk, loaded when a 3D element becomes
visible. Other routes load only the small header emblem, never the hero model.
No external font or tracker is loaded.

The scene has one TikTok coin, a Twitch crystal, gift box and subscription star,
one KICKs gem and one plain rainbow diamond representing YouTube Jewels, each floating independently alongside
the laptop and phone. The symbols retain the original coin motion, staggered in
depth and height with clearance from devices and one another throughout the loop.
Model provenance is in `public/models/LICENSE.txt`. The phone is original geometry
with a continuous back; the earlier royalty-free reference phone is not distributed.
Its height is about 47% of the laptop width, matching a 16 cm phone beside a
roughly 34 cm laptop. The six floating symbols use a 75% base scale. Visual balancing further trims
the diamond by 15%, the gift by 10% and the KICKs gem by 8%; positions
and animation remain unchanged. The camera target and distance preserve the approved
laptop and phone framing independently of the smaller scene bounds.
Screens retain separate materials for future media. Shallow beveled lion/Burj
emblems share one polished chrome material on the laptop lid and phone back.
The lid's flat face has uniform normals to prevent a diagonal reflection seam;
its rounded edges retain their original shading. Device geometry, media UVs and
animation are preserved. Keep the Blender authoring
files outside this public website repository. To optimize a new GLB export, run:

```sh
npx @gltf-transform/cli@4.3.0 optimize INPUT.glb public/models/hero-vNEXT.glb --compress quantize --flatten false --join false --palette false --instance false --simplify-error 0.0001 --texture-compress false
```

This preserves animated roots and screen materials, reduces repeated geometry and
keyframes, and quantizes vertices without shipping a decoder. Check all animated
objects, the loop boundary, the initial camera framing and a rotated view after updates.

The layout supports narrow screens, keyboard controls, a skip link and
reduced motion. When changing it, check home, Games and policy pages
at mobile and desktop widths. Keep availability and payment information accurate.

## Website accounts and releases

Downloads are offered only on Home through Download for Windows; there is no separate download page.
Old `/download/` links redirect to Home.
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
