---
title: 'Story 1.11: Kjør dataprogrammet hver time og publiser appen'
type: 'feature'
created: '2026-10-31'
status: 'done'
baseline_commit: '7fe590b026d90bf0af3960dc9cba813e4a1044f9'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Dataprogrammet kjører bare for hånd, og appen er ikke publisert noe sted, så ingen bruker får ferske data (FR-2, FR-5, NFR-6).

**Approach:** En ny `data.yml` kjører `npm run data` hver time, ved push til `main` og manuelt. Står Pages på «GitHub Actions», bygges og publiseres appen med den nye `latest.json`. Ellers publiseres bare `latest.json` til grenen `data` (reserven i storyen). Workflowen avgjør dette selv i hver kjøring, så den virker før og etter at faglærer har endret Pages.

**Beslutning (Aksel, 2026-10-31): appen leser reserven selv.** Under `npm run dev` laster appen `latest.json`, så fila på grenen `data` fra `raw.githubusercontent.com`, og til slutt `demo.json`. Et rent klon med nett viser derfor ekte data når grenen har en fersk fil, og ellers demodata.

## Boundaries & Constraints

**Always:** `concurrency` uten avbrudd. Cron utenfor hel time. `timeout-minutes` under 60. En kjøring som ikke publiserer, er rød, laster opp loggen med kvalitetsrapporten som artifact og lar forrige publisering stå. Produksjonsbygget feiler uten `latest.json` og inneholder aldri `demo.json` (AD-10). `npm ci && npm run dev` virker uten nett og nøkler og viser da demodata. Enhver feil ved lesing av grenen `data` gir demodata, aldri en feilside.

**Never:** Ingen hemmeligheter, nøkler eller nye tjenester. Ingen miljøvariabel som styrer appens atferd (AD-10). Ingen commit til `main` fra jobben. Grenen `data` får ingen historikk som vokser. Produksjonsbygget og E2E leser aldri grenen `data`. Ingen retting av funnene fra PR #77 utenom det som står under Tasks; de andre tilhører en egen `fix`-PR.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Pages på Actions | `build_type: workflow`, minst 95 % gyldige | Appen bygges med `latest.json` og publiseres til Pages | – |
| Pages av eller på «Deploy from branch» | API-et gir 404 eller `legacy` | `latest.json` til grenen `data`, ett commit (force) | `::warning::` om at reserven er brukt |
| Under 95 % gyldige | `npm run data` gir exit 1 | Ingen bygging, ingen publisering | Rød kjøring, loggen som artifact |
| Dataprogrammet krasjer | Unntak i `main` | Som over | Rød kjøring, loggen som artifact |
| `latest.json` mangler etter kjøringen | Exit 0, men ingen fil | Byggesteget feiler | Rød kjøring, forrige publisering står |
| Direkte lenke på Pages | `/<repo>/sted/gaustatoppen` | `404.html` er kopi av `index.html`, så stedssiden åpnes | – |
| Endring i `data.yml` i en PR | `pull_request` på den stien | Henter og bygger, men publiserer ingenting | Rød hvis noe feiler |
| Dev, lokal `latest.json` finnes | Fil i `public/data/` | Den brukes, grenen `data` leses ikke | – |
| Dev, fersk fil på grenen | Svar med `text/plain` og `generert` under 12 t | Ekte data, uten demobanner | – |
| Dev, ingen fil på grenen | 404 | Demodata | – |
| Dev, uten nett eller tregt svar | Avvist kall, eller over 5 s | Demodata | `console.error` |
| Dev, ødelagt fil på grenen | Ikke JSON, annen HTTP-feil eller feil skjema | Demodata | `console.error` |
| Dev, gammel fil på grenen | `generert` over 12 t | Demodata, ikke «Ingen ferske data» | – |
| Produksjonsbygg og `vite preview` | `latest.json` og `demo.json` mangler eller finnes | Grenen `data` leses aldri | Som i dag |

</frozen-after-approval>

## Code Map

