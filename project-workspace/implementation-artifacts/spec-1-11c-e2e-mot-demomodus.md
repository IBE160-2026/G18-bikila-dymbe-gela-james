---
title: 'Story 1.11c: E2E, CI og pre-push mot demomodus'
type: 'chore'
created: '2026-10-31'
status: 'done'
baseline_commit: 'b32b9f7390e591c85df0a23cb63d912a78c20df7'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Etter steg 2 bygger Playwright, CI og pre-push fortsatt i normal modus. E2E er derfor rød, og `npm run build` i CI og hooken avhenger av nett gjennom `prebuild`. Ingen test viser at bygget faktisk velger riktig fil, det ble bare bekreftet for hånd (funn 10 i `spec-1-11b`).

**Approach:** Playwright, `ci.yml` og `.githooks/pre-push` bruker `build:demo`. To nye spec-filer viser i nettleseren at normal modus aldri leser `demo.json`, og at demomodus aldri leser `latest.json`.

## Boundaries & Constraints

**Always:** Hele E2E kjører uten nett og uten filer fra `npm run data`. Normal-testen kjører mot et ekte bygg i normal modus, der `demo.json` faktisk ligger i bygget, ellers beviser den ingenting. Bygget for testen kjører ikke `prebuild`.

**Never:** Ingen endring av `src/`, `scripts/` eller `data.yml` (steg 4). Ingen nye avhengigheter. Ingen svekkede testkrav: påstander om antall steder, banner og axe står som før. Ingen `retries` eller lengre tidsavbrudd for å få testene grønne.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Normal modus, fil finnes | `latest.json` svarer med gyldige live-data | Stedene vises uten demobanner. Eneste datakall er lokal `latest.json` | – |
| Normal modus, ingen fil | `latest.json` svarer 404, `demo.json` ligger i bygget | «Fant ingen værdata …» vises, uten demobanner. `demo.json` hentes aldri | – |
| Demomodus, `latest.json` finnes | `latest.json` svarer med gyldige data | Demobanner og 24 steder. Eneste datakall er lokal `demo.json` | – |
| Gamle live-data | `demo.json` serveres med `mode: "live"` | Som i dag i `tom.spec.ts`: «Ingen ferske data» og «Utdatert» | – |

</frozen-after-approval>

## Code Map

- `playwright.config.ts:18` -- `webServer` blir en liste med to servere, og `projects` får to prosjekter. Kommentaren på linje 3 stemmer da med begge.
- `tests/e2e/datagren.spec.ts` -- testen hører til forrige design. Slettes.
- `tests/e2e/{kart,filter,forklaring,gamle-data,sted,liste}.spec.ts` -- linja `context.route('**/data/latest.json', … 404)` og kommentaren om «leftover latest.json» fjernes. Demobygget leser aldri fila, så linjene ville skjult en feil. `route('**/*')` for nett beholdes.
- `tests/e2e/tom.spec.ts:5,20` -- serverer live-data som `latest.json`. Blir `demo.json`; `clock.ts` og `useSteder.ts` velger ut fra `mode` i fila, ikke byggemodus, så testen virker uendret. `const live` beholdes.
- `tests/e2e/gamle-data.spec.ts:21`, `sted.spec.ts:125`, `filter.spec.ts:1203` -- endrer allerede `demo.json`. Beholdes.
- `src/hooks/useSteder.ts:140` -- `dataKilde(import.meta.env.MODE)`, koblingen som testes. Endres ikke.
- `.github/workflows/ci.yml:29` -- `npm run build:demo`.
- `.github/workflows/e2e.yml` -- kjører `npm run test:e2e`. Endres ikke.
- `.githooks/pre-push:23` -- `build` blir `build:demo` i løkka.
- `README.md:230` -- teksten om hooken nevner `build`. Rettes.

## Tasks & Acceptance

**Execution:**
- [x] `playwright.config.ts` -- prosjektet `chromium` kjører alt unntatt `normalmodus.spec.ts` mot `build:demo` på port 4173. Prosjektet `normalmodus` kjører bare den fila mot port 4174, bygget med `npx vite build --outDir node_modules/.cache/e2e-normal` og servert med `npx vite preview --outDir node_modules/.cache/e2e-normal --port 4174 --strictPort` -- `npx vite build` hopper over `prebuild`, og mappen er allerede ignorert av git og ESLint.
- [x] `tests/e2e/normalmodus.spec.ts` -- ny: de to radene for normal modus i matrisen.
- [x] `tests/e2e/demomodus.spec.ts` -- ny: raden for demomodus, og erstatter `datagren.spec.ts`.
- [x] `tests/e2e/{kart,filter,forklaring,gamle-data,sted,liste}.spec.ts` -- fjern rutene og kommentarene for `latest.json`.
- [x] `tests/e2e/tom.spec.ts` -- server live-data som `demo.json`, og rett kommentaren.
- [x] `.github/workflows/ci.yml`, `.githooks/pre-push`, `README.md` -- `build:demo`.

