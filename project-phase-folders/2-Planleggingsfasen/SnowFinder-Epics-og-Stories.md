---
stepsCompleted: [1, "1-confirmed", 2, "2-approved", 3, "3-elicited-critique-and-refine"]
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

## Kravinventar

### Funksjonelle krav

FR-1: Stedskatalog-bygging (offline skript, produserer migrasjon) — Må ha
FR-2: Timesbasert henting fra MET og NVE — Må ha
FR-3: Skjemavalidering av rådata — Må ha
FR-4: SnowScore- og skivindu-beregning, "ufullstendige data" ved >10% manglende timer — Må ha
FR-5: Atomisk publisering med 95%-kvalitetsterskel — Må ha
FR-6: Robusthet mot datakilde-nedetid (retry, kretsbryter) — Må ha
FR-7: Delt SnowScore-modul (shared/snowscore.ts, egenskapstester, parity-test) — Må ha
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
FR-18: Snøvarsel — registrering (inline, ingen konto) — Bør ha
FR-19: Snøvarsel — utsendelse og avmelding (maks 1/regel/døgn) — Bør ha
FR-20: Flerkriteriefilter — nysnø, vind, temperatur — Må ha
FR-21: Filterverdier i URL (delbar lenke) — Må ha
FR-22: Solfilter — Bør ha
FR-23: Avstandsfilter (posisjon kun i nettleser) — Bør ha
FR-24: Stedstypefilter — Bør ha
FR-25: Nysnø siste 24 t (NVE-basert) — Bør ha
FR-26: Null-treff-veiledning — kryssreferanse til FR-14, ingen egen implementasjon
FR-27: Tilbakemeldingsskjema (uten konto) — Bør ha
FR-28: Serversidevalidert, misbruksbeskyttet innsending (Turnstile, RLS) — Bør ha
FR-29: Automatisk sletting av tilbakemelding etter 12 mnd — Bør ha

### Ikke-funksjonelle krav

NFR-1: 95% av filtersøk < 2 sekunder
NFR-2: Norgeskartet interaktivt < 3 sekunder på mobil
NFR-3: Datafriskhet — normalt < 90 min; "utdatert" 3–12 t; fjernet fra visning > 12 t
NFR-4: Tjenesten fungerer med siste gyldige data ved datakilde-nedetid
NFR-5: Rate-limiting + Turnstile på skrivbare endepunkter, RLS på alle tabeller, kun anon-key-lesing fra klient
NFR-6: Pipeline-feil/avviste svar/kretsbrytere logges OG varsler gruppen aktivt (ikke bare logg)
NFR-Privacy: Ingen konto; posisjon kun i nettleser; faste slettefrister (avmelding, 24t, 12mnd, 7 døgn)
NFR-7: WCAG 2.1 AA på alt unntatt selve kartlaget; tilgjengelig listevisning er fullt AA-alternativ
NFR-8: Skalerbarhet — katalog 300→1500 steder, "noen tusen" samtidige brukere (åpent, ikke lastet testet)

### Tilleggskrav (fra arkitektur)

- **Ingen starter-template valgt.** Greenfield npm-pakke i repo-rot (React 19.3.0 + TS 6.0.x +
  Vite 8.3.0), satt opp manuelt — påvirker Epic 1 Story 1 (prosjekt-skaffolding er en egen,
  tidlig story siden ingenting er bygget ennå).
- To Supabase-miljøer (dev/prod); `supabase/migrations/*.sql` er eneste skjemaendringsvei (AD-3).
- Klient er read-only mot Supabase (anon key + RLS); all skriving går via Edge Functions; én
  skriver per tabell (AD-1: `alert_rules` kun av `follow/`, `feedback` kun av `feedback/`).
- Pipeline-stadier (`fetch`, `validate`, `score`, `stage`, `publish`, `alert`) er egne, idempotente
  filer under `supabase/functions/pipeline/`, med én staging-kontrakt (AD-2) — `score.ts` skriver
  et eksplisitt `skivindu_uten_dagslys`-flagg ved mørketid-fallback.
