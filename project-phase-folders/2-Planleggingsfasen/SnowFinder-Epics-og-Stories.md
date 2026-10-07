---
stepsCompleted: [1, "1-confirmed", 2, "2-approved", 3, "3-elicited-critique-and-refine"]
revisions:
  - "v3 (2026-10-07): oppdatert etter forenklingen uten Supabase (fremdriftsplan steg 8d)"
inputDocuments:
  - project-phase-folders/2-Planleggingsfasen/SnowFinder-PRD.md
  - project-phase-folders/2-Planleggingsfasen/SnowFinder-Arkitektur.md
  - project-phase-folders/2-Planleggingsfasen/SnowFinder-DESIGN.md
  - project-phase-folders/2-Planleggingsfasen/SnowFinder-EXPERIENCE.md
---

# SnowFinder - Epic Breakdown

## Overview

Dette dokumentet bryter ned kravene fra PRD-en, UX-spinene og arkitekturen til byggbare
stories, i rekkefølgen produktbriefen og PRD-en selv legger opp til: Må ha først (i
utviklingsrekkefølgen stedskatalog/pipeline → SnowScore → kart/stedssider → filter), deretter
Bør ha.

**v3 (2026-10-07):** Oppdatert etter de to endringsrundene 7. oktober
([runde 1](../../project-workspace/planning-artifacts/sprint-change-proposal-2026-10-07.md),
[runde 2](../../project-workspace/planning-artifacts/sprint-change-proposal-2026-10-07-forenkling.md)).
Det finnes ingen database og ingen Supabase. Dataprogrammet er et Node-script som publiserer én
JSON-datafil, og appen er statiske filer som bare leser den (arkitektur v4, PRD v3).
- Snøvarsel, PWA og tilbakemelding er «Ikke i v1». ID-ene beholdes, slik at sensor kan følge
  hvordan planen utviklet seg.
- Hver story har Må ha eller Bør ha i overskriften.
- Nye stories: 1.10 (demodata) og 1.11 (planlagt jobb og publisering).

## Kravinventar

### Funksjonelle krav

FR-1: Stedskatalog-bygging (offline skript, produserer `data/catalog.json`) — Må ha
FR-2: Timesbasert henting fra MET og NVE (Node-script, planlagt jobb i GitHub Actions) — Må ha
FR-3: Skjemavalidering av rådata, avvisning registreres i kvalitetsrapporten — Må ha
FR-4: SnowScore-beregning, "ufullstendige data" ved >10% manglende timer — Må ha (skivindu-delen Bør ha)
FR-5: Atomisk publisering av datafilen med 95%-kvalitetsterskel — Må ha
FR-6a: Siste gyldige data ved datakilde-nedetid — Må ha
FR-6b: Nye forsøk med økende ventetid (kretsbryteren er fjernet) — Bør ha
FR-7: Delt SnowScore-modul (shared/snowscore.ts, egenskapstester; én modul, ingen parity-test) — Må ha
FR-8: Forklaringsside — kort fortalt og steg for steg — Må ha
FR-9: Regneeksempel (6-timers tabell) — Må ha
FR-10: «Prøv selv»-kalkulator — Bør ha
FR-11: Datakilder og begrensninger-seksjon — Må ha
FR-12: Interaktivt Norgeskart — Må ha
FR-13: Tilgjengelig listevisning (fullverdig alternativ) — Må ha
FR-14: Antall-treff live + null-treff-veiledning — Må ha
FR-15: Hurtigvalg (Pudderdag, Sol etter snøfall) — Bør ha
FR-16: Stedsside med full poengsum og rådata — Må ha
FR-17: Beste skivindu (m/ mørketid-fallback) — Bør ha
FR-18: Snøvarsel — registrering — Ikke i v1 (v3)
FR-19: Snøvarsel — utsendelse og avmelding — Ikke i v1 (v3)
FR-20: Flerkriteriefilter — nysnø, vind, temperatur (i nettleseren, shared/filter.ts) — Må ha
FR-21: Filterverdier i URL (delbar lenke) — Må ha
FR-22: Solfilter — Bør ha
FR-23: Avstandsfilter (posisjon kun i nettleser) — Bør ha
FR-24: Stedstypefilter — Bør ha
FR-25: Nysnø siste 24 t (NVE-basert) — Bør ha
FR-26: Null-treff-veiledning — kryssreferanse til FR-14, ingen egen implementasjon
FR-27: Tilbakemeldingsskjema — Ikke i v1 (v3)
FR-28: Serversidevalidert, misbruksbeskyttet innsending — Ikke i v1 (v3)
FR-29: Automatisk sletting av tilbakemelding — Ikke i v1 (v3)
FR-30: Lokal demomodus med ferdige data (`npm ci && npm run dev` uten nøkler) — Må ha
FR-31: Vurdering av SnowScore mot målte forhold — Ikke i v1 (v3)

### Ikke-funksjonelle krav

