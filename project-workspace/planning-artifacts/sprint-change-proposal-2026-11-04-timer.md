# Endringsforslag 2026-11-04: timesjobben starter neste kjøring selv

**Status:** godkjent av Aksel 2026-11-04 («godkjenner»)
**Modus:** batch
**Bygges på:** `story/1-11g-timer`, fra `main`
**Forrige forslag:** [sprint-change-proposal-2026-11-02-timesjobb.md](sprint-change-proposal-2026-11-02-timesjobb.md)

## 1. Problemet

Endringen fra 2. november (1.11f) holder ikke.

- **Hva 1.11f gjorde:** timeplanen prøver hvert 10. minutt, og jobben `gate` henter bare når dataene er minst 50 minutter gamle. Endringen ble merget 2. november kl. 19:02 UTC.
- **Hva som skjedde:** fram til 4. november kl. 20:16 UTC startet GitHub bare **7 planlagte kjøringer på omtrent 49 timer**, av rundt 290 forsøk. Avstanden mellom kjøringene var 4 til 8 timer.
- **Følgen på nettsiden:** dataene var ofte 4 til 8 timer gamle, og 3. november kl. 06:18 UTC var de 285 minutter gamle. Banneret «Viser siste kjente data» sto store deler av døgnet.
- **En avvist kjøring:** 4. november kl. 09:13 UTC ble bare 92 % av stedene gyldige, så ingenting ble publisert, slik FR-5 krever. Neste kjøring kom først 8 timer senere.
- **Det som virker:** hver kjøring som starter, når nettsiden uten nytt bygg. Kjeden fra jobben til nettsiden er i orden. Problemet er at GitHub nesten aldri starter en planlagt kjøring.

FR-2 («hver time») og NFR-3 (normalt under 90 minutter) er dermed ikke oppfylt, og Story 1.11 kan ikke settes til `done`.

**Aksels beslutning 2026-11-04:** den opprinnelige planen står. Det betyr oppdatering hver time, banner etter 90 minutter og NFR-3 uendret.

## 2. Hva endringen berører

| Område | Endring |
|---|---|
| Epic 1, Story 1.11 | Akseptkriteriet fra 2026-11-02 utvides med timeren. Storyen er fortsatt `in-progress`. |
| Andre stories | Ingen. |
| PRD, FR-2 | Kravet «hver time» står. Konsekvensen fra 2026-11-02 beskriver nå timeren. |
| PRD, NFR-3 | Uendret. |
| Arkitektur | «One run at a time», figuren og tabellen over workflows. AD-10 er uendret: én datafil og ingen modusbryter i appen. |
| UX | Ingen. Banneret og grensen på 90 minutter er uendret. |
| `data.yml` | Ny siste jobb, `timer`, som starter `data-timer.yml`. Timeplanen og `gate` er uendret. |
| Ny `data-timer.yml` | Venter til dataene er rundt 55 minutter gamle, og starter så `data.yml`. |
| Tester | `data-workflow.test.ts` utvides til begge filene. |
| README | Avsnittet om timesjobben. |
| Vercel, grenen `data` og dataprogrammet | Uendret. |
| Nøkler og tjenester | Ingen nye. Bare den innebygde `GITHUB_TOKEN`. |

## 3. Anbefalt løsning: direkte justering

**Hver kjøring som har hentet data, starter en timer. Timeren starter neste kjøring.**

1. **`data.yml` får en siste jobb, `timer`.**
   - **Når den kjører:** bare på `main` og bare når `gate` lot kjøringen hente. Det gjelder også når hentingen ble avvist (under 95 %) eller feilet, så kjeden ikke stopper.
   - **Hva den gjør:** starter `data-timer.yml` med `gh workflow run`. Den har bare `actions: write` og ingen checkout.