**Acceptance Criteria:**
- Given et rent klon uten `public/data/latest.json`, when `npm run test:e2e` kjøres, then er alle testene grønne.
- Given at `public/data/latest.json` finnes lokalt, when `npm run test:e2e` kjøres, then er resultatet det samme.
- Given at `dataKilde` alltid returnerer `demo`, when `normalmodus.spec.ts` kjøres, then feiler den. Given at den alltid returnerer `latest`, when `demomodus.spec.ts` kjøres, then feiler den.
- Given en push av PR-en, when CI og E2E er ferdige, then er begge grønne på Ubuntu.

## Implementation Notes

- Normal-bygget bruker `npm run build --ignore-scripts -- --outDir …`, ikke `npx vite build` som oppgaven sa (funn 1 i gjennomgangen). Da kjører E2E det samme skriptet som `data.yml` publiserer med, uten `prebuild`.
- `reuseExistingServer` er `false` på begge serverne, så port 4173 og 4174 må være ledige.
- Playwright starter serverne etter hverandre, så de to `tsc -b`-kjøringene kolliderer ikke. Begge bygges også med `--project`, så én prosjektkjøring sparer ikke tid.
- Mutasjoner: `dataKilde` alltid `demo` gir rødt i `normalmodus.spec.ts`, alltid `latest` gir rødt i `demomodus.spec.ts`, og `build` med `--mode demo` gir rødt i `normalmodus.spec.ts` (2 av 2). Alle er tilbakestilt.
- `sprint-status.yaml` står på `in-progress`, for Story 1.11 er ikke ferdig før steg 4–7 er gjort.

## Spec Change Log

## Review Triage Log

Gjennomgang med Blind Hunter (11 funn), Edge Case Hunter (4) og Verification Gap (1 pluss 2 andre funn). Ingen funn ga intent_gap eller bad_spec.

| # | Lag | Funn | Vurdering | Rute | Begrunnelse |
|---|-----|------|-----------|------|-------------|
| 1 | VG, BH | Ingen sjekk kjører selve `npm run build`. Feil modus der ville gitt «Fant ingen værdata» i produksjon med alt grønt | high | patch | Stemmer: `data.yml:59` er eneste kall. Normal-bygget kjører nå skriptet, og mutasjonen gir rødt. |
| 2 | ECH, BH | `reuseExistingServer` kan gjenbruke en server med feil eller gammelt bygg | medium | patch | Stemmer: README viser `npm run preview` på port 4173. Satt til `false`. |
| 3 | ECH, VG, BH | README beskriver bare ett bygg i E2E | medium | patch | Rettet på linje 131 og 152. Linje 174 stemmer fortsatt. |
| 4 | BH | Arkitekturen beskriver E2E som bare demo | medium | patch | Rettet på linje 374 og 389, i begge kopiene. |
| 5 | ECH, VG, BH | `AGENTS.md` sier `npm run build` før commit og i CI, og at røyktesten kjører på demodata | medium | defer | Må gå gjennom `bmad-project-context`, og Aksel godkjenner hver skriving der. Står i `deferred-work.md`. |
| 6 | BH | `tom.spec.ts` tester gamle live-data i demobygget | low | avvist | Aldersgrensene følger `mode` i fila, ikke byggemodus, og den frosne matrisen sier dette. Normal-testen viser at bygget leser riktig fil. |
| 7 | BH | Normal-testen bruker 404, ikke 200 med HTML | low | avvist | Grenen er dekket i `loadPublishedData.test.ts` og ble sett i Chromium i steg 2. |
| 8 | BH | Påstanden om datakall kan komme før et sent kall | low | avvist | En reserve måtte kommet før meldingen vises, og den feilen fanges. Ingen sen henting finnes i normal flyt. |
| 9 | BH | Filteret på datakall ser ikke andre adresser | false | avvist | Filteret ser stien, så `raw.githubusercontent.com/…/data/latest.json` fanges og feiler på hele adressen. |
| 10 | BH | Oppsett for datakall er kopiert i to spec-filer | low | avvist | Fire linjer i to filer. Ingen konkret skade, og det krever en ny hjelpefil. |
| 11 | BH | KI-logg og spec-status mangler i diffen | false | avvist | Spec-en oppdateres her, og loggene skrives ved commit. |

## Design Notes

- **Avvik fra steg 3 i endringsforslaget:** Forslaget sier at spec-ene skal «route `demo.json`». De fleste rutene svarer bare 404 for `latest.json`. De fjernes i stedet, for de ville skjult nettopp den feilen de nye testene skal fange.
- **Hvorfor to bygg:** Testen av normal modus kan ikke kjøre mot demobygget, for valget av fil skjer ved bygging. En falsk rute i demobygget ville bare testet ruten.
- **`npm run build` kjøres ikke lenger av CI og hooken.** Normal modus bygges fortsatt i E2E, med unntak av `prebuild`. `predev` og `prebuild` prøves på ekte i steg 6.
- **Datakall måles med URL-er som ender på `/data/<fil>.json`**, uten kartbilder. Sammenligning med hele adressen fanger også et kall til `raw.githubusercontent.com/.../data/latest.json`.

## Verification

**Commands:**
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build:demo` -- expected: grønt
- `npm run test:e2e` -- expected: alle grønne, både med og uten lokal `public/data/latest.json`
- `gh pr checks 78 --watch` -- expected: CI og E2E grønne

**Manual checks:**
- Midlertidig mutasjon av `dataKilde` begge veier: testene feiler. Mutasjonen tilbakestilles før commit.