- Test-plassering: Vitest/fast-check colocated (`*.test.ts`), Playwright E2E i `tests/e2e/`,
  kontraktstester mot opptatte MET/NVE-svar i `tests/contract/` (AD-4).
- Stedskatalog-bygging er et offline-skript (`scripts/build-catalog/`); `locations` er
  read-only i kjøretid (AD-5).
- Delt SnowScore-modul `shared/snowscore.ts`, brukt av både pipeline og kalkulator, med
  parity-test (AD-6).
- `retention/cleanup.ts` er eneste sletter av alle TTL-data (AD-7).
- Utforsk (kart+liste) er ÉN rute med ETT datalag (`useSteder`-hook); presentasjon veksler på
  `visning=kart|liste` i URL (AD-8).
- DESIGN.md-tokens har ett kildested: `src/lib/theme.ts` + `src/styles/tokens.css`, holdt i
  sync av `theme.test.ts` (AD-9).
- CI: `ci.yml` (lint/typecheck/unit/property/kontraktstester på hver PR), `e2e.yml` (Playwright
  mot preview-deploy), `deploy.yml` (migrasjoner + Pages-deploy ved merge til `main`).
- Hosting: Cloudflare Pages `[ASSUMPTION — ikke endelig bekreftet av gruppa, se arkitekturens
  Deferred-seksjon]`.

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
UX-DR8: Snøvarsel-skjema inline på stedssiden (terskel + enhet), ikke egen side.
UX-DR9: Tilbakemeldingsskjema: kategori + fritekst med tegnteller (maks 1000), statisk
personvern-advarsel over feltet.
UX-DR10: Global `banner-stale-data`-komponent (warning-bakgrunn) for datakilde-nede-tilstand.
UX-DR11: Tilstander: skjelett-lasting (`surface-sunken`), null-treff med forslag, "ufullstendige
data"-tekst i stedet for score-badge.
UX-DR12: Responsiv layout: filterpanel som bunn-ark (<768px) vs. fast venstre sidepanel
(≥768px), ett brytpunkt.
UX-DR13: Tilgjengelighetsgulv: kontrast ≥4.5:1/≥3:1, synlig fokusring i aksentfarge, trykkmål
≥44px, `prefers-reduced-motion` respektert.
UX-DR14: IA: Utforsk (kart/liste), Stedsside, Forklaringsside, Tilbakemelding — fast
toppnavigasjon (ikke bunn-faner).
UX-DR15: PWA install-prompt vises først etter besøkt stedsside minst én gang.

### FR-dekningskart

FR-1 til FR-7, FR-12, FR-13, FR-16: Epic 1
FR-8 til FR-11: Epic 2
FR-14, FR-15, FR-20 til FR-26: Epic 3
FR-17 til FR-19: Epic 4
FR-27 til FR-29: Epic 5

`[RETTET under story-generering: FR-14 (levende treff-antall/null-treff-veiledning) og
FR-26 (kryssreferanse til FR-14) flyttet fra Epic 1 til Epic 3 — de forutsetter et aktivt
filter, som først finnes i Epic 3. Epic 1 (kart/liste uten filter) trengte dem ikke.]`

**NFR-8 (skalerbarhet) har bevisst ingen egen story.** Den er delvis indirekte styrket av
Story 1.7 og 3.1 sine ytelses-AC-er (samme indekserte-tabell-mønster), men reell lasttesting mot
«noen tusen» samtidige brukere er ikke en story i noen epic — dette er allerede flagget som åpent
spørsmål i PRD §10 og gjentas her for å unngå at det stille forsvinner mellom dokumentene.

## Epic-liste

### Epic 1: Se snøforholdene i Norge — på kart eller i liste
Brukeren kan åpne SnowFinder og se ekte, ferske SnowScore-data for norske steder, enten som et
fargelagt kart eller som en likeverdig, tilgjengelig liste, og åpne et sted for full detalj.
Dette er den ugjennomskjærbare kjernen — uten denne fungerer ingen andre epics.
**FRs dekket:** FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-12, FR-13, FR-16. **Konsoliderer**
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
Brukeren kan se når det beste tidsvinduet for en skitur er (med mørketid-håndtering), og følge
et sted uten konto for å få push-varsel når egne krav oppfylles der.
**FRs dekket:** FR-17, FR-18, FR-19. **Konsoliderer** skivindu og snøvarsel i én epic fordi
begge er utvidelser av samme stedsside (`Sted.tsx`) fra Epic 1.

