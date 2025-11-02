# GitHub Copilot Instructions

Follow `.cursor/rules/*.mdc` conventions. Rules activate via file globs.

**`src/*.ts`** (`.cursor/rules/src-core.mdc`): Strict TS, class API, JSDoc `@public`/`@internal`, export types  
**`src/lib/**`** (`.cursor/rules/src-lib.mdc`): Functional modules, named exports, type guards  
**`tests/**`** (`.cursor/rules/tests.mdc`): Vitest, happy-dom, clean DOM in `afterEach`, use `destroy()`, mock with `vi`  
**`example/**`** (`.cursor/rules/example.mdc`): JS ESM, Vite, TailwindCSS v4, Handlebars, Tweakpane  
**Config files** (`.cursor/rules/config.mdc`): Rollup ESM+CJS, ESLint, Prettier, Vitest  
**`wiki/**`** (`.cursor/rules/wiki.mdc`): Markdown, git submodule, publish via `npm run wiki`  
**`scripts/**`** (`.cursor/rules/scripts.mdc`): Bash with shebang, `set -e`
