---
title: 'Story 1.7: Se Norgeskartet med fargelagte steder'
type: 'feature'
created: '2026-10-08'
status: 'done'
baseline_commit: 'a120952c414f4c82a004de154aa65fa5e29beaa2'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Appen viser bare «N steder lastet». Brukeren skal se et Norgeskart der hvert sted er fargelagt etter SnowScore, og kunne åpne stedet (FR-12, UJ-1 steg 1).

**Approach:** Utforsk-siden på `/` viser et Leaflet-kart med én sirkelmarkør per sted, fargelagt etter SnowScore-trinn. Markøren har en tooltip med navn og score, og et klikk åpner `/sted/:id`. Data kommer fra én delt `useSteder()`-hook. En Playwright-røyktest i demomodus dekker kart → stedsside.

**Beslutninger (Aksel, 2026-10-08):**
- Trinn og etiketter: 0–19 «Lite» (`snowscore-0`), 20–44 «Middels» (`snowscore-1`), 45–69 «Godt» (`snowscore-2`), 70–100 «Svært godt» (`snowscore-3`).
- Et sted med «ufullstendige data» får en hul markør: hvit fyll, grå (`snowscore-0`) stiplet kant. Tooltipen sier «Ufullstendige data», og stedet kan åpnes.
- Bakgrunnskartet er Kartverket topo (`https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png`, attribusjon «© Kartverket»). Det krever ingen nøkkel.

## Boundaries & Constraints

**Always:**
- AD-8: `useSteder()` i `src/hooks/` er eneste vei til stedsdata for sider og komponenter. Den laster via `loadPublishedData` og gjør bare én lasting per sideinnlasting, også når man går mellom ruter.
- Farger fra `src/lib/theme.ts`, mål fra DESIGN.md (`map-marker`: 28 px, 2 px hvit kant). Ingen hardkodede hex-verdier.
- Score vises aldri bare som farge: tooltipen har alltid tall og etikett («Hemsedal · 82 · Svært godt»).
- Rutene `/` og `/sted/:id` respekterer `import.meta.env.BASE_URL`, slik at appen virker under en undermappe på GitHub Pages. Tilbake-knappen i nettleseren virker.
- Avhengigheter med eksakte versjoner: `leaflet` 1.9.4, `@types/leaflet` (siste 1.9.x, minst 7 dager gammel) og `@playwright/test` 1.63.0. Ingen andre nye pakker; rutingen skrives selv (ingen react-router).
- `npm test` krever fortsatt verken nett eller nettlesere. E2E kjøres med en egen kommando.

**Never:**
- Ingen listevisning, filtre eller full stedsside. Stedssiden viser bare navn, score-badge og en lenke tilbake til kartet (resten kommer i Story 1.9).
- Ingen markørklynging (300 steder krever det ikke), og ingen aldersgrenser for data (Story 1.9).
- E2E-testen henter aldri kartfliser fra nettet.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Demomodus | Rent klon, `npm run dev` | Kart over Norge med 24 markører og demobanner | N/A |
| Trinngrenser | Score 0, 19, 20, 44, 45, 69, 70, 100 | Trinn 0, 0, 1, 1, 2, 2, 3, 3 med riktig etikett | N/A |
| Ufullstendige data | `snowScore.kind = "incomplete"` | Hul, stiplet markør; tooltip «Ufullstendige data» | Aldri vist som 0 |
| Klikk på markør | Markør for `hemsedal-skisenter` | Navigerer til `/sted/hemsedal-skisenter`; stedssiden viser navnet | N/A |
| Direkte lenke | `/sted/finnes-ikke` | Melding «Fant ikke stedet» med lenke til kartet | N/A |
| Ukjent rute | `/noe-annet` | Melding «Fant ikke siden» med lenke til kartet | N/A |
| Lasting | Datafila er ikke hentet ennå | Skjelett i `surface-sunken`, ikke bare spinner | N/A |
| Lastefeil | `loadPublishedData` gir `error` | Feilmeldingen i `role="alert"` | N/A |

</frozen-after-approval>

## Code Map