### Epic 5: Gi tilbakemelding uten konto
Brukeren kan sende en tilbakemelding til gruppen — feil, forslag eller datakvalitet — uten
innlogging, trygt beskyttet mot misbruk.
**FRs dekket:** FR-27, FR-28, FR-29.

**Rekkefølge og avhengighet:** Epic 1 → 2/3/4/5 kan i prinsippet bygges i hvilken som helst
rekkefølge etter Epic 1 (ingen av dem krever hverandre), men følger brief/PRD-ens MoSCoW: Epic
1 er 100 % Må ha og bygges først; Epic 2 er nesten helt Må ha (kun kalkulatoren er Bør ha) og
bygges som nummer to siden forklaringssiden er lenket fra hver SnowScore-visning i Epic 1; Epic
3 sin kjerne (nysnø/vind/temp-filter) er Må ha og bygges som nummer tre; Epic 4 og 5 er 100 %
Bør ha og bygges sist, i den rekkefølgen tiden tillater.

**Ikke-funksjonelle og tverrgående krav** (NFR-1 til NFR-8, NFR-Privacy, samt UX-DR1/2/3 om
design-tokens og SnowScore-fargeskala) er ikke egne epics — de er akseptansekriterier som gjelder
på tvers av stories i alle epics (særlig Epic 1, der ytelse, robusthet og tilgjengelighet først
blir konkrete).

---

## Epic 1: Se snøforholdene i Norge — på kart eller i liste

Brukeren kan åpne SnowFinder og se ekte, ferske SnowScore-data for norske steder, på kart eller
i tilgjengelig liste, og åpne et sted for full detalj.

### Story 1.1: Prosjekt-skaffolding og CI-skjelett

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

### Story 1.2: Bygg stedskatalogen

As en gruppemedlem som skal fylle katalogen,
I want et frittstående skript som bygger en migrasjon med ~300 steder fra OpenStreetMap og Kartverket,
So that pipelinen har reelle steder å hente værdata for. Realiserer FR-1.

**Acceptance Criteria:**

**Given** skriptet `scripts/build-catalog/` kjøres manuelt
**When** det henter fra OpenStreetMap (skianlegg/langrenn) og Kartverket (fjelltopper/tettsteder)
**Then** produseres én `supabase/migrations/*.sql`-fil som oppretter og fyller `locations`
(navn, koordinater med 4 desimaler, høyde, stedstype) med ~300 rader
**And** verken `src/` eller `supabase/functions/` importerer noe fra `scripts/build-catalog/`
(AD-5)
**And** `locations` har ingen `INSERT`/`UPDATE`/`DELETE`-tilgang fra noen kjøretids-funksjon —
kun lesing (AD-5)

### Story 1.3: Hent og valider værdata hver time

As systemet,
I want å hente MET- og NVE-data for alle steder hver time og validere hvert svar mot et strengt skjema,
So that bare tillitsverdige data går videre i pipelinen. Realiserer FR-2, FR-3.

**Acceptance Criteria:**

**Given** en planlagt time-jobb og stedskatalogen fra Story 1.2
**When** jobben kjører
**Then** sendes kall med identifiserende User-Agent og `If-Modified-Since`, og data hentes kun på
nytt når `Expires` er passert (ingen unødvendig kall)
**And** hvert svar valideres med Zod mot et strengt skjema før det skrives til
`conditions_staging`
**And** et ugyldig svar avvises, logges til `api_incidents`, og rettes aldri automatisk
**And** en avbrutt kjøring fortsetter der den slapp ved neste forsøk (ikke helt på nytt)
**And** `fetch.ts` og `validate.ts` er egne filer under `supabase/functions/pipeline/`, begge
idempotente (AD-2)

