# LionDubai Interactive website

Public, static product site for https://liondubai.net. Only publishable website
source belongs here. No private history, credentials or operational records.

## Develop and check

Node.js 24 and npm 11. Run `npm ci`, then `npm run dev`.
Open http://localhost:3000/ (no repository subpath).
Run `npm run lint` and `npm test` to check the complete static export.

## Publish

GitHub Actions builds `out/` and deploys to GitHub Pages. Enable Pages with
GitHub Actions as its source, verify domain ownership, and configure the custom
domain `liondubai.net` and HTTPS. DNS must match Pages before launch.
The public site does not host the API or database.

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
