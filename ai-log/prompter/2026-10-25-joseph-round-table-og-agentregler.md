# 2026-10-25: Status, round table og opprydding i agentreglene

**Hvem:** Joseph
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-build` (spec for Story 3.4), `bmad-party-mode` (alle agentene) og `bmad-project-context` (AGENTS.md)
**Fase:** Gjennomføring
**Resultat:**
- Spec for Story 3.4 (hurtigvalg) er godkjent og står som `ready-for-dev` på greina `story/3-4-hurtigvalg`. Den leveres i egen PR.
- Round table med agentene om feil og svakheter i prosjektet.
- `AGENTS.md` er ryddet opp, og regelen om review fra et gruppemedlem før merge er innført.
- `sprintplan.md` noterer at 3.5 ble bygget før 3.4. `fremdriftsplan.md` noterer den nye review-regelen.

## Prompter

### 1
> connnect to https://github.com/IBE160-2026/G18-bikila-dymbe-gela-james

**Svar (kort):** Repoet var allerede koblet. Lokal `main` lå 83 commits bak og ble spolt fram.

### 2
> hvor er vi nå ?

**Svar (kort):** Epic 1 og 2 og Må ha i Epic 3 er ferdige, og 3.5 er ferdig. Neste er 3.4. 1.11 venter på faglærer.

### 3
> kjør neste story

**Svar (kort):** `bmad-build` lagde en spec for 3.4. Joseph valgte verdiene «Ekte pudder» (Pudderdag: nysnø ≥ 10 cm, vind ≤ 8 m/s, temp ≤ −2 °C; Sol etter snøfall: nysnø ≥ 5 cm, skydekke ≤ 30 %) og at et hurtigvalg erstatter hele filteret.

### 4
> godkjenn og stopp

**Svar (kort):** Specen står som `ready-for-dev`, og ingen kode er skrevet.

### 5
> du må nå samle alle agentene på en round table discussion om arbeidet vi gjør. vi vil at de kommer med noen anbefalinger og hvis evt. vi har gjørt noe feil mens vi jobbet  med prosjektet frem til nå.

**Svar (kort):** Funn: skjev fordeling av commits (Aksel 67, Joseph 34, Bård 3, Kelly 1), ingen møtereferater, steg 8c (wireframes og brukertestplan) ikke startet, UX-dokumentene har glidd fra koden, appen er ikke publisert, og E2E var rød i PR #33–#38 uten at noen så det.

### 6
> sjekk også evt. svakheter

**Svar (kort):** MET-hentingen respekterer ikke `Expires`/`If-Modified-Since` og håndterer ikke `429`. Ingen side setter `document.title` (WCAG 2.4.2). SnowScore er aldri sjekket mot observert snø. Hurtigvalgene gir null treff i demodata. Bussfaktor 1.

### 7
> hva er feilen her [AGENTS.md limt inn]

**Svar (kort):** Ni motsigelser og utdaterte linjer, blant annet grennavn, språket i story-specs, «planleggingen er ferdig», commit-stil og «lim resultatet inn i PR-en».

### 8
> Kan du fikse dette ? hva med våres mappestruktur på git ? er den greit ?

**Svar (kort):** `bmad-project-context` rettet AGENTS.md etter Josephs valg: commit-meldinger med prefiks og norsk beskrivelse, og `CONTRIBUTING.md` slettes. Mappestrukturen er god for koden. Svakhetene er gamle greiner på GitHub, tomme fasemapper og to kopier av planleggingsdokumentene.

**Hva vi gjorde med det:**
- Claude trakk tilbake påstanden om at kursets skjermkrav sa imot forbudet mot kontoer, fordi AGENTS.md allerede sier at slike funksjoner aldri skal bygges.

### 9
> hvor har vi filen for de faste regler agentene skal følge ?

**Svar (kort):** `AGENTS.md` i rota. `CLAUDE.md` importerer den.

### 10
> kan du oppdatere disse reglene i agent.md slik at andre i gruppen ta review etter en story er ferdig ?

**Svar (kort):** En story-PR krever nå godkjenning fra et annet gruppemedlem, og vi bytter på hvem som tar review. `docs/`-PR-er er unntatt.

**Hva vi gjorde med det:**
- SM-8 i PRD-en sier fortsatt at godkjenning er fjernet. Den skal oppdateres via `bmad-correct-course`.
- Regelen håndheves ikke av GitHub før faglærer slår på grenbeskyttelse.

### 11
> ja , committe den og push til git

**Svar (kort):** Committet og pushet. Pre-push-hooken stoppet først fordi `npm ci` ikke var kjørt etter at 83 commits ble hentet. Aksel laget PR #54.

### 12
> be andre ta review

**Svar (kort):** Missbikila og kellygela ble bedt om review på PR #54, og bakgrunnen ble lagt i en kommentar.

### 13
> kan du fortsette med mappestrukturen ?

**Svar (kort):** 21 ferdig-mergede greiner ble slettet på GitHub, og alle ble sjekket mot `main` først. README forklarer BMad-mappene, kommentaren i hooken er rettet, og `project-workspace/party-mode/` er lagt i `.gitignore` (PR #55).

**Hva vi gjorde med det:**
- Den lokale greina `story/3-4-hurtigvalg` ble slettet ved et uhell, fordi den ikke hadde egne commits. Den ble gjenopprettet med en gang, og specen lå trygt i stash.

### 14
> be sena ta review og skriv lenken her

### 15
> missbikila mente jeg

### 16
> legg dette i agent.md som ny regel, før opp altid møteprotokol vi har samt oppdater prosjekt fremgang i rikig mappe også. Du skal oppdatere storyene vi er ferdig med. har vi slik opplegg i dag ?

**Svar (kort):** Bare delvis. Det finnes ingen regel om møtereferater (og ingen referater), fremdriftsplanen ble oppdatert av vane, og `done` i `sprint-status.yaml` settes for hånd.

### 17
> flytt den og jeg godkjenner

**Svar (kort):** `fremdriftsplan.md` er flyttet til `3-Gjennomføringsfasen/`, og alle lenker er rettet. AGENTS.md har nye regler for møtereferat, `done` i `sprint-status.yaml` og oppdatering av fremdriftsplanen i samme PR som storyen.

### 18
> Hele gruppen er her . rydd opp nå

**Svar (kort):** Utdatert status ble fjernet fra `milepæler.md` og `sprintplan.md`, og mappebeskrivelser som lovet innhold som ikke fantes, ble rettet.

### 19
> 25 November har vi satt som dato men den er egentlig i desember . / bare bruk 25 november som egentlig dato

### 20
> -Joseph , Sena, Aksel og Kelly / Joseph skal rydde mappstruktur, oppdatere regler i agent.md, neste møtet fordeler vi arbeidsoppgaver. Kelly kjører koden senere i kveld når jeg er ferdig med de oppgaver jeg jobber med. Sena kjører også Storyer etter kelly er ferdig. Aksel kjører storyene deretter.

**Svar (kort):** Første møtereferat skrevet, og specen for 3.4 pushet til `story/3-4-hurtigvalg` så Kelly kan bygge den.

### 21
> kjør på / ta neste

**Svar (kort):** PR #54 og #55 merget. E2E i #54 var rød fordi axe målte mens bunn-arket fadet inn. Rettet i `bmad-build` (oneshot) med Blind Hunter: axe-hjelperen emulerer nå redusert bevegelse.

**Hva vi gjorde med det:**
- Claude endret tilnærming etter gjennomgangen, fra å vente på animasjonene til å emulere redusert bevegelse. Feilen ble gjenskapt med kunstig treg animasjon før og etter rettingen.