### Story 1.4: Bygg den delte SnowScore-modulen

As en bruker,
I want at SnowScore beregnes av én enkelt, delt formel — ikke to separate implementasjoner,
So that tallet aldri kan sprike mellom pipelinen og kalkulatoren senere. Realiserer FR-7.

**Acceptance Criteria:**

**Given** formelen fra den rettede briefen (A/B/C, med B sin morketid-uavhengige nevner=16 og
B/C=0 uten nedbør)
**When** `shared/snowscore.ts` implementeres som ren TypeScript uten React/npm/Deno-spesifikke
avhengigheter
**Then** kan modulen importeres uendret fra både Vite (`src/lib/snowscore.ts` re-eksporterer den)
og en Deno Edge Function
**And** egenskapsbaserte tester (minst 1000 tilfeldige inndata) bekrefter: poengsum alltid 0–100,
mer nysnø gir aldri lavere A, lavere snittemperatur gir aldri lavere B, ingen nedbør (P<0,5mm)
gir alltid B=0 og C=0, samme inndata gir alltid samme resultat
**And** en parity-test kjører et fast, gyldig inndatasett gjennom begge importstiene og bekrefter
identisk output (AD-6)
**And** denne storyen leverer kun modulen og dens tester — ingen pipeline-integrasjon ennå
(det er Story 1.5)

### Story 1.5: Beregn og publiser SnowScore i pipelinen

As en bruker,
I want at hvert sted i katalogen får en fersk, publisert SnowScore hver time,
So that jeg alltid ser et oppdatert, kvalitetssikret tall på kartet og stedssiden. Realiserer FR-4, FR-5.

**Acceptance Criteria:**

**Given** validerte data i `conditions_staging` fra Story 1.3 og modulen fra Story 1.4
**When** `score.ts` beregner SnowScore for hvert sted via `shared/snowscore.ts`
**Then** skrives poengsum og delpoeng til `conditions_staging`, og batchen publiseres til
`conditions` atomisk kun hvis minst 95 % av stedene fikk gyldige data — ellers beholdes forrige
publiserte batch uendret
**And** et sted med mer enn 10 % manglende timer får «ufullstendige data» i stedet for en
tallverdi

### Story 1.7: Se Norgeskartet med fargelagte steder

As en skientusiast,
I want å se et kart over Norge der hvert sted er fargelagt etter SnowScore,
So that jeg raskt kan se hvor snøpotensialet er best. Realiserer FR-12. Realiserer UJ-1 (steg 1).

**Acceptance Criteria:**

**Given** publiserte data fra Story 1.5
**When** jeg åpner `/` (Utforsk, `visning=kart` som standard)
**Then** viser Leaflet-kartet alle steder som markører fargelagt etter SnowScore-trinn
(`snowscore-0`..`snowscore-3`, minst 4 trinn, jf. DESIGN.md UX-DR2)
**And** et trykk/klikk på en markør åpner stedssiden for det stedet
**And** `Utforsk`-siden og dens data hentes via én delt `useSteder()`-hook (AD-8) — ingen annen
komponent spør Supabase direkte for stedsdata
**And** kartet er interaktivt (kan panneres/zoomes) innen 3 sekunder på en representativ
mobiltelefon over 4G (NFR-2)

### Story 1.8: Bruk tilgjengelig listevisning i stedet for kart

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

### Story 1.9: Åpne en stedsside med full poengsum

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
kart, liste og denne siden (NFR-3)
**And** et sted med «ufullstendige data» (Story 1.5) vises som tekst, aldri som et tallbadge
**And** en automatisert tilgjengelighetstest (axe/Playwright) i CI rapporterer null kritiske
WCAG 2.1 AA-brudd på denne siden (NFR-7)

### Story 1.6: Hold tjenesten oppe når en datakilde er nede

As en bruker,
I want at SnowFinder fortsetter å vise data selv om MET eller NVE er nede,
So that jeg alltid får et svar, selv om det ikke er det aller ferskeste. Realiserer FR-6.

**Acceptance Criteria:**