- `.github/workflows/ci.yml`, `e2e.yml` -- mønster: `actions/checkout@v4`, `setup-node@v4` med Node 24 og npm-cache, `npm ci`, `timeout-minutes`. Skal ikke endres.
- `.github/workflows/data.yml` -- ny. Miljøet `github-pages` finnes og tillater bare grenen `main`, så publisering må kjøre fra `main`. Siste versjoner: `configure-pages@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5`, `upload-artifact@v7`.
- `scripts/pipeline/run.ts:133` -- `main(argv)` setter `process.exitCode = 1` når `report.publisert` er false, men er ikke eksportert. Rapporten skrives bare til loggen (`publish.ts`, `writeRunReport`), så artifactet er loggen fra `tee`.
- `src/lib/router.ts`, `Lenke.tsx`, `useSteder.ts:138` -- bruker allerede `import.meta.env.BASE_URL`. `vite.config.ts` har ingen `base`, så `--base=/<repo>/` gis ved bygging i workflowen. Appkoden trenger ingen endring for undermappen.
- `src/lib/data/loadPublishedData.ts` -- laster `latest` og så `demo`. `tryFetch` regner annet enn JSON-innholdstype som manglende, men `raw.githubusercontent.com` svarer `text/plain` (og `Access-Control-Allow-Origin: *`), så den kilden må hoppe over sjekken. `medNyereFelt` og `PublishedData.safeParse` skal brukes også her. `DataSource` får `'datagren'`.
- `src/lib/clock.ts` og `FJERNES_ETTER_MS`/`dataAlderMs` i `shared/freshness.ts` -- alderssjekken for fila fra grenen. Lint forbyr `Date.now()` i `src/`.
- `src/hooks/useSteder.ts:138` -- sender adressen bare når `import.meta.env.DEV` er sann, så `vite build` og E2E aldri leser grenen.
- `src/lib/data/loadPublishedData.test.ts` -- mønster: `fakeFetch` med filer per adresse, `live`-objektet og `console.error` er mocket.
- `README.md` linje 113–115 og «Demomodus» (linje 142–147) -- sier at et rent klon alltid viser demodata, og at sletting av `latest.json` gir demodata. Må rettes. Demodata kan alltid ses med `npm run build && npm run preview`.
- `epic-1-context.md` -- omskrivingen i 1.6 fjernet 1.11-stoff. Linje 57–58 i `git show 7fe590b^1:project-workspace/implementation-artifacts/epic-1-context.md` har teksten som skal tilbake.
- `deferred-work.md` -- to punkter om exit-koden (1.10, 1.3) og `404.html` (1.7) løses her.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/pipeline/run.ts` -- eksporter `main` med injiserbare kjøringer -- gjør exit-koden testbar uten nett.
- [x] `scripts/pipeline/run.test.ts` -- test at ikke-publisert gir `exitCode` 1 og publisert 0, for demo og live -- jobbens røde kjøring avhenger av den.
- [x] `src/lib/data/loadPublishedData.ts` -- `DATAGREN_URL` (`https://raw.githubusercontent.com/IBE160-2026/G18-bikila-dymbe-gela-james/data/latest.json`) og en valgfri tredje parameter med adressen; rekkefølgen `latest`, grenen, `demo`; tidsavbrudd 5 s bare for grenen -- valget til Aksel.
- [x] `src/lib/data/loadPublishedData.test.ts` -- én test per dev-rad i matrisen, og at grenen ikke leses uten adressen.
- [x] `src/hooks/useSteder.ts` -- send `DATAGREN_URL` bare under `import.meta.env.DEV`.
- [x] `.github/workflows/data.yml` -- ny jobb etter matrisen: cron `17 * * * *`, `push` til `main`, `workflow_dispatch`, `pull_request` på egen sti; `timeout-minutes: 50`; `npm run data` med `tee` og `pipefail`; artifact ved feil; Pages-sjekk med `gh api`; bygg med `--base`, `404.html`, fjern `demo.json`; egen Pages-jobb, eller force-push av ett commit med `latest.json` i rota av grenen `data` -- selve storyen.
- [x] `README.md` -- rett demoteksten, og beskriv timesjobben, begge publiseringsveiene og `npm run build && npm run preview` for demodata.
- [x] `epic-1-context.md` -- ta inn igjen 1.11-stoffet og beskriv at dev leser grenen `data`.
- [x] `deferred-work.md` -- merk de tre punktene løst.

Status i `sprint-status.yaml`, `fremdriftsplan.md`, `milepæler.md`, `aktivitetsdiagram.md`, KI-loggen, og endringen av FR-30 og AD-10, gjøres ved leveringen.

**Acceptance Criteria:**
- Given at `data.yml` er merget til `main`, when jobben kjører, then ligger ferske data enten på Pages eller på grenen `data`, og kjøringen er grønn.
- Given en PR som endrer `data.yml`, when sjekkene kjører, then henter og bygger jobben uten å publisere.
- Given bygget for undermappen, when `/sted/gaustatoppen` åpnes direkte under `--base`, then vises stedssiden med data fra `latest.json`.
- Given et rent klon uten nett, when `npm run dev` startes, then vises demodata med demobanneret.

## Implementation Notes

## Spec Change Log

## Review Triage Log

Gjennomgang med Blind Hunter (11 funn), Edge Case Hunter (4) og Verification Gap (3). Ingen funn ga intent_gap eller bad_spec.

