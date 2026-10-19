# AGENTS.md

<!-- once-ui-agent-harness:start -->
## Once UI codegen harness

Before generating Once UI code, load the harness from your installed package (not full doc pages):

1. Read `node_modules/@once-ui-system/core/ai/manifest.json`
2. Load bootstrap: `ai/rules.compact.md` + `ai/catalog.json`
3. Match intent via `ai/tasks/index.json` → fetch task bundle + component slices
4. Validate: `npx once-ui-validate-ai-code path/to/file.tsx`

npm exports: `@once-ui-system/core/ai/manifest.json`

Remote fallback: https://docs.once-ui.com/ai/manifest.json
<!-- once-ui-agent-harness:end -->


<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
