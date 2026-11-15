# SnowFinder: sluttrapport

**Gruppe:** G18, IBE160, Høgskolen i Molde
**Status:** skjelett (2026-11-15). Seksjoner merket *[Fylles inn]* skrives ferdig innen F5 (forslag 2026-11-23).

> Skjelettet bygger på PRD §9 (suksessmål), fremdriftsplanen og KI-loggen. Tall som allerede er
> målt, står inne med dato og metode. Alt som står her, skal kunne sjekkes i repoet.

## 1. Sammendrag

*[Fylles inn til slutt, 5–8 setninger: hva SnowFinder er, hva som ble levert, de viktigste
resultatene fra brukertesten og hva vi ville gjort annerledes.]*

## 2. Mål og omfang

- **Problemet og visjonen:** se [produktbriefen](../1-Oppstartsfasen/SnowFinder-Produktbrief.md) og PRD §1.
- **Levert i v1:**
  - stedskatalog med 300 steder;
  - dataprogram som henter fra MET og NVE hver time;
  - SnowScore (0–100) med forklaringsside og kalkulator;
  - norgeskart og tilgjengelig listevisning;
  - stedsside med beste skivindu;
  - filter med hurtigvalg og delbar adresse;
  - søk på stedsnavn.
- **Ikke i v1:** brukerkontoer, snøvarsel, tilbakemeldingsskjema, PWA og database (PRD §6.3).
  Faglærer rådet oss til å holde v1 enkel. Kravene står fortsatt i PRD-en, merket «Ikke i v1».
- *[Fylles inn: kort om hvordan omfanget endret seg, med lenker til endringsforslagene i
  `project-workspace/planning-artifacts/sprint-change-proposal-*.md`.]*

## 3. Resultat mot suksessmålene (PRD §9)

### 3.1 Verifisert automatisk i CI (A)

| Mål | Krav | Hvor det testes | Resultat |
|---|---|---|---|
| SM-9 Kjerneflyt | E2E: Utforsk → filter → stedsside | `tests/e2e/` (demomodus) | *[Bekreft fra siste CI-kjøring]* |
| SM-10 Fasit | Fasittabeller for SnowScore, skivindu og filter | `tests/golden/` (`snowscore.json`, `skivindu.json`, `filter.json`, `sok.json`) | *[Bekreft]* |
| SM-15 Dataalder | «Utdatert» fra 3 t, fjernet etter 12 t | `src/hooks/useSteder.test.ts`, `src/lib/format.test.ts`, `tests/e2e/gamle-data.spec.ts` | *[Bekreft]* |
| SM-11 Datakvalitet | Kvalitetsrapport i hver kjøring, kjørings-ID og kildetidspunkt | `scripts/pipeline/*.test.ts` | *[Bekreft]* |
| SM-5 Robusthet | Siste gyldige data når en kilde er nede | `scripts/pipeline/run.test.ts`, `tests/e2e/gamle-data.spec.ts` | *[Bekreft]* |
| SM-6 Korrekthet | Egenskapstester med minst 1000 tilfeldige inndata | `shared/snowscore.test.ts` (`numRuns: 1000`) | *[Bekreft]* |
| SM-7 Tilgjengelighet | Null kritiske WCAG 2.1 AA-brudd (axe) | `@axe-core/playwright` i `tests/e2e/` (filter, forklaring, liste, sted m.fl.) | *[Bekreft]* |
| SM-8 Sporbarhet | All endring via PR, story-PR godkjent av et annet medlem | git-historikken | Se merknad under |

**Merknad til SM-8:** 92 PR-er er merget per 2026-11-15. Siden 2026-09-27 har alle endringene
fra gruppa gått via PR. Unntakene er:
- planleggingsstegene 3–7, som ble committet direkte 2026-09-27, før regelen var innført;
- faglærers egne commits (tilbakemeldinger, sesjonslogg-skillen og `technology.md`).

PR #33–#38 og #58 ble merget uten grønn E2E eller godkjenning. Det ble rettet etterpå (PR #39 og
#61). *[Fylles inn: hvordan regelen om godkjenning ble innført 2026-10-25, og hvordan flaggede
GitHub-kontoer gjorde noen godkjenninger usynlige.]*

**Mot-metrikk SM-C2:** *[Fylles inn: ingen Må ha-tester ble fjernet eller svekket for å få grønn
CI. Avvik nevnes her.]*

### 3.2 Målt manuelt eller under demo (B)

| Mål | Krav | Metode | Dato | Resultat |
|---|---|---|---|---|
| SM-1 Ytelse | 95 % av filterendringene under 500 ms | Event Timing i Chromium, 114 endringer (slidere, hurtigvalg, søk) på nettsiden med 300 steder ([målinger](målinger/README.md)) | 2026-11-15 | **Ikke oppfylt på mobilprofilen** (4G, CPU 4×): 61 % under 500 ms, p95 1320 ms. Med rask CPU: 100 %, p95 112 ms. *[Bekreft på ekte telefon]* |
| SM-12 Kartlasting | Interaktivt innen 3 s på mobil over 4G | Playwright med 4G-struping, tom hurtigbuffer, fem kjøringer ([målinger](målinger/README.md)) | 2026-11-15 | **Ikke oppfylt på mobilprofilen**: median 9,0 s. Med 4G og rask CPU: median 2,7 s, 4 av 5 under 3 s. *[Bekreft på ekte telefon]* |
| SM-13 Ferskhet | Under 3 t, i normal drift rundt 1 t | Actions-historikken for `data.yml` | 2026-11-08 til 2026-11-15 | 232 grønne kjøringer, ingen røde. Lengste opphold 136 min (2026-11-11), siste døgn 58 min. Nettsiden viste 300 steder med 18 min gamle data 2026-11-15. *[Oppdater med typisk alder og andel av tiden over 3 t fram til levering]* |
| SM-14 Kjørbarhet | Rent klon etter README på under 10 min, uten hjelp | Generalprøven 2026-11-24 | | *[Fylles inn]* |

