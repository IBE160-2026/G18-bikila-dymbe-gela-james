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
| F3 | Wireframes, kursets skjermkrav og brukertestplan (steg 8c) | Planleggingsfasen | 2026-10-28, nådd. Forslaget var 2026-11-04 |
| F4 | Brukertest med minst fem personer | [Gjennomføringsfasen](../3-Gjennomføringsfasen/) | 2026-11-19, forslag (var 2026-11-16). Test 17.–19. november, se [brukertest/](../3-Gjennomføringsfasen/brukertest/) |
| F5 | Sluttrapport og presentasjon klare | [Avslutningsfasen](../4-Avslutningsfasen/) | Etter levering 2026-12-02, dato ikke satt (var 2026-11-23). Skrives etter leveringen, vedtatt av gruppa 2026-11-18 |

## Produktmilepæler

| # | Milepæl | Epic og sprint | Frist |
|---|---|---|---|
| 1 | Stedskatalog og datapipeline (MET, NVE, Kartverket, OSM) | Epic 1, sprint 1–2 | Katalog og pipeline nådd 2026-10-08 (PR #18, #23, #24). Timesjobb og publisering (1.11): merget 2026-11-01 (PR #78), grenen `data` oppdateres, appen ikke publisert før Vercel er satt opp. I drift og nådd 2026-11-15: 232 grønne kjøringer siden 8. november, lengste opphold 58 min siste døgn (frist var 2026-11-11). Jobben skriver alltid datafila til grenen `data`, og Vercel publiserer appen fra `main` (GitHub Pages er slått av i emnet, 2026-11-01) |
| 2 | SnowScore-beregning og forklaringsside | Epic 1 (1.4) og Epic 2, sprint 1 | 2026-10-09, nådd (PR #20, #33–#36) |
| 3 | Norgeskart og stedssider | Epic 1 (1.7–1.9), sprint 2 | 2026-10-08, nådd (PR #25–#32) |
| 4 | Filter (nysnø, vind, sol, temperatur, avstand, stedstype, nysnø siste 24 timer) | Epic 3, sprint 3 | 2026-10-28, nådd (PR #48–#71). Forslaget var 2026-11-01 |
| 5 | «Bør ha» ferdig og kodefrys for v1: robusthet ved nedetid (1.6) og beste skivindu (4.2). Ingen nye stories etter 2026-11-16, og etter brukertesten bygges bare kritiske rettinger fram til kodefrysen (snøvarsel og tilbakemelding er «Ikke i v1») | 1.6 og 4.2 i sprint 4, 2.4 i sprint 1 | Storyene er nådd: 4.2 2026-10-28 (PR #74), 1.6 2026-10-29 (PR #77). Kodefrys 2026-11-28, vedtatt av gruppa 2026-11-18 (var 2026-11-11 og 2026-11-21). «Best akkurat nå» kan bygges etter 16. november hvis endringsforslaget godkjennes |
| 6 | Levering og demo | Avslutningsfasen | 2026-12-02, vedtatt av gruppa 2026-11-18. Var 2026-11-25, vedtatt ([referat 2026-10-25](../3-Gjennomføringsfasen/møtereferater/2026-10-25-møtereferat.md)). Faglærer må godta den nye datoen |

## Forslaget fra 2026-10-28

Fra 28. oktober er det fire uker igjen til levering. Fristene er satt slik at hver del får omtrent
én uke, og at det er plass til å rette det brukertesten finner:

- **Uke 44 (28. oktober–1. november): steg 8c starter.** Filteret (M4) ble ferdig 28. oktober med
  3.7 og 3.8, fire dager før forslaget. Steg 8c kan starte nå, fordi det ikke avhenger av koden.
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
- **24. november: generalprøve.** `npm ci && npm run dev:demo` med det faste testdatasettet, og `npm ci && npm run dev` med ekte data, etter README på en ren maskin.
- **25. november: levering og demo (M6).**

Hvor langt vi har kommet på hver milepæl, står i
[fremdriftsplanen](../3-Gjennomføringsfasen/fremdriftsplan.md). Datoene her endres når en
milepæl nås, når gruppa vedtar en frist, eller når en frist flyttes. Endringen gjøres i samme PR
som oppdaterer tidslinjen.

## Forslaget fra 2026-11-15

Kodefrysen 11. november og brukertesten 12.–16. november holdt ikke: Story 1.8b og 3.9 ventet på
godkjenning, og PRD-en ble revidert etter faglærers tilbakemelding. Aksel foreslo nye datoer
2026-11-15, og gruppa bekrefter dem på neste møte:

- **15.–16. november: rekruttering.** 5–6 deltakere, én i reserve. Ingen nye stories etter 16. november.
- **17.–19. november: brukertest (F4).** Etter [materiellet i brukertest/](../3-Gjennomføringsfasen/brukertest/).
  Har vi under fem avtaler 18. november, måler vi SM-3 i den minimale testen med minst tre personer.
- **19.–20. november: resultatene** fylles ut i `brukertest/resultater.md`.
- **20.–21. november: kritiske rettinger** som `fix`-PR-er med review. **21. november: kodefrys (M5).**
  Timesjobben (M1) ble nådd allerede 15. november.
- **21.–23. november: funnene inn i sluttrapporten (F5).** Generalprøve 24. november og levering
  25. november står som før.

## Vedtaket fra 2026-11-18

Aksel utsatte kodefrysen og leveringen én uke 2026-11-18, så det er tid til rettingene etter
brukertesten og til forsiden «Best akkurat nå» (topp 3 steder). Sluttrapporten skrives etter
leveringen. Gruppa bekreftet datoene samme dag, og faglærer må godta den nye leveringsdatoen:

- **17.–19. november: brukertest (F4)** som før.
- **19.–27. november: rettinger og «Best akkurat nå».** Rettingene kommer fra gjennomgangen av nettsiden
  2026-11-18 og fra brukertesten, som `fix`-PR-er med review. «Best akkurat nå» er en ny story og går
  først gjennom `bmad-correct-course`, fordi den bryter regelen om ingen nye stories etter 16. november.
- **28. november: kodefrys (M5).**
- **1. desember: generalprøve** etter README på en ren maskin.
- **2. desember: levering og demo (M6).**
- **Etter 2. desember: sluttrapport og presentasjon (F5).** Datoen er ikke satt.
