# Fremdriftsplan

Oversikt over hvordan vi går fram, steg for steg, så alle kan følge med selv om de ikke var
på møtet. Oppdater statusen når et steg er ferdig.

**Sist oppdatert:** 2026-10-07

## Slik holder du deg oppdatert

1. Se **Hvor er vi nå?** under.
2. Les siste referat i [`møtereferater/`](../3-Gjennomføringsfasen/møtereferater/).
3. Se promptene fra siste økt i [`ai-log/prompter/`](../../ai-log/prompter/).

## Hvor er vi nå?

**7. oktober: faglærers tilbakemelding er innarbeidet, og planen er forenklet.**

Faglæreren vurderte prosjektet som «Vanskelig», med flest eksterne tjenester som største risiko
([tilbakemeldingen](../1-Oppstartsfasen/tilbakemelding-product-brief.md)). To godkjente
endringsrunder (PR #8–#13) har gjort dette:
- **Ingen database og ingen Supabase.** Dataprogrammet er et Node-script (`npm run data`) som
  lager én JSON-fil, og appen er en statisk side som filtrerer i nettleseren.
- **Ikke i v1:** snøvarsel (push, PWA), tilbakemeldingsskjema og analyse av treffsikkerhet. De
  fjernede kravene står merket «Ikke i v1» i PRD-en, så historikken synes.
- **Nytt i Må ha:** lokal kjøring med demodata, så sensor kan starte appen med
  `npm ci && npm run dev` uten nøkler. Kvalitetsrapport for hver kjøring og fasittabeller.
- Oppdatert: [produktbrief](../1-Oppstartsfasen/SnowFinder-Produktbrief.md),
  [PRD v3](SnowFinder-PRD.md) og [arkitektur v4](SnowFinder-Arkitektur.md). Endringsforslagene
  ligger i [`project-workspace/planning-artifacts/`](../../project-workspace/planning-artifacts/).

**Story 1.1** (prosjektskjelett, CI-fil og design-tokens) er bygget, gjennomgått og merget (PR #10).

**Også merget:**
- #14: oppdatert `AGENTS.md` (regler for agentene);
- #15: lokal pre-push-hook som kjører lint, typesjekk, tester og bygg før hver push, og avviser push til `main`;
- #16: denne planen.

Gruppa har bestemt (7. oktober) at godkjenning fra et annet gruppemedlem ikke kreves før merge.
Den som lager PR-en, kan merge den selv når sjekkene er grønne.

**GitHub Actions er på.** CI (`ci.yml`) kjører på hver PR og ved push til `main`. Pre-push-hooken
kjører de samme sjekkene lokalt. Alle som har klonet repoet før #15, kjører `npm run prepare` én gang.
GitHub Pages er slått på (2026-10-08), men kilden står på «Deploy from a branch». Faglærer må sette den til «GitHub Actions» før Story 1.11 kan publisere appen.

**Neste steg** (se også tabellen under):
1. **Sally (`bmad-ux`)** lager wireframes for Utforsk, Stedsside og forklaringsside, kobler
   kursets skjermkrav (pålogging, profil, innsjekking, feed, arrangementer) til SnowFinder, og
   lager en brukertestplan.
2. ~~**John** oppdaterer epics og stories etter forenklingen.~~ Ferdig 2026-10-07 (PR #19): epics v3, sprintplan og `sprint-status.yaml`.
3. **Amelia (`bmad-build`)** bygger Story 1.4 (SnowScore-modulen) og 1.10 (demodata).

Forslag til annet videre arbeid eller endringer: legg dem fram som en PR eller i et
møtereferat. Endringer i krav eller omfang går gjennom `bmad-correct-course`.

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
| 7 | Epics og stories | John (produktleder) | [Epics og stories](SnowFinder-Epics-og-Stories.md) | Joseph | 2026-09-27 | ✅ Ferdig |
| 8 | Sprintplanlegging | bmad-sprint-planning | [Sprintplan](sprintplan.md) og [sprint-status.yaml](../../project-workspace/implementation-artifacts/sprint-status.yaml) | Aksel | 2026-09-27 | ✅ Ferdig |
| 8b | Innarbeide faglærers tilbakemelding og forenkle (to endringsrunder) | `bmad-correct-course`, John, Winston | [Endringsforslag](../../project-workspace/planning-artifacts/), oppdatert brief, PRD v3 og arkitektur v4 | Joseph | 2026-10-07 | ✅ Ferdig |
| 8c | Wireframes, kursets skjermkrav og brukertestplan | Sally (UX-designer) | Oppdatert EXPERIENCE.md og wireframes | | | ⬜ Neste |
| 8d | Oppdatere epics, stories og sprintplan etter forenklingen | John og `bmad-sprint-planning` | Epics og stories, sprintplan, `sprint-status.yaml` | Aksel | 2026-10-07 | ✅ Ferdig (epics v3, sprintplan og `sprint-status.yaml`) |
| 9 | Bygge appen, én story om gangen | Amelia (utvikler) | Kode, tester, PR-er. Story 1.1 ferdig (PR #10). Story 1.2 ferdig (PR #18). Story 1.4 ferdig (PR #20). Story 1.10 ferdig (PR #22). Story 1.3 ferdig (PR #23). Story 1.5 ferdig (PR #24). Story 1.7 ferdig (PR #25). Story 1.8 ferdig (PR #27), 1.7b markører etter zoom (PR #28). Story 1.9 (stedsside) bygd. | Aksel (sprint 1) | | 🔄 Pågår |
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
- **Amelia bygger én story om gangen** på egen branch, med Pull Request og grønne sjekker.

## Regler for alle

- Logg promptene fra hver KI-økt i [`ai-log/prompter/`](../../ai-log/prompter/).
- Skriv et møtereferat etter hvert gruppemøte.
- Ingen kode går rett inn i `main`. Alt går via Pull Request med grønne tester.
