# Aktivitetsdiagram fram til levering

Arbeidsflyten gruppa følger fra i dag (2026-10-27) til levering og demo 2026-11-25. Diagrammet
viser rekkefølgen og reglene, ikke status. Status står i
[fremdriftsplanen](fremdriftsplan.md), og datoene i [milepælene](../2-Planleggingsfasen/milepæler.md)
og [tidslinjen](fremdriftsplan.md#tidslinje). Fristene merket «forslag» er ikke vedtatt ennå.

Tre spor går parallelt: storyene som gjenstår, Story 1.11 (som venter på faglærer) og steg 8c
med brukertestplanen. Når alle tre er ferdige, går vi videre til brukertest, sluttrapport og
levering.

```mermaid
flowchart TD
    start(["Start 2026-10-27"]) --> fork1{{"Tre spor parallelt"}}

    %% Spor A: storyene som gjenstår
    fork1 --> a1["Velg neste story i sprintplan.md:<br/>3.7, 3.8, deretter 4.2"]
    a1 --> a2["Bygg med bmad-build på greinen<br/>story/nr-kort-navn"]
    a2 --> a3["Kjør lint, typecheck, test, build<br/>og test:e2e lokalt"]
    a3 --> a4["Sett storyen til done i sprint-status.yaml,<br/>oppdater fremdriftsplan og tidslinje,<br/>logg KI-økten i ai-log"]
    a4 --> a5["Åpne PR med reviewer fra gruppa"]
    a5 --> a6{"Er PR-en synlig og<br/>kjører sjekkene?"}
    a6 -- "Nei, flagget konto" --> a7["Et annet medlem lager<br/>en synlig kopi-PR"]
    a7 --> a8
    a6 -- "Ja" --> a8{"CI og E2E grønne?"}
    a8 -- "Nei" --> a9["Rett feilen på samme grein"] --> a8
    a8 -- "Ja" --> a10{"Approve fra et<br/>annet gruppemedlem?"}
    a10 -- "Nei, funn" --> a9
    a10 -- "Ja" --> a11["Merge og slett greinen"]
    a11 --> a12{"Flere v1-stories igjen?"}
    a12 -- "Ja" --> a1
    a12 -- "Nei" --> m4["M4 og M5: filter og Bør ha ferdig<br/>forslag 2026-11-01 og 2026-11-11"]

    %% Spor B: Story 1.11
    fork1 --> b1{"Har faglærer satt GitHub Pages<br/>til GitHub Actions?"}
    b1 -- "Ja" --> b2["Bygg Story 1.11:<br/>timesjobb og publisering"]
    b1 -- "Nei" --> b3{"Er det etter<br/>2026-11-04?"}
    b3 -- "Nei" --> b4["Purr på faglærer"] --> b1
    b3 -- "Ja" --> b5["Bruk reserven i Story 1.11:<br/>publiser datafila til grenen data"]
    b5 --> b2
    b2 --> m1["M1: pipeline i drift<br/>forslag 2026-11-11"]

    %% Spor C: UX og brukertestplan
    fork1 --> c1["Steg 8c med bmad-ux:<br/>wireframes og kursets skjermkrav"]
    c1 --> c2["Brukertestplan:<br/>oppgaver, minst fem personer"]
    c2 --> f3["F3: steg 8c ferdig<br/>forslag 2026-11-04"]

    m4 --> join1{{"Alle tre spor ferdige"}}
    m1 --> join1
    f3 --> join1

    join1 --> d1["Brukertest med minst fem personer"]
    d1 --> d2{"Kritiske funn?"}
    d2 -- "Ja" --> d3["Lag fix-stories og bygg dem<br/>som i spor A"] --> d1
    d2 -- "Nei" --> f4["F4: brukertest ferdig<br/>forslag 2026-11-16"]
    f4 --> e1["Sluttrapport, retrospektiv<br/>og presentasjon i 4-Avslutningsfasen"]
    e1 --> e2["Generalprøve: npm ci og npm run dev<br/>etter README på en ren maskin"]
    e2 --> e3{"Virker alt uten nøkler?"}
    e3 -- "Nei" --> e4["Rett README eller koden"] --> e2
    e3 -- "Ja" --> f5["F5: sluttrapport klar<br/>forslag 2026-11-23"]
    f5 --> slutt(["M6: levering og demo<br/>2026-11-25, vedtatt"])
```

## Løpende hele perioden

- **Gruppemøte hver uke:** skriv referat i [`møtereferater/`](møtereferater/). Vedtatte frister
  føres inn i milepælene, og «forslag» byttes med «vedtatt».
- **Når en frist ikke holder:** flytt den i milepælene og tidslinjen i samme PR, og si hvorfor i
  «Hvor er vi nå?» i fremdriftsplanen. Nye krav eller mer omfang går gjennom `bmad-correct-course`.
- **Kontoene til Kelly og Sena:** til GitHub Support har sluppet dem fri, lager et annet medlem
  synlige kopi-PR-er av arbeidet deres (se spor A).

Diagrammet oppdateres når arbeidsflyten endres, for eksempel når et spor er ferdig, når en story
legges til eller tas ut, eller når en regel i `AGENTS.md` endrer hvordan vi leverer.
