# Endringsforslag 2026-11-02: timesjobben må tåle at GitHub hopper over kjøringer

**Status:** godkjent av Aksel 2026-11-02 («Godkjenn og bygg»)
**Modus:** batch
**Bygges på:** `story/1-11e-vercel` (PR #81), som uansett må merges før noen annen PR

## 1. Problemet

Natt til 2. november ble timesjobben fulgt fra kl. 20:06 til 09:31 UTC, uten at noe ble endret i mellomtiden.

- `data.yml` står på `main` med `cron: '17 * * * *'` og er `active`.
- **Bare 2 av 14 planlagte kjøringer startet:** 23:39 UTC (22 minutter forsinket) og 06:15 UTC. GitHub startet aldri de andre 12.
- **Begge kjøringene virket:** de ble grønne, og `runId` var på nettsiden noen minutter etter, uten nytt bygg. Kjeden fra jobben til nettsiden er altså i orden.
- **Dataene ble gamle:** målt hvert 10. minutt på `https://snowfinder-seven.vercel.app/data/latest.json` var dataene opptil 6 timer og 36 minutter gamle. Banneret «Viser siste kjente data» kommer etter 90 minutter, så det sto på nettsiden det meste av natten.

GitHub sier selv at planlagte kjøringer kan bli forsinket eller droppet når det er mye last. FR-2 («hver time») og Story 1.11 er derfor ikke oppfylt i praksis, selv om koden er riktig.

## 2. Hva endringen berører

| Område | Endring |
|---|---|
| Epic 1, Story 1.11 | Ett nytt akseptkriterium om hyppigere forsøk og kontroll av alderen på dataene. Storyen er fortsatt `in-progress`. |
| Andre stories | Ingen. |
| PRD, FR-2 | Kravet «hver time» står. Én konsekvens beskriver nå hvordan det holdes. |
| PRD, NFR-4 og NFR-6 | Uendret. |
| Arkitektur | Linjene om den planlagte jobben («One run at a time», figuren og tabellen over workflows). AD-10 er uendret. |
| UX | Ingen. Banneret og grensen på 90 minutter er uendret. |
| `data.yml` | Ny timeplan og en ny første jobb, `gate`. |
| Tester | Én enhetstest leser `data.yml`. |
| README | Avsnittet om timesjobben. |
| Vercel | Uendret. |
| Nøkler og tjenester | Ingen nye. |

## 3. Anbefalt løsning: direkte justering

**Prøv oftere, men hent bare når dataene er gamle nok.**

- **Hyppigere forsøk:** `data.yml` startes hvert 10. minutt, utenom hel time: `cron: '5,15,25,35,45,55 * * * *'`.
- **Ny første jobb, `gate`:** den bruker ingen checkout og ingen `npm ci`, og tar noen sekunder. Den leser `generert` i `latest.json` på grenen `data`.
  - Er fila yngre enn **50 minutter**, og kjøringen er startet av timeplanen, stopper `gate` resten av kjøringen. Kjøringen blir grønn med `data`, `branch` og `verify` som skipped.
  - Ellers kjører alt som før.
- **Kjøringer som alltid går:** push til `main`, `workflow_dispatch` og PR-er hopper aldri over.
- **Hvis `gate` ikke får lest fila:** feil svar, ikke JSON eller ingen gyldig `generert` gir en full kjøring. En feil i kontrollen kan altså aldri stoppe oppdateringen.
- **Uendret:** `concurrency`-gruppen og resten av jobbene.

### Hvorfor dette er nok

- **MET belastes som før:** dataene blir hentet omtrent én gang i timen. Ved 50 minutter slipper første forsøk etter en publisering gjennom etter rundt en time, så hvert sted hentes fortsatt omtrent én gang per time, slik FR-2 sier.
- **Mange sjanser før banneret:** mellom 50 og 90 minutter gamle data er det fire forsøk. Banneret kommer bare hvis alle fire blir droppet. I natt startet GitHub 2 av 14, så det kan likevel skje i dårlige perioder. Vi kan ikke garantere dette uten en tjeneste som krever nøkkel, og det er utenfor v1.

### Alternativer som er forkastet

- **Ekstern cron-tjeneste som starter `workflow_dispatch`:** krever en GitHub-nøkkel og en konto hos en annen tjeneste. Det er utenfor v1.
- **Vercel Cron:** Hobby-kontoen tillater bare én kjøring per døgn, og den trenger en nøkkel for å starte jobben hos GitHub.
- **Hente hvert 10. minutt uten `gate`:** seks ganger så mange spørsmål til MET, uten at prognosen blir ferskere. Det bryter FR-2.
- **Heve banner-grensen:** skjuler problemet for brukeren, men dataene er like gamle.

### Innsats, risiko og tid

- **Innsats:** noen timer.
- **Risiko:** lav. Faller `gate`, går kjøringen som før.
- **Ulemper:**
  - **Flere oppføringer i Actions:** omtrent 144 per døgn, de fleste korte og grønne med jobber som skipped.
  - **Grå kjøringer:** et forsøk som kommer mens en kjøring pågår, venter i køen. Står det allerede ett forsøk der, erstatter GitHub det, og det gamle vises som grått («cancelled»), ikke rødt.
- **Tid:** påvirker ikke kodefrysen 11. november.

## 4. Konkrete endringer

### 4.1 Story 1.11 (`SnowFinder-Epics-og-Stories.md`)

GAMMELT:
```
**And** jobben bruker en `concurrency`-gruppe uten avbrudd, så bare én kjøring går om gangen
```
NYTT:
```
**And** jobben bruker en `concurrency`-gruppe uten avbrudd, så bare én kjøring går om gangen
**And** timeplanen starter jobben hvert 10. minutt, og en planlagt kjøring hopper over hentingen når
`latest.json` på grenen `data` er yngre enn 50 minutter, så GitHubs droppede kjøringer ikke gir
timer gamle data, og MET fortsatt spørres omtrent én gang i timen. Kan ikke alderen leses, kjører
jobben som vanlig *(ny 2026-11-02)*
```
**Begrunnelse:** natten 1.–2. november, se del 1.

### 4.2 PRD, FR-2 (begge kopier)

GAMMELT:
```
- Forespørsler bruker identifiserende User-Agent og begrenset samtidighet. *(v3)* Hvert sted
  hentes én gang per time, i takt med hvor ofte MET oppdaterer prognosen. Kjøringen lagrer ingen
  tilstand mellom timene, så `If-Modified-Since`/`Expires` brukes ikke.
```
NYTT:
```
- Forespørsler bruker identifiserende User-Agent og begrenset samtidighet. *(v3)* Hvert sted
  hentes én gang per time, i takt med hvor ofte MET oppdaterer prognosen. Kjøringen lagrer ingen
  tilstand mellom timene, så `If-Modified-Since`/`Expires` brukes ikke.
- *(2026-11-02)* GitHub dropper mange planlagte kjøringer, så jobben startes hvert 10. minutt og
  henter bare når den publiserte fila er minst 50 minutter gammel. Tidspunktet i den publiserte fila
  er det eneste den leser fra forrige kjøring.
```

### 4.3 Arkitektur (engelsk, begge kopier)

- **«One run at a time»:**
  - GAMMELT: «The scheduled job uses a GitHub Actions `concurrency` group without cancellation.»
  - NYTT: legg til «GitHub drops many scheduled runs, so the schedule fires every 10 minutes and a first job, `gate`, ends a scheduled run when the published `latest.json` is under 50 minutes old. If it cannot read the age, the run goes ahead. Push, manual and PR runs always fetch. (2026-11-02)»
- **Figuren:**
  - GAMMELT: `scheduled hourly, one run at a time`
  - NYTT: `scheduled every 10 min, fetches when data is 50+ min old, one run at a time`
- **Tabellen over workflows:**
  - GAMMELT: `data.yml` (hourly, on push to `main`, and manual)
  - NYTT: `data.yml` (every 10 min with an age gate, so about hourly; on push to `main`; and manual)
- **«stateless» i rapportavsnittet:** uendret. `gate` leser den publiserte fila, ikke en egen tilstandsfil.

### 4.4 `data.yml`

- `cron: '5,15,25,35,45,55 * * * *'`, med kommentar om hvorfor.
- **Ny jobb `gate`:**
  - **Oppsett:** `permissions: {}`, `timeout-minutes: 5`.
  - **Kontroll:** `curl` mot `raw.githubusercontent.com/<repo>/data/latest.json`, og `jq` leser `generert`.
  - **Resultat:** skriver `run=true` eller `run=false` med en linje i loggen om alderen.
  - **Når den stopper:** `run=false` bare når `github.event_name == 'schedule'` og alderen er under 50 minutter.
- **`data`:** får `needs: gate` og `if: needs.gate.outputs.run == 'true'`.
- **`branch` og `verify`:** uendret. De hopper over seg selv når `data` er skipped.
- **Kommentaren om `timeout-minutes: 50`:** oppdateres, fordi den nevner timen mellom kjøringene.

### 4.5 Test

En ny Vitest-test leser `data.yml` og sjekker:

- at timeplanen har minst fire forsøk i timen;
- at grensen er under 90 minutter minus to intervaller, så det er minst to forsøk før banneret;
- at `data` avhenger av `gate`;
- at bare `schedule` kan hoppe over.

Testen kjører i `npm test` og holder tallene i takt med banner-grensen.

### 4.6 README

Avsnittet om timesjobben, linje 194: «hvert 10. minutt, men henter bare når dataene på grenen `data` er minst 50 minutter gamle», og hvorfor.

### 4.7 Spec og fremdrift

- **Ny spec:** `spec-1-11f-paalitelig-timesjobb.md`, laget gjennom `bmad-build`.
- **Andre filer:** `fremdriftsplan.md`, «Sist oppdatert», og KI-loggen oppdateres.
- **`sprint-status.yaml`:** 1.11 forblir `in-progress` til planlagte kjøringer er sett holde dataene under 90 minutter etter merge.

## 5. Overlevering

- **Omfang:** lite. Amelia (`bmad-build`) bygger direkte på `story/1-11e-vercel`, og det kommer med i PR #81.
- **Joseph:** reviewer PR #81 med denne endringen.
- **Aksel:** godkjenner merge.

**Ferdig når:**

1. `npm run lint`, `typecheck`, `npm test` og `build:demo` er grønne lokalt, og CI, E2E og data er grønne på PR #81.
2. Kjøringen av `data.yml` på PR-en viser at `gate` slipper gjennom, fordi en PR alltid henter.
3. Etter merge viser et døgn med planlagte kjøringer at:
   - `gate` hopper over når dataene er ferske;
   - minst én kjøring i timen henter og publiserer;
   - dataene på nettsiden holder seg under 90 minutter i de fleste timene.

   Dette måles på nettsiden, ikke bare i Actions.