NFR-1: 95% av filtersøk < 2 sekunder (filtrering i nettleseren over ~300 steder)
NFR-2: Norgeskartet interaktivt < 3 sekunder på mobil
NFR-3: Datafriskhet — normalt < 90 min; "utdatert" 3–12 t; fjernet fra visning > 12 t
NFR-4: Tjenesten fungerer med siste gyldige data ved datakilde-nedetid
NFR-DQ1: Datakontrakt — MET/NVE-svar valideres mot Zod-skjemaer, dokumentert som dataordbok
NFR-DQ2: Kvalitetsrapport per kjøring (i datafilen, eller i jobbloggen/artifact ved feilet kjøring)
NFR-DQ3: Sporbarhet — hver publisert verdi har kjørings-ID og kildens tidsstempel
NFR-5 (v3): Ingen skrivbare endepunkter og ingen hemmeligheter; appen leser bare datafilen
NFR-6 (v3): Feilede kjøringer og avviste svar står i kvalitetsrapporten og som rød kjøring i Actions-fanen; ingen egen varslingskanal
NFR-Privacy (v3): Ingen konto, ingen skjema, ingen lagrede brukeropplysninger; posisjon kun i nettleser
NFR-7: WCAG 2.1 AA på alt unntatt selve kartlaget; tilgjengelig listevisning er fullt AA-alternativ
NFR-8: Skalerbarhet — katalog 300→1500 steder, "noen tusen" samtidige brukere (statiske filer)

### Tilleggskrav (fra arkitektur)

- **Ingen starter-template valgt.** Greenfield npm-pakke i repo-rot (React 19.3.0 + TS 6.0.x +
  Vite 8.3.0), satt opp manuelt (Story 1.1, ferdig).
- **Ingen database (v4).** Appen er statiske filer som bare leser den publiserte datafilen
  (AD-1). Ingen Supabase, Edge Functions, RLS eller migreringer. Story 1.1 lagde tomme
  `supabase/`- og `src/lib/supabase/`-mapper; Story 1.10 fjerner dem.
- **Dataprogram (AD-2):** `scripts/pipeline/` med `run.ts` (eneste inngang, lager kjørings-ID,
  skriver kjøringsrapporten i `finally`), `fetch.ts`, `validate.ts`, `score.ts` og
  `publish.ts`. Stegene er idempotente og sender data videre bare via den typede `RunContext`
  (`shared/contracts/run.ts`). `score.ts` skriver et eksplisitt `skivinduUtenDagslys`-flagg
  ved mørketid-fallback (når FR-17 bygges). Kjøres med `tsx`.
- **Datafiler (AD-10):** `npm run data` skriver `public/data/latest.json` (ikke committet), og
  `npm run data:demo` skriver `public/data/demo.json` (committet) fra
  `tests/contract/fixtures/`. `src/lib/data/` laster `latest.json` og faller tilbake til
  `demo.json`. `src/lib/clock.ts` er eneste kilde til «nå»; alder vurderes av
  `shared/freshness.ts`.
- **Kontrakter (AD-12):** `PublishedData`, `Sted`, `RunReport` og `Catalog` er Zod-skjemaer i
  `shared/contracts/`, med camelCase-felt.
- Test-plassering: Vitest/fast-check colocated (`*.test.ts`, også i `scripts/` og `shared/`),
  Playwright E2E i `tests/e2e/`, kontraktstester mot opptatte MET/NVE-svar i `tests/contract/`,
  fasittabeller som JSON i `tests/golden/` (AD-4).
- Stedskatalog-bygging er et offline-skript (`scripts/build-catalog/`) som bare produserer
  `data/catalog.json`; dataprogrammet leser katalogen og endrer den aldri (AD-5).
- Delt domenelogikk i `shared/` (`snowscore.ts`, `filter.ts`, `freshness.ts`, `contracts/`),
  brukt av både appen og dataprogrammet; `zod` er eneste tredjepartsimport der (AD-6).
- Utforsk (kart+liste) er ÉN rute med ETT datalag (`useSteder`-hook); presentasjon veksler på
  `visning=kart|liste` i URL (AD-8).
- DESIGN.md-tokens har ett kildested: `src/lib/theme.ts` + `src/styles/tokens.css`, holdt i
  sync av `theme.test.ts` (AD-9).
- CI: `ci.yml` (lint/typecheck/unit/property/kontraktstester på hver PR), `e2e.yml`
  (Playwright-røyktest i demomodus) og `data.yml` (planlagt kjøring hver time + GitHub
  Pages-deploy). Til GitHub Actions er slått på, kjører en lokal pre-push-hook sjekkene.
- Hosting: GitHub Pages `[ASSUMPTION — en administrator må slå på Actions og Pages]`.

### UX-designkrav

UX-DR1: Design-tokens implementert som `src/lib/theme.ts` (TS-konstanter, kildesannhet) +
`src/styles/tokens.css` (CSS custom properties), med `theme.test.ts` som feiler CI ved avvik.
UX-DR2: Egen 4-trinns SnowScore-fargeskala (`snowscore-0`..`snowscore-3`, grå→sterkt blått)
adskilt fra UI-aksentfargen, brukt kun på kartmarkør, score-badge og listerad.
UX-DR3: Score-badge-komponent viser alltid tall + tekstetikett, aldri kun farge.
UX-DR4: Filterpanel med slidere (`role="slider"`, `aria-valuenow`) og levende treff-antall via
`aria-live="polite"`.
UX-DR5: Kartmarkør-komponent: sirkel, hvit kant, tykkere aksent-kant for valgt sted, tooltip på
hover (desktop).
UX-DR6: Listerad-komponent: tastaturnavigerbar (Tab/Enter), sorterbar (score/avstand/navn) via
ordinær kontroll, ikke dra-og-slipp.
UX-DR7: Beste skivindu-kort med mørketid-fallback-tekst («Mørketid – vindu vist uten dagslys»).
UX-DR8: *(Ikke i v1, v3)* Snøvarsel-skjema inline på stedssiden.
UX-DR9: *(Ikke i v1, v3)* Tilbakemeldingsskjema.
UX-DR10: Global `banner-stale-data`-komponent (warning-bakgrunn) når siste data er eldre enn
normalt.
UX-DR11: Tilstander: skjelett-lasting (`surface-sunken`), null-treff med forslag, "ufullstendige
data"-tekst i stedet for score-badge.
UX-DR12: Responsiv layout: filterpanel som bunn-ark (<768px) vs. fast venstre sidepanel
(≥768px), ett brytpunkt.
UX-DR13: Tilgjengelighetsgulv: kontrast ≥4.5:1/≥3:1, synlig fokusring i aksentfarge, trykkmål
≥44px, `prefers-reduced-motion` respektert.
UX-DR14: IA: Utforsk (kart/liste), Stedsside, Forklaringsside — fast toppnavigasjon (ikke
bunn-faner). *(v3: «Tilbakemelding» er ute av v1.)*
UX-DR15: *(Ikke i v1, v3)* PWA install-prompt.
UX-DR16 (v3): Demobanner «Demodata – ikke ekte prognoser» når datafilen har `mode: "demo"`.