**Given** at MET eller NVE simuleres utilgjengelig i test
**When** pipelinen kjører
**Then** brukes eksponentiell ventetid med tilfeldig variasjon og fast maksimum ved feilende kall
**And** en kretsbryter per datakilde åpner etter et definert antall påfølgende feil og stopper
videre forsøk i en avkjølingsperiode
**And** klienten fortsetter å vise siste gyldige publiserte batch — aldri en tom eller delvis
oppdatering
**And** hendelsen logges til `api_incidents` **og** utløser en aktiv varsling til gruppen (ikke
kun en logglinje, jf. NFR-6)
**And** frontend viser `banner-stale-data`-komponenten (DESIGN.md/UX-DR10) øverst på Utforsk-
og stedssiden når en kretsbryter er åpen eller siste publiserte batch er eldre enn normalt —
uten at resten av siden blokkeres

`[RETTET under sprintplanlegging 2026-09-27: Story 1.6 flyttet etter 1.9. Den krever
`banner-stale-data` på Utforsk- og stedssiden, som først finnes etter 1.7 og 1.9 — en
forover-avhengighet. Nummeret er beholdt så kryssreferanser ikke brytes.]`

---

## Epic 2: Forstå og stole på SnowScore

Brukeren kan lese en forklaringsside som viser nøyaktig hvordan SnowScore beregnes.

### Story 2.1: Les kort fortalt og steg for steg

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

### Story 2.2: Se det utledede regneeksempelet

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

### Story 2.3: Les om datakilder og begrensninger

As en bruker,
I want å forstå at SnowScore er en prognose, ikke en garanti,
So that jeg ikke forveksler modellerte forhold med målte, faktiske forhold. Realiserer FR-11.

**Acceptance Criteria:**

**Given** jeg er på forklaringssiden
**When** jeg leser «datakilder og begrensninger»
**Then** listes MET og NVE med lisens (CC BY 4.0 / NLOD)
**And** teksten sier eksplisitt at SnowFinder ikke er en skredfarevurdering, med lenke til
Varsom.no for fjellområder

### Story 2.4: Prøv SnowScore-kalkulatoren selv

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

### Story 3.1: Filtrer på nysnø, vind og temperatur

As en skientusiast,
I want å sette minimumskrav til nysnø og grenser for vind og temperatur,
So that jeg bare ser steder som faktisk oppfyller kravene mine. Realiserer FR-20. Realiserer UJ-1 (steg 2).

**Acceptance Criteria:**

**Given** Utforsk-siden fra Epic 1 med publiserte data
**When** jeg setter minimum nysnø, maks vind og temperaturgrense i filterpanelet
**Then** viser kart og liste bare steder som oppfyller ALLE valgte kriterier (kombinert med OG)
**And** 95 % av filtersøk svarer på under 2 sekunder, via en parameterisert databasefunksjon mot
en forhåndsberegnet, indeksert tabell (NFR-1)
**And** nysnø-cm-anslaget bruker samme faste 1mm≈1cm-omregning som forklaringssiden
**And** filterpanelet vises som et bunn-ark under 768px bredde og som et fast venstre sidepanel
fra 768px og oppover (DESIGN.md/UX-DR12), verifisert med en Playwright-test i begge
viewport-bredder

### Story 3.2: Del og gjenåpne et filtrert søk

As en bruker,
I want at filterverdiene mine lagres i nettadressen,
So that jeg kan dele søket mitt med et enkelt lenke-trykk. Realiserer FR-21. Realiserer UJ-1 (steg 6).

**Acceptance Criteria:**

**Given** jeg har satt et filter (Story 3.1) i enten kart- eller listevisning
**When** jeg kopierer nettadressen og åpner den i en ny økt
**Then** gjenskapes nøyaktig samme filterverdier OG samme visningsmodus (`visning=kart|liste`)
**And** mangler `visning`-parameteren i en delt lenke, brukes `kart` som standard

### Story 3.3: Få hjelp ved null treff og se antall treff live

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

### Story 3.4: Bruk hurtigvalg for vanlige kombinasjoner

