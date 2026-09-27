---
title: 'Story 1.1: Project scaffolding and CI skeleton'
type: 'chore'
created: '2026-09-27'
status: 'ready-for-dev'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-1-context.md'
  - '{project-root}/project-phase-folders/2-Planleggingsfasen/SnowFinder-DESIGN.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Nothing buildable exists yet. Every later story needs a stable folder layout, a working toolchain, CI, and one code source for DESIGN.md tokens (AD-9).

**Approach:** Hand-roll a single npm package at the repo root (no starter template): Vite 8.3.0 + React 19.3.0 + TypeScript 6.0.x, the architecture's folder skeleton, a minimal app shell, `theme.ts` + `tokens.css` with a drift test, and a `ci.yml` that runs lint, typecheck, unit tests and build on every PR.

## Boundaries & Constraints

**Always:**
- Pin exact versions (no `^`), verified compatible: `react`/`react-dom` 19.3.0; dev: `typescript` 6.0.3 (NOT 7 — typescript-eslint needs <6.1), `vite` 8.3.0, `vitest` 5.0.1, `@vitejs/plugin-react` 6.1.1, `eslint` 10.11.0, `@eslint/js` 10.0.1, `typescript-eslint` 8.70.1, `eslint-plugin-react-hooks` 7.1.1, `globals` 17.12.0, `@types/react`/`@types/react-dom` 19.3.0, `@types/node` 24.19.0. Commit `package-lock.json`.
- `theme.ts` holds every DESIGN.md frontmatter token in `colors`, `typography`, `rounded`, `spacing`, keyed identically to DESIGN.md (including `-dark` and `snowscore-*` colors). `tokens.css` mirrors them as CSS custom properties.
- Dark mode switching (`prefers-color-scheme`) is deferred to the first story with real UI; `-dark` tokens exist only as plain variables now.
- CI runs Vitest from this story on (decision: the story's own AC requires `theme.test.ts` to fail CI on drift, which overrides the "no tests yet" wording).
- Leave existing root content untouched (`.github/agents/`, `_bmad/`, `.claude/`, `.agents/`, `project-phase-folders/`, `project-workspace/`, `ai-log/`).

**Never:**
- No business logic, no database tables, no migrations, no Supabase client or dependency, no routing, no Leaflet.
- No `e2e.yml` or `deploy.yml` yet (need a preview deploy/hosting that does not exist).
- No literal hex/px values in components for anything DESIGN.md names.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Tokens in sync | `tokens.css` matches `theme.ts` | `theme.test.ts` passes | N/A |
| Value drift | one CSS value differs from `theme.ts` | test fails, naming the variable | CI job red |
| Missing variable | token in `theme.ts` has no CSS var | test fails, naming the missing var | CI job red |
| Extra variable | CSS var with no `theme.ts` token | test fails, naming the extra var | CI job red |

</frozen-after-approval>

## Code Map

- `project-phase-folders/2-Planleggingsfasen/SnowFinder-DESIGN.md` (frontmatter lines 1–100) -- source for all token values; `components` block is NOT tokenized (it only references other tokens).
- `project-phase-folders/2-Planleggingsfasen/SnowFinder-Arkitektur.md` (Structural Seed, lines 221–266) -- canonical folder list.
- `.gitignore` -- already ignores `node_modules/`, `dist/`, `coverage/`, `*.tsbuildinfo`; reuse, do not duplicate.
- `.github/agents/` -- BMAD agent configs; do not touch. Add `.github/workflows/` beside it.

## Tasks & Acceptance

**Execution:**
- [ ] `package.json` -- create with `"type": "module"`, `"engines": {"node": ">=24"}`, scripts `dev`, `build` (`tsc -b && vite build`), `typecheck` (`tsc -b`), `lint` (`eslint .`), `test` (`vitest run`); pinned deps -- toolchain entry point.
- [ ] `tsconfig.json` (`"files": []` + `references` to the two below), `tsconfig.app.json` (include `src`, `shared`; strict; `noEmit`; `types: ["node", "vite/client"]`; `tsBuildInfoFile: ./node_modules/.tmp/tsconfig.app.tsbuildinfo`), `tsconfig.node.json` (include `vite.config.ts`; same pattern) -- Vite-template project-reference pattern so `tsc -b` typechecks without emitting; no `composite`.
- [ ] `vite.config.ts` -- `defineConfig` from `vitest/config`; React plugin; `test` block: environment `node`, include `src/**/*.test.{ts,tsx}`, `shared/**/*.test.ts`, `supabase/functions/**/*.test.ts` (AD-4).
- [ ] `eslint.config.js` -- flat config: `@eslint/js` recommended + `typescript-eslint` + `eslint-plugin-react-hooks`; use `reactHooks.configs.flat.recommended`, `globals.browser`; ignore `dist`, `coverage`, `_bmad`, `.claude`, `.agents`, `ai-log`, `project-*`.
- [ ] `index.html`, `src/main.tsx` (imports `./styles/tokens.css` and `./App.css`), `src/App.tsx`, `src/App.css` -- minimal shell rendering `<h1>SnowFinder</h1>`; `App.css` uses only `var(--…)` from `tokens.css`.
- [ ] `src/lib/theme.ts` -- exported `as const` objects `colors`, `typography`, `rounded`, `spacing`; every value is the DESIGN.md string verbatim (e.g. `fontWeight: '700'`, `spacing['1']: '4px'`).
- [ ] `src/styles/tokens.css` -- `:root` custom properties, naming `--color-<key>`, `--rounded-<key>`, `--spacing-<key>`, `--typography-<style>-<kebab-prop>` — e.g. `--spacing-1: 4px`, `--typography-meta-letter-spacing: 0.01em`, `--typography-numeric-font-feature-settings: 'tnum' 1`, `--typography-display-font-family: 'Inter', system-ui, sans-serif`.
- [ ] `src/lib/theme.test.ts` -- read `tokens.css` via `readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8')`, parse `--name: value;` pairs, flatten `theme.ts` with the same naming rule, assert exact set equality and value equality (compare after `trim()` only, no other normalisation); cover the four matrix rows (drift cases via small inline CSS fixtures fed to the same parse/compare helper).
- [ ] Empty skeleton dirs with `.gitkeep`: `src/pages`, `src/components`, `src/hooks`, `src/lib/supabase`, `src/lib/types`, `shared`, `supabase/migrations`, `supabase/functions`, `scripts/build-catalog`, `tests/e2e`, `tests/contract/fixtures`.
- [ ] `.github/workflows/ci.yml` -- on `pull_request` and `push` to `main`; `permissions: contents: read`; `ubuntu-latest`; `actions/setup-node` Node 24 with `cache: npm`; `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- [ ] `README.md` -- short "Kom i gang" section (Norwegian, matching the file): `npm install`, `npm run dev`, `npm test`.

**Acceptance Criteria:**
- Given a fresh clone, when running `npm ci && npm run lint && npm run typecheck && npm test && npm run build`, then every command exits 0.
- Given the skeleton, when listing the tree, then every folder in the architecture's Structural Seed that this story owns exists.
- Given a PR, when CI runs, then `ci.yml` executes lint, typecheck, tests and build.
- Given `package.json`, when inspected, then no Supabase, Leaflet or router dependency is present.

## Implementation Notes

## Spec Change Log

## Review Triage Log

- Pre-approval spec review (subagent), 9 findings, all accepted: exact dev-dep pins incl. TS 6.0.3 (high); test file types for reading tokens.css (high); Vitest include per AD-4 (medium); token naming/compare examples (medium); tsc -b project-reference pattern (medium); dark mode deferred explicitly (low); app shell wiring (low); CI permissions/cache/Linux lockfile (low); ESLint ignores + react-hooks preset (low).

## Verification

**Commands:**
- `npm ci` -- expected: installs from lockfile with no peer-dependency errors (locally and in CI on `ubuntu-latest`; if Linux Rolldown bindings are missing from the Windows-made lockfile, regenerate it)
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: all exit 0, `theme.test.ts` passes

**Manual checks (if no CLI):**
- Temporarily edit one value in `tokens.css` and run `npm test` -- expected: failure naming that variable; revert.