### FR-dekningskart

FR-1 til FR-7, FR-12, FR-13, FR-16, FR-30: Epic 1
FR-8 til FR-11: Epic 2
FR-14, FR-15, FR-20 til FR-26: Epic 3
FR-17: Epic 4
FR-18, FR-19, FR-27 til FR-29, FR-31: Ikke i v1 (v3). Story 4.1, 4.3, 4.4 og Epic 5 er merket deretter.

`[RETTET under story-generering: FR-14 (levende treff-antall/null-treff-veiledning) og
FR-26 (kryssreferanse til FR-14) flyttet fra Epic 1 til Epic 3 — de forutsetter et aktivt
filter, som først finnes i Epic 3. Epic 1 (kart/liste uten filter) trengte dem ikke.]`

**NFR-8 (skalerbarhet) har bevisst ingen egen story.** Den er delvis indirekte styrket av
Story 1.7 og 3.1 sine ytelses-AC-er (statiske filer, filtrering i nettleseren), men reell lasttesting mot
«noen tusen» samtidige brukere er ikke en story i noen epic — dette er allerede flagget som åpent
spørsmål i PRD §10 og gjentas her for å unngå at det stille forsvinner mellom dokumentene.

## Epic-liste

### Epic 1: Se snøforholdene i Norge — på kart eller i liste
Brukeren kan åpne SnowFinder og se ekte, ferske SnowScore-data for norske steder, enten som et
fargelagt kart eller som en likeverdig, tilgjengelig liste, og åpne et sted for full detalj.
Dette er den ugjennomskjærbare kjernen — uten denne fungerer ingen andre epics.
**FRs dekket:** FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-12, FR-13, FR-16, FR-30. **Konsoliderer**
stedskatalog, pipeline, SnowScore-modul, kart OG listevisning i én epic fordi de deler samme
kodefiler (`Utforsk.tsx`, `useSteder`-hooken, AD-8) og samme datalag — å splitte dem ville gitt
to epics som begge endrer de samme filene uten reell risikogrense mellom dem.

### Epic 2: Forstå og stole på SnowScore
Brukeren kan lese en forklaringsside som viser nøyaktig hvordan SnowScore beregnes, med et
utledet regneeksempel og (som utvidelse) en live kalkulator — uavhengig av om de kom fra kartet
eller listen.
**FRs dekket:** FR-8, FR-9, FR-10, FR-11.

### Epic 3: Finn steder som oppfyller mine krav
Brukeren kan sette presise krav (nysnø, vind, temperatur — og som utvidelse sol, avstand,
stedstype, nysnø siste 24t) og få akkurat de stedene som oppfyller dem, med hjelp til å justere
kravet ved null treff.
**FRs dekket:** FR-14, FR-15, FR-20, FR-21, FR-22, FR-23, FR-24, FR-25, FR-26 (kryssreferanse).

### Epic 4: Få mer ut av et sted jeg følger med på
Brukeren kan se når det beste tidsvinduet for en skitur er (med mørketid-håndtering).
**FRs dekket:** FR-17. *(v3: Snøvarsel (FR-18/19) og PWA er Ikke i v1, så epicen har bare
skivinduet igjen, som en utvidelse av stedssiden `Sted.tsx` fra Epic 1.)*

### Epic 5: Gi tilbakemelding uten konto *(Ikke i v1, v3)*
Tatt ut av v1 i forenklingen. Den krevde Supabase, Turnstile og lagring av fritekst. ID-ene
beholdes.
**FRs:** FR-27, FR-28, FR-29 (alle Ikke i v1).

**Rekkefølge og avhengighet:** Epic 1 → 2/3/4/5 kan i prinsippet bygges i hvilken som helst
rekkefølge etter Epic 1 (ingen av dem krever hverandre), men følger brief/PRD-ens MoSCoW: Epic
1 er 100 % Må ha og bygges først; Epic 2 er nesten helt Må ha (kun kalkulatoren er Bør ha) og
bygges som nummer to siden forklaringssiden er lenket fra hver SnowScore-visning i Epic 1; Epic
3 sin kjerne (nysnø/vind/temp-filter) er Må ha og bygges som nummer tre; Epic 4 (skivindu) er
Bør ha og bygges sist. Epic 5 er Ikke i v1.

**Ikke-funksjonelle og tverrgående krav** (NFR-1 til NFR-8, NFR-DQ1–3, NFR-Privacy, samt UX-DR1/2/3 om
design-tokens og SnowScore-fargeskala) er ikke egne epics — de er akseptansekriterier som gjelder
på tvers av stories i alle epics (særlig Epic 1, der ytelse, robusthet og tilgjengelighet først
blir konkrete).

---