As en bruker,
I want forhåndsdefinerte snarveier som «Pudderdag»,
So that jeg slipper å stille inn flere glidebrytere manuelt hver gang. Bør ha. Realiserer FR-15.

**Acceptance Criteria:**

**Given** Utforsk-siden med filterpanelet
**When** jeg trykker en hurtigvalg-chip
**Then** fylles filteret med chipens faste, dokumenterte kombinasjon av verdier i én handling,
og resultatet oppdateres umiddelbart

### Story 3.5: Filtrer på sol

As en turgåer,
I want å sette maks skydekke i dagslystimer,
So that jeg finner steder med utsikt til sol, ikke bare snø. Bør ha. Realiserer FR-22.

**Acceptance Criteria:**

**Given** Utforsk-siden med grunnfilteret fra Story 3.1
**When** jeg setter maks skydekke
**Then** kombineres dette med de andre kriteriene (fortsatt OG)

### Story 3.6: Filtrer på avstand

As en bruker,
I want å sette maks avstand fra min egen posisjon,
So that jeg finner steder som faktisk er i nærheten. Bør ha. Realiserer FR-23.

**Acceptance Criteria:**

**Given** Utforsk-siden med grunnfilteret fra Story 3.1
**When** jeg deler posisjon og setter en maks-avstand
**Then** kombineres dette med de andre kriteriene (fortsatt OG)
**And** posisjonen beregnes og brukes kun i nettleseren — et nettverkskall med posisjon i sendes
aldri til server (verifisert med nettverkstest, NFR-Privacy)

### Story 3.7: Filtrer på stedstype

As en bruker,
I want å filtrere på stedstype (skisted, fjelltopp, by),
So that jeg kun ser stedstyper som er relevante for turen min. Bør ha. Realiserer FR-24.

**Acceptance Criteria:**

**Given** Utforsk-siden med grunnfilteret fra Story 3.1
**When** jeg velger én eller flere stedstyper
**Then** kombineres dette med de andre kriteriene (fortsatt OG)

### Story 3.8: Filtrer på nysnø siste 24 timer

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

Brukeren kan se beste skivindu og følge et sted for push-varsel, uten konto.

### Story 4.1: Gjør SnowFinder installerbar som PWA

As en bruker,
I want å kunne legge SnowFinder på hjemskjermen som en installerbar webapp,
So that jeg kan motta push-varsler på mobilen — spesielt på iPhone, der dette er en forutsetning. Ny story lagt til under elicitering (dekket av ingen FR direkte, men er en forutsetning for FR-18/19 på iPhone).

**Acceptance Criteria:**

**Given** SnowFinder er bygget og deployet
**When** en bruker besøker en stedsside for første gang (Story 1.9)
**Then** registreres en service worker og et web-app-manifest som gjør SnowFinder installerbar
(«Legg til på Hjem-skjerm» på iOS, install-prompt på Android/desktop)
**And** install-tilbudet vises først etter at brukeren har besøkt minst én stedsside, aldri ved
aller første sideåpning (UX-DR15)
**And** appen fungerer identisk installert og ikke-installert — installasjon endrer kun
tilgjengeligheten av push-varsler, ikke annen funksjonalitet
**And** denne storyen er uavhengig av Story 4.3/4.4 (varsler virker på Android/desktop uten
installasjon; installasjon trengs kun for iPhone)

### Story 4.2: Se beste skivindu på stedssiden

As en skientusiast,
I want å se de fire beste sammenhengende timene de neste 48 timene,
So that jeg vet nøyaktig når jeg bør dra. Bør ha. Realiserer FR-17.

**Acceptance Criteria:**

**Given** stedssiden (Story 1.9) med et 48-timers datavindu
**When** vinduet beregnes
**Then** velges de fire sammenhengende dagslystimene med lavest snittvind og minst skydekke,
kun blant timer etter at et eventuelt snøfall har stoppet
**And** har stedet ingen dagslystimer i hele vinduet (mørketid), settes
`skivindu_uten_dagslys=true` i `conditions_staging` av `score.ts` (AD-2), og stedssiden viser
«Mørketid – vindu vist uten dagslys» i stedet for at funksjonen feiler eller returnerer tomt
**And** frontend leser dette flagget direkte — den re-utleder aldri mørketid-tilstanden selv
ved å telle dagslystimer klient-side

