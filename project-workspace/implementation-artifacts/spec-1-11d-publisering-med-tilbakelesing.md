---
title: 'Story 1.11d: Publiser alltid til grenen data, og les tilbake det som er publisert'
type: 'feature'
created: '2026-11-01'
status: 'done'
baseline_commit: 'c3642e27c1d8ea7a94d71f0bf8e2c58b1f19b2a2'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `data.yml` skriver til grenen `data` bare når Pages er av. Slås Pages på, slutter grenen å oppdateres, og `npm run dev` får gamle data. Jobben er også grønn selv om det publiserte aldri kom ut, og bygget kjører `prebuild`, som kan hente en annen fil. Aksel krever at publisering bevises på den faktiske adressen, ikke med grønn workflow.

**Approach:** På `main` publiserer jobben alltid til grenen `data`, og i tillegg til Pages når Pages står på «GitHub Actions». Bygget kjører uten `prebuild`. En egen jobb leser fila tilbake fra hver adresse og sammenligner `runId` med den aktuelle kjøringen.

## Boundaries & Constraints

**Always:** Ingen publisering utenfor `main`. Tilbakelesingen bruker `runId` fra `public/data/latest.json` i samme kjøring, og den faktiske adressen uten cache-parametre: `https://raw.githubusercontent.com/<repo>/data/latest.json` og `<page_url>data/latest.json`. Jobben med skrivetilgang kjører ingen prosjektkode.

**Never:** Ingen endring av `src/`, `scripts/`, `tests/` eller `package.json`. «Pages er av» forblir en advarsel til steg 7. Ingen nye avhengigheter, actions eller hemmeligheter.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| `main`, Pages av | Pages-API-et svarer 404 | Grenen `data` skrives og leses tilbake. Pages-jobben hoppes over. Kjøringen er grønn med en advarsel | – |
| `main`, Pages på | `build_type` er `workflow` | Grenen og Pages publiseres, og begge leses tilbake | – |
| PR eller annen gren | `GITHUB_REF` er ikke `main` | Ingenting publiseres eller leses tilbake. Valget skrives i loggen | – |
| Forsinket svar | Gammel `runId` i CDN-et de første minuttene | Ny lesing hvert 20. sekund, grønn når `runId` stemmer | – |
| Feil fil ute | `runId` stemmer ikke innen 12 minutter | Kjøringen blir rød | `::error::` med adresse, forventet og funnet `runId` |
| Adressen svarer feil | HTTP-feil eller ikke JSON | Regnes som ikke stemt, og leses på nytt til fristen | Samme feilmelding |
| Publisering feilet | `branch` eller `pages` feilet | Kjøringen er rød. Den andre adressen leses tilbake hvis den ble publisert | – |
| Mangler `runId` | `latest.json` har ingen `runId` | Kjøringen blir rød før noe publiseres | `::error::` |

</frozen-after-approval>

## Code Map

- `.github/workflows/data.yml:53-61` -- bygget: `npm run build --ignore-scripts -- --base=…`. Skriptet `build` kjøres, men ikke `prebuild`, som i `playwright.config.ts`.
- `data.yml:73-98` -- steget `target`: erstatt output `publish` med `branch` (`true` på `main`), `pages` (`true` på `main` med `build_type` `workflow`) og `run_id`. Linja `::warning::` beskriver ikke lenger en reserve og skrives om. Sjekken av API-et kjører fortsatt på PR.
- `data.yml:32-33` -- outputs for de tre verdiene.
- `data.yml:100-110` -- artefaktene følger de nye verdiene, som nå kan være sanne samtidig.
- `data.yml:121-145` -- `branch` får `if` på ny output. Innholdet er uendret.
- `data.yml:147-160` -- `pages` får `if` på ny output og `outputs.page_url`. `timeout-minutes` er uendret.
- `data.yml` (ny jobb `verify`) -- `needs: [data, branch, pages]`, kjører når minst én av dem lyktes og kjøringen ikke er avbrutt. `permissions: {}`, ingen `checkout`, `timeout-minutes: 30`, ett steg per adresse med `if` på jobbresultatet. Hent verdier gjennom `env`, ikke inline i skriptet. Bruk `curl` og `jq`, som finnes på runneren.
- `scripts/pipeline/publish.ts:46` -- `runId` i den publiserte fila, fra `run.ts:91` og unik per kjøring. Endres ikke.
- `README.md` og `ARCHITECTURE`-kopiene:390 -- beskriver allerede dette. Endres ikke.
- `project-phase-folders/3-Gjennomføringsfasen/fremdriftsplan.md:20-25,227`, `aktivitetsdiagram.md:41,160`, `2-Planleggingsfasen/milepæler.md:31` -- omtaler at jobben velger mellom Pages og reserven. Rettes til at grenen alltid skrives. Historiske avsnitt fra før 31. oktober står.