| # | Lag | Funn | Vurdering | Rute | Begrunnelse |
|---|-----|------|-----------|------|-------------|
| 1 | ECH | `generert` under 12 t, men alle steder over 12 t, gir «Ingen ferske data» | medium | patch | Stemmer: `medFerskhet` måler `kildeTidspunkt`, som kan være en time eldre. Minst ett sted må nå overleve grensen. |
| 2 | ECH | `generert` foran klokka gir negativ alder | low | avvist | Krever feil klokke hos brukeren, og `erGamleData` har samme atferd. En vakt gir ekstra forgrening uten en reell bruker. |
| 3 | ECH | Feil i `deploy-pages` gir ingen `data-run-log` | low | avvist | Kjøringen blir rød, og jobbens egen logg viser feilen. Dataprogrammet lyktes, så det er ingen avvisninger å finne i rapporten. |
| 4 | ECH | Kommentaren lover demodata, men sjekken leser bare `generert` | medium | patch | Samme rotårsak som #1. |
| 5 | BH | Tidsavbrudd meldes som `cancelled`, ikke rød | medium | patch | Bryter regelen om rød kjøring. `timeout 45m` gir feilkode før jobbgrensen. |
| 6 | BH | Trege 5xx-svar kan gi rundt en time, mens spec-en sier 35 min | medium | patch | Samme retting som #5: grensen kapper kjøringen. Tidsbudsjettet i `fetch.ts` står åpent i `deferred-work.md`. |
| 7 | BH | Hele `data`-jobben har `contents: write` | medium | patch | `npm ci`, dataprogrammet og bygget trenger det ikke. Skrivingen er flyttet til en egen jobb `branch`, så `--no-verify` også er borte. |
| 8 | BH | `concurrency` per ref gir to samtidige kjøringer mot MET | medium | patch | Bryter «én kjøring om gangen» og 10 kall/s. Fast gruppe `data`. |
| 9 | BH | Direkte lenke under `--base` har ingen verifisering | medium | patch | Samme som #16: nytt steg `Check the build`. |
| 10 | BH | Testen om produksjon viser ikke det tittelen sier | medium | patch | Samme som #15. |
| 11 | BH | `DATAGREN_URL` ligger i bundelen | false | avvist | Sjekket i `dist`: strengen `raw.githubusercontent` finnes ikke der. |
| 12 | BH | Krasj gjennom `main` er ikke testet | low | avvist | `runLive` fanger krasj og gir `publisert: false`, som er testet. `.catch` er siste skanse, og å teste den krever omskriving av inngangen. |
| 13 | BH | «Hvert 17. minutt» betyr noe annet enn cron | low | patch | En direkte retting i README. |
| 14 | BH | README mangler adresse, Pages-innstilling, stans etter 60 dager og at grenen stopper | low | patch | Få setninger, og sensor og gruppa trenger dem. |
| 15 | VG | `import.meta.env.DEV` har ingen test | medium | patch | Ny `tests/e2e/datagren.spec.ts`. Mutasjonssjekk: uten vilkåret feiler testen. Dev-retningen er en manuell sjekk etter første kjøring. |
| 16 | VG | Ingenting sjekker `dist` | medium | patch | Nytt steg `Check the build`, som også kjører på PR-er. |
| 17 | VG | Publisering og feilveier kjører først på `main` | medium | defer | Krever ekte tilstand på GitHub. Pages-sjekken kjører nå også på PR-en, så tokenet prøves før merge. Står i `deferred-work.md`. |
| 18 | BH | `AGENTS.md` nevner ikke grenen `data` og `data.yml` | medium | defer | Endrer agentkontekst, og regelen om å slette greiner kan ellers treffe `data`. Går via `bmad-project-context`. |

## Design Notes

- **Valget gjøres i kjøringen.** Per 2026-10-31 viser API-et `has_pages: false`, og nettstedet gir 404, så Pages-veien kan ikke prøves før faglærer har slått det på. Reserven kan prøves med en gang.
- **Grenen leses bare under `npm run dev`.** Da er produksjonen fri for koden i praksis, AD-10 holder for bygget, og E2E (som kjører mot `vite preview`) trenger ingen blokkering.
- **Gammel fil gir demodata.** Stopper jobben, eller slås Pages på så grenen ikke lenger oppdateres, ville et rent klon ellers vist «Ingen ferske data». Sensor kan klone lenge etter siste kjøring.
- **Cron `17`:** GitHub forsinker ofte jobber ved hel time, og grensen på 90 min for banneret gir bare 30 min slingringsmonn.
- **`timeout-minutes: 50`:** dekker verste fall på rundt 35 min fra reviewen av PR #77.

## Verification

**Commands:**
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` -- expected: grønt
- `npm run test:e2e` -- expected: grønt, E2E leser ikke grenen `data`
- `gh pr checks <n> --watch` -- expected: `data.yml` kjører ekte henting og bygging på PR-en

**Manual checks:**
- Etter merge: kjøringen på `main` er grønn, og grenen `data` eller Pages har en fersk `latest.json`.
- Etter første kjøring til grenen: `npm run dev` på et rent klon viser ekte data uten CORS-feil.