### Story 4.3: Registrer et snøvarsel uten konto

As en skientusiast,
I want å følge et sted med en egendefinert terskel,
So that jeg slipper å sjekke manuelt hver dag. Bør ha. Realiserer FR-18. Realiserer UJ-2 (steg 1–3).

**Acceptance Criteria:**

**Given** jeg er på stedssiden
**When** jeg trykker «Varsle meg», setter en terskel (f.eks. 15 mm nysnø) og bekrefter
**Then** registreres regelen via en Edge Function (`supabase/functions/follow/`) som validerer
terskelen og begrenser antall regler per enhet
**And** kun `follow/` skriver til `alert_rules` (AD-1) — ingen annen funksjon skriver dit
**And** ingen navn, e-post eller konto er involvert noe sted i flyten
**And** en automatisert tilgjengelighetstest (axe/Playwright) i CI rapporterer null kritiske
WCAG 2.1 AA-brudd på det inline registreringsskjemaet (NFR-7)

### Story 4.4: Motta og meld deg av et snøvarsel

As en bruker som følger et sted,
I want å få push-varsel når terskelen min oppfylles, og melde meg av med ett trykk,
So that jeg holdes oppdatert uten å bli oversvømt. Bør ha. Realiserer FR-19. Realiserer UJ-2 (steg 4–6).

**Acceptance Criteria:**

**Given** en registrert regel (Story 4.3) og en ny publisert batch (Epic 1) som oppfyller terskelen
**When** pipelinens `alert.ts` evaluerer regler etter publisering
**Then** sendes maks ett push-varsel per regel per døgn, deduplisert via `alert_dispatch_log` —
`alert.ts` skriver aldri til `alert_rules` selv (AD-1)
**And** varselet lenker rett til stedssiden
**And** avmelding (fra varselet eller stedssiden) sletter regelen permanent — verifisert med en
sikkerhetstest som bekrefter raden faktisk er borte, ikke bare deaktivert

---

## Epic 5: Gi tilbakemelding uten konto

Brukeren kan sende tilbakemelding til gruppen uten innlogging.

### Story 5.1: Send en tilbakemelding uten konto

As en bruker,
I want å sende en kategorisert tilbakemelding uten å oppgi navn eller e-post,
So that jeg kan rapportere feil eller forslag med lav terskel. Bør ha. Realiserer FR-27, FR-28.

**Acceptance Criteria:**

**Given** Tilbakemelding-siden
**When** jeg velger kategori, skriver fritekst (maks 1000 tegn) og sender
**Then** verifiserer en Edge Function et Cloudflare Turnstile-token, validerer innholdet mot et
fast skjema, og begrenser innsendinger med en kortlevd, saltet hash
**And** klienten har ingen direkte skrivetilgang til `feedback` — kun Edge Function-en kan
skrive (RLS blokkerer direkte forsøk, AD-1)
**And** skjemaet advarer mot å skrive personopplysninger i fritekstfeltet, statisk over feltet
**And** fritekst behandles som utrygt innhold ved lagring/visning — en sikkerhetstest bekrefter
at innsendt HTML/skript ikke kan injiseres
**And** en automatisert tilgjengelighetstest (axe/Playwright) i CI rapporterer null kritiske
WCAG 2.1 AA-brudd på denne siden (NFR-7)

### Story 5.2: Automatisk sletting av gamle tilbakemeldinger

As gruppen (databehandler),
I want at tilbakemeldinger slettes automatisk etter tolv måneder,
So that vi ikke lagrer personopplysninger lenger enn nødvendig. Bør ha. Realiserer FR-29.

**Acceptance Criteria:**

**Given** en tilbakemelding eldre enn 12 måneder (Story 5.1)
**When** `supabase/functions/retention/cleanup.ts` kjører sin planlagte jobb
**Then** slettes raden — og dette er den eneste funksjonen som noensinne sletter fra `feedback`
(AD-7)
