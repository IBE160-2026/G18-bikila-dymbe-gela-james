---
title: 'Ytelse på mobil: bare endrede markører (A) og parallell lasting (B)'
type: 'feature'
created: '2026-11-20'
status: 'done'
baseline_commit: 'f751771ca79e78815f8e84106f2072e9fe1369de'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/project-phase-folders/4-Avslutningsfasen/målinger/README.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** SM-1 og SM-12 (Må ha) holder ikke på mobilprofilen. Grunnmålingen 20.11 mot den publiserte siden, med 4G, CPU 4× tregere og 5 kjøringer:
- SM-12: kartet er interaktivt etter median 7463 ms, og ingen av 5 kjøringer er under 3 s.
- SM-1: 102 av 114 filterendringer (89 %) er under 500 ms, og p95 er 672 ms.

**Approach:** Aksel godkjente 20.11 to tiltak, som bygges i denne rekkefølgen og måles hver for seg:
- **A:** kartet oppdaterer bare markørene som kommer til eller faller bort når filteret endres.
- **B:** datafila og Leaflet hentes ved oppstart, parallelt med React, i stedet for i serie.

Tiltak C (zod/mini) og D (canvas) er ikke valgt.

**Beslutning 2026-11-20 (Aksel), etter målingene:**
- Tiltak B er fjernet igjen (revert). Med 10 målinger per variant ga B ingen målbar effekt på SM-12: median 4896 ms med A+B mot 4996 ms med bare A, godt innenfor variasjonen.
- Bare tiltak A beholdes.
- SM-12 føres som avvik innen 25.11.

## Boundaries & Constraints

**Always:**
- Markørene forblir SVG med tooltip og klikk, og har `data-sted-id`.
- Zoom og posisjon står der brukeren forlot dem.
- En markør som blir værende, skal vise riktig stil, og et klikk på den skal åpne stedet med det gjeldende søket.
- Datafila hentes én gang per side, også med tidlig start. Gjeldende regler for ny henting (Story 1.6b) og alder (NFR-3) gjelder uendret.
- Demomodus henter `demo.json`, og normal modus henter `latest.json` (AD-10).
- Hvert tiltak måles med `mal-ytelse.cjs` (mobilprofil) før og etter, på samme måte, med 10–20 målinger per variant for både SM-12 og SM-1 (endret av Aksel 2026-11-20). Tallene føres inn i PR-en og i `målinger/README.md`.
- Grenen er `story/ytelse-mobil`. PR-en går til review hos Joseph først og Kelly i tillegg (endret av Aksel 2026-11-20: Joseph er den eneste med bekreftet synlige godkjenninger) og merges ikke uten godkjenning. PR-en sier at SM-12 i tillegg skal måles på en ekte telefon.
- CI og E2E skal være grønne før review.

**Never:**
- Canvas-markører, `zod/mini`, nye avhengigheter eller endringer i `shared/contracts/`.
- Endringer i UX eller utseende.
- Merge uten godkjenning.

## I/O & Edge-Case Matrix

| Scenario | Tilstand | Forventet |
|---|---|---|
| Strammere filter | 300 → 120 treff | 180 markører fjernes, 120 står urørt |
| Løsere filter | 120 → 300 | 180 legges til, 120 står urørt |
| Nytt søk, samme treff | `sok` endres | Ingen markører lages på nytt, og et klikk bruker det nye `sok` |
| Ny datafil (ny henting) | Nye `Sted`-objekter med samme id | Markørene lages på nytt med den nye stilen |
| Zoom | `zoomend` | Alle synlige markører får ny størrelse, som før |
| Tidlig start, så subscribe | `forhandslast()` før render | Én henting, og samme resultat til alle |
| Leaflet lastet tidlig | Kartet monteres senere | Samme modul uten ny import, og samme feilmelding hvis lastingen feiler |

**Beslutning 2026-11-20 (Aksel): målemetode.** Forhåndsvisningene på Vercel krever innlogging. Før og etter måles derfor på et lokalt produksjonsbygg med ekte data (`npm run build`, så `vite preview`), med samme skript og profil. `main` og greinen måles likt. I tillegg måles den publiserte siden etter merge.

</frozen-after-approval>

## Code Map

