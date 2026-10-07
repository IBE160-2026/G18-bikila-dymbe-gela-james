---
title: 'Sprint Change Proposal: faglærerens tilbakemelding og ingeniørnivå'
created: '2026-10-07'
workflow: bmad-correct-course
mode: batch
trigger: 'Tilbakemelding på product brief fra faglærer, 2026-10-06'
scope_classification: major
status: 'godkjent'
approved_by: 'Joseph (2026-10-07), venter på PR-godkjenning fra gruppemedlem'
requested_by: Joseph
---

# Sprint Change Proposal: faglærerens tilbakemelding og ingeniørnivå

## 1. Hva som utløste endringen

**Utløser:** Faglærer (oppdragsgiver) ga tilbakemelding på produktbriefen 2026-10-06
([tilbakemelding-product-brief.md](../../project-phase-folders/1-Oppstartsfasen/tilbakemelding-product-brief.md)).
Kategori: **nytt krav fra oppdragsgiver**. Ingen story har feilet; Story 1.1 er bygget og ligger
til gjennomgang.

**Problemet, kort:**
1. **Sensor kan ikke kjøre appen.** Gjennomførbarhet «Kjørbar for sensor» er vurdert som **stor
   risiko**, og kriterium 6 (README og kjørbarhet, 10 %) har status **Endre**. Appen krever
   gruppas Supabase-prosjekt, Turnstile og Web Push.
2. **Omfanget er for stort for Må ha.** Pipelinen med kø, kretsbryter, eksponentiell ventetid og
   overvåkingsvarsler gjør kjerneflyten mer kompleks enn nødvendig (kriterium 2 og 5: Juster).
3. **Suksesskriteriene blander det som testes automatisk med mål for brukertest** (Juster).
4. **Fasit mangler** for beste skivindu (inkludert mørketid) og filtrering, slik SnowScore har.
5. **Briefen** mangler «hva skiller oss fra yr.no og Skiinfo», har for mye teknologi, og det er
   uklart hvilken av de to kopiene som gjelder.

**Tilleggsføring fra gruppa (Joseph, 2026-10-07):** løsningen skal holde dataingeniørnivå på
alle områder, med brukervennlighet som hovedpunkt i UX. Gruppa har avtalt at nivået skal vises
som **kvalitet og dybde, ikke mer infrastruktur**, slik at det ikke strider mot faglærerens råd
om å forenkle.

**Bevis:** tilbakemeldingens tabeller «Gjennomførbarhet» og «Utgangspunkt for del 1»;
sensorveiledningen for del 1, kriterium 6 («Dersom appen ikke lar seg kjøre … trekker det
tydelig ned på kriterium 6 og begrenser hvor høyt kriterium 2 kan vurderes»).

## 2. Sjekkliste

