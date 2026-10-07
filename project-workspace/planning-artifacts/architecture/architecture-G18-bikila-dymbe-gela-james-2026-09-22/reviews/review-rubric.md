# Rubric review: ARCHITECTURE-SPINE.md (v3, 2026-10-07)

Reviewer: independent (rubric lens). Spine not edited.
Inputs checked: PRD v2 (FR-30, FR-31, NFR-DQ1-3, FR-6a/6b, FR-20), sprint-change-proposal-2026-10-07 section 4.3 (A1-A4).

## Verdict

Not yet ready to freeze for epics/stories: A1, A3 and A4 land, but AD-11's single-writer rule cannot produce the run record on failed runs, "same code as the pipeline" is not implementable for validate/skivindu, and table ownership and deployment/environments are left implicit.

## Proposal A1-A4 coverage

| Item | Status | Note |
|---|---|---|
| A1 AD-10 + AD-1 ripple | Done (stronger than proposed: demoNow, filter golden, writes disabled in demo) | Gaps in F2, F6 |
| A2 AD-2 simplified, Should-have marked "in text and figure" | Text done, figure not done | Neither diagram marks queue/resume, retry, circuit breaker as Should-have (F5) |
| A3 `pipeline_runs`, owner publish.ts, `run_id` on conditions; "data model lists all tables (seven)" | Partly | Table and run_id done. No table inventory anywhere (F3) |
| A4 Structural Seed additions + local-run section | Mostly | Tree and Running Locally done. The layered-client diagram has the port; the Structural Seed diagram has no demo path, port or deployment mode (F4) |

## Findings (ranked)

### F1 (high) AD-11 cannot satisfy FR-6a / SM-11 on failed runs
- Location: AD-11 "The run record" (lines 238-242); AD-2 stage chain.
- Problem: `publish.ts` is the only writer of `pipeline_runs`, one row per run. But FR-6a says a source failure "is recorded in pipeline_runs" and SM-11 says every run writes one complete row. If `fetch` fails or the job times out, `publish.ts` is never reached, so no row exists. Who generates `run_id`, and whether a re-run (AD-2 "safe to re-run") creates a second row, is unstated. "Counts passed forward in the run context" has no defined shape, so each stage will invent one.
- Fix: add to AD-11: the entrypoint creates `run_id` and a typed `RunContext` (defined in `shared/contracts/`); `publish.ts` runs as the terminal step on every path (called from a `finally`, with `published=false` and an error reason on abort). A re-run is a new run with a new `run_id`. A row is written even when 0 locations were fetched.

### F2 (high) "Same code as the pipeline" is not implementable for validate and skivindu
- Location: AD-10 "Demo data" (lines 219-222); AD-6 binds only `snowscore.ts`; Structural Seed tree.
- Problem: `scripts/demo-data/` (Node) must reuse the pipeline's validation (`validate.ts`, a Deno Edge Function file) and, for the required morketid demo place, the skivindu logic (`score.ts`). Only SnowScore sits in `shared/`. Without a rule, units will copy validate/skivindu into the script (the drift AD-10 forbids) or import Deno-specific files from Node. Also open: how `shared/` and Zod are imported under both Vite (npm) and Deno (`npm:` / import map), and whether the Supabase CLI bundler accepts `../../shared` imports. AD-6's "zero dependencies" covers snowscore only, yet `shared/contracts/` needs Zod. The demo JSON has no schema, so generator and demo adapter can disagree on shape.
- Fix: add `shared/validate.ts` (pure, Zod through one import map) and `shared/skivindu.ts` (pure TS, same constraints as AD-6); `validate.ts`/`score.ts` become thin wrappers. Name the single import map and tsconfig path, and require one test importing `shared/*` from both runtimes. Add a Zod schema for `public/demo/*.json` in `shared/contracts/`, used by the generator on write and the demo adapter on read.

### F3 (high) Table ownership is incomplete; "each table has exactly one writer" is unverifiable
- Location: AD-1 (lines 83-89), AD-7, AD-11, Structural Seed.
- Problem: AD-1 names writers for 4 tables. Unowned or ambiguous: `conditions_staging` (stage.ts?), `conditions` (publish.ts?), `api_incidents` (named only in AD-11), the rate-limit hash table (NFR-5 applies to both `feedback/` and `follow/`, so two writers), push subscriptions (FR-18), the historical-weather table AD-7 deletes from, and `locations` (migration only, AD-5). The proposal's seven-table list is absent.
- Fix: add a "Tables and owners" table to AD-1 (table, sole writer, readers, anon-readable yes/no, retention owner). Give the rate-limit table one owner (a single helper that is the only code touching it) or one table per function. Say which `pipeline_runs`/`conditions` columns are anon-readable (the explainer page needs `latestRun`).

