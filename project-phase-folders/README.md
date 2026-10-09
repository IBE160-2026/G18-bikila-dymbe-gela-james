# Dokumentasjon — G18 SnowFinder (IBE160)

Denne mappen inneholder gruppens prosjektdokumentasjon for **SnowFinder**, organisert etter de
fire fasene i prosjektmodellen brukt i IBE160: oppstart, planlegging, gjennomføring og
avslutning.

| Mappe | Fase | Innhold |
|---|---|---|
| [`1-Oppstartsfasen/`](1-Oppstartsfasen/) | Oppstart | Produktbrief, mandat, roller, tidlige risikoer |
| [`2-Planleggingsfasen/`](2-Planleggingsfasen/) | Planlegging | Krav (PRD), arkitektur, epics/stories, sprint-plan, milepæler, testplan |
| [`3-Gjennomføringsfasen/`](3-Gjennomføringsfasen/) | Gjennomføring | Sprint-status, møtereferater, kodegjennomganger, endringer |
| [`4-Avslutningsfasen/`](4-Avslutningsfasen/) | Avslutning | Sluttrapport, retrospektiv, leveranse og presentasjon |
| [`assets/`](assets/) | — | Diagrammer, skjermbilder og bilder brukt i dokumentasjonen |

Produktet heter **SnowFinder** — en webapp som finner steder og tidspunkt med best
prognostiserte snøforhold, med **SnowScore** (0–100) som kjernemetrikk. Se
[`1-Oppstartsfasen/SnowFinder-Produktbrief.md`](1-Oppstartsfasen/SnowFinder-Produktbrief.md)
for full produktbrief.

## `project-phase-folders/` vs. `project-workspace/` vs. `ai-log/` vs. koden

- **`project-phase-folders/`** (denne mappen) — gruppens kuraterte dokumentasjon:
  - **Der nå:** produktbrief (`1-Oppstartsfasen/`), PRD, arkitektur, DESIGN/EXPERIENCE,
    epics/stories, sprintplan, milepæler og fremdriftsplan (`2-Planleggingsfasen/`),
    møtereferat-mal (`3-Gjennomføringsfasen/`)
  - **Kommer etter hvert:** testplan (`2-Planleggingsfasen/`), kodegjennomganger og
    endringslogg (`3-Gjennomføringsfasen/`), sluttrapport, retrospektiv og leveranse
    (`4-Avslutningsfasen/`)
- **`project-workspace/`** — BMAD-verktøyets arbeidsmappe:
  - **Der nå:** utkastene bak produktbrief, PRD, UX og arkitektur i `planning-artifacts/`
    (identiske med kopiene i denne mappen), og `implementation-artifacts/` med
    `sprint-status.yaml`, epic-kontekst og story-specs
  - **Kommer etter hvert:** `test-artifacts/` når testarbeidet starter
- **`ai-log/`** — løpende KI-bruksslogg på tvers av alle faser (ikke bare gjennomføring), per
  produktbriefens krav om å logge sentrale prompts, endrede/avviste forslag og godkjenning:
  [`logg.md`](../ai-log/logg.md) er sammendraget, og [`prompter/`](../ai-log/prompter/) har
  promptene ordrett, én fil per økt
- **`AGENTS.md` og `CLAUDE.md`** (repo-roten) — felles regler for KI-agentene: grener og PR,
  loggføring, språk og hvilke filer som må holdes like
- **Selve produktet (koden)** — verken i `project-phase-folders/` eller `project-workspace/`,
  men i repo-roten (full mappestruktur og begrunnelse i
  [`2-Planleggingsfasen/SnowFinder-Arkitektur.md`](2-Planleggingsfasen/SnowFinder-Arkitektur.md)):
  - `src/` — nettappen: Norgeskart, liste, stedsside og forklaringssiden «Slik beregner vi SnowScore»
  - `shared/` — kode som både appen og dataprogrammet bruker: den ene SnowScore-formelen,
    datakontraktene og aldersgrensene for data
  - `scripts/pipeline/` — dataprogrammet (`npm run data`), som henter MET og NVE og publiserer
    `public/data/latest.json`
  - `scripts/build-catalog/` — engangsskriptet som bygger stedskatalogen `data/catalog.json` fra
    OpenStreetMap og Kartverket
  - `public/data/demo.json` — demodataene som vises uten nett
  - `tests/` — kontraktstester mot lagrede MET- og NVE-svar, fasittabeller og E2E-tester (Playwright)
  - `.github/workflows/` — CI og E2E på hver PR, og `.githooks/` — pre-push-hooken
  - Det finnes ingen database og ingen Supabase. De ble tatt ut av v1 etter faglærers råd.
