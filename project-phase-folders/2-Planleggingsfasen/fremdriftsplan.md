# Fremdriftsplan

Oversikt over hvordan vi går fram, steg for steg, så alle kan følge med selv om de ikke var
på møtet. Oppdater statusen når et steg er ferdig.

**Sist oppdatert:** 2026-09-27

## Slik holder du deg oppdatert

1. Se **Hvor er vi nå?** under.
2. Les siste referat i [`møtereferater/`](../3-Gjennomføringsfasen/møtereferater/).
3. Se promptene fra siste økt i [`ai-log/prompter/`](../../ai-log/prompter/).

## Hvor er vi nå?

Mary har rettet briefen, John har skrevet [PRD-en](SnowFinder-PRD.md), Sally har levert
[DESIGN.md](SnowFinder-DESIGN.md)/[EXPERIENCE.md](SnowFinder-EXPERIENCE.md), og Winston har
oppdatert [arkitekturen](SnowFinder-Arkitektur.md) mot begge (AD-8: kart/liste er én rute; AD-9:
design-tokens har ett kildested i kode; AD-2 utvidet for mørketid-flagget). **Neste steg:** John
lager epics/stories fra PRD + oppdatert arkitektur + UX.

## Stegene

Vi bruker BMad Method med fem agenter. Hvert steg bygger på det forrige.

| # | Steg | Agent | Resultat | Ansvarlig | Frist | Status |
|---|---|---|---|---|---|---|
| 1 | Produktbrief | Emnets BMAD-mal | [Produktbrief](../1-Oppstartsfasen/SnowFinder-Produktbrief.md) | Aksel | 2026-09-22 | ✅ Ferdig |
| 2 | Første arkitekturgrunnlag | Winston (arkitekt) | [Arkitektur](SnowFinder-Arkitektur.md) | Joseph | 2026-09-22 | ✅ Ferdig |
| 3 | Rette opp briefen (SnowScore-formel m.m.) | Mary (analytiker) | Oppdatert produktbrief | Joseph | 2026-09-27 | ✅ Ferdig |
| 4 | Krav (PRD) | John (produktleder) | [PRD](SnowFinder-PRD.md) | Joseph | 2026-09-27 | ✅ Ferdig |
| 5 | Design og brukeropplevelse | Sally (UX-designer) | [DESIGN.md](SnowFinder-DESIGN.md) / [EXPERIENCE.md](SnowFinder-EXPERIENCE.md) | Joseph | 2026-09-27 | ✅ Ferdig |
| 6 | Oppdatere arkitekturen mot PRD og UX | Winston (arkitekt) | [Oppdatert arkitektur](SnowFinder-Arkitektur.md) | Joseph | 2026-09-27 | ✅ Ferdig |
| 7 | Epics og stories | John (produktleder) | Epics og stories | | | ⬜ Neste |
| 8 | Sprintplanlegging | John eller Winston | Sprintplan og frister i [milepæler](milepæler.md) | | | ⬜ |
| 9 | Bygge appen, én story om gangen | Amelia (utvikler) | Kode, tester, PR-er | | | ⬜ |
| 10 | Brukertest, sluttrapport og demo | Hele gruppen | [Avslutningsfasen](../4-Avslutningsfasen/) | | | ⬜ |

Steg 1 og 2 ble gjort før gruppen bestemte seg for denne rekkefølgen. Derfor kommer
arkitekturen før PRD-en, og Winston går gjennom den på nytt i steg 6.

## Hvorfor denne rekkefølgen?

- **Briefen rettes først** fordi PRD-en bygger direkte på den. Feil i SnowScore-formelen ville
  ellers blitt med videre.
- **Sally kommer etter PRD-en** fordi hun trenger kravene for å designe skjermene: kart,
  stedsside, filter og forklaringsside.
- **Stories lages etter arkitektur og UX**, slik at hver story kan vise til både krav, design
  og tekniske regler.
- **Amelia bygger én story om gangen** på egen branch, med Pull Request og godkjenning fra et
  gruppemedlem.

## Regler for alle

- Logg promptene fra hver KI-økt i [`ai-log/prompter/`](../../ai-log/prompter/).
- Skriv et møtereferat etter hvert gruppemøte.
- Ingen kode går rett inn i `main`. Alt går via Pull Request med grønne tester.
