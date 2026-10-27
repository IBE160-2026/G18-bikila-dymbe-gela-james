# Tidslinje, milepæler og aktivitetsdiagram

## 2026-10-27 kl. 22:58 — Joseph

### Oppgave
Joseph ba om å organisere prosjektet: tegne tidslinjen og milepælene med datoer, plassere dem i riktige fasemapper og lage en regel i `AGENTS.md` om at de skal oppdateres. Underveis ba han også om et aktivitetsdiagram for arbeidsflyten fram til fristen. Tidligere i økten svarte jeg på spørsmål om gjenstående godkjenninger, opprydding, tester (alt grønt på `main` og #66), antall stories, SRS og app eller nettside.

### Plan
- Status står fortsatt bare i fremdriftsplanen (regel i `AGENTS.md`). Derfor fikk milepælene datoer, fremdriftsplanen tidslinjen, og aktivitetsdiagrammet ble en egen prosessfil uten status.
- Datoer for det som er gjort, er hentet fra datoen PR-ene ble merget. Framtidige frister er merket «forslag».
- Endringen i `AGENTS.md` gikk gjennom `bmad-project-context` og ble godkjent av Joseph.
- Følger opp [synlig PR for Sena](998-2026-10-27-21-40-29-synlig-pr-for-sena-story-3-7.md).

### Resultat
- **PR #68** (`docs/tidslinje-og-milepaeler`): CI og E2E er grønne. Den inneholder:
  - `2-Planleggingsfasen/milepæler.md` med datoer og F1–F5
  - «Tidslinje» (Gantt og datotabell) i `fremdriftsplan.md`
  - nye `3-Gjennomføringsfasen/aktivitetsdiagram.md`
  - regelen i `AGENTS.md`
  - README-lenker
  - KI-logg
  - Story 3.6 satt til `done` i `sprint-status.yaml`
- Begge Mermaid-diagrammene er parset uten feil med `mermaid@11.4.1`.
- #63 (3.6) ble merget av Aksel uten formell «Approve». Det er notert i fremdriftsplanen.
- Ingen greiner er slettet ennå. Det venter på et ja fra Joseph.

### Åpne punkter
- Gruppa vedtar eller endrer de foreslåtte fristene (M4 01.11, F3 04.11, M1/M5 11.11, F4 16.11, F5 23.11), og «forslag» byttes med «vedtatt».
- Se at Gantt-diagrammet og aktivitetsdiagrammet vises riktig på GitHub før #68 merges.
- Slette de ferdige greinene på GitHub og lokalt når Joseph sier ja.