| # | Punkt | Status | Funn |
|---|---|---|---|
| 1.1 | Utløsende story | [x] | Ingen story; ekstern tilbakemelding. Story 1.1 påvirkes ikke. |
| 1.2 | Problemtype | [x] | Nytt krav fra oppdragsgiver, pluss gruppas kvalitetsambisjon. |
| 1.3 | Bevis | [x] | Faglærerens tilbakemelding og sensorveiledningen. |
| 2.1 | Epic 1 kan fullføres? | [!] | Ja, men pipelinen forenkles (1.3, 1.6), og en ny Må ha-story for demomodus kommer til. |
| 2.2 | Endringer på epic-nivå | [!] | Ingen ny epic. Nye stories: 1.10 (demomodus), 2.5 (analyse, Bør ha). |
| 2.3 | Senere epics | [!] | Epic 3 og 4 får fasit-kriterier. Epic 4 (push) og 5 (Turnstile) får en tydelig utsettelsesregel. |
| 2.4 | Overflødige epics | [N/A] | Ingen epic blir overflødig. |
| 2.5 | Rekkefølge | [!] | Story 1.10 inn i sprint 1. Story 1.6 flyttes til Bør ha (sprint 4). |
| 3.1 | PRD | [!] | Ny FR-30 og NFR-DQ, endret FR-2/FR-6/NFR-6, nye fasit-krav og nytt §9. |
| 3.2 | Arkitektur | [!] | Ny AD-10 (datatilgang via én port, to adaptere), AD-1 justeres, ny tabell `pipeline_runs`. |
| 3.3 | UX | [!] | Wireframes mangler for nøkkelskjermene. Kursets skjermkrav må kobles til SnowFinder. Plan for brukertest. |
| 3.4 | Andre artefakter | [!] | README, `.env.example`, `ci.yml` (demo-E2E), AGENTS.md (BMAD alltid), sprintplan, fremdriftsplan. |
| 4.1 | Direkte justering | Levedyktig | Lav–middels innsats, lav risiko. |
| 4.2 | Tilbakerulling | Ikke levedyktig | Ingen ferdig kode å rulle tilbake. |
| 4.3 | MVP-gjennomgang | Levedyktig | Pipelinens robusthet flyttes til Bør ha, og demomodus inn i Må ha. |
| 4.4 | Valgt vei | [x] | Direkte justering + MVP-gjennomgang (se §3). |

## 3. Anbefalt vei

**Direkte justering kombinert med en MVP-gjennomgang.** Strukturen med fem epics beholdes. Må
ha flytter vekt fra driftsrobusthet til kjørbarhet, korrekthet og datakvalitet.

| | |
|---|---|
| Innsats | Middels: én økt per agent (John, Winston, Sally, sprintplanlegging). Ingen kode kastes. |
| Risiko | Lav. Endringene forenkler, og demomodus fjerner avhengigheten til Supabase for UI-arbeidet. |
| Tidsplan | Positiv. Sprint 2 (kart, liste, stedsside) kan starte i demomodus før Supabase er satt opp, som i dag blokkerer. |

**Ingeniørnivå uten mer infrastruktur.** Disse tiltakene gir dybde uten nye tjenester:
- **Datakontrakt:** Zod-skjemaene for MET og NVE dokumenteres som en dataordbok.
- **Datakvalitet per kjøring:** andel gyldige steder, avviste svar og manglende timer lagres for
  hver kjøring og vises for brukeren.
- **Sporbarhet** fra hver publisert verdi tilbake til kjøring og kildetidspunkt.
- **Reproduserbare demodata:** de bygges av samme kode som pipelinen.
- **Fasittabeller (golden tests)** for SnowScore, skivindu og filter.
- **Analyse:** en vurdering av SnowScore mot NVEs målte nysnø, som Bør ha.
- **UX:** wireframes og en brukertest med målbare oppgaver.

## 4. Detaljerte endringsforslag

### 4.1 PRD (`SnowFinder-PRD.md`, begge kopier)

**P1. Ny FR-30: Lokal demomodus (Må ha)**, ny seksjon §4.7 «Kjøring og demodata»:

```
NY:
#### FR-30: Lokal demomodus med ferdige data *(Må ha)*

En utenforstående kan klone repoet og starte SnowFinder med `npm ci && npm run dev`, uten
Supabase-prosjekt, nøkler eller nettverkskall til MET/NVE. Appen viser da et demodatasett.

Konsekvenser (testbare):
- Datakilden velges med `VITE_DATA_SOURCE=demo|supabase`. `demo` er standard i
  `.env.example`, og `.env.example` inneholder ingen ekte hemmeligheter.
- Demodatasettet (ca. 20–30 steder) bygges av `npm run demo:data` fra de lagrede MET/NVE-svarene
  i `tests/contract/fixtures/`, med samme validerings- og SnowScore-kode som pipelinen (AD-6).
  Det finnes ingen håndskrevne poengsummer.
- Demodatasettet inneholder bevisst ett sted med «ufullstendige data», ett med utdaterte data
  og ett i mørketid, slik at sensor ser alle tilstandene.
- Demomodus vises tydelig i grensesnittet («Demodata – ikke ekte prognoser»).
- En E2E-røyktest i CI kjører kart → filter → stedsside i demomodus.
- README beskriver begge måtene å kjøre på: demomodus (anbefalt for sensor) og full lokal stack
  med Supabase CLI (krever Docker).
```
Begrunnelse: faglærerens viktigste punkt (stor risiko, kriterium 6). Det fjerner også
avhengigheten til Supabase for UI-stories.

