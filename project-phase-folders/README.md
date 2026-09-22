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

## `project-phase-folders/` vs. `project-workspace/`

- **`project-phase-folders/`** (denne mappen) — gruppens kuraterte dokumentasjon:
  - **Der nå:** produktbrief (`1-Oppstartsfasen/`), arkitektur og milepæler
    (`2-Planleggingsfasen/`), møtereferat-mal (`3-Gjennomføringsfasen/`)
  - **Kommer etter hvert:** PRD, UX/UI-spesifikasjon, epics/stories, sprint-plan, testplan
    (`2-Planleggingsfasen/`), sprint-status, kodegjennomganger, endringslogg
    (`3-Gjennomføringsfasen/`), sluttrapport, retrospektiv, leveranse (`4-Avslutningsfasen/`)
- **`project-workspace/`** — BMAD-verktøyets arbeidsmappe:
  - **Der nå:** `planning-artifacts/product-brief.md` og
    `planning-artifacts/architecture/architecture-*/` (utkastene bak produktbriefen og
    arkitekturen over)
  - **Kommer etter hvert:** flere kjøringer i `planning-artifacts/` (PRD, epics/stories), samt
    `implementation-artifacts/` og `test-artifacts/` når utvikling og testarbeid starter
