---
title: 'Story 1.1: Project scaffolding and CI skeleton'
type: 'chore'
created: '2026-09-27'
status: 'done'
baseline_commit: 'dcd81e6c2923560873201f298bed121e7841ddca'
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
- [x] `package.json` -- create with `"type": "module"`, `"engines": {"node": ">=24"}`, scripts `dev`, `build` (`tsc -b && vite build`), `typecheck` (`tsc -b`), `lint` (`eslint .`), `test` (`vitest run`); pinned deps -- toolchain entry point.
- [x] `tsconfig.json` (`"files": []` + `references` to the two below), `tsconfig.app.json` (include `src`, `shared`; strict; `noEmit`; `types: ["node", "vite/client"]`; `tsBuildInfoFile: ./node_modules/.tmp/tsconfig.app.tsbuildinfo`), `tsconfig.node.json` (include `vite.config.ts`; same pattern) -- Vite-template project-reference pattern so `tsc -b` typechecks without emitting; no `composite`.
- [x] `vite.config.ts` -- `defineConfig` from `vitest/config`; React plugin; `test` block: environment `node`, include `src/**/*.test.{ts,tsx}`, `shared/**/*.test.ts`, `supabase/functions/**/*.test.ts` (AD-4).
- [x] `eslint.config.js` -- flat config: `@eslint/js` recommended + `typescript-eslint` + `eslint-plugin-react-hooks`; use `reactHooks.configs.flat.recommended`, `globals.browser`; ignore `dist`, `coverage`, `_bmad`, `.claude`, `.agents`, `ai-log`, `project-*`.
- [x] `index.html`, `src/main.tsx` (imports `./styles/tokens.css` and `./App.css`), `src/App.tsx`, `src/App.css` -- minimal shell rendering `<h1>SnowFinder</h1>`; `App.css` uses only `var(--…)` from `tokens.css`.
- [x] `src/lib/theme.ts` -- exported `as const` objects `colors`, `typography`, `rounded`, `spacing`; every value is the DESIGN.md string verbatim (e.g. `fontWeight: '700'`, `spacing['1']: '4px'`).
- [x] `src/styles/tokens.css` -- `:root` custom properties, naming `--color-<key>`, `--rounded-<key>`, `--spacing-<key>`, `--typography-<style>-<kebab-prop>` — e.g. `--spacing-1: 4px`, `--typography-meta-letter-spacing: 0.01em`, `--typography-numeric-font-feature-settings: 'tnum' 1`, `--typography-display-font-family: 'Inter', system-ui, sans-serif`.
- [x] `src/lib/theme.test.ts` -- read `tokens.css` via `readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8')`, parse `--name: value;` pairs, flatten `theme.ts` with the same naming rule, assert exact set equality and value equality (compare after `trim()` only, no other normalisation); cover the four matrix rows (drift cases via small inline CSS fixtures fed to the same parse/compare helper).
- [x] Empty skeleton dirs with `.gitkeep`: `src/pages`, `src/components`, `src/hooks`, `src/lib/supabase`, `src/lib/types`, `shared`, `supabase/migrations`, `supabase/functions`, `scripts/build-catalog`, `tests/e2e`, `tests/contract/fixtures`.
- [x] `.github/workflows/ci.yml` -- on `pull_request` and `push` to `main`; `permissions: contents: read`; `ubuntu-latest`; `actions/setup-node` Node 24 with `cache: npm`; `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- [x] `README.md` -- short "Kom i gang" section (Norwegian, matching the file): `npm install`, `npm run dev`, `npm test`.

**Acceptance Criteria:**
- Given a fresh clone, when running `npm ci && npm run lint && npm run typecheck && npm test && npm run build`, then every command exits 0.
- Given the skeleton, when listing the tree, then every folder in the architecture's Structural Seed that this story owns exists.
- Given a PR, when CI runs, then `ci.yml` executes lint, typecheck, tests and build.
- Given `package.json`, when inspected, then no Supabase, Leaflet or router dependency is present.

## Implementation Notes

- All pins installed as specified; `npm install` resolved them with no peer-dependency errors and 0 vulnerabilities. `package-lock.json` (made on Windows, Node 26.7 / npm 11.19) lists every `@rolldown/binding-*` optional package, including `binding-linux-x64-gnu`, so `npm ci` on `ubuntu-latest` should not need a regenerated lockfile.
- `theme.test.ts` keeps the parse/compare helpers local to the test file (not exported from `theme.ts`), so the shipped module holds tokens only. The comparison checks set equality and values after `trim()` only; failures list every drift as `missing variable …`, `extra variable …` or `value drift in …`.
- `eslint.config.js` uses `tseslint.config(...)` with `js.configs.recommended`, `tseslint.configs.recommended` and `reactHooks.configs.flat.recommended`; the ignores are exactly those in the task.
- tsconfigs follow the Vite template (bundler resolution, `verbatimModuleSyntax`, strict, `noEmit`, no `composite`).
- `index.html` uses `lang="nb"` because the UI is Norwegian only.

## Spec Change Log

## Review Triage Log

- Pre-approval spec review (subagent), 9 findings, all accepted: exact dev-dep pins incl. TS 6.0.3 (high); test file types for reading tokens.css (high); Vitest include per AD-4 (medium); token naming/compare examples (medium); tsc -b project-reference pattern (medium); dark mode deferred explicitly (low); app shell wiring (low); CI permissions/cache/Linux lockfile (low); ESLint ignores + react-hooks preset (low).

**Implementation review, 2026-10-07** (Blind Hunter, Edge Case Hunter, Verification Gap). There are no intent_gap or bad_spec findings, so there is no loopback.

| # | Layer | Finding | Verdict | Route | Evidence |
|---|---|---|---|---|---|
| 1 | blind | `package-lock.json` missing from the diff | false | reject | The file is tracked and committed; the coordinator left it out of the review diff on purpose (generated file). |
| 2 | blind, verification-gap | Windows-made lockfile not proven on Linux / Node 24 | maybe-false | settled by PR CI | It lists `@rolldown/binding-linux-x64-gnu`. The first CI run on the PR decides it. |
| 3 | blind | Spec status and triage log do not match the work | false | reject | Status set to `in-review` in step 4. This log is written in step 5, as the workflow defines. |
| 4 | blind | Dark-mode deferral recorded only in a CSS comment | false | reject | Recorded in the frozen intent (Boundaries, "Always": dark mode switching deferred). |
| 5 | blind, edge | `parseCssVars` silently overwrites a variable declared twice | low | patch | `Map.set` keeps the last value. Now reported as `duplicate variable`, with a test. |
| 6 | edge | `engines >=24` admits Node 25, which vitest 5.0.1 excludes | low | patch | Vitest engines are `^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0`. Changed to `^24.0.0 \|\| >=26.0.0`. |
| 7 | blind, edge | CI has no timeout or concurrency control | low | patch | Added `timeout-minutes: 15` and a concurrency group that cancels outdated runs. |
| 8 | blind | README does not show the CI gates (lint, typecheck, build) and uses `npm install` | low | patch | README is graded (criterion 6). It now uses `npm ci` and lists all gates. |
| 9 | blind, edge | CSS parser reads declarations outside `:root` | low | defer | Only one `:root` block exists today. This becomes real with dark mode. |
| 10 | blind | ESLint uses browser globals for every file; `scripts/`, `supabase/functions/` and `tests/` are not type-checked | low | defer | No code exists there yet. Due with Stories 1.2 and 1.3. |
| 11 | blind | Nothing checks that CSS uses only `var(--…)`, or that `theme.ts` matches DESIGN.md | low | defer | Values match today (checked by hand by Verification Gap). It needs tooling (stylelint or a frontmatter test). |
| 12 | blind | Inter font named but never loaded | low | defer | Falls back to `system-ui`. Decide in the first UI story (NFR-2 performance). |
| 13 | blind | No favicon, description or theme-color; actions not SHA-pinned; no `npm audit` | low | defer | Cosmetic or hardening. Fits Story 4.1 (PWA) and Dependabot. |
| 14 | blind | No `.gitignore` entries for `node_modules/`, `dist/`, `coverage/` | false | reject | Already present in the root `.gitignore` (lines 2, 5, 9, 33). |
| 15 | verification-gap | Gap screen of the token drift test | — | none | No gaps. The test is tied to the real exports and the real file, and each matrix row has a passing test. |

## Verification

**Commands:**
- `npm ci` -- expected: installs from lockfile with no peer-dependency errors (locally and in CI on `ubuntu-latest`; if Linux Rolldown bindings are missing from the Windows-made lockfile, regenerate it)
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: all exit 0, `theme.test.ts` passes

**Manual checks (if no CLI):**
- Temporarily edit one value in `tokens.css` and run `npm test` -- expected: failure naming that variable; revert.
