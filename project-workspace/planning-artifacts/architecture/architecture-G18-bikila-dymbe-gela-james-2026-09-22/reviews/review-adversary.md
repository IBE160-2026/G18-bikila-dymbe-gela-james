# Adversarial review of ARCHITECTURE-SPINE.md (v3) — "compliant but incompatible" story pairs

Lens: each pair below has two stories that obey every AD to the letter and still collide. Each collision is a hole; a tightened or new AD closes it.

**Verdict:** The spine locks writers, locations of files and the formula, but leaves the shapes that cross those boundaries (port return types, demo JSON, `conditions` columns, filter inputs, clock and age semantics) unowned, so independently compliant stories can still fail at the seams.

## H1 — Port return type vs. demo JSON vs. `conditions` table (no owner of the `Sted` shape)

- Units: Story 1.10 (demo adapter + `scripts/demo-data`) vs. Story 1.5 (publish pipeline / migration for `conditions`) vs. Story 1.7 (map page via `useSteder`).
- AD-10 names the port functions (`listSteder`, `getSted`, `filterSteder`, `latestRun`) but not their types. AD-2 fixes only that staging has typed columns, and `lib/types/` is "generated from the DB schema".
- Collision: 1.5 names columns in snake_case (`snow_score`, `skivindu_uten_dagslys`, `observed_at`). 1.10 emits camelCase JSON (`snowScore`), since the Consistency Conventions say camelCase for TS values. 1.7 consumes whatever `lib/types` generates. The demo adapter returns a hand-mapped shape, the Supabase adapter another. Each story is compliant, and the adapters return different objects.
- Joins: the port returns "Sted" (location + current conditions). In SQL that is a join of `locations` and `conditions`. The demo JSON may be one file or two, with the join done client-side. Nothing says which.
- **Tightening, new AD-12 "Port DTOs are the contract":** `shared/contracts/` holds Zod schemas for `Sted`, `Conditions` and `PipelineRun`, as the port's return types. Both adapters must parse their output through them. The mapping snake_case→camelCase lives in one function (`toSted`) in `shared/`. `public/demo/*.json` has a fixed file list and a schema-validated shape. A test loads the demo JSON and a Supabase fixture row and asserts both parse to the same DTO. `lib/types/` re-exports the DTOs and is not generated from the DB.

## H2 — Demo clock vs. data age vs. staleness (three interpretations of "now")

- Units: Story 1.10 (`demoNow`) vs. a "stale data banner" story vs. Story 3.x (`beste skivindu` / forecast window).
- AD-10 says age is measured against `demoNow` "in demo mode", but does not say which fields count as the data's age (`observed_at`, source timestamp from AD-11, `pipeline_runs.started_at`, publish time), what the stale thresholds are, or who injects the clock.
- Collision: the banner story computes age from `run.started_at` with `Date.now()` in a hook, which is fine in supabase mode. The skivindu story filters the 48 h window with `Date.now()` and works against real time. In demo mode `demoNow` is months old, so the window is empty and the mørketid flag path misfires. AD-10 also says nothing about timezone-dependent features (sunrise via SunCalc, `Europe/Oslo` conversion) using `demoNow`.
- Also: the demo JSON "byte-identical" rule clashes with `demoNow`. If `demoNow` is derived from the fixture timestamps it is stable. If it is the generation time it is not. Unspecified.
- **Tightening, extend AD-10 or new AD-13 "One clock":** `src/lib/clock.ts` exports `now()` and is the only place `Date.now()` / `new Date()` may be called in `src/` (lint rule). The Supabase adapter returns wall time. The demo adapter returns `demoNow`, defined as the max source timestamp in the fixtures. Data age is defined once, as `now() - conditions.source_timestamp` (AD-11 lineage field), in `shared/freshness.ts` with the thresholds. The pipeline gets the same clock injected for tests.

## H3 — Filter semantics: `shared/filter.ts` vs. the SQL function vs. `useSteder`

- Units: Story 3.1 (filters; owns `shared/filter.ts`) vs. Story 1.7 (map page, `useSteder`) vs. the Supabase adapter story.
- AD-10: the demo adapter uses `shared/filter.ts`; the DB has a "parameterised filter function" that must match the golden table. AD-8: map and list read "the same filter query params" from the URL. Nothing owns the parameter vocabulary (names, units, open or closed ranges, null handling, AND/OR across facets, sort and tie-break, pagination).
- Collision: 1.7 parses `?min=60&maks=…` into its own `FilterState` in `useSteder`. 3.1 defines `Filter` in `shared/filter.ts` with different names. The SQL function takes yet another set. The golden table is "PRD FR-20" and its input format is not pinned to any of these. A passing golden test on the shared TS and a later passing DB test still leave the URL→filter mapping untested.
- Also: the port has both `filterSteder` and `listSteder`, and the Supabase adapter may filter in SQL while `useSteder` additionally filters client-side (map bounds, text search). Two filters in series.
- Also: the SQL function is deferred ("once the Supabase adapter exists"), so the golden rows are fixed against the TS version, which becomes the de facto spec without anyone saying so.
- **Tightening, extend AD-10 / new AD-14:** `shared/filter.ts` exports `FilterParams` (Zod) plus `parseFilterParams(URLSearchParams)` and `serializeFilterParams`. These are the only URL↔filter code, used by `useSteder`, FilterPanel and both adapters. The port has one query function, `querySteder(FilterParams, Sort, Page)`. Filtering happens inside the adapter only, never in hooks or components. The golden table holds `FilterParams` JSON → expected ids, with explicit null, boundary-inclusive and tie-break rules. The SQL function's argument is a single `jsonb` of that same `FilterParams`, so the argument shape cannot drift.