## 4. Brukertest (C)

Planen står i [EXPERIENCE.md](../2-Planleggingsfasen/SnowFinder-EXPERIENCE.md#brukertestplan-steg-8c-2026-10-28),
og materiellet og rådataene i [`3-Gjennomføringsfasen/brukertest/`](../3-Gjennomføringsfasen/brukertest/).

| Mål | Krav | Resultat |
|---|---|---|
| SM-2 Nytte | Minst 4 av 5 finner et sted på under 2 min uten hjelp | |
| SM-3 Forklarbarhet (Må ha) | Minst 4 av 5 (minimal test: minst 2 av 3) | |
| SM-4 Dataforståelse | Minst 4 av 5 skiller prognose fra faktiske forhold og oppdager utdaterte data | |
| SM-16 Brukbarhet | SUS minst 68, og minst 80 % av oppgavene fullført uten hjelp | |

*[Fylles inn fra `resultater.md`: antall deltakere, de viktigste funnene, hva som ble rettet før
kodefrysen 21.11, og hva som er videre arbeid.]*

## 5. Avvik fra planen

| Hva | Plan | Faktisk | Hvorfor |
|---|---|---|---|
| Kodefrys (M5) | 2026-11-11 | 2026-11-21 (forslag) | Story 1.8b og 3.9 ventet på godkjenning, og PRD-en ble revidert etter faglærers tilbakemelding 2026-11-12 |
| Timesjobb i drift (M1) | 2026-11-11 | 2026-11-15 | GitHub startet bare noen av de planlagte kjøringene. Løst med 1.11f og 1.11g (timer) |
| Brukertest (F4) | 2026-11-12 til 2026-11-16 | 2026-11-17 til 2026-11-19 (forslag) | Følge av kodefrysen |
| Publisering | GitHub Pages | Vercel | Pages ble slått av i emnet 2026-11-01 |
| NFR-3 ferskhet | 90 min | Under 3 t, mål rundt 1 t | Bevisst svekket 2026-11-14 etter målinger av hvor ofte GitHub faktisk starter planlagte jobber |

*[Fylles inn: andre avvik, for eksempel søk lagt til som Må ha (2026-11-04), UX-forbedringen i
fem steg (2026-11-02), og om fargeforklaringen på kartet ble bygget.]*

## 6. Prosess

- **Metode:** BMad Method med KI-agenter for analyse, krav, arkitektur, UX og utvikling, og
  GitHub Flow med én grein og én PR per oppgave. Se [fremdriftsplanen](../3-Gjennomføringsfasen/fremdriftsplan.md).
- **Tidslinje:** se [milepælene](../2-Planleggingsfasen/milepæler.md) og
  [aktivitetsdiagrammet](../3-Gjennomføringsfasen/aktivitetsdiagram.md).
- **Kvalitetssikring:** lint, typesjekk, enhetstester og bygg i CI og pre-push-hook, E2E i
  Chromium, Firefox og WebKit, og kodegjennomgang i to lag (KI, så et gruppemedlem).
- *[Fylles inn: samarbeid og rollefordeling, møter (lenke til referatene) og retrospektiven for
  Epic 2 med tiltakene.]*

## 7. Bruk av KI

- Alle vesentlige KI-økter er logget i [`ai-log/logg.md`](../../ai-log/logg.md), med promptene
  ordrett i [`ai-log/prompter/`](../../ai-log/prompter/).
- *[Fylles inn: hva KI var god til, hvor den tok feil og hvordan vi oppdaget det (eksempler fra
  kolonnen «Forslag endret/avvist»), og hvordan vi sikret at vi forstår koden.]*

## 8. Refleksjon og læring

*[Fylles inn: hva fungerte, hva ville vi gjort annerledes, og hva hver av oss lærte.]*

## 9. Videre arbeid

- Funksjonene som er «Ikke i v1»: snøvarsel, tilbakemelding, PWA og brukerkontoer (PRD §6.3).
- Fargeforklaring på kartet (UX-steg 4, designet i PR #95), hvis den ikke er bygget før kodefrysen.
- Ytelse på mobil (SM-1 og SM-12), hvis den ikke rettes før kodefrysen: hente data og Leaflet
  parallelt, og tegne markørene med canvas i stedet for å lage 300 SVG-markører ved hver endring
  (se [målingene](målinger/README.md)).
- Mørketid: beste skivindu i perioder uten dagslys (avviket fra FR-30 i Story 4.2).
- Valg av dag i filteret og skalering ut over 300 steder (til beslutning i PRD §7).
- Funnene fra brukertesten som ikke ble rettet. *[Fylles inn]*
- Utsatte funn fra kodegjennomgangene i [`deferred-work.md`](../../project-workspace/implementation-artifacts/deferred-work.md).

## 10. Vedlegg

- [Produktbrief](../1-Oppstartsfasen/SnowFinder-Produktbrief.md) ·
  [PRD](../2-Planleggingsfasen/SnowFinder-PRD.md) ·
  [Arkitektur](../2-Planleggingsfasen/SnowFinder-Arkitektur.md) ·
  [DESIGN.md](../2-Planleggingsfasen/SnowFinder-DESIGN.md) ·
  [EXPERIENCE.md](../2-Planleggingsfasen/SnowFinder-EXPERIENCE.md) ·
  [Epics og stories](../2-Planleggingsfasen/SnowFinder-Epics-og-Stories.md)
- Kjøre appen: se `README.md` i rotmappen (`npm ci && npm run dev:demo`).