## Epic 1: Se snøforholdene i Norge — på kart eller i liste

Brukeren kan åpne SnowFinder og se ekte, ferske SnowScore-data for norske steder, på kart eller
i tilgjengelig liste, og åpne et sted for full detalj.

### Story 1.1: Prosjekt-skaffolding og CI-skjelett *(Må ha, ferdig: PR #10)*

`[v3: Bygget før forenklingen. Mappene `supabase/` og `src/lib/supabase/` fjernes i Story 1.10.]`

As en utvikler,
I want et tomt, byggbart prosjektskjelett som følger arkitekturens mappestruktur,
So that hver senere story har et stabilt sted å legge kode uten å måtte finne opp strukturen på nytt.

**Acceptance Criteria:**

**Given** et tomt repo-rot (kun `project-phase-folders/`, `project-workspace/`, `ai-log/`)
**When** skaffoldingen er kjørt
**Then** finnes `src/`, `shared/`, `supabase/`, `scripts/`, `tests/` med mappene arkitekturen
lister (inkl. `src/pages/`, `src/components/`, `src/hooks/`, `src/lib/`, `src/styles/`)
**And** `npm run build`, `npm run lint` og `npm run typecheck` kjører grønt på et tomt Vite +
React 19.3.0 + TypeScript 6.0.x-prosjekt
**And** `.github/workflows/ci.yml` finnes og kjører lint+typecheck (ingen tester ennå — de
kommer med første story som faktisk har noe å teste)
**And** `src/lib/theme.ts` (TS-konstanter) og `src/styles/tokens.css` finnes med DESIGN.md sine
tokens speilet inn, og en `theme.test.ts` som sammenligner de to og feiler CI ved avvik (AD-9) —
uten dette har ingen senere komponent-story et sted å hente farger/typografi/spacing fra
**And** ingen forretningslogikk, ingen databasetabeller og ingen Supabase-tilkobling opprettes i
denne storyen (jf. "opprett kun det en story faktisk trenger")

### Story 1.2: Bygg stedskatalogen *(Må ha)*

As en gruppemedlem som skal fylle katalogen,
I want et frittstående skript som bygger en katalogfil med ~300 steder fra OpenStreetMap og Kartverket,
So that dataprogrammet har reelle steder å hente værdata for. Realiserer FR-1.

**Acceptance Criteria:**

**Given** skriptet `scripts/build-catalog/` kjøres manuelt (`npm run catalog`)
**When** det henter skisteder fra OpenStreetMap og slår opp fjelltopper og tettsteder fra en
manuelt kvalitetssikret navneliste i Kartverket
**Then** produseres `data/catalog.json` med ~300 steder (navn, koordinater med 4 desimaler,
høyde, stedstype skisted/fjelltopp/by), validert mot Zod-skjemaet `Catalog` i
`shared/contracts/` før fila skrives, og committet
**And** fila skrives atomisk; feiler en kilde eller finnes ikke et navn, står forrige fil urørt
**And** ingenting utenfor `scripts/build-catalog/` importerer skriptet, og dataprogrammet leser
katalogen uten å endre den (AD-5)

`[v3: Erstatter migreringen til `locations`. Bygget i PR #18.]`

### Story 1.3: Hent og valider værdata hver time *(Må ha)*

As systemet,
I want å hente MET- og NVE-data for alle steder i katalogen og validere hvert svar mot et strengt skjema,
So that bare tillitsverdige data går videre i dataprogrammet. Realiserer FR-2, FR-3, NFR-DQ1.

**Acceptance Criteria:**

**Given** stedskatalogen fra Story 1.2
**When** `npm run data` kjører
**Then** hentes hvert sted én gang med identifiserende User-Agent og begrenset samtidighet, uten
nøkler og uten tilstand mellom kjøringer (ingen `If-Modified-Since`/`Expires`)
**And** hvert svar valideres med Zod mot et strengt skjema i `shared/contracts/` før det legges i
`RunContext`
**And** et ugyldig svar avvises, registreres i kjøringens kvalitetsrapport (sted, kilde, årsak) og
rettes aldri automatisk
**And** en avbrutt kjøring publiserer ingenting og kjøres på nytt neste gang
**And** `fetch.ts` og `validate.ts` er egne, idempotente steg under `scripts/pipeline/`, kalt fra
`run.ts` (AD-2)
**And** skjemaene er dokumentert i `shared/contracts/data-dictionary.md` (felt, enhet, gyldig
område, kilde), og kontraktstester i `tests/contract/` kjører valideringen mot opptatte ekte svar

### Story 1.4: Bygg den delte SnowScore-modulen *(Må ha)*

As en bruker,
I want at SnowScore beregnes av én enkelt, delt formel — ikke to separate implementasjoner,
So that tallet aldri kan sprike mellom pipelinen og kalkulatoren senere. Realiserer FR-7.

**Acceptance Criteria:**

**Given** formelen fra den rettede briefen (A/B/C, med B sin morketid-uavhengige nevner=16 og
B/C=0 uten nedbør)
**When** `shared/snowscore.ts` implementeres som ren TypeScript uten React- eller
plattformspesifikke avhengigheter
**Then** kan modulen importeres uendret fra både Vite (`src/lib/snowscore.ts` re-eksporterer den)
og dataprogrammet i Node (`tsx`)
**And** egenskapsbaserte tester (minst 1000 tilfeldige inndata) bekrefter: poengsum alltid 0–100,
mer nysnø gir aldri lavere A, lavere snittemperatur gir aldri lavere B, ingen nedbør (P<0,5mm)
gir alltid B=0 og C=0, samme inndata gir alltid samme resultat
**And** en fasittabell i `tests/golden/snowscore.json` (med briefens eksempel, sum 58) kjøres som
test mot modulen (AD-12)
**And** det finnes ingen annen kopi av formelen, så en egen parity-test trengs ikke (AD-6, v3)
**And** denne storyen leverer kun modulen og dens tester — ingen pipeline-integrasjon ennå
(det er Story 1.5)