## Tasks & Acceptance

**Execution:**
- [x] `.github/workflows/data.yml` -- bygg uten `prebuild`, nye outputs, `branch` og `pages` uavhengig av hverandre, og jobben `verify` med 12 minutters frist per adresse.
- [x] `fremdriftsplan.md`, `aktivitetsdiagram.md`, `milepæler.md` -- rett omtalen av reserven, og sett «Sist oppdatert».

**Acceptance Criteria:**
- Given en PR som endrer `data.yml`, when jobben kjører, then er `data` grønn, og `branch`, `pages` og `verify` hoppes over.
- Given skriptet i `verify` kjørt lokalt mot en testserver, when `runId` stemmer etter noen forsøk, then avsluttes det med kode 0. When `runId` aldri stemmer, eller svaret er 404 eller ikke JSON, then avsluttes det med kode ulik 0 og en `::error::`-linje.
- Given `data.yml`, when fila lastes som YAML, then peker alle `needs` og `outputs` på jobber og steg som finnes.

## Implementation Notes

- De to stegene i `verify` deler samme skript med et YAML-anker (`&read-back`), som GitHub Actions støtter. Frist og intervall står som `env` på jobben (720 og 20 sekunder), så skriptet kan prøves lokalt med kortere tider.
- Pages-steget i `verify` kjører også når lesingen av grenen feilet, så loggen viser begge adressene.
- Sjekken av `runId` i steget `target` kjører før greiningen på `main`, så en manglende `runId` også blir rød på PR.
- `milepæler.md:47` står uendret: avsnittet er forslaget fra 28. oktober, altså historisk.
- Etter review kjører `verify` på `main` når `data` lyktes, og siste steg gjør kjøringen rød hvis noe ikke ble publisert. Betingelsen på jobben kan ikke prøves lokalt. Første prøve er at `verify` hoppes over på PR-en.

Skriptene ble hentet ut av `data.yml` og kjørt lokalt med `bash -e`, jq 1.8.2 og kortere frist enn 720 s. Den virkelige fristen er ikke kjørt.

Tilbakelesingen mot en lokal testserver:

| Svar fra serveren | Exit | `::error::` |
|---|---|---|
| Gammel `runId` to ganger, deretter riktig | 0 | nei |
| 503, så ikke JSON, deretter riktig | 0 | nei |
| `runId` stemmer aldri | 1 | ja |
| 404 | 1 | ja |
| Ikke JSON | 1 | ja |
| JSON uten `runId` | 1 | ja |
| Ingen server | 1 | ja |

Siste steg i `verify`. `–` betyr at output mangler:

| `data.branch` | `data.pages` | `branch` | `pages` | Exit | Antall `::error::` |
|---|---|---|---|---|---|
| `true` | `false` | success | skipped | 0 | 0 |
| `true` | `true` | success | success | 0 | 0 |
| `true` | `true` | success | failure | 1 | 1 |
| `true` | `true` | failure | success | 1 | 1 |
| `true` | `true` | cancelled | success | 1 | 1 |
| `true` | `true` | success | cancelled | 1 | 1 |
| `true` | `true` | success | skipped | 1 | 1 |
| `true` | `false` | failure | skipped | 1 | 1 |
| `true` | `false` | cancelled | skipped | 1 | 1 |
| – | – | skipped | skipped | 1 | 2 |
| – | `true` | skipped | success | 1 | 2 |
| `false` | `false` | skipped | skipped | 1 | 2 |
| `true` | – | success | skipped | 0 | 0 |

Siste rad er kjent: mangler bare output `pages`, fanges det ikke, fordi steget bare ser på `pages` når verdien er `true`.

- Etter triagen krever siste steg også at `pages` er `true` eller `false`, så raden «`true`, mangler, success, skipped» gir nå exit 1, ikke exit 0 som i tabellen.
- `sprint-status.yaml` står på `in-progress`, for Story 1.11 er ikke ferdig før steg 5–7 er gjort.

## Spec Change Log

## Review Triage Log

