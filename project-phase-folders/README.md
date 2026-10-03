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
  men i repo-roten: `src/`, `shared/`, `supabase/`, `scripts/`, `tests/`, `.github/workflows/`
  (full mappestruktur og begrunnelse i
  [`2-Planleggingsfasen/SnowFinder-Arkitektur.md`](2-Planleggingsfasen/SnowFinder-Arkitektur.md)):
  - **Der nå:** ingenting — mappene er ikke opprettet ennå
  - **Kommer etter hvert:**
    - `src/` — frontend: sider, komponenter, hooks (Norgeskart, stedssider, filter,
      SnowScore-forklaringsside)
    - `shared/` — den ene SnowScore-formelen, brukt av både frontend-kalkulatoren og pipelinen
    - `supabase/` — migrasjoner og Edge Functions: datapipeline (fetch → validate → score →
      stage → publish → alert), tilbakemelding, snøvarsel, sletting av utdaterte data
    - `scripts/` — engangsskript som bygger stedskatalogen fra OSM/Kartverket
    - `tests/` — E2E- og kontraktstester
    - `.github/workflows/` — CI/CD