- `src/App.tsx` -- skall med `AppView` (header, demobanner, skjelett, feil). Gjør det til ruteren: header og banner felles, innholdet velges fra stien. `src/App.test.tsx` tester `AppView` med `renderToString`; behold mønsteret.
- `src/lib/data/loadPublishedData.ts` -- `loadPublishedData(fetchFn?, baseUrl)` gir `LoadResult` (`ok` med `data: PublishedData` eller `error` med `message`). Gjenbrukes uendret av `useSteder`.
- `shared/contracts/published.ts` -- `Sted` (`id`, `navn`, `lat`, `lon`, `snowScore` med `kind`, `score`), `PublishedData`.
- `src/lib/theme.ts` -- `colors['snowscore-0'..'snowscore-3']`, `colors['surface-raised']`; `src/styles/tokens.css` speiler dem (`theme.test.ts` sjekker at de er like). Legg til map-marker-målene i `theme.ts` bare hvis `theme.test.ts` krever det.
- `src/components/DemoBanner.tsx` -- eksisterende banner, uendret.
- `src/hooks/`, `src/pages/` -- tomme (`.gitkeep`). Nye filer: `src/hooks/useSteder.ts`, `src/pages/Utforsk.tsx`, `src/pages/Sted.tsx`, `src/components/KartVisning.tsx`.
- `vite.config.ts` -- Vitest `environment: 'node'` og `include` uten `tests/e2e`. Behold dette, så Playwright-filer ikke kjøres av Vitest.
- `eslint.config.js`, `tsconfig*.json` -- må dekke `tests/e2e/` og `playwright.config.ts`.
- `.github/workflows/ci.yml` -- eksisterende CI. En ny `e2e.yml` (AD-4 / arkitektur §CI) kjører Playwright mot `vite preview`. Push av workflow-filer krever `workflow`-tilgang i gh.
- `project-workspace/implementation-artifacts/deferred-work.md` -- punktet om skrifttypen Inter (NFR-2) gjelder første story med ekte UI. Velg system-ui hvis Inter ikke allerede lastes, og noter det.

## Tasks & Acceptance

**Execution:**
- [x] `package.json`, `package-lock.json` -- legg til `leaflet`, `@types/leaflet` og `@playwright/test` med eksakte versjoner, og skriptet `"test:e2e": "playwright test"`.
- [x] `src/lib/scoreTier.ts` (+ test) -- `scoreTier(snowScore)` gir `{ tier: 0..3, label }` for score, og `incomplete` for ufullstendige data, med grensene fra Intent. Testen dekker alle grensene i matrisen.
- [x] `src/lib/router.ts` (+ test) -- en liten History API-ruter: `parseRoute(pathname, base)` gir `utforsk`, `sted` med `id`, eller `ikke-funnet`. Lag også `href(route, base)`, `navigate()` og en `useRoute()`-hook som lytter på `popstate`. Testen dekker base `/` og `/G18-bikila-dymbe-gela-james/`.
- [x] `src/hooks/useSteder.ts` -- delt hook som laster én gang per sideinnlasting (et promise på modulnivå) og gir `null` (laster), `ok` eller `error`.
- [x] `src/components/KartVisning.tsx` (+ ren hjelpefil med test) -- et Leaflet-kart med topo-fliser og attribusjon, tilpasset Norges utstrekning. Én sirkelmarkør per sted, med stil fra `markerStyle(sted)`, tooltip fra `tooltipText(sted)` og navigasjon til `/sted/:id` ved klikk. Kartet ryddes ved unmount. Importer `leaflet/dist/leaflet.css`.
- [x] `src/pages/Utforsk.tsx`, `src/pages/Sted.tsx`, `src/App.tsx`, `src/App.css` (+ `App.test.tsx`) -- ruting, skjelett, feil og «Fant ikke». Stedssiden har navn, score-badge (tall + etikett, hvit tekst på `snowscore-3`) og en lenke tilbake.
- [x] `playwright.config.ts`, `tests/e2e/kart.spec.ts` -- `webServer` kjører `npm run build && npm run preview` i demomodus. Flisforespørsler stoppes med `page.route`. Testen åpner `/`, venter på 24 markører, klikker én og forventer `/sted/<id>` med stedets navn som overskrift.
- [x] `.github/workflows/e2e.yml` -- `npm ci`, `npx playwright install --with-deps chromium`, `npm run test:e2e` på pull requests.
- [x] `README.md` -- kort om kartet og om `npx playwright install chromium` + `npm run test:e2e`.

**Acceptance Criteria:**
- Given et rent klon, when `npm ci && npm run lint && npm run typecheck && npm test && npm run build` kjøres uten nett, then alt er grønt.
- Given installert Chromium, when `npm run test:e2e` kjøres, then røyktesten kart → stedsside er grønn.
- Given `npm run build`, when bundlen inspiseres, then JavaScript-koden er under 150 kB gzip (et mål for NFR-2, 3 s på 4G).

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alt exit 0, gzip-størrelse på JS under 150 kB.
- `npx playwright install chromium && npm run test:e2e` -- expected: røyktesten passerer.

**Manual checks:**
- `npm run dev`: kartet viser Norge med 24 fargede markører og demobanner; hover gir tooltip; klikk åpner stedssiden; Tilbake går til kartet.

## Review Triage Log