**P2. FR-2 forenkles**

```
GAMMEL: En avbrutt kjøring (f.eks. Supabase-tidsavbrudd) fortsetter der den slapp ved neste
forsøk, fremfor å starte helt på nytt.
NY:     Én planlagt jobb henter alle ~300 steder i én kjøring med begrenset samtidighet. En
avbrutt kjøring publiserer ingenting (FR-5) og kjøres på nytt ved neste time. Køstyrte puljer
som fortsetter der de slapp, er Bør ha.
```

**P3. FR-6 deles. Robusthetsmaskineriet blir Bør ha**

```
GAMMEL: FR-6: Robusthet mot datakilde-nedetid (Må ha): eksponentiell ventetid, kretsbryter per
datakilde, varsling av gruppen.
NY:     FR-6a (Må ha): Ved feil hos en datakilde publiseres ingen ny batch, og klienten viser
siste gyldige batch (følger av FR-5). Feilen skrives til `pipeline_runs`.
        FR-6b (Bør ha): Eksponentiell ventetid, kretsbryter per datakilde og aktiv varsling
av gruppen (NFR-6).
```

**P4. Ny NFR-DQ: datakvalitet og sporbarhet (Må ha)**, under §7.2:

```
NY:
- NFR-DQ1 (datakontrakt): Hvert MET- og NVE-svar valideres mot et Zod-skjema. Skjemaene er
  dokumentert som en dataordbok (felt, enhet, gyldig område, kilde).
- NFR-DQ2 (kvalitet per kjøring): Hver pipeline-kjøring skriver én rad i `pipeline_runs`:
  starttid, varighet, antall steder, andel gyldige, antall avviste svar per kilde, antall steder
  med ufullstendige data, og om batchen ble publisert. Forklaringssiden viser siste kjørings
  kvalitet i klartekst.
- NFR-DQ3 (sporbarhet): Hver publisert verdi i `conditions` har `run_id` og kildens
  tidsstempel, slik at enhver poengsum kan spores til kjøringen og rådataene den kom fra.
```

**P5. NFR-6 blir Bør ha** (henger sammen med FR-6b). Aktiv varsling til gruppa krever en ekstern
kanal.

**P6. Fasit-krav (golden tests)**, nye konsekvenser:

```
FR-17 (Beste skivindu), NY konsekvens:
- En fasittabell med minst fire tilfeller (normal dag, snøfall som slutter midt i vinduet,
  for få sammenhengende dagslystimer, mørketid) med inndata time for time og forventet
  vindu. Den brukes både i dokumentasjonen og som test.

FR-20 / FR-14 (Filter og null treff), NY konsekvens:
- En fasittabell med et lite stedssett (5–8 steder), flere filterkombinasjoner, forventede
  treff og forventet null-treff-forslag. Den brukes som test mot samme filterfunksjon som
  appen bruker.
```

**P7. Ny §9: suksesskriteriene deles i tre**

```
NY tabell (erstatter dagens primær/sekundær-liste, ID-ene beholdes):
| ID | Kriterium | Hvordan verifiseres |
| SM-6 Korrekthet, SM-5 Robusthet, SM-7 Tilgjengelighet (axe), SM-8 Sporbarhet, NY SM-9
  Kjerneflyt (E2E i demomodus), NY SM-10 Fasittabeller, NY SM-11 Datakvalitet
  (pipeline_runs fylles) | Automatisk i CI |
| SM-1 Ytelse (filter < 2 s), NFR-2 (kart < 3 s mobil), NFR-3 (ferskhet < 90 min) | Måles
  manuelt eller ved demo; rapporteres med måledata, ikke CI-blokkerende |
| SM-2 Nytte, SM-3 Forklarbarhet, SM-4 Dataforståelse | Mål for brukertesten (5 personer) |
```

