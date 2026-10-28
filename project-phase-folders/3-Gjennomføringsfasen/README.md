# 3 — Gjennomføringsfasen

Formål: dokumentere selve utviklingsarbeidet — hva som ble bygget, testet og endret, sprint
for sprint.

## Innhold (legges til etter hvert)

- **[`fremdriftsplan.md`](fremdriftsplan.md)** — hvor vi er nå, [tidslinjen](fremdriftsplan.md#tidslinje)
  fra oppstart til levering, stegene og status for hver story. Oppdateres i samme PR som hver
  ferdige story og etter hvert møte som endrer planen.
- **[`aktivitetsdiagram.md`](aktivitetsdiagram.md)** — arbeidsflyten fram til levering
  2026-11-25 (storyene som gjenstår, Story 1.11, steg 8c, brukertest og sluttrapport), og
  [aktivitetslisten](aktivitetsdiagram.md#aktivitetsliste) med alle epics og stories, avhengigheter,
  ansvarlig og frist
- **[`møtereferater/`](møtereferater/)** — ett referat per gruppemøte

## Hvor resten ligger

Dette lages av BMad-verktøyet og ligger i `project-workspace/`. Det lenkes hit i stedet for å
kopieres, så det bare finnes én versjon:

- **Kodegjennomganger** — hver story-spec har en «Review Triage Log» med alle funn og hva som ble
  gjort med dem: [`implementation-artifacts/spec-*.md`](../../project-workspace/implementation-artifacts/).
  Funn som ble utsatt: [`deferred-work.md`](../../project-workspace/implementation-artifacts/deferred-work.md).
- **Endringshåndtering** — endringsforslagene (`sprint-change-proposal-*.md`) i
  [`planning-artifacts/`](../../project-workspace/planning-artifacts/), og avvik fra sprintplanen i
  [`sprintplan.md`](../2-Planleggingsfasen/sprintplan.md).
- **Retrospektiv** — [Epic 2](../../project-workspace/implementation-artifacts/epic-2-retro-2026-10-09.md).
- **Story-status** — [`sprint-status.yaml`](../../project-workspace/implementation-artifacts/sprint-status.yaml)
  (maskinlesbar, brukes av BMad).
- **QA / testresultater** — fasittabeller i [`tests/golden/`](../../tests/golden/), kontraktstester
  mot MET og NVE i [`tests/contract/`](../../tests/contract/), og Playwright med axe i
  [`tests/e2e/`](../../tests/e2e/). Resultatet av brukertesten kommer hit.

## Forrige / neste steg

Bygger videre på [`2-Planleggingsfasen/`](../2-Planleggingsfasen/). Når prosjektet er levert,
oppsummeres det i [`4-Avslutningsfasen/`](../4-Avslutningsfasen/).