### Story 1.10: Kjør SnowFinder lokalt med demodata *(Må ha)*

As en sensor eller et nytt gruppemedlem,
I want å starte SnowFinder fra et rent klon med `npm ci && npm run dev`, uten nøkler og nettverk,
So that jeg kan prøve appen og kjøre testene kun etter README. Realiserer FR-30, AD-10.

**Acceptance Criteria:**

**Given** et rent klon og Node 24
**When** jeg følger README («Kom i gang»)
**Then** starter appen med det committede demodatasettet `public/data/demo.json` (ca. 20–30
steder), merket «Demodata – ikke ekte prognoser» (UX-DR16)
**And** `npm run data:demo` bygger `demo.json` med dataprogrammet fra `tests/contract/fixtures/`,
med egen liten demokatalog som fixtures dekker helt; fast referansetid, fast kjørings-ID og
varighet 0, og en test bekrefter at to kjøringer gir byte-lik fil
**And** demodatasettet har minst ett sted med «ufullstendige data» og ett utdatert (eldre enn 3 t
mot demo-nå)
**And** `src/lib/data/` laster `latest.json` og faller tilbake til `demo.json`, og
`src/lib/clock.ts` er eneste kilde til «nå» (lint forbyr `Date.now()` andre steder)
**And** de tomme mappene `supabase/` og `src/lib/supabase/` fra Story 1.1 er fjernet

`[v3: Ny story fra endringsrunde 1, plassert rett etter 1.4. Bygges sammen med den delen av
dataprogrammet den trenger (`run.ts`, `score.ts`, `publish.ts` mot fixtures). Story 1.3 og 1.5
kobler senere på de ekte kildene.]`

### Story 1.5: Beregn og publiser SnowScore i dataprogrammet *(Må ha)*

As en bruker,
I want at hvert sted i katalogen får en fersk, publisert SnowScore hver time,
So that jeg alltid ser et oppdatert, kvalitetssikret tall på kartet og stedssiden. Realiserer FR-4, FR-5, FR-6a, NFR-DQ2, NFR-DQ3.

**Acceptance Criteria:**

**Given** validerte data i `RunContext` fra Story 1.3 og modulen fra Story 1.4
**When** `score.ts` beregner SnowScore for hvert sted via `shared/snowscore.ts`
**Then** skriver `publish.ts` hele datafilen (`public/data/latest.json`) til et midlertidig navn og
bytter den inn atomisk, men bare hvis minst 95 % av stedene fikk gyldige data — ellers står
forrige fil urørt
**And** et sted med mer enn 10 % manglende timer får «ufullstendige data» i stedet for en
tallverdi, og teller som gyldig mot terskelen
**And** et sted som feilet i en kjøring som likevel publiseres, vises som «ufullstendige data»;
fila bærer aldri verdier fra en tidligere kjøring
**And** fila valideres mot `PublishedData` før den skrives, har `mode: "live"`, og hver
stedspost har kjørings-ID og kildens tidsstempel (NFR-DQ3)
**And** hver kjøring skriver én kvalitetsrapport (start, varighet, antall steder, andel gyldige,
avviste per kilde, antall ufullstendige, publisert eller ikke og hvorfor). For en publisert
kjøring ligger den i datafilen; ellers skrives den til loggen (NFR-DQ2)

### Story 1.11: Kjør dataprogrammet hver time og publiser appen *(Må ha)*

As en bruker,
I want at SnowFinder på nett oppdateres med ekte data hver time,
So that kartet viser ferske prognoser uten at noen kjører noe for hånd. Realiserer FR-2 (planlagt jobb), FR-5, NFR-6.

**Acceptance Criteria:**

**Given** dataprogrammet fra Story 1.5 og at en administrator har slått på GitHub Actions og
Pages
**When** `.github/workflows/data.yml` kjører hver time (og ved merge til `main`)
**Then** kjøres `npm run data`, appen bygges med den nye `latest.json`, og resultatet
publiseres til GitHub Pages
**And** jobben bruker en `concurrency`-gruppe uten avbrudd, så bare én kjøring går om gangen
**And** produksjonsbygget feiler hvis kjøringen ikke ga `latest.json`, slik at forrige
publisering blir stående og produksjon aldri viser demodata (AD-10)
**And** en kjøring som ikke publiserer, laster opp kvalitetsrapporten som artifact og vises som
rød i Actions-fanen (NFR-6)

`[v3: Ny story fra endringsrunde 2. Krever at Actions og Pages er slått på; til da kan
`npm run data` kjøres lokalt.]`

### Story 1.7: Se Norgeskartet med fargelagte steder *(Må ha)*

As en skientusiast,
I want å se et kart over Norge der hvert sted er fargelagt etter SnowScore,
So that jeg raskt kan se hvor snøpotensialet er best. Realiserer FR-12. Realiserer UJ-1 (steg 1).

**Acceptance Criteria:**