**P8. §6 MVP-omfang** oppdateres i tråd med P1–P5:
- inn: demomodus og datakvalitet;
- ut til Bør ha: kretsbryter, ventetid, aktiv varsling og køstyrte puljer.

Ny regel i §6.2: *«Er Må ha ikke stabilt ved halvveis-sjekken (slutten av sprint 2), utsettes
Epic 4 (snøvarsel) og Epic 5 (tilbakemelding) til etter innlevering. Begge krever eksterne
tjenester som sensor ikke kan teste.»*

**P9. §10 Åpne spørsmål:** punkt 3 (IBE160-kriterier) lukkes. Sensorveiledningen og faglærerens
tilbakemelding er nå kjent.

### 4.2 Produktbrief (begge kopier)

**B1.** Ny seksjon **«What Makes This Different»** (kort, 4–6 linjer):
- Yr.no gir én prognose per sted.
- Skiinfo og anleggene gir løypestatus per anlegg.
- SnowFinder svarer på «hvor i hele landet oppfylles *mine* krav nå?», med en åpen og
  etterprøvbar poengsum og filter på tvers av alle steder.

**B2.** **«Proposed Architecture»** kortes ned til en enkel figur og stacktabellen. Detaljene
(kø, kretsbryter, staging) henvises til arkitekturen. «Data Sources and Pipeline» forenkles i
tråd med P2/P3.

**B3.** **«Scope for Version 1»**: lokal demomodus inn i Må ha; robust feilhåndtering endres til
«siste gyldige data ved nedetid (kretsbryter og varsling er Bør ha)».

**B4.** **«Success Criteria»**: samme tredeling som P7, og funksjonelle kriterier for kjerneflyten.

**B5.** Ny linje øverst: *«Gjeldende versjon er
`project-phase-folders/1-Oppstartsfasen/SnowFinder-Produktbrief.md`; kopien i
`project-workspace/` er BMADs arbeidskopi og holdes lik.»* Samme regel gjelder alle
planleggingsdokumentene (se også S3).

### 4.3 Arkitektur (`SnowFinder-Arkitektur.md`, begge kopier)

**A1. Ny AD-10: Datatilgang via én port med to adaptere**

```
NY:
### AD-10 — Data access has one port and two adapters (v3, PRD FR-30)
- Binds: src/lib/data/**, src/hooks/**, scripts/demo-data/**
- Prevents: components or hooks branching on "demo vs real" on their own, or the demo
  dataset drifting from what the pipeline would produce.
- Rule: src/ reads data only through src/lib/data/ (a typed port: listSteder, getSted,
  filterSteder, latestRun). Two adapters implement it: supabase/ (the only file that creates
  a Supabase client) and demo/ (reads public/demo/*.json). VITE_DATA_SOURCE picks one at build
  time. The demo dataset is generated by scripts/demo-data/ from tests/contract/fixtures/ using
  the same validate code and shared/snowscore.ts as the pipeline — never hand-written scores.
  Filter logic used by both adapters lives in shared/ so the demo and the database answer the
  same filter identically (tested against the filter golden table, PRD FR-20).
```
Ringvirkning: AD-1 endres fra «`src/` når Supabase bare gjennom
`src/lib/supabase/client.ts`» til «… bare gjennom `src/lib/data/supabase/`». Regelen om én
skriver per tabell er uendret, og AD-8 (`useSteder()`) leser gjennom porten.