### F4 (medium) Deployment and environments not decided for demo vs Supabase vs CI
- Location: AD-3, Structural Seed diagram, Stack "Hosting" ASSUMPTION, Deferred "CI matrix".
- Problem: `VITE_DATA_SOURCE` is a build-time switch, but nothing says what Cloudflare Pages builds: which mode the deployed site and PR previews use, which Supabase previews read, or whether the demo adapter ships in the prod bundle (NFR-PF-style size limits). AD-3 "CI applies migrations to dev on every PR" ignores fork PRs without secrets, which is the examiner scenario. The Structural Seed diagram shows only prod Supabase, no demo path or `public/demo`, and the pipeline edge omits `pipeline_runs`, `api_incidents`, `conditions_staging`. Deferred calls CI an implementation detail, yet whether the DB filter golden test is CI-blocking (PRD: when CI has a local database) and the doc-copy parity check (proposal S2) are decisions, not tuning. The phase-folder copy `SnowFinder-Arkitektur.md` is still v2 (no AD-10/11, updated 2026-09-27), so copy parity is already broken.
- Fix: add an "Environments" table: local-demo, local-supabase, CI (PR: demo build + e2e + shared goldens, no secrets), preview, prod, each with data mode and Supabase project. Decide the deployed site's mode and that fork PRs skip migrate-to-dev. Put the DB golden test in a named CI job (`supabase start`) or mark it manual until then. Redraw the Structural Seed with the port and both modes. Sync the phase-folder copy or state which is canonical.

### F5 (medium) Deferred / Should-have items can still make units diverge; v3 contradictions
- Location: AD-2, AD-7, AD-1, Deferred, diagrams.
- Problems:
  1. `alert` is a stage in the Must-have chain and diagram, but Epic 4 is deferrable (proposal P8 rule). The entrypoint contract must say `alert` is optional and the chain works without it.
  2. FR-6b (breaker state) and queue/resume need persisted state; undecided, so whoever builds them adds a table that breaks AD-1. Reserve names and owners under Deferred.
  3. AD-7 deletes weather data after 7 days, but FR-31 analysis compares forecast vs NVE "over a period". The input source for `scripts/analysis/` (live fetch, archived snapshots, longer retention) is undecided: a real AD-7 vs FR-31 conflict.
  4. `skivindu_uten_dagslys` is written to `conditions_staging`, but the client reads `conditions`; state that the published table and demo schema carry it.
  5. AD-1 says the client does `select` only, but filtering uses a parameterised DB function; say "select or RPC to read-only functions".
  6. Proposal A2 required Should-have marking in text and figure; the figures are unmarked.
  7. The push-delivery provider is deferred but fixes `alert.ts` and the subscription table; say one story owns both.
- Fix: one sentence each in AD-2/AD-7/AD-1 and a Deferred line per item with a named owner.

### F6 (medium) Golden tables and the client write path have no home; some enforcement is thin
- Location: AD-10 "Filter logic", AD-6, AD-4, AD-11 data contract.
- Problems:
  - The filter golden table (and SnowScore and skivindu goldens, SM-10) has no path or format. The shared-TS test and the DB test agree only if both read one file. AD-4 does not list `shared/**` as a colocated-test location.
  - How `src/` calls Edge Functions (follow, feedback) is unspecified. Via `supabase.functions.invoke` it needs a client and breaks AD-1; via `fetch` it needs a wrapper (e.g. `src/lib/api/`) with the demo-disabled behaviour, missing from the tree. FR-30's "disabled with explanation" has no owner.
  - "A test fails when data-dictionary.md and the Zod schemas disagree" is unenforceable against prose markdown.
- Fix: name golden file paths (e.g. `tests/contract/golden/filter.json`) as the only source; add `shared/**/*.test.ts` to AD-4; add `src/lib/api/` with a `disabledInDemo` flag to AD-1/AD-10; generate `data-dictionary.md` from the Zod schemas, or make it a machine-readable table the test parses.

## Checklist result

| Criterion | Result |
|---|---|
| Fixes the real divergence points | Partial: run record, shared validate/skivindu, table owners, write path missing |
| Every Rule enforceable | AD-3..AD-9 fine; AD-10/AD-11 partly (F1, F2, F6) |
| Deferred cannot let units diverge | Fails for breaker/queue state, push provider, CI decisions (F4, F5) |
| Covers PRD v2 + A1-A4 | Mostly; A2 figures and A3 table list missing; FR-31 data source conflicts with AD-7 |
| No internal contradictions | Seed diagram stale vs AD-10/11; AD-1 select-only vs RPC; AD-7 vs FR-31 |
| Every dimension decided/deferred/open | Environments and CI not covered (F4); SM-7 axe tests have no stated location |

Minor, unranked: `src/lib/types/` is "generated from the DB schema" while demo types come from JSON, so state one source type set; Stack says Node 24 while Running Locally says "24 or 26+": pick one.
