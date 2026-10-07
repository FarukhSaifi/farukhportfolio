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

