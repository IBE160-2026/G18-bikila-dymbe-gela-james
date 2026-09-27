# Epic 1 Context: Se snøforholdene i Norge — på kart eller i liste

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Deliver the core of SnowFinder from an empty repo: a user can open the app and see real, fresh SnowScore data for about 300 Norwegian locations, either on a coloured Leaflet map or in an equivalent, fully accessible list, and open any location for full detail. The epic covers the whole vertical: project scaffolding and design tokens, the offline location catalogue, the hourly MET/NVE pipeline (fetch, validate, score, atomic publish, outage resilience), the shared SnowScore module, and the Explore (map/list) and location pages. Every other epic depends on it. It is 100% Must-have and is built first.

## Stories

- Story 1.1: Project scaffolding and CI skeleton
- Story 1.2: Build the location catalogue
- Story 1.3: Fetch and validate weather data every hour
- Story 1.4: Build the shared SnowScore module
- Story 1.5: Compute and publish SnowScore in the pipeline
- Story 1.7: See the Norway map with coloured locations
- Story 1.8: Use the accessible list view instead of the map
- Story 1.9: Open a location page with full score
- Story 1.6: Keep the service up when a data source is down (built last; number kept for cross-references)

## Requirements & Constraints

- **Catalogue:** ~300 locations from OpenStreetMap (ski resorts, cross-country venues) and Kartverket (peaks, towns). Each has a name, coordinates to 4 decimals, elevation and a location type (skisted/fjelltopp/by).
- **Fetching:** runs hourly. It sends an identifying User-Agent and `If-Modified-Since`, refetches only after `Expires` has passed, and limits concurrency (breaking MET's terms risks getting the group blocked). Coordinates are rounded to 4 decimals and elevation is sent to MET. The job runs in batches so it stays within Supabase time limits, and an interrupted run resumes where it stopped.
- **Validation:** every response is checked with a strict Zod schema. Invalid responses are rejected and logged to `api_incidents`. They are never auto-corrected and never reach `conditions`.
- **SnowScore formula** (hourly precipitation pₕ in mm, temperature Tₕ in °C):
  - f(T) = min(1, max(0, (2 − T)/2)); S = Σ pₕ·f(Tₕ); P = Σ pₕ; T̄ = mean Tₕ
  - A = 60·min(1, S/20); B = 25·min(1, max(0, (2 − T̄)/16)); C = 15·S/P; B = C = 0 when P < 0.5 mm
  - SnowScore = round(A + B + C), range 0–100. Conversion is 1 mm water ≈ 1 cm snow everywhere.
  - Reference example: a 6-hour window with P = 12, S = 12, T̄ ≈ −2.3 gives A = 36, B ≈ 7, C = 15, total **58**.
- **Property tests** (≥1000 random inputs in CI): score stays in 0–100; more new snow never lowers A; a lower mean temperature never lowers B; P < 0.5 always gives B = C = 0; the output is deterministic.
- **Incomplete data:** if more than 10% of hours are missing, the location shows the text "ufullstendige data" instead of a number. It must never show 0 or a guessed score.
- **Publishing:** a batch becomes visible atomically only if at least 95% of locations are valid. Otherwise the previous batch stays unchanged. Publishing is idempotent, and concurrent runs are blocked.
- **Resilience:** failed calls retry with exponential backoff plus jitter and a fixed maximum. Each source has its own circuit breaker with a cooldown. The client always shows the last valid batch, never a partial or empty one. Failures, rejected responses and breaker trips are written to `api_incidents` **and** actively notify the group (for example through a webhook). Logging alone does not count.
- **Freshness:** data is normally less than 90 minutes old. At 3–12 hours old it is marked "Utdatert" with a timestamp. Locations whose data is older than 12 hours are removed from the map, the list and the location page, not greyed out.
- **Performance:** the map must be pannable and zoomable within 3 s on a mid-range phone over 4G.
- **Accessibility:** everything except the Leaflet map layer must meet WCAG 2.1 AA. The list view is the full AA alternative to the map. Automated axe/Playwright checks in CI must report zero critical violations on the list page and the location page.
- **Location page:** a stable, shareable `/sted/:id` URL with no session or account. It shows SnowScore with the A/B/C sub-scores, temperature, new snow, wind, cloud cover, elevation and the source timestamp.
- **No accounts anywhere.** The UI is Norwegian only. SnowFinder is not an avalanche assessment.

## Technical Decisions

- **Stack:** Node 24 LTS, React 19.3.0, TypeScript 6.0.x, Vite 8.3.0, @supabase/supabase-js 2.116.0, Leaflet 1.9.4, Zod 4.6.5, Vitest 5.0.1, fast-check 4.10.1, Playwright 1.63.0, date-fns-tz and SunCalc. It is a single npm package at the repo root with no starter template. Edge Functions are Deno and sit outside the npm package. Hosting on Cloudflare Pages is still an unconfirmed assumption.
- **Layout:** `src/{pages,components,hooks,lib,styles}`, `shared/`, `supabase/{migrations,functions}`, `scripts/build-catalog/`, `tests/{e2e,contract/fixtures}`, `.github/workflows/{ci,e2e,deploy}.yml`.
- **Read-only client:** `src/` reaches Supabase only through `src/lib/supabase/client.ts`, using the anon key and `select` only. No other file creates a Supabase client, and no service-role key goes in the bundle. RLS is on every table.
- **Pipeline:** each stage is its own idempotent file in `supabase/functions/pipeline/` (`fetch.ts`, `validate.ts`, `score.ts`, `stage.ts`, `publish.ts`, `alert.ts`), run in order by one scheduled entrypoint. There is exactly one `conditions_staging` table, defined by a single migration. Stages only add typed columns to it, with no `jsonb`/`raw_payload` columns and no second staging table.
- **Migrations are the only way to change the schema.** There are separate dev and prod Supabase projects. CI applies migrations to dev on every PR and to prod after merge to `main`.
- **Catalogue is offline:** `scripts/build-catalog/` only produces a migration file. Nothing in `src/` or `supabase/functions/` imports it. `locations` is read-only at runtime: no INSERT, UPDATE or DELETE from any function.
- **One SnowScore module:** `shared/snowscore.ts` is pure TypeScript with no React, npm, Deno, Node or browser globals. `src/lib/snowscore.ts` re-exports it, and `pipeline/score.ts` imports it by relative path. A parity test runs a golden input set through both paths.
- **One Explore route:** `src/pages/Utforsk.tsx` reads `visning=kart|liste` (default `kart`) and renders `KartVisning` or `ListeVisning`. Both use `src/hooks/useSteder.ts`, and no page duplicates its query. The location page is `src/pages/Sted.tsx`.
- **Design tokens have one source:** `src/lib/theme.ts` holds the TS constants, keyed exactly as in DESIGN.md. `src/styles/tokens.css` defines matching CSS variables. `theme.test.ts` parses the CSS, checks it against `theme.ts` and fails CI on any drift. Leaflet marker colours import from `theme.ts`. Components never hardcode a hex or px value that DESIGN.md already names.
- **Tests:** Vitest and fast-check tests are colocated as `*.test.ts`. Playwright tests go in `tests/e2e/`. MET/NVE contract tests with recorded fixtures go in `tests/contract/`.
- **Conventions:**
  - SQL uses snake_case, TS values use camelCase, and components and types use PascalCase.
  - IDs are `uuid`. Timestamps are stored as UTC `timestamptz` and converted to Norwegian time (with DST) only in the UI. Daylight is computed locally with SunCalc.
  - Edge Function errors use the shape `{ error: { code, message } }`, and inputs are validated with Zod.
  - Secrets live only in Supabase env vars.
  - Comments explain *why* only, for example `// AD-5: ...`.

## UX & Interaction Patterns

- **Tokens:**
  - Light mode is the default, and dark mode follows the system setting.
  - Surfaces: `surface-base` `#F5F8FB`, `surface-raised` `#FFFFFF`, `surface-sunken` `#EBF1F7`.
  - `accent` `#0B6FB8` is used only for actions and the focus ring.
  - Font is Inter or system-ui, with no external font loading. Use `tnum` for all numbers.
  - Spacing scale is 4/8/12/16/24/32/48, with a 16px gutter.
- **SnowScore scale:** `snowscore-0..3` (`#9AA7B8`, `#8FC1E8`, `#3E8FD0`, `#0B4C8C`, grey to deep blue). It is reserved for SnowScore: map markers, score badges and list-row indicators. Circles and fully rounded shapes are also reserved for SnowScore.
- **Score badge:** always shows the number plus a text label (for example "82 · Svært godt"), never colour alone. The darkest tier uses white text, and every tier must reach ≥4.5:1 contrast. The badge is not a link; the whole card or row is the click target.
- **Map marker:** a 28px circle with a white 2px border. The selected marker gets an accent border. On desktop, hover shows a tooltip with name and score. Tap or click opens the location page. Markers cluster only at very low zoom.
- **List row:** a raised card with the name (heading), the badge, and new snow, wind and temperature in `numeric`. Rows are reachable with Tab and open with Enter. Sorting (score/distance/name) uses a `<select>` or a row of buttons, never drag-and-drop.
- **States:**
  - Loading: skeleton cards and markers in `surface-sunken`, never a screen with only a spinner.
  - 3–12 h old: a "Utdatert" `meta` label with a timestamp.
  - Over 12 h old: the location is removed.
  - Incomplete data: the text "Ufullstendige data" in place of the badge.
  - Source down: a full-width `banner-stale-data` with warning background and ink-primary text, for example "Viser siste kjente data fra kl. 14:00 — MET svarer ikke nå". The banner must not block the rest of the page.
- **Layout:** fixed top navigation (SnowFinder · Slik beregner vi SnowScore · Tilbakemelding), which becomes a ☰ menu on mobile. The map/list toggle sits directly under the nav. There is one breakpoint at 768px. The location page is one column on mobile and two on desktop (raw data and sub-scores on the left).
- **Accessibility floor:**
  - A visible accent focus ring, tab order that follows reading order, and Enter/Space to activate.
  - Touch targets ≥44px.
  - Respect `prefers-reduced-motion`.
  - No auto-playing motion, and no infinite scroll without a "load more" control.
- **Tone:** calm and precise. Never promise snow or safety.

## Cross-Story Dependencies

- Build order: 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.7 → 1.8 → 1.9 → 1.6.
- 1.1 provides the token files and folders that every UI story uses.
- 1.3 needs the catalogue from 1.2.
- 1.5 needs 1.3 (staging data) and 1.4 (the module).
- 1.7, 1.8 and 1.9 read the batches published in 1.5.
- 1.8 reuses the `useSteder` hook from 1.7.
- 1.6 adds the stale banner to the pages built in 1.7 and 1.9.
- Later epics build on this one:
  - Epic 2 links from every SnowScore display and reuses `shared/snowscore.ts`.
  - Epic 3 adds filters, live hit counts and null-hit guidance to `Utforsk` and `useSteder`.
  - Epic 4 extends `Sted.tsx` and `score.ts`, including the `skivindu_uten_dagslys` flag.
- Keep `Utforsk`, `useSteder` and `conditions_staging` easy to extend. Do not build Epic 3 or 4 features here.