## H4 — Two owners of the score and the flag: `score.ts` writes staging, `publish.ts` writes `conditions`

- Units: Story 1.5 (pipeline `stage`/`publish`) vs. the calculator story (AD-6) vs. the demo generator.
- AD-6 binds the formula, not the *inputs and outputs*. AD-2 says stages "only append typed columns to the single migration that defines `conditions_staging`", but `conditions` (the published table) has no equivalent rule. Who defines its columns, and is it a copy of staging?
- Collision: `publish.ts` copies staging to `conditions` and recomputes `snow_score` (the "atomic ≥95% valid" check needs scores) in its own step, or rounds differently. The demo generator calls `shared/snowscore.ts` with fixture inputs mapped by its own mapper, and the pipeline's `score.ts` maps validated MET/NVE fields into inputs with a different one (e.g. units, missing-value defaults, how "incomplete data" locations are scored). AD-6's parity test covers the pure function with golden inputs, not the field mapping, so demo and production scores differ for the same fixture while "using the same code".
- **Tightening, tighten AD-6 and AD-2:** `shared/snowscore.ts` also exports `toScoreInput(validatedConditions)` (the mapping) and the rounding/clamp rules, and `score.ts`, the calculator and `scripts/demo-data` call both. `publish.ts` only copies and never recomputes. `conditions` columns are a strict subset-plus-`run_id` of staging, defined in the same migration pass, with a test that diffs the two column lists. State how an incomplete input is scored (null score vs. degraded score) in one place.

## H5 — Demo mode and write paths: split ownership of state and "disabled" behaviour

- Units: Story 1.10 (demo mode) vs. follow/feedback stories vs. E2E smoke (SM-9).
- AD-10 says write features are "not part of the port and are disabled in demo mode" but does not say who decides, how, or what the UI shows. AD-1 says writes go through Edge Functions "from src/", so a component can still call `fetch('/functions/v1/follow')` directly, which is neither a Supabase client nor the port.
- Collision: the follow story adds a button that posts to an Edge Function URL built from `VITE_SUPABASE_URL`. In demo mode that variable is empty, so it fails at click time with a network error. The feedback story hides its form with a local `import.meta.env.VITE_DATA_SOURCE === 'demo'` check. The "decides demo or real on its own" prohibition in AD-10 is broken by the very mechanism it relies on. Likewise `latestRun` in demo has no `pipeline_runs` row unless 1.10 generates one, and the freshness UI differs between modes.
- **Tightening, new AD-15:** `src/lib/data/` also exports a `capabilities` object (`{ canFollow, canSendFeedback, hasRunHistory }`) set by the adapter. Edge-Function calls go only through `src/lib/writes/` (one wrapper, the only file that builds Edge Function URLs), which returns `{ error: { code: 'unavailable_in_demo' } }` in demo. Components read `capabilities` only and never read `VITE_DATA_SOURCE`. The demo generator must emit a `run` record derived from fixtures.

## Further smaller gaps (not top-five)

- AD-1 says each table has one writer, yet `api_incidents` is written by `validate.ts` (AD-11) and listed nowhere in AD-1; `alert_dispatch_log` and the rate-limit hash table have no declared writer (feedback? a separate function?). Add a complete writer table to AD-1.
- AD-7 lists "historical weather data" for deletion, but AD-5/AD-11 do not say which table that is, and `conditions` rows with `run_id` lineage may be deleted while `pipeline_runs` keeps pointing at them. Define retention across `conditions`, `pipeline_runs` and `api_incidents`.
- AD-2 "idempotent" is undefined for `publish` (a re-run within the same hour: new `run_id` or same?). One row per run and one atomic publish need a run-key rule.
- AD-9 binds `src/components/` only. Pages and the Leaflet code under other directories can hardcode colours.
- AD-3: CI applies migrations to dev on every PR, so concurrent PRs with migrations collide on dev. Naming/ordering rule for migration files is missing.
- Spine has no rule for the shape of the Edge Function error vs. Zod validation errors (only "{ error: { code, message } }"), and no code vocabulary.
