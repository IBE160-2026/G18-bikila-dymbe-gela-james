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

## Forholdet til `project-workspace/planning-artifacts/`

`project-workspace/planning-artifacts/` er BMAD-verktøyets egen arbeidsmappe — der agentene
(f.eks. Winston/arkitekt) skriver rå utkast og kjørelogg (`.memlog.md`) mens et dokument
utarbeides. Den inneholder for øyeblikket:

- `product-brief.md` — samme innhold som
  [`1-Oppstartsfasen/SnowFinder-Produktbrief.md`](1-Oppstartsfasen/SnowFinder-Produktbrief.md),
  men uten kuratering/omdøping
- `architecture/architecture-*/` — kjøremappen bak
  [`2-Planleggingsfasen/SnowFinder-Arkitektur.md`](2-Planleggingsfasen/SnowFinder-Arkitektur.md),
  inkludert `.memlog.md` (hver beslutning logget underveis, inkl. versjonssjekk og
  motstridende gjennomganger)

Denne mappen er ikke gruppens leveranse — den ferdige, navngitte og kuraterte versjonen av
hvert dokument ligger i riktig fasemappe over. `project-workspace/` er bare til referanse hvis
noen vil se hvordan et dokument ble til.