**A2. Pipelinen forenkles i v1** (AD-2): stegene er de samme, men kø- og puljemekanismen og
kretsbryteren merkes som Bør ha i tekst og figur. Staging og atomisk publisering beholdes, fordi
de er kjernen i datakvaliteten.

**A3. Ny tabell `pipeline_runs`** (eier: `publish.ts`, eneste skriver), og `run_id` på
`conditions` (NFR-DQ2/DQ3). Datamodellen listes med alle tabellene (sju med `pipeline_runs`).

**A4. Structural Seed:** legg til `src/lib/data/{supabase,demo}/`, `scripts/demo-data/`,
`public/demo/` og `.env.example`. En ny del om lokal kjøring beskriver demomodus og lokal
Supabase.

### 4.4 UX (`SnowFinder-EXPERIENCE.md` og `DESIGN.md`)

**U1. Wireframes** for nøkkelskjermene, både mobil og PC:
- Utforsk: kart og liste, med filteret som bunn-ark og som sidepanel;
- Stedsside;
- Forklaringsside, med panelet for datakvalitet;
- Tilbakemelding.

De legges i `project-phase-folders/2-Planleggingsfasen/wireframes/`.

**U2. Kursets skjermkrav koblet til SnowFinder**, med begrunnelse ut fra brukernes behov
(forslag fra 2026-10-07):

| Kurspunkt | Skjerm i SnowFinder |
|---|---|
| Pålogging | Utforsk uten innloggingsvegg |
| Profil | Snøvarsel på stedssiden |
| Innsjekking | Tilbakemelding om faktiske forhold |
| Sosial feed | Utforsk-listen, rangert og oppdatert hver time |
| Arrangementer | Beste skivindu og snøvarsel |

Begrunnelsen (lite friksjon, personvern, brukerens egentlige behov) står i EXPERIENCE.md, og
mappingen skal avklares med faglærer.

**U3. Brukervennlighet som hovedpunkt:** ny seksjon «Brukertestplan» med
- fem målbare oppgaver (SM-2, SM-3, SM-4), hver med suksesskriterium og tid;
- et SUS-skjema (System Usability Scale);
- en mal for å føre resultatene.

**U4.** Ny tilstand «Demodata» (et banner i DESIGN.md) og et panel for datakvalitet på
forklaringssiden.

### 4.5 Epics and stories (`SnowFinder-Epics-og-Stories.md`)

**E1. Every story is labelled Må ha or Bør ha in its heading.** Today the label appears only in
the text, and only for Bør ha. The faglærer asks for it explicitly.

**E2. New Story 1.10: Kjør SnowFinder lokalt med demodata (Må ha)**, placed right after 1.4:

```
As en sensor eller et nytt gruppemedlem,
I want å starte SnowFinder fra et rent klon med npm ci && npm run dev, uten nøkler,
So that jeg kan prøve appen og kjøre testene kun etter README. Realiserer FR-30, AD-10.

Given et rent klon og Node 24
When jeg følger README («Kom i gang»)
Then starter appen i demomodus med demodatasettet, merket «Demodata»
And npm run demo:data bygger public/demo/*.json fra tests/contract/fixtures/ med
    shared/snowscore.ts, og en test bekrefter at resultatet er reproduserbart (samme inndata → samme fil)
And src/lib/data/ har porten og demo-adapteren; Supabase-adapteren er et tomt skall til Story 1.3
And .env.example finnes uten ekte hemmeligheter, og README dokumenterer begge kjøremåtene
```

**E3. Story 1.3 forenkles:** AC «en avbrutt kjøring fortsetter der den slapp» fjernes (Bør ha).
Ny AC: validerings-skjemaene dokumenteres som dataordbok (NFR-DQ1).

**E4. Story 1.5 utvides:** `publish.ts` skriver én rad i `pipeline_runs` og `run_id` på hver
publisert rad (NFR-DQ2/DQ3).

