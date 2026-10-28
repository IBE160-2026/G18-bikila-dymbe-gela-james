# Epic 4 Context: Få mer ut av et sted jeg følger med på

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Brukeren skal se når det beste tidsvinduet for en skitur er, rett på stedssiden, slik at SnowScore («hvor») får et svar på «når». Epicen er i v1 krympet til én Bør ha-story: beste skivindu (FR-17) med mørketid-håndtering, som en utvidelse av stedssiden fra Epic 1. Snøvarsel og PWA er tatt ut («Ikke i v1»), og epicen bygges sist, i sprint 4, sammen med robusthet ved nedetid (1.6). Den inngår i milepælen «Bør ha ferdig og kodefrys for v1» (forslag 2026-11-11).

## Stories

- Story 4.1: Gjør SnowFinder installerbar som PWA (Ikke i v1)
- Story 4.2: Se beste skivindu på stedssiden (Bør ha)
- Story 4.3: Registrer et snøvarsel uten konto (Ikke i v1)
- Story 4.4: Motta og meld deg av et snøvarsel (Ikke i v1)

## Requirements & Constraints

- **Definisjon:** beste skivindu er de fire sammenhengende timene med lavest snittvind og minst skydekke i et 48-timers vindu, valgt blant dagslystimer.
- **Etter snøfall:** kommer det nysnø i perioden, velges vinduet bare blant timer etter at snøfallet har stoppet.
- **Mørketid-fallback:** har stedet ingen dagslystimer i hele vinduet, beregnes vinduet blant alle timer, og stedssiden viser «Mørketid – vindu vist uten dagslys». Funksjonen skal aldri feile eller returnere tomt i mørketid.
- **For få dagslystimer:** et eget tilfelle som må ha definert oppførsel (finnes ikke fire sammenhengende dagslystimer). Kildene sier ikke hva svaret skal være; det må avgjøres og dokumenteres i spec-en og fasittabellen.
- **Fasittabell:** `tests/golden/skivindu.json` med minst fire tilfeller (vanlig dag, snøfall som slutter midt i vinduet, for få sammenhengende dagslystimer, mørketid), som viser inndata time for time og forventet vindu. Den kjøres som test mot samme funksjon som dataprogrammet bruker, og brukes også i dokumentasjonen (SM-10).
- **Demodata (FR-30):** demodatasettet får ett sted i mørketid når storyen bygges. Demo er deterministisk og regenereres med `npm run data:demo`; ingen verdier skrives for hånd, og testen for byte-likhet må fortsatt bestå. Demokjøringen må fortsatt nå 95 %-terskelen.
- **Tone:** rolig og presis, aldri «garantert». Kortet skal aldri forsvinne stille i mørketid.

## Technical Decisions

- **Delt logikk (AD-6):** beregningen bor i `shared/skivindu.ts`, ren TypeScript, importert av dataprogrammet. Ingen kopi andre steder; `zod` er eneste tillatte tredjepartsimport i `shared/`.
- **Dataprogrammet regner, appen leser (AD-1, AD-2):** `scripts/pipeline/score.ts` beregner vinduet og skriver et eksplisitt `skivinduUtenDagslys`-flagg i datafilen. Appen leser flagget direkte og re-utleder aldri mørketid ved å telle dagslystimer selv. Data går mellom stegene bare gjennom `RunContext`.
- **Kontrakt (AD-12):** nye felt legges i Zod-skjemaet for `Sted`/`PublishedData` i `shared/contracts/` (camelCase), og beskrives i `shared/contracts/data-dictionary.md`. `publish.ts` validerer mot skjemaet, og `src/lib/data/` parser med det samme.
- **Fasittabellen** bruker de samme formene og oppgir grenseregler: inklusive/eksklusive grenser, null-verdier og tie-break-rekkefølge (AD-12). Golden-tabeller ligger i `tests/golden/`, enhetstester ved siden av koden (AD-4).
- **Tid:** alle tidsstempler i UTC (ISO 8601) i datafilen; konvertering til norsk lokaltid skjer bare i UI. «Nå» i `src/` kommer bare fra `src/lib/clock.ts` (AD-10).
- **Gjenbruk av dagslys:** `shared/sol.ts` (Story 3.5) har allerede `erDagslystime` med halvtimesregelen; bruk den i stedet for en ny dagslysregel.
- **Fallgruve:** SnowScore-vinduet (`selectWindow`, `WINDOW_HOURS`) er 24 timer, mens skivinduet krever 48. Sjekk at både live-data og demo-fixtures dekker 48 timer, og ikke endre SnowScore-vinduet.
- **Ingen nye avhengigheter, tjenester eller nøkler.**

## UX & Interaction Patterns

- **Beste skivindu-kort** på stedssiden (`Sted.tsx`): bakgrunn `surface-sunken` (skiller det fra rådata-kortene), tidsromteksten i `heading` (for eksempel «lørdag 10–14»), en kort begrunnelse (for eksempel «etter nattens snøfall») i `meta`. Bruk tokens fra `theme.ts`/`tokens.css`, aldri literal hex/px (AD-9).
- Kortet vises bare når vinduet finnes; i mørketid vises fallback-teksten i stedet for at kortet forsvinner.
- **Plassering:** mobil (<768px) én kolonne, kortet under delpoengene; desktop (≥768px) to kolonner, kortet i høyre kolonne.
- Tilgjengelighet: status formidles aldri bare med farge, kontrast ≥ 4.5:1 for brødtekst.

## Cross-Story Dependencies

- Bygger på stedssiden (Story 1.9/1.9b), dataprogrammets `score.ts` og publisering (1.5), demodata (1.10) og dagslyslogikken fra Story 3.5 (`shared/sol.ts`).
- Bygges parallelt med Story 1.6 (robusthet ved nedetid) i sprint 4; begge kan røre `scripts/pipeline/` og `demo.json`, så regenerer demodata etter fletting.
- Endrer UI: kjør `npm run test:e2e` lokalt før PR, og husk at E2E i CI kjører på Ubuntu med bredere fonter.