2. **Ny `data-timer.yml`:**
   - Startes bare med `workflow_dispatch`.
   - Leser tidspunktet for siste commit på grenen `data`, på samme måte som `gate`.
   - Sover til dataene er **55 minutter** gamle, men **minst 30 minutter**. Minstetiden gjelder når forrige henting ble avvist og dataene derfor allerede er gamle. Den hindrer at en kilde som er nede blir spurt i tett løkke.
   - Leser alderen på nytt etterpå. Er dataene under **50 minutter** gamle, har noe annet publisert i mellomtiden, og timeren starter ingenting.
   - Ellers starter den `data.yml` på `main` med `gh workflow run`.
   - **Oppsett:** `concurrency: data-timer` med `cancel-in-progress: true`, så det bare finnes én timer om gangen og den nyeste vinner. `timeout-minutes: 70`, og tilgangene `actions: write` og `contents: read`.
3. **Timeplanen beholdes som reserve, uendret hvert 10. minutt.** Hvis kjeden stopper, starter den første planlagte kjøringen som GitHub slipper gjennom, kjeden igjen. Når kjeden går, finner `gate` ferske data og stopper kjøringen etter noen sekunder.

   Dette er et avvik fra det Aksel godkjente muntlig, som var ett forsøk i timen. Forsøk som GitHub dropper, bruker ingen maskin. Bare de 7 av rundt 290 som faktisk startet, kostet noe, og de tok noen sekunder hver. Ett forsøk i timen ville bare gjort reserven tregere: med det vi har målt, ville kjeden i snitt startet igjen først etter omtrent to døgn.

### Hvorfor det virker

- **GitHub stopper ikke slike kjøringer:** GitHub stopper hendelser som en workflow utløser med `GITHUB_TOKEN`, men gjør unntak for `workflow_dispatch`. Slike kjøringer blir ikke droppet slik planlagte kjøringer blir.
- **MET belastes som før:** dataene hentes omtrent én gang i timen, slik FR-2 krever.
- **Tidsbudsjettet holder:**

  | Steg | Tid |
  |---|---|
  | Timeren sover | ~55 min |
  | Kø og oppstart | 1–2 min |
  | Hentingen | ~2 min |
  | Sum | 58–60 min |

  Grensen for banneret er 90 minutter, så det er rom for en treg kjøring eller kø hos GitHub.

### Maskinbruk

Timeren holder en GitHub-maskin opptatt mens den sover, altså nesten hele døgnet. Den bruker nesten ingen prosessorkraft. Repoet er offentlig, så det koster ingenting og trekkes ikke fra noen kvote.

Aksel ønsket minst mulig maskinbruk. Den beste løsningen, et environment med wait timer som venter uten maskin, krever admin i repoet, og det har bare `bipa` og `TesAgi-HiMolde`. Derfor bygges timeren slik at overgangen blir liten:

- Når en admin lager environmentet `data-timer` med wait timer på 55 minutter, legges `environment: data-timer` til på jobben, og sov-steget fjernes.
- Kontrollen av alderen blir stående, så kjeden kan ikke gå i løkke om wait timeren skulle mangle.
- Denne overgangen står som et utsatt punkt i `deferred-work.md`.

### Risiko for dataene

Ingen.

- Dataprogrammet, valideringen, terskelen på 95 %, grenen `data` og `latest.json` er uendret.
- Det kan bare gå én kjøring av `data.yml` om gangen og bare én timer om gangen.
- Stopper kjeden, er vi tilbake der vi er i dag.

### Alternativer som er forkastet

- **Environment med wait timer nå:** krever admin. Aksel vil ikke vente på faglærer. Det står som neste steg (se over).
- **Oppdatering hver 4. time, med banner etter 8 timer:** Aksel valgte den opprinnelige planen (2026-11-04).
- **Bare reservetimeplanen, altså 1.11f slik den er:** måler 4 til 8 timer mellom kjøringene, og oppfyller ikke FR-2.
- **Ekstern cron-tjeneste eller Vercel Cron:** krever nøkkel eller konto, og Vercel Cron kan bare kjøre én gang i døgnet på Hobby-planen.
- **`workflow_run` i stedet for `workflow_dispatch`:** GitHub begrenser kjeder med `workflow_run` til tre ledd. `workflow_dispatch` har ingen slik grense.

### Innsats, risiko og tid