- `src/components/KartVisning.tsx:72-84`: effekten som kjører `clearLayers()` og lager alle markørene på nytt ved hver endring i `steder` eller `sok`. Skal erstattes med oppdatering av bare forskjellene. `zoomend` (`:51-54`) skal fortsatt bruke `eachLayer`.
- `src/components/kartMarkor.ts` og `kartMarkor.test.ts`: rene hjelpere for stil, størrelse og tooltip. Den rene diff-funksjonen legges her, så den kan testes uten nettleser.
- `src/components/KartVisning.tsx:42`: `import('leaflet')` i effekten. Skal bruke en delt, hurtigbufret laster.
- `src/hooks/useSteder.ts`: `createStederStore` starter `loadFn` først ved den første `subscribe` (`pending ??=`), altså etter at React har tegnet. `store` lages på modulnivå (`:207`).
- `src/main.tsx`: starter appen. Her settes den tidlige hentingen av data og Leaflet i gang før `createRoot`.
- `src/hooks/useSteder.test.ts` (finnes): tester for butikken utvides.
- `tests/e2e/filter.spec.ts` og `kart.spec.ts`: bruker `path[data-sted-id=…]` og klikk. Skal fortsatt passere uten endring.
- `project-phase-folders/4-Avslutningsfasen/målinger/README.md`: før- og etter-tall.

## Tasks & Acceptance

**Execution:**
- [x] `src/components/kartMarkor.ts` + test: en ren funksjon som tar eksisterende markører (id → `Sted`) og nye treff, og gir hva som skal fjernes og hva som skal legges til. Et sted med samme id men et annet `Sted`-objekt regnes som endret.
- [x] `src/components/KartVisning.tsx`: hold markørene i et `Map` med id som nøkkel og bruk diff-funksjonen. Klikket leser `sok` fra en ref, så nytt søk ikke lager markørene på nytt.
- [x] Mål tiltak A og før tallene inn.
- [x] `src/hooks/useSteder.ts` + test: `forhandslast()` på butikken starter `loadFn` én gang, og `subscribe` gjenbruker den samme hentingen.
- [x] En delt Leaflet-laster med hurtigbuffer (eksportert fra `KartVisning.tsx` eller en liten modul) + test: lastes én gang, og en feil gir samme feilmelding som før.
- [x] `src/main.tsx`: kall begge før `createRoot`.
- [x] Mål tiltak B og før tallene inn.
- [x] `målinger/README.md`, PR med før- og etter-tall og en merknad om at SM-12 også skal måles på en ekte telefon, og review fra Joseph og Kelly.

**Acceptance Criteria:**
- Gitt Utforsk med kart, når en slider endrer treffene, så lages ingen markør for et sted som var med før og fortsatt er med, og E2E-testene for filter og kart passerer uendret.
- Gitt en kald side, når appen starter, så begynner hentingen av datafila og Leaflet før React har tegnet første gang, og datafila hentes bare én gang.
- Gitt målingen etter A og etter B, så står før- og etter-tallene for SM-1 og SM-12 i PR-en.

## Implementation Notes

- **Grunnmåling, lokalt bygg av `main` (f751771):**
  - `npm run build` med ekte data, servert med gzip som hos Vercel (en enkel Node-server; `vite preview` komprimerer ikke).
  - Mål på `http://127.0.0.1:4175/` med `mal-ytelse.cjs` (4G, CPU 4×, 5 kjøringer).
  - SM-12: median 5829 ms, verst 7100 ms, 0 av 5 under 3 s.
  - SM-1: 91 av 114 (80 %) under 500 ms, p50 312 ms, p95 776 ms.
- **Låst datagrunnlag** (Aksel 2026-11-20):
  - Alle tre lokale varianter (`main`, A og A+B) bruker samme kopi av `latest.json`, som legges inn i `dist/data/` etter hvert bygg: runId `20261120T084001Z-bf103870`, `referenceTime` 2026-11-20 kl. 09.40 norsk tid, 300 steder, sha256 `e57ad497…`.
  - Den publiserte siden bruker live-data, altså datafila som gjelder da den måles. Det står i resultatet.
- **Arbeidsdeling:** hovedøkten tar målingene (oppgave 3 og 7) og PR-en (oppgave 8). Implementeringen gjør A og B som **to separate commits** på `story/ytelse-mobil`, A først, så hvert tiltak kan bygges og måles for seg. Commit-meldingene følger AGENTS.md: `fix:` og en kort norsk tekst i imperativ, for eksempel `fix: oppdater bare markørene som endres i kartet`. Ikke push. Ikke bruk port 4175.

- **Resultat** (10 målinger per variant, låst datagrunnlag; full tabell i `målinger/README.md`):
  - SM-1: lokal `main` 94,8 % → A 99,4 % (10 av 10 økter ≥ 95 %), p95 504 → 264 ms.
  - SM-12: `main` 4841 ms, A 4996 ms, A+B 4896 ms. Ingen målbar effekt av B, og 0 av 10 under 3 s for alle variantene.
  - B ble fjernet etter Aksels valg (`973cdd9`). Oppgavene for B er gjort og målt, men koden er tatt ut igjen.
