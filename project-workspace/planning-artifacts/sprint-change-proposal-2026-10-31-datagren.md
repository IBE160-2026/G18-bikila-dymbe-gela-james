# Sprint Change Proposal: Appen leser reserven på grenen `data`

**Dato:** 2026-10-31
**Utløst av:** Aksels valg i Story 1.11 (2026-10-31): appen skal lese reserven selv
**Modus:** batch
**Omfang:** Minor. Koden er bygget i Story 1.11, og bare dokumenter endres her.
**Godkjent:** Aksel (2026-10-31). **Erstattes av** `sprint-change-proposal-2026-10-31-ekte-data-som-standard.md` hvis det forslaget godkjennes.

## 1. Problem

Story 1.11 sier at appen kan lese `latest.json` fra `raw.githubusercontent.com` når GitHub Pages ikke er på. FR-30 og AD-10 sier derimot at et rent klon viser demodata. Aksel valgte at appen leser fila selv, så de to kravene må stemme overens. Sjekket 2026-10-31: API-et viser `has_pages: false`, så reserven er det som gjelder i dag.

## 2. Konsekvenser

| Område | Konsekvens |
|---|---|
| Epics og stories | Story 1.10 får en merknad. Story 1.11 er presisert. Ingen nye stories. |
| PRD | FR-30 og SM-14 endres. |
| Arkitektur | AD-10 og tabellen over kjøremåter endres, i begge kopier. Ingen ny AD. |
| UX | Ingen. Demobanneret vises fortsatt bare på demodata. |
| Sensor | `npm ci && npm run dev` virker fortsatt uten nøkler og nett. Med nett og en fersk fil på grenen vises ekte data og ikke demodata. Demodata kan alltid ses med `npm run build && npm run preview`. |
| Risiko | Uten reserven ville sensor alltid sett det samme. Nå avhenger det av om timesjobben har gått siste 12 timer. Enhver feil gir demodata, så appen stopper ikke. |

## 3. Anbefaling

Direkte justering. Ingen story reverteres, og fristene endres ikke. Grenen leses bare under `npm run dev`, så regelen om at produksjon aldri viser demodata (AD-10) står som før, og E2E er uendret.

## 4. Endringer

### Epics: Story 1.10

Etter kriteriet om `src/lib/data/`, legges til:

> `[v5, 2026-10-31: Story 1.11 legger til grenen `data` mellom de to, bare under `npm run dev`. Uten nett, eller ved enhver feil, vises fortsatt demodatasettet.]`

Begrunnelse: kriteriet var riktig da storyen ble bygget, og historikken beholdes.

### Epics: Story 1.11

**Gammelt:** `og `src/lib/data/` kan lese den fra `raw.githubusercontent.com`. Da får en lokalt kjørt app ferske data hver time uten hosting`

**Nytt:** `og `src/lib/data/` leser den fra `raw.githubusercontent.com` under `npm run dev`, når fila er under 12 timer gammel. Da får en lokalt kjørt app ferske data hver time uten hosting. Enhver feil gir demodata`

### PRD: FR-30, innledningen

**Gammelt:** `Det krever ikke nøkler eller nettverkskall til MET og NVE. Appen viser da et demodatasett.`

**Nytt:** `Det krever ikke nøkler eller nettverkskall til MET og NVE. Uten nett viser appen da et demodatasett. *(endret v5, 2026-10-31)* Med nett kan `npm run dev` i stedet vise ekte data fra grenen `data`, hvis timesjobben har lagt en fil der som er under 12 timer gammel. Enhver feil ved lesingen gir demodatasettet.`

### PRD: FR-30, README-punktet

**Gammelt:** `demodata, som anbefales for sensor;`

**Nytt:** `demodata, som anbefales for sensor; *(endret v5)* med nett vises de med `npm run build && npm run preview`;`

### PRD: SM-14

**Gammelt:** `starter appen i demomodus fra et rent klon kun etter README`

**Nytt:** `starter appen fra et rent klon kun etter README, i demomodus eller *(v5)* med ekte data fra grenen `data``

### Arkitektur: AD-10, «Files» (på engelsk)

**Gammelt:** `` `src/lib/data/` loads `latest.json` and falls back to `demo.json` when it is absent, which is the case on a clean clone. ``

**Nytt:** `` `src/lib/data/` loads `latest.json` and falls back to `demo.json` when it is absent, which is the case on a clean clone. *(v5, 2026-10-31)* While Pages is off, the scheduled job publishes `latest.json` to the branch `data`. Under `npm run dev` only, the app reads that file between the two, when it is under 12 h old and at least one place survives the age limit. Every problem with it gives `demo.json`. ``

### Arkitektur: AD-10, «One mode flag»

**Gammelt:** `No environment variable switches behaviour.`

**Nytt:** `No environment variable switches behaviour. Vite's build mode (`import.meta.env.DEV`) decides only whether the branch `data` is read, so the production build and E2E never read it.`

### Arkitektur: tabellen over kjøremåter

**Gammelt (sensor):** `| Examiner / first run | `npm ci && npm run dev` | `demo.json` (committed) | Node 24 or 26+ |`

**Nytt:** `| Examiner / first run | `npm ci && npm run dev` | `demo.json` (committed), or the branch `data` when it has a file under 12 h old | Node 24 or 26+ |`

**Gammelt (`data.yml`):** `| `data.yml` (hourly, on push to `main`, and manual) | `npm run data`, build, deploy to Pages only if `latest.json` was produced | live | Actions and Pages enabled in the repo |`

**Nytt:** `| `data.yml` (hourly, on push to `main`, and manual) | `npm run data`, build, then deploy to Pages when Pages is set to GitHub Actions, otherwise publish `latest.json` to the branch `data`; only if `latest.json` was produced | live | Actions enabled in the repo |`

## 5. Overlevering

- **Omfang:** Minor. Endringene gjøres i PR-en for Story 1.11, i begge kopier av PRD og arkitektur.
- **Ferdig når:** dokumentene stemmer med koden, kopiene er like, og en sjekk etter første kjøring viser at `npm run dev` på et rent klon leser fila uten CORS-feil.