- **Innsats:** noen timer.
- **Risiko:** lav.
  - `data-timer.yml` kan ikke startes før fila ligger på `main`, fordi GitHub bare tillater `workflow_dispatch` på workflows som finnes på standardgreinen. Den kan derfor bare prøves delvis i PR-en, med enhetstesten og en kjøring av `data.yml` på PR-en som viser at `timer` hopper over seg selv utenfor `main`.
  - Selve kjeden prøves første time etter merge, på nettsiden.
- **Tid:** påvirker ikke kodefrysen 11. november. Døgnmålingen etter merge må være ferdig før kodefrysen.

## 4. Konkrete endringer

### 4.1 Story 1.11 (`SnowFinder-Epics-og-Stories.md`)

GAMMELT:
```
**And** timeplanen starter jobben hvert 10. minutt, og en planlagt kjøring hopper over hentingen når
siste publisering på grenen `data` er yngre enn 50 minutter, så GitHubs droppede kjøringer ikke gir
timer gamle data, og MET fortsatt spørres omtrent én gang i timen. Kan ikke alderen leses, kjører
jobben som vanlig *(ny 2026-11-02)*
```
NYTT:
```
**And** timeplanen starter jobben hvert 10. minutt, og en planlagt kjøring hopper over hentingen når
siste publisering på grenen `data` er yngre enn 50 minutter, så GitHubs droppede kjøringer ikke gir
timer gamle data, og MET fortsatt spørres omtrent én gang i timen. Kan ikke alderen leses, kjører
jobben som vanlig *(ny 2026-11-02)*
**And** hver kjøring på `main` som har hentet data, også en avvist, starter `data-timer.yml`, som
venter til dataene er rundt 55 minutter gamle (minst 30 minutter) og så starter `data.yml`. Den
starter ingenting når dataene er under 50 minutter gamle, og det går bare én timer om gangen. Så
holder dataene seg under 90 minutter selv når GitHub dropper planlagte kjøringer; timeplanen er
reserve hvis kjeden stopper *(ny 2026-11-04)*
```

### 4.2 PRD, FR-2 (begge kopier)

GAMMELT:
```
- *(2026-11-02)* GitHub dropper mange planlagte kjøringer, så jobben startes hvert 10. minutt og
  henter bare når siste publisering på grenen `data` er minst 50 minutter gammel. Tidspunktet for den
  publiseringen er det eneste den leser fra forrige kjøring.
- Én kjøring henter alle ~300 steder, med begrenset samtidighet. En avbrutt kjøring publiserer
  ingenting (FR-5) og kjøres på nytt ved neste forsøk, som kommer etter høyst 10 minutter fordi fila
  da fortsatt er gammel *(endret 2026-11-02)*.
```
NYTT:
```
- *(2026-11-02)* GitHub dropper mange planlagte kjøringer, så jobben startes hvert 10. minutt og
  henter bare når siste publisering på grenen `data` er minst 50 minutter gammel. Tidspunktet for den
  publiseringen er det eneste den leser fra forrige kjøring.
- *(2026-11-04)* Timeplanen alene ga 4–8 timer mellom kjøringene, så hver kjøring som har hentet,
  starter en timer som starter neste kjøring når dataene er rundt 55 minutter gamle. Timeplanen er
  reserve.
- Én kjøring henter alle ~300 steder, med begrenset samtidighet. En avbrutt kjøring publiserer
  ingenting (FR-5) og prøves på nytt av timeren etter minst 30 minutter, eller ved neste planlagte
  forsøk *(endret 2026-11-04)*.
```

### 4.3 Arkitektur (engelsk, begge kopier)

- **«One run at a time»:** legg til etter «(2026-11-02)»:
  «The schedule alone left 4–8 hours between runs, so every run on `main` that fetched starts `data-timer.yml`, which waits until the data is about 55 minutes old (at least 30) and dispatches `data.yml`. It dispatches nothing when the data is under 50 minutes old, and only one timer exists at a time. The schedule stays as a fallback that restarts the chain. (2026-11-04)»