**Given** en datafil fra Story 1.5 eller demodata fra Story 1.10
**When** jeg åpner `/` (Utforsk, `visning=kart` som standard)
**Then** viser Leaflet-kartet alle steder som markører fargelagt etter SnowScore-trinn
(`snowscore-0`..`snowscore-3`, minst 4 trinn, jf. DESIGN.md UX-DR2)
**And** et trykk/klikk på en markør åpner stedssiden for det stedet
**And** `Utforsk`-siden og dens data hentes via én delt `useSteder()`-hook (AD-8), som leser
datafilen gjennom `src/lib/data/` — ingen annen komponent laster stedsdata selv
**And** siden virker i demomodus, og en E2E-røyktest i demomodus dekker kart → stedsside
**And** kartet er interaktivt (kan panneres/zoomes) innen 3 sekunder på en representativ
mobiltelefon over 4G (NFR-2)

### Story 1.8: Bruk tilgjengelig listevisning i stedet for kart *(Må ha)*

As en bruker med skjermleser og tastatur,
I want en fullverdig listevisning av samme steder som kartet,
So that jeg kan utforske katalogen uten mus, touch eller fargesyn. Realiserer FR-13, NFR-7. Realiserer UJ-3.

**Acceptance Criteria:**

**Given** jeg navigerer med tastatur fra toppnavigasjonen
**When** jeg velger «Vis som liste» (`visning=liste`)
**Then** vises samme steder som kartet, hentet fra samme `useSteder()`-hook (AD-8), som en
tastaturnavigerbar liste (Tab/Enter)
**And** hver rad viser SnowScore som tall **og** tekstetikett (aldri kun farge)
**And** listen er sorterbar på score, avstand og navn via ordinære kontroller (ikke
dra-og-slipp)
**And** en automatisert tilgjengelighetstest (axe/Playwright) i CI rapporterer null kritiske
WCAG 2.1 AA-brudd på denne siden
**And** listen virker i demomodus (Story 1.10)

### Story 1.9: Åpne en stedsside med full poengsum *(Må ha)*

As en skientusiast,
I want å se full poengsum med delpoeng og rådata for ett sted,
So that jeg forstår nøyaktig hvorfor stedet scorer som det gjør. Realiserer FR-16. Realiserer UJ-1 (klimaks).

**Acceptance Criteria:**

**Given** jeg trykker på et sted fra kart eller liste (Story 1.7/1.8)
**When** stedssiden (`/sted/:id`) åpnes
**Then** vises SnowScore med delpoeng (A/B/C), temperatur, nysnø, vind, skydekke, høyde og
datakildens tidsstempel
**And** URL-en er stabil og delbar uten noen sesjon eller innlogging
**And** data eldre enn 3 timer merkes «utdatert»; steder med data eldre enn 12 timer fjernes fra
kart, liste og denne siden (NFR-3). Alderen regnes mot `src/lib/clock.ts` og vurderes av
`shared/freshness.ts`, så grensene testes deterministisk mot demo-nå
**And** et sted med «ufullstendige data» (Story 1.5) vises som tekst, aldri som et tallbadge
**And** en automatisert tilgjengelighetstest (axe/Playwright) i CI rapporterer null kritiske
WCAG 2.1 AA-brudd på denne siden (NFR-7)
**And** siden virker i demomodus (Story 1.10)

### Story 1.6: Hold tjenesten oppe når en datakilde er nede *(Bør ha)*

As en bruker,
I want at SnowFinder fortsetter å vise data selv om MET eller NVE er nede, og at jeg ser når dataene er gamle,
So that jeg alltid får et svar og vet hvor ferskt det er. Realiserer FR-6b.

**Acceptance Criteria:**

**Given** at MET eller NVE simuleres utilgjengelig i test
**When** dataprogrammet kjører
**Then** prøves et feilende kall på nytt et fast antall ganger med økende ventetid
**And** appen fortsetter å vise siste gyldige datafil — aldri en tom eller delvis (følger av 1.5)
**And** frontend viser `banner-stale-data`-komponenten (DESIGN.md/UX-DR10) øverst på Utforsk-
og stedssiden når siste data er eldre enn normalt — uten at resten av siden blokkeres

`[v3: Kretsbryteren, `api_incidents` og den aktive varslingen er fjernet (ingen tilstand mellom
kjøringer). «Siste gyldige data» (FR-6a, Må ha) dekkes av Story 1.5, og «utdatert» av 1.9.
Storyen er derfor Bør ha.]`

`[RETTET under sprintplanlegging 2026-09-27: Story 1.6 flyttet etter 1.9. Den krever
`banner-stale-data` på Utforsk- og stedssiden, som først finnes etter 1.7 og 1.9 — en
forover-avhengighet. Nummeret er beholdt så kryssreferanser ikke brytes.]`

---

## Epic 2: Forstå og stole på SnowScore

Brukeren kan lese en forklaringsside som viser nøyaktig hvordan SnowScore beregnes.

### Story 2.1: Les kort fortalt og steg for steg *(Må ha)*

As en bruker,
I want en side som forklarer hva SnowScore måler og hvordan den beregnes,
So that jeg forstår tallet jeg ser overalt i løsningen. Realiserer FR-8.

**Acceptance Criteria:**

**Given** jeg trykker på et SnowScore-badge eller lenken i toppnavigasjonen
**When** forklaringssiden åpnes
**Then** viser den «kort fortalt» (hva SnowScore måler / ikke måler) og «steg for steg» med
formelen og én illustrasjon per delpoeng (A/B/C)
**And** siden har en endringslogg-seksjon som viser versjonsnummer og begrunnelse for
formelendringer (starter med Marys B-nevner-endring 6→16, se briefens memlogg)
**And** siden er lenket fra hver SnowScore-visning i løsningen (kart-tooltip, listerad,
stedsside)
**And** en automatisert tilgjengelighetstest (axe/Playwright) i CI rapporterer null kritiske
WCAG 2.1 AA-brudd på denne siden (NFR-7)

