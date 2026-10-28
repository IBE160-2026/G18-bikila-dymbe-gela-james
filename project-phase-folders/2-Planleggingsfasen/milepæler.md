# Milepæler

Rekkefølgen følger utviklingsprosessen i produktbriefen: stedskatalog og pipeline → SnowScore
→ kart og stedssider → filter → «bør ha»-funksjoner.

Tidslinjen med alle milepælene står i
[fremdriftsplanen](../3-Gjennomføringsfasen/fremdriftsplan.md#tidslinje), og hver aktivitet som
fører fram til dem står i [aktivitetslisten](../3-Gjennomføringsfasen/aktivitetsdiagram.md#aktivitetsliste).

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
| 1 | Stedskatalog og datapipeline (MET, NVE, Kartverket, OSM) | Epic 1, sprint 1–2 | Katalog og pipeline nådd 2026-10-08 (PR #18, #23, #24). Timesjobb og publisering (1.11): 2026-11-11, forslag. Har ikke faglærer satt GitHub Pages til «GitHub Actions» innen 2026-11-04, brukes reserven i Story 1.11 (datafila på grenen `data`) |
| 2 | SnowScore-beregning og forklaringsside | Epic 1 (1.4) og Epic 2, sprint 1 | 2026-10-09, nådd (PR #20, #33–#36) |
| 3 | Norgeskart og stedssider | Epic 1 (1.7–1.9), sprint 2 | 2026-10-08, nådd (PR #25–#32) |
| 4 | Filter (nysnø, vind, sol, temperatur, avstand, stedstype, nysnø siste 24 timer) | Epic 3, sprint 3 | 3.1–3.7 nådd 2026-10-28 (PR #48–#66). Hele filteret med 3.8: 2026-11-01, forslag |
| 5 | «Bør ha» ferdig og kodefrys for v1: robusthet ved nedetid (1.6) og beste skivindu (4.2). Etter dette bygges bare rettinger fra brukertesten (snøvarsel og tilbakemelding er «Ikke i v1») | 1.6 og 4.2 i sprint 4, 2.4 i sprint 1 | 2026-11-11, forslag |
| 6 | Levering og demo | Avslutningsfasen | 2026-11-25, vedtatt ([referat 2026-10-25](../3-Gjennomføringsfasen/møtereferater/2026-10-25-møtereferat.md)) |

## Forslaget fra 2026-10-28

Fra 28. oktober er det fire uker igjen til levering. Fristene er satt slik at hver del får omtrent
én uke, og at det er plass til å rette det brukertesten finner:

- **Uke 44 (28. oktober–1. november): filteret ferdig (M4).** 3.7 er merget, og 3.8 er bygget. Det
  som gjenstår, er synlig PR, review og merge. Steg 8c starter samtidig, fordi det ikke avhenger av
  koden.
- **Uke 45 (2.–8. november): sprint 4 og steg 8c (F3).** 1.6 og 4.2 bygges parallelt av to
  personer, fordi de berører ulike filer (banner for gamle data og stedssiden). Steg 8c må være
  ferdig 4. november, så brukertestplanen er klar i god tid. Samme dag avgjør vi reserven for
  Story 1.11.
- **9.–11. november: kodefrys (M1 og M5).** Siste v1-stories merges, og 1.11 settes i drift.
  Brukertesten skal teste den ferdige appen, ikke en halvferdig versjon.
- **12.–16. november: brukertest (F4).** Minst fem personer, etter planen fra steg 8c.
- **17.–20. november: rettinger etter brukertesten.** Bare kritiske funn bygges, som egne
  `fix`-PR-er med review. Resten skrives inn i sluttrapporten som videre arbeid.
- **16.–23. november: sluttrapport og presentasjon (F5).** Starter mens rettingene pågår, fordi
  det meste av innholdet allerede finnes i fremdriftsplanen, KI-loggen og retrospektivene.
- **24. november: generalprøve.** `npm ci && npm run dev` etter README på en ren maskin.
- **25. november: levering og demo (M6).**

Hvor langt vi har kommet på hver milepæl, står i
[fremdriftsplanen](../3-Gjennomføringsfasen/fremdriftsplan.md). Datoene her endres når en
milepæl nås, når gruppa vedtar en frist, eller når en frist flyttes. Endringen gjøres i samme PR
som oppdaterer tidslinjen.