- **Figuren:**
  - GAMMELT: `scheduled every 10 min, fetches when data is 50+ min old, one run at a time`
  - NYTT: `restarted by data-timer about every hour, schedule every 10 min as fallback, one run at a time`
- **Tabellen over workflows:**
  - `data.yml`: GAMMELT «(every 10 min with an age gate, so about hourly; on push to `main`; and manual)». NYTT «(started by `data-timer.yml` about hourly; every 10 min with an age gate as fallback; on push to `main`; and manual)».
  - Ny rad: `data-timer.yml` (started by `data.yml`) | waits until the data is about 55 min old, then dispatches `data.yml` | live | Actions enabled in the repo

### 4.4 `data.yml`

- **Ny jobb `timer`:**
  - **Avhengigheter:** `needs: [gate, data, branch, verify]`.
  - **Vilkår:** `if: always() && github.ref == 'refs/heads/main' && github.event_name != 'pull_request' && needs.gate.outputs.run == 'true'`.
  - **Oppsett:** `permissions: actions: write`, `timeout-minutes: 5`.
  - **Steg:** `gh workflow run data-timer.yml --ref main`.
- **Uendret:** timeplanen, `gate`, `data`, `branch` og `verify`. Kommentaren øverst oppdateres.

### 4.5 Ny `data-timer.yml`

- **Utløser:** bare `workflow_dispatch`.
- **Concurrency:** `group: data-timer`, `cancel-in-progress: true`.
- **Én jobb `wait`:**
  - **Oppsett:** `permissions: actions: write, contents: read`, `timeout-minutes: 70`.
  - **Steg 1:** les alderen gjennom API-et, regn ut ventetiden (55 minutter minus alderen, men minst 30 minutter) og `sleep`. Kan ikke alderen leses, vent 55 minutter.
  - **Steg 2:** les alderen på nytt. Er den under 50 minutter, skriv det i loggen og stopp. Ellers kjør `gh workflow run data.yml --ref main`.
- **Kommentar i fila:** hvordan sovingen byttes ut med `environment: data-timer` når en admin har laget det.

### 4.6 Test

`scripts/pipeline/data-workflow.test.ts` utvides. Den sjekker:

- at `data.yml` har jobben `timer`, som bare kjører på `main`, utenom PR-er, etter `gate`, og med `always()`;
- at `data-timer.yml` bare har `workflow_dispatch`, har `cancel-in-progress: true`, har en målalder under 90 minutter, minstetid på minst 30 minutter og en sperre som er lavere enn målalderen;
- at sperren i timeren er lik grensen i `gate`, slik at de ikke kommer i utakt.

### 4.7 README

Avsnittet om timesjobben skal si:

- at timeren starter neste kjøring og at timeplanen er reserve;
- hvordan man ser timeren i Actions-fanen;
- at timeren kan stoppes ved å slå av `data-timer.yml`.

### 4.8 Spec, fremdrift og utsatte punkter

- **Spec:** ny `spec-1-11g-timer.md` gjennom `bmad-build`.
- **`deferred-work.md`:** nytt punkt om å bytte sovingen med environment og wait timer når en admin har laget det.
- **Andre filer:** `fremdriftsplan.md` og KI-loggen oppdateres.
- **`sprint-status.yaml`:** 1.11 forblir `in-progress` til målingen etter merge er ferdig.

## 5. Overlevering

- **Omfang:** lite. Amelia (`bmad-build`) bygger på `story/1-11g-timer`. Det blir en PR med Joseph som reviewer, og Aksel godkjenner push og merge.

**Ferdig når:**

1. `npm run lint`, `typecheck`, `npm test` og `build:demo` er grønne lokalt, og CI, E2E og `data` er grønne på PR-en.
2. Kjøringen av `data.yml` på PR-en viser at `timer` blir skipped utenfor `main`.
3. Etter merge viser Actions-fanen at kjøringen etter merge startet `data-timer.yml`, og at timeren startet `data.yml` rundt 55 minutter senere.
4. Et døgn med måling på `https://snowfinder-seven.vercel.app/data/latest.json` viser data under 90 minutter gamle i minst 20 av 24 timer. Da settes 1.11 og Epic 1 til `done`.
