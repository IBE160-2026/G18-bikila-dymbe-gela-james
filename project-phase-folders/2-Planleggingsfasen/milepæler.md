# Milepæler

Rekkefølgen følger utviklingsprosessen i produktbriefen: stedskatalog og pipeline → SnowScore
→ kart og stedssider → filter → «bør ha»-funksjoner.

Tidslinjen med alle milepælene står i
[fremdriftsplanen](../3-Gjennomføringsfasen/fremdriftsplan.md#tidslinje).

## Hvordan datoene leses

- **Nådd:** datoen milepælen ble nådd, hentet fra datoen PR-en ble merget.
- **Vedtatt:** fristen er bestemt av gruppa på et møte (lenke til referatet).
- **Forslag:** fristen er foreslått, men ikke vedtatt. Gruppa bekrefter eller endrer den på neste
  møte, og da byttes «Forslag» ut med «Vedtatt».

## Fasemilepæler

| # | Milepæl | Fase | Dato |
|---|---|---|---|
| F1 | Produktbrief ferdig (steg 1) | [Oppstartsfasen](../1-Oppstartsfasen/) | 2026-09-22, nådd |
| F2 | Planleggingen ferdig etter faglærers tilbakemelding: PRD v3, arkitektur v4, UX, epics og sprintplan (steg 2–8d) | Planleggingsfasen | 2026-10-07, nådd (PR #8–#21) |
| F3 | Wireframes, kursets skjermkrav og brukertestplan (steg 8c) | Planleggingsfasen | 2026-11-04, forslag |
| F4 | Brukertest med minst fem personer | [Gjennomføringsfasen](../3-Gjennomføringsfasen/) | 2026-11-16, forslag |
| F5 | Sluttrapport og presentasjon klare | [Avslutningsfasen](../4-Avslutningsfasen/) | 2026-11-23, forslag |

## Produktmilepæler

| # | Milepæl | Epic og sprint | Frist |
|---|---|---|---|
| 1 | Stedskatalog og datapipeline (MET, NVE, Kartverket, OSM) | Epic 1, sprint 1–2 | Katalog og pipeline nådd 2026-10-08 (PR #18, #23, #24). Timesjobb og publisering (1.11): 2026-11-11, forslag. Venter på at faglærer setter GitHub Pages til «GitHub Actions» |
| 2 | SnowScore-beregning og forklaringsside | Epic 1 (1.4) og Epic 2, sprint 1 | 2026-10-09, nådd (PR #20, #33–#36) |
| 3 | Norgeskart og stedssider | Epic 1 (1.7–1.9), sprint 2 | 2026-10-08, nådd (PR #25–#32) |
| 4 | Filter (nysnø, vind, sol, temperatur, avstand, stedstype) | Epic 3, sprint 3 | 2026-11-01, forslag |
| 5 | «Bør ha»: beste skivindu og kalkulator (snøvarsel og tilbakemelding er «Ikke i v1») | 1.6 og 4.2 i sprint 4, 2.4 i sprint 1 | 2026-11-11, forslag |
| 6 | Levering og demo | Avslutningsfasen | 2026-11-25, vedtatt ([referat 2026-10-25](../3-Gjennomføringsfasen/møtereferater/2026-10-25-møtereferat.md)) |

Hvor langt vi har kommet på hver milepæl, står i
[fremdriftsplanen](../3-Gjennomføringsfasen/fremdriftsplan.md). Datoene her endres når en
milepæl nås, når gruppa vedtar en frist, eller når en frist flyttes. Endringen gjøres i samme PR
som oppdaterer tidslinjen.