### Story 2.2: Se det utledede regneeksempelet *(Må ha)*

As en bruker,
I want et komplett regneeksempel fra rådata til ferdig poengsum,
So that jeg kan etterprøve formelen selv, ikke bare lese den. Realiserer FR-9.

**Acceptance Criteria:**

**Given** jeg er på forklaringssiden (Story 2.1)
**When** jeg leser regneeksempel-seksjonen
**Then** vises 6-timers tabellen med per-time nedbør og temperatur fra briefen, med S, P og T̄
eksplisitt utledet før A/B/C og sluttsummen vises
**And** tallene i eksempelet stemmer med `shared/snowscore.ts` sin faktiske output for samme
inndata (verifisert med en test som kjører eksempelets inndata gjennom modulen)

### Story 2.3: Les om datakilder og begrensninger *(Må ha)*

As en bruker,
I want å forstå at SnowScore er en prognose, ikke en garanti,
So that jeg ikke forveksler modellerte forhold med målte, faktiske forhold. Realiserer FR-11.

**Acceptance Criteria:**

**Given** jeg er på forklaringssiden
**When** jeg leser «datakilder og begrensninger»
**Then** listes MET og NVE med lisens (CC BY 4.0 / NLOD)
**And** teksten sier eksplisitt at SnowFinder ikke er en skredfarevurdering, med lenke til
Varsom.no for fjellområder
**And** siden viser kvalitetsrapporten fra siste publiserte kjøring i klartekst (andel gyldige,
avviste svar per kilde, antall med ufullstendige data, tidspunkt) (NFR-DQ2)

### Story 2.4: Prøv SnowScore-kalkulatoren selv *(Bør ha)*

As en bruker,
I want å justere nedbør og temperatur og se poengsummen endre seg live,
So that jeg kan utforske formelen interaktivt. Bør ha. Realiserer FR-10.

**Acceptance Criteria:**

**Given** jeg er på forklaringssiden
**When** jeg endrer nedbør- eller temperaturverdien i kalkulatoren
**Then** oppdateres A/B/C og sluttsummen umiddelbart, uten sideoppdatering
**And** kalkulatoren importerer `shared/snowscore.ts` direkte — ingen egen kopi av formelen
finnes i kalkulator-komponenten (AD-6)

---

## Epic 3: Finn steder som oppfyller mine krav

Brukeren kan sette presise krav og få akkurat de stedene som oppfyller dem.

### Story 3.1: Filtrer på nysnø, vind og temperatur *(Må ha)*

As en skientusiast,
I want å sette minimumskrav til nysnø og grenser for vind og temperatur,
So that jeg bare ser steder som faktisk oppfyller kravene mine. Realiserer FR-20. Realiserer UJ-1 (steg 2).

**Acceptance Criteria:**

**Given** Utforsk-siden fra Epic 1 med publiserte data
**When** jeg setter minimum nysnø, maks vind og temperaturgrense i filterpanelet
**Then** viser kart og liste bare steder som oppfyller ALLE valgte kriterier (kombinert med OG)
**And** filtreringen skjer i nettleseren med den delte `shared/filter.ts`, og 95 % av
filtersøk svarer på under 2 sekunder (NFR-1)
**And** en fasittabell (`tests/golden/filter.json`, 5–8 steder, flere kombinasjoner) kjøres som
CI-blokkerende test mot `shared/filter.ts`
**And** nysnø-cm-anslaget bruker samme faste 1mm≈1cm-omregning som forklaringssiden
**And** filterpanelet vises som et bunn-ark under 768px bredde og som et fast venstre sidepanel
fra 768px og oppover (DESIGN.md/UX-DR12), verifisert med en Playwright-test i begge
viewport-bredder

### Story 3.2: Del og gjenåpne et filtrert søk *(Må ha)*

As en bruker,
I want at filterverdiene mine lagres i nettadressen,
So that jeg kan dele søket mitt med et enkelt lenke-trykk. Realiserer FR-21. Realiserer UJ-1 (steg 6).

**Acceptance Criteria:**

**Given** jeg har satt et filter (Story 3.1) i enten kart- eller listevisning
**When** jeg kopierer nettadressen og åpner den i en ny økt
**Then** gjenskapes nøyaktig samme filterverdier OG samme visningsmodus (`visning=kart|liste`)
**And** mangler `visning`-parameteren i en delt lenke, brukes `kart` som standard
**And** `shared/filter.ts` eier `FilterParams` og de eneste `parse`/`serialize`-funksjonene
mellom URL og filter (AD-12)

### Story 3.3: Få hjelp ved null treff og se antall treff live *(Må ha)*

As en bruker,
I want å se antall treff oppdateres mens jeg justerer filteret, og få et konkret forslag ved null treff,
So that jeg aldri står fast med en tom, uforklart liste. Realiserer FR-14, FR-26.

**Acceptance Criteria:**

**Given** jeg justerer en filterverdi (Story 3.1)
**When** antall treff endres
**Then** oppdateres et synlig treff-antall live, annonsert til skjermleser via
`aria-live="polite"` (UX-DR4)
**And** ved null treff identifiserer systemet hvilket enkeltkriterium som ville gitt flest nye
treff hvis lempet, og foreslår nettopp det (f.eks. «Ingen treff. Prøv vind under 8 m/s i
stedet»)
**And** forslaget ved null treff er dekket av fasittabellen fra Story 3.1

### Story 3.4: Bruk hurtigvalg for vanlige kombinasjoner *(Bør ha)*