Gjennomgang med Blind Hunter (10 funn), Edge Case Hunter (4) og Verification Gap (3 pluss 2 andre funn). Ingen funn ga intent_gap eller bad_spec.

| # | Lag | Funn | Vurdering | Rute | Begrunnelse |
|---|-----|------|-----------|------|-------------|
| 1 | VG, ECH | En manglende output eller en `cancelled` publiseringsjobb kunne gi grønn kjøring uten publisering | high | patch | Stemmer: `verify` ble selv hoppet over. Den kjører nå alltid på `main` når `data` lyktes, og siste steg krever begge resultatene. Også manglende `pages`-output gir rødt. |
| 2 | BH | Bygget sjekkes ikke mot fila som leses tilbake | low | patch | `cmp` er én linje, og den kjører også på PR. |
| 3 | ECH, BH | Kommentaren om under en time stemmer ikke når `verify` holder låsen | medium | patch | Kommentaren er rettet. To adresser som svikter kan forsinke neste kjøring, men da er kjøringen allerede rød. |
| 4 | BH | README sier at ingenting publiseres ved feil | medium | patch | Stemmer ikke lenger for feil etter publisering. Rettet. |
| 5 | BH, VG | `epic-1-context.md`, `sprintplan.md` og epics omtaler fortsatt reserven | medium | patch | Epics motsa seg selv, og agenter bygger fra konteksten. Rettet. |
| 6 | BH | Fremdriftsplanen endret en historisk rad og sa at PR #78 er utkast | medium | patch | Raden er tilbake, og datert oppføring for 1. november er lagt til. |
| 7 | VG | Skriptet i `verify` har ingen test som kjører i repoet | medium | defer | Spec-en utelukker `tests/`. Resultatene står i Implementation Notes, og første ekte kjøring er steg 6. Står i `deferred-work.md`. |
| 8 | VG, ECH, BH | Pages-veien og `page_url` er uprøvd, og adressen antar skråstrek til slutt | maybe-false | defer | Dokumentasjonen oppgir ikke formatet, og Pages-API-et svarer med skråstrek. Mangler den, blir kjøringen rød med adressen i meldingen. Avgjøres i steg 7. |
| 9 | BH | `verify` leser bare datafila, ikke selve appen | low | avvist | Endringsforslaget legger nettsiden og direkte lenke til håndsjekken i steg 7. |
| 10 | BH | Aktivitetsdiagrammet viser ikke feilveien, og M1 kan se nådd ut uten Pages | low | avvist | Diagrammet er en oversikt. M1 vurderes i steg 7. |
| 11 | ECH | Ny kjøring av en gammel, rød `verify` etter en nyere publisering gir falsk rød | low | avvist | Krever en manuell ny kjøring og er ufarlig: feilmeldingen viser begge `runId`. |
| 12 | BH | `data-run-log` lastes ikke opp når bare publiseringen feiler | low | avvist | Kvalitetsrapporten gjelder `data`-jobben, og loggen fra publiseringen finnes i kjøringen. |
| 13 | VG | `run_id` og den publiserte fila er samme fil, så sammenligningen kan ikke se en bytting under bygget | false | avvist | `--ignore-scripts` og `cmp` i «Check the build» fanger dette. |
| 14 | BH | Logg, triage-rader og sporbarhet mangler i diffen | false | avvist | De skrives ved commit. |

## Design Notes

- **Frist på 12 minutter:** `raw.githubusercontent.com` svarer `max-age=300`, og GitHub Pages bruker vanligvis `max-age=600`. Fristen skal tåle en full cache-periode, ikke være rask.
- **Hvorfor egen jobb:** Jobben med skrivetilgang skal ikke gjøre mer enn å skrive. `verify` har ingen tilganger, og en feil i tilbakelesingen kan ikke påvirke det som er publisert.
- **`concurrency: data`** holder hele kjøringen, så en ny timeskjøring kan ikke overskrive fila under tilbakelesingen.
- **Grensen for beviset:** Tilbakelesingen kjører ikke på PR, så den prøves på ekte først i steg 6. Her prøves skriptet lokalt.

## Verification

**Commands:**
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build:demo` -- expected: grønt
- `gh pr checks 78 --watch` -- expected: `data`, CI og E2E grønne, `branch`, `pages` og `verify` hoppet over

**Manual checks:**
- Skriptet i `verify` kjørt mot en lokal testserver for de tre utfallene. Første ekte kjøring skjer i steg 6.