**E5. Story 1.6 blir Bør ha** (FR-6b, NFR-6), flyttes til sprint 4. «Siste gyldige batch» er
allerede dekket av 1.5, og «utdatert» er dekket av 1.9.

**E6. Story 1.7–1.9** får en ekstra AC: virker i demomodus (Story 1.10). E2E-røyktesten kjører
i demomodus i CI.

**E7. Story 2.3 utvides:** forklaringssiden viser siste kjørings datakvalitet (NFR-DQ2).

**E8. Story 3.1 og 3.3** får fasit-AC (P6, filter og null treff). **Story 4.2** får
fasittabellen for skivindu (P6).

**E9. Ny Story 2.5: Vurder SnowScore mot målte forhold (Bør ha):** et analyse-skript i
`scripts/analysis/` sammenligner MET-prognosen med NVEs modellerte nysnø for katalogens steder
over en periode. Resultatet er en kort rapport (treffsikkerhet, systematiske avvik) som brukes i
sluttrapporten. Dette er dataanalytiker-delen. Den er ikke del av appen og krever ingen ny
tjeneste.

### 4.6 Andre artefakter

- **S1. `sprintplan.md`:**
  - Sprint 1 får Story 1.10 (etter 1.4).
  - Sprint 2 starter i demomodus, og Supabase trengs først for 1.3 og 1.5.
  - 1.6 flyttes til sprint 4.
  - Ny halvveis-sjekk etter sprint 2 (regelen i P8).
- **S2. `ci.yml`** (i Story 1.10 og 1.7): E2E-røyktest i demomodus. I tillegg en sjekk av at
  dokumentkopiene i `project-workspace/` og `project-phase-folders/` er like (faglærerens punkt 7).
- **S3. `AGENTS.md`** (via `bmad-project-context`): regelen om BMAD alltid, faglærerens føringer,
  ingeniørnivå som kvalitet, og hvilken dokumentkopi som gjelder.
- **S4. `fremdriftsplan.md` og `milepæler.md`:** nytt steg «Endringsrunde etter faglærers
  tilbakemelding». Milepæl: «Sensor-test: et gruppemedlem starter appen fra rent klon kun etter
  README», tidligst etter Story 1.10.
- **S5.** Story 1.1 (bygget, til gjennomgang) **påvirkes ikke**. Den fullføres som planlagt.

## 5. Overlevering

**Omfang: Major.** Endringene berører PRD, arkitektur og UX, ikke bare backlogen.

| Rekkefølge | Agent / skill | Leveranse |
|---|---|---|
| 1 | John (`bmad-prd`, oppdater) | PRD P1–P9 og brief B1–B5, begge kopier |
| 2 | Winston (`bmad-architecture`, oppdater) | AD-10, A2–A4, begge kopier |
| 3 | Sally (`bmad-ux`) | Wireframes U1, kursmapping U2, brukertestplan U3, U4 |
| 4 | John (`bmad-create-epics-and-stories`, oppdater) | E1–E9 |
| 5 | `bmad-sprint-planning` | S1, S4, `sprint-status.yaml` (ny 1.10, 2.5; 1.6 flyttet) |
| 6 | `bmad-project-context` | S3 (AGENTS.md) |
| 7 | Amelia (`bmad-build`) | Fullføre Story 1.1, deretter 1.4 og 1.10 |

Hver leveranse får egen grein og PR (`planlegging/<agent>-<tema>`) med godkjenning fra et
gruppemedlem, og hver økt logges i `ai-log/`.

**Suksesskriterier for endringen:**
- Faglærerens tre «neste steg» er dekket:
  1. lokal kjøring med demodata, `.env.example` og en test fra et rent klon;
  2. Må ha merket på stories og pipelinen forenklet;
  3. suksesskriteriene delt i tre, og fasit laget for skivindu og filter.
- Briefen er oppdatert i repoet, slik at historikken viser hvordan planen utviklet seg.
- Et gruppemedlem har startet appen fra et rent klon kun etter README (etter Story 1.10).
