# Reality-check review: ARCHITECTURE-SPINE v3 (2026-10-07)

Lens: was each committed decision confirmed against the web, the existing project, or the current starter, or only asserted?

## Verdict
The Stack versions are real and mostly current, but v3's operational claims (Deno importing `shared/`, Edge Function limits, local stack, Playwright CI) are asserted without evidence, and the spine points at a `package-lock.json` that does not exist.

## What I checked
- **Registry (`npm view`, 2026-10-07).** The named versions exist: react 19.3.0 (latest), vite 8.3.0 (latest 8.3.3), supabase-js 2.116.0 (latest 2.117.3), zod 4.6.5 (latest), vitest 5.0.1 (latest 5.0.3), fast-check 4.10.1 (latest 4.10.2), Playwright 1.63.0 (latest), Leaflet 1.9.4 (latest; 2.0 not stable). TypeScript latest is 7.0.2, which matches the spine's "7.0 shipped" note. Nothing is wrong, and the patch lag is cosmetic.
- **Existing project.** There is no `package.json` or `package-lock.json` at the repo root, and Story 1.1 is `ready-for-dev` (hand-rolled, no starter). `node_modules/` has react 19.3.0, vite 8.3.0, typescript 6.0.3, zod 4.6.5 and vitest 5.0.1, so the toolchain pins match. `supabase-js`, leaflet, fast-check, playwright, date-fns-tz and suncalc are not installed yet. `node_modules` and `dist/` are gitignored leftovers with no manifest.
- **Web.** Supabase Edge Function limits: wall clock 150 s on Free and 400 s on Paid, CPU 2 s per request, idle timeout 150 s ([limits](https://supabase.com/docs/guides/functions/limits)). Importing files outside `supabase/` works, but needs a recent CLI and Docker or the experimental `--use-api` flag ([changelog](https://supabase.com/changelog/33613-deploy-edge-functions-from-cli-without-needing-docker-import-files-outside-of-su)). There are open local-serve problems with such imports ([supabase#30813](https://github.com/supabase/supabase/issues/30813), [cli#1093](https://github.com/supabase/cli/issues/1093)).

## Findings

1. **AD-6 / AD-10 / AD-11: Deno importing `shared/` is asserted, not proven.**
   - The spine says `shared/*.ts` "runs unmodified under both Vite and Deno" and is imported "by relative path" from `supabase/functions/`.
   - Reality: deploying and serving functions that import outside `supabase/` depends on the CLI version and on Docker or `--use-api`, and local serving has known failures.
   - Deno also needs explicit `.ts` extensions on relative imports, and `shared/contracts/` and `shared/filter.ts` use Zod (npm). That breaks the "zero npm" claim for those two files, and AD-6 only covers `snowscore.ts`.
   - Fix: add a Story 1.x spike that runs `supabase functions serve` and a deploy with `shared/` imports, then record the result. Pin a minimum Supabase CLI version in the Stack table. State how Deno resolves `zod` (`deno.json` import map or `npm:zod@4.6.5`) and how the same specifier works in Vite. Require `allowImportingTsExtensions` in tsconfig.

2. **AD-2 / Structural Seed: the hourly job over ~300 locations is not checked against Edge Function limits.**
   - v3 dropped queue/resume and relies on "capped concurrency" in a single run.
   - Free-plan wall clock is 150 s and CPU is 2 s per request, and a timeout means "publishes nothing".
   - Fix: record the plan tier and the limits in the spine. Add a measured budget (300 MET and NVE calls in under 150 s with the chosen concurrency) as an AD-2 acceptance check. Say whether scheduling uses pg_cron plus pg_net, and name it, because "Supabase Scheduled Job" is not a product name.

3. **Stack table: the tooling that v3 leans on is not listed.**
   - Missing: the Supabase CLI version, the Deno/Edge runtime version, Docker as a prerequisite (it is only mentioned in Running Locally), pg_cron/pg_net, and `@vitejs/plugin-react` and the ESLint stack, which Story 1.1 does pin.
   - Fix: add rows with versions and a "verified on" date. Add a single "versions verified 2026-10-07 via `npm view`" note, and either bump the stale patches (vite 8.3.3, supabase-js 2.117.3, vitest 5.0.3, fast-check 4.10.2) or say they are deliberately pinned.

4. **Spine says `package-lock.json` pins date-fns-tz and SunCalc, but there is no manifest or lock in the repo.**
   - The Stack table also says "single package at repo root". Today that is true only in the Story 1.1 spec.
   - Fix: reword to "to be created by Story 1.1". Resolve "latest at install time" into concrete versions at install, and record SunCalc's maintenance state, because the package is old and rarely updated. Check that `date-fns-tz` still supports date-fns v4.

5. **v3 build-time and CI claims lack verification.**
   - `VITE_DATA_SOURCE`: `import.meta.env.VITE_*` is inlined at build time, which fits the spine. But both adapters get bundled unless the switch is a static branch or dynamic import. Otherwise the demo bundle includes supabase-js, against the "only one adapter" intent and the bundle budget.
   - Playwright E2E in demo mode: this needs `npx playwright install --with-deps` on the runner, a `webServer` config that builds and previews (not `dev`), and a pinned runner image. The spine says only "smoke test in CI".
   - Fix: add an AD-10 note that the adapter is chosen by a static `import.meta.env` branch so the other adapter is tree-shaken, and verify with a bundle check. Specify the e2e.yml essentials (browser install and cache, `vite preview`). Say that the DB golden test needs Docker on the runner (`supabase start`, which is slow, so a path-filtered or nightly job).

Minor: "Node 24 or 26+" in Running Locally is fine (Vite 8 needs 20.19+ or 22.12+), but the CI Node version is not stated. The Cloudflare Pages hosting row is correctly marked [ASSUMPTION].
