# LionDubai website

Read README.md and relevant docs before edits. Keep this project independently buildable.
Preserve approved behavior. Never commit credentials, logs, dependencies or generated output.
Prefer existing runtime/framework APIs or proven, maintained libraries over custom
infrastructure when they reduce code and maintenance. Check compatibility, security,
dependency weight and hosting traffic; keep product-specific rules with their owner.
Run relevant checks and review the staged diff before committing. Commit/push only when requested.
This repository is PUBLIC. Review every published file; never import private repository history or operational records.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
