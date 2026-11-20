# Story 3.1b: ryddigere filter

## 2026-11-07 kl. 22:08 — Aksel Dymbe

### Oppgave
Steg 2 i UX-forbedringen: bygge det ryddigere filteret som Sally beskrev i PR #91. Aksel godkjente spec-en etter en gjennomgang med subagent, og ba om egen grein og PR, ingen merge til main.

### Plan
- `bmad-build`: spec, gjennomgang av spec-en, bygging, gjennomgang i tre lag, retting og presentasjon.
- Spec: [spec-3-1b-ryddigere-filter.md](../../project-workspace/implementation-artifacts/spec-3-1b-ryddigere-filter.md). Greinen er laget fra `docs/ux-filter-og-banner` (PR #91).
- UX-delen og bannerfargene er logget i [991-…-ux-filter-og-banner.md](991-2026-11-07-17-09-40-ux-filter-og-banner.md), som ligger på greinen til PR #90.

### Resultat
- Commits: `3898be2` (spec), `5e16c04` (bygging), `e080f20` (rettinger etter gjennomgangen, og `done`).
- **Bygget:** aktive krav som chips med × øverst i panelet, gruppene «Vær» og «Sted», «Mer om skydekke» og «Mer om NVE-dataene». Det lukkede arket er uendret.
- **Gjennomgang av spec-en:** 10 funn, alle rettet før bygging.
- **Kodegjennomgang:** 15 funn, der 7 er rettet og 8 avvist.
- **Tester:** lint, typesjekk, 685 av 685 enhetstester, `build:demo` og 143 av 143 E2E-tester er grønne lokalt.

### Åpne punkter
- `npm run test:e2e:nettlesere` (Firefox og WebKit) er ikke kjørt lokalt. CI kjører den.
- UX-DR10 i SnowFinder-Epics-og-Stories.md sier fortsatt «warning-bakgrunn» om banneret. Det rettes i PR #90.
- Steg 3–5 i UX-forbedringen gjenstår.