Tre lag: Blind Hunter (B), Edge Case Hunter (E) og Verification Gap (V). 26 funn. Merk: flere funn går ut fra at GitHub Actions er av. Det stemmer ikke, for CI kjørte grønt på PR #23 og #24, så `e2e.yml` vil kjøre på PR-er.

| # | Lag | Funn | Vurdering | Rute | Begrunnelse |
|---|-----|------|-----------|------|-------------|
| 1 | V | Ingen sjekk kjører E2E normalt (Actions «av») | false | avvist | Actions er på. `e2e.yml` kjører på hver PR. |
| 2 | V | `Lenke`-klikk er ikke testet noe sted | medium | patch | Det stemmer. E2E klikker nå «Tilbake til kartet». |
| 3 | V, B | Tooltipen (aldri bare farge) er ikke testet der den brukes | medium | patch | Det stemmer. E2E holder musepekeren over en markør og sjekker teksten. |
| 4 | B | E2E dekker ikke ufullstendig markør eller «Fant ikke stedet» | low | patch | Det er tillegg i samme testfil. |
| 5 | E | Et avvist `import('leaflet')` gir uhåndtert feil og et tomt kart | medium | patch | Det stemmer, for eksempel uten nett eller etter en ny deploy. Nå vises en feilmelding. |
| 6 | E | Skjelettet er lavt, så siden hopper når kartet kommer | low | patch | Det er én CSS-regel. |
| 7 | B | Markørtestene er svake (`dashArray` truthy, `startsWith`) | low | patch | Det er direkte strammere forventninger. |
| 8 | B, E | Direkte lenker til `/sted/:id` gir 404 på GitHub Pages | medium | defer | Det stemmer, men Pages-deploy er Story 1.11. Der hører `404.html` hjemme. |
| 9 | B, E | Markørene kan ikke brukes med tastatur. På mobil åpner et trykk siden uten tooltip | low | avvist | Kartlaget er unntatt AA (PRD). Listen i Story 1.8 er alternativet, og stedssiden viser tall og etikett. |
| 10 | B | KI-loggen mangler | false | avvist | Den skrives ved leveringen. |
| 11 | B | Triage-loggen mangler, statusen er ulik, og 1.5 flyttes til `done` | false | avvist | Loggen skrives nå. At 1.5 går til `done` når neste story starter, er etablert praksis. |
| 12 | B | Kriteriet om bundlestørrelse har ingen sjekk | low | avvist | Det er målt ved bygg (ca. 141 kB gzip) og ført i PR-en. En egen sjekk gir lite nå. |
| 13 | B, V | README sier at E2E kjøres på PR | false | avvist | Det stemmer, siden Actions er på. |
| 14 | B | `data-sted-id` er en krok bare for testen | low | avvist | Den er ufarlig og gjør testen stabil. |
| 15 | B | Ingen `<h1>` under lasting og feil | low | avvist | Tilstanden varer kort, og `role="status"`/`role="alert"` leses opp. |
| 16 | B | `IkkeFunnet` bruker klassen `sted-navn` | low | avvist | Det er kosmetisk. |
| 17 | B | `useSteder` er bare testet via `createSharedLoader`, og en feil hurtigbufres | low | avvist | Én lasting per sideinnlasting er AD-8. En ny lasting gir nytt forsøk. |
| 18 | B | `e2e.yml` mangler hurtigbuffer og HTML-rapport | low | avvist | Optimalisering. Sporene lastes opp ved feil. |
| 19 | E | Tom `steder` gir tomt kart uten forklaring | low | avvist | `publish` krever ≥ 95 % av katalogen, så tom liste publiseres ikke. |
| 20 | E | Et avvist `loadFn` forgifter loaderen | false | avvist | `loadPublishedData` avviser aldri, men gir `error`. |
| 21 | E | `navigate()` til samme sti beholder `?query`/`#hash` | low | avvist | Ingen ruter bruker query ennå. Story 1.8 (`visning`) må ta stilling til det. |
| 22 | E | `reuseExistingServer` kan teste et gammelt bygg lokalt | low | avvist | Det er Playwrights standard. I CI startes alltid en ny server. |
| 23 | V | `navigate`/`useRoute`/hooken er ikke enhetstestet | low | avvist | E2E dekker dem (rad 1–3), og den kjører på PR. |
| 24 | B | Overskriften «SnowFinder» er ikke lenger `h1` | false | avvist | Det er bevisst: hver side har sin egen `h1`. |
| 25 | E | Markører kan ikke nås med tastatur (påstand) | low | avvist | Samme som rad 9. |
| 26 | E | Direkte lenker på Pages (påstand) | medium | defer | Samme som rad 8. |