As en bruker,
I want forhåndsdefinerte snarveier som «Pudderdag»,
So that jeg slipper å stille inn flere glidebrytere manuelt hver gang. Bør ha. Realiserer FR-15.

**Acceptance Criteria:**

**Given** Utforsk-siden med filterpanelet
**When** jeg trykker en hurtigvalg-chip
**Then** fylles filteret med chipens faste, dokumenterte kombinasjon av verdier i én handling,
og resultatet oppdateres umiddelbart

### Story 3.5: Filtrer på sol *(Bør ha)*

As en turgåer,
I want å sette maks skydekke i dagslystimer,
So that jeg finner steder med utsikt til sol, ikke bare snø. Bør ha. Realiserer FR-22.

**Acceptance Criteria:**

**Given** Utforsk-siden med grunnfilteret fra Story 3.1
**When** jeg setter maks skydekke
**Then** kombineres dette med de andre kriteriene (fortsatt OG)

### Story 3.6: Filtrer på avstand *(Bør ha)*

As en bruker,
I want å sette maks avstand fra min egen posisjon,
So that jeg finner steder som faktisk er i nærheten. Bør ha. Realiserer FR-23.

**Acceptance Criteria:**

**Given** Utforsk-siden med grunnfilteret fra Story 3.1
**When** jeg deler posisjon og setter en maks-avstand
**Then** kombineres dette med de andre kriteriene (fortsatt OG)
**And** posisjonen beregnes og brukes kun i nettleseren — et nettverkskall med posisjon i sendes
aldri noe sted (verifisert med nettverkstest, NFR-Privacy)

### Story 3.7: Filtrer på stedstype *(Bør ha)*

As en bruker,
I want å filtrere på stedstype (skisted, fjelltopp, by),
So that jeg kun ser stedstyper som er relevante for turen min. Bør ha. Realiserer FR-24.

**Acceptance Criteria:**

**Given** Utforsk-siden med grunnfilteret fra Story 3.1
**When** jeg velger én eller flere stedstyper
**Then** kombineres dette med de andre kriteriene (fortsatt OG)

### Story 3.8: Filtrer på nysnø siste 24 timer *(Bør ha)*

As en bruker,
I want å filtrere på NVE sitt modellerte nysnø for siste døgn, ikke bare MET-prognosen fremover,
So that jeg også kan finne steder som allerede har fått snø. Bør ha. Realiserer FR-25.

**Acceptance Criteria:**

**Given** Utforsk-siden med grunnfilteret
**When** jeg velger «siste 24 t» som datagrunnlag for nysnø-filteret
**Then** brukes NVE seNorge-verdien i stedet for MET-prognosen for det kriteriet, tydelig merket
i grensesnittet hvilken kilde som er i bruk

---

## Epic 4: Få mer ut av et sted jeg følger med på

Brukeren kan se beste skivindu på stedssiden. *(v3: Snøvarsel og PWA er Ikke i v1.)*

### Story 4.1: Gjør SnowFinder installerbar som PWA *(Ikke i v1, v3)*

Tatt ut i forenklingen. Den var en forutsetning for push-varsler på iPhone, og snøvarsel er ute
av v1. ID-en beholdes.

### Story 4.2: Se beste skivindu på stedssiden *(Bør ha)*

As en skientusiast,
I want å se de fire beste sammenhengende timene de neste 48 timene,
So that jeg vet nøyaktig når jeg bør dra. Realiserer FR-17.

**Acceptance Criteria:**

**Given** stedssiden (Story 1.9) med et 48-timers datavindu
**When** vinduet beregnes
**Then** velges de fire sammenhengende dagslystimene med lavest snittvind og minst skydekke,
kun blant timer etter at et eventuelt snøfall har stoppet
**And** har stedet ingen dagslystimer i hele vinduet (mørketid), skriver `score.ts`
`skivinduUtenDagslys: true` i datafilen (AD-2), og stedssiden viser «Mørketid – vindu vist
uten dagslys» i stedet for at funksjonen feiler eller returnerer tomt
**And** frontend leser dette flagget direkte — den re-utleder aldri mørketid-tilstanden selv
ved å telle dagslystimer klient-side
**And** en fasittabell (`tests/golden/skivindu.json`) med minst fire tilfeller — vanlig dag,
snøfall som slutter midt i vinduet, for få sammenhengende dagslystimer, mørketid — kjøres som
test mot samme funksjon som dataprogrammet bruker
**And** demodatasettet får ett sted i mørketid når denne storyen bygges (FR-30)

### Story 4.3: Registrer et snøvarsel uten konto *(Ikke i v1, v3)*

Tatt ut i forenklingen (FR-18). Den krevde en Edge Function og lagrede regler. ID-en beholdes.

### Story 4.4: Motta og meld deg av et snøvarsel *(Ikke i v1, v3)*

Tatt ut i forenklingen (FR-19). Den krevde Web Push og en push-leverandør. ID-en beholdes.

---

## Epic 5: Gi tilbakemelding uten konto *(Ikke i v1, v3)*

Tatt ut i forenklingen. Ingen story i denne epicen bygges i v1.

### Story 5.1: Send en tilbakemelding uten konto *(Ikke i v1, v3)*

Tatt ut (FR-27, FR-28). Den krevde Supabase, Cloudflare Turnstile og lagring av fritekst. ID-en
beholdes.

### Story 5.2: Automatisk sletting av gamle tilbakemeldinger *(Ikke i v1, v3)*

Tatt ut (FR-29). Uten lagrede tilbakemeldinger er det ingenting å slette. ID-en beholdes.