- **Etter gjennomgangen** (`2dc53bd`):
  - `sokRef` settes i `useLayoutEffect`.
  - Ny E2E-test sjekker at Oksskoltens markør er det samme elementet etter en filterendring. Den feiler med den gamle kartkoden og består med den nye.
- **Verifisert:**
  - `npm run lint`, `typecheck`, `test` (797 tester) og `build:demo` er grønne.
  - `npm run test:e2e`: 176 passerte.
- **Utkast til avvik for SM-12:** i `målinger/README.md`.

## Spec Change Log

## Review Triage Log

Gjennomgang 2026-11-20: Blind Hunter (BH, 11 funn), Edge Case Hunter (EC, 4 funn) og Verification Gap (VG, 2 funn).

| # | Funn | Verdikt | Bevis og rute |
|---|---|---|---|
| 1 | BH, EC: `markorEndringer` antar at id-ene i treffene er unike. Et duplikat gir en markør som aldri fjernes | low | `PublishedData` krever ikke unike id-er, men katalogen har unike id-er, og alle sider og E2E-tester bygger allerede på det. Avvist: lite sannsynlig, og rettingen legger til en vakt |
| 2 | BH, EC: stablingsrekkefølgen for markører som kommer tilbake, følger ikke lenger rekkefølgen i fila | low | Ekte, men bare for hvilken av to overlappende markører som ligger øverst. Fila er ikke sortert på score, så den gamle rekkefølgen hadde ingen mening. Å flytte alle markørene fram igjen koster det tiltak A sparer. Avvist |
| 3 | EC: en importer som kaster synkront, går forbi `.catch` i `main.tsx` | false | `import('leaflet')` gir alltid et promise og kaster aldri synkront |
| 4 | BH, EC: `sokRef` oppdateres i `useEffect`, så et klikk kan bruke det gamle søket i et kort vindu | low | Ekte, og rettingen er direkte: `useLayoutEffect`. Patch |
| 5 | BH, VG: ingen test sjekker at en markør som blir værende, er det samme elementet etter en filterendring | medium | Bekreftet: `filter.spec.ts:105-123` sjekker posisjon og størrelse, og gikk også grønt med den gamle koden. Patch: E2E-steg som merker elementet og sjekker at merket er der etter at sliderne er endret |
| 6 | BH: klikk etter nytt søk er ikke testet | false | VG viser at `filter.spec.ts:451-459` klikker Gaustatoppen etter en filterendring og sjekker at adressen har det nye søket |
| 7 | BH: Leaflet lastes på alle sider, også når appen åpnes rett på en stedsside eller i listevisningen, og konkurrerer om båndbredden med datafila | medium | Ekte: `main.tsx` starter alltid lastingen, og SM-12 gjelder bare kartet. Var patch. Faller bort, fordi B er fjernet |
| 8 | BH: dokumentasjonen (README for målinger, ai-log og fremdriftsplan) mangler i diffen | false | Den er lagt til hovedøkten og PR-steget (Implementation Notes). Den er ikke en feil i koden |
| 9 | BH: greinnavnet har ikke story-nummer | low | Arbeidet har ingen story. Greina `story/ytelse-mobil` er godkjent i spesifikasjonen. Avvist |
| 10 | BH: testnavnet i `lastLeaflet.test.ts` lover at kartet viser feilen, men bare lasteren testes | low | Var patch. Faller bort, fordi B er fjernet |
| 11 | BH: `forhandslast()` med en henting som feiler før noen abonnerer, er ikke testet | low | Var patch. Faller bort, fordi B er fjernet |
| 12 | BH: en markør som fjernes, beholder tooltip og klikk | false | Leaflet lukker tooltipen ved `remove` (`Tooltip.js:306`), og en fjernet markør har ingen referanser igjen |
| 13 | VG: når en nyere datafil kommer, er redrawing av kartet bare testet i hjelperen | maybe-false (medium) | Krever en E2E-test med klokke og to live-filer. Utsatt til `deferred-work.md` |

## Verification

**Commands:**
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build:demo` -- forventet: grønne.
- `npm run test:e2e` -- forventet: grønne.
- `node "project-phase-folders/4-Avslutningsfasen/målinger/mal-ytelse.cjs" <url> 5 4` -- før og etter hvert tiltak.
