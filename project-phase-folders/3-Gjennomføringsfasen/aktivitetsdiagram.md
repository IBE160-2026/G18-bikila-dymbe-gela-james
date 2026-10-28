# Aktivitetsdiagram og aktivitetsliste

Arbeidsflyten gruppa følger fra i dag (2026-10-28) til levering og demo 2026-11-25, og en liste
over alle aktivitetene i prosjektet, bygget fra [epics og stories](../2-Planleggingsfasen/SnowFinder-Epics-og-Stories.md)
og [sprintplanen](../2-Planleggingsfasen/sprintplan.md). Status for hver story står i
[fremdriftsplanen](fremdriftsplan.md), og datoene i [milepælene](../2-Planleggingsfasen/milepæler.md)
og [tidslinjen](fremdriftsplan.md#tidslinje). Fristene merket «forslag» er ikke vedtatt ennå.

## Arbeidsflyt fram til levering

Tre spor går parallelt: storyene som gjenstår, Story 1.11 (som venter på faglærer) og steg 8c
med brukertestplanen. Når alle tre er ferdige og koden er fryst, går vi videre til brukertest,
rettinger, sluttrapport og levering.

```mermaid
flowchart TD
    start(["Start 2026-10-28"]) --> fork1{{"Tre spor parallelt"}}

    %% Spor A: storyene som gjenstår
    fork1 --> a1["Velg neste story i sprintplan.md:<br/>1.6<br/>(1.11 venter på faglærer)"]
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
    a12 -- "Nei" --> m4["M5 kodefrys<br/>forslag 2026-11-11"]

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

    m4 --> join1{{"Alle tre spor ferdige:<br/>kodefrys"}}
    m1 --> join1
    f3 --> join1

    join1 --> d1["Brukertest med minst fem personer<br/>2026-11-12 til 2026-11-16"]
    d1 --> f4["F4: brukertest ferdig<br/>forslag 2026-11-16"]
    f4 --> d2{"Kritiske funn?"}
    d2 -- "Ja" --> d3["Bygg rettingene som fix-PR-er<br/>med review, innen 2026-11-20"]
    d2 -- "Nei" --> e1
    d3 --> e1["Sluttrapport, retrospektiv<br/>og presentasjon i 4-Avslutningsfasen"]
    e1 --> f5["F5: sluttrapport klar<br/>forslag 2026-11-23"]
    f5 --> e2["Generalprøve 2026-11-24: npm ci og<br/>npm run dev etter README på en ren maskin"]
    e2 --> e3{"Virker alt uten nøkler?"}
    e3 -- "Nei" --> e4["Rett README eller koden"] --> e2
    e3 -- "Ja" --> slutt(["M6: levering og demo<br/>2026-11-25, vedtatt"])
```

### Løpende hele perioden

- **Gruppemøte hver uke:** skriv referat i [`møtereferater/`](møtereferater/). Vedtatte frister
  føres inn i milepælene, og «forslag» byttes med «vedtatt».
- **Når en frist ikke holder:** flytt den i milepælene og tidslinjen i samme PR, og si hvorfor i
  «Hvor er vi nå?» i fremdriftsplanen. Nye krav eller mer omfang går gjennom `bmad-correct-course`.
- **Etter kodefrys (2026-11-11):** bare rettinger fra brukertesten bygges. Alt annet skrives inn i
  sluttrapporten som videre arbeid.
- **Kontoene til Kelly og Sena:** til GitHub Support har sluppet dem fri, lager et annet medlem
  synlige kopi-PR-er av arbeidet deres (se spor A).

## Aktivitetsliste

Alle aktivitetene i prosjektet: én rad per story fra epics-dokumentet, pluss arbeidet som ikke er
en story (planlegging, brukertest, rapport og levering). «Avhenger av» er det som må være ferdig
før aktiviteten kan starte. Ferdige aktiviteter har datoen PR-en ble merget, og de andre har
fristen fra milepælene.

### Avhengigheter mellom storyene

Grønn er ferdig, gul gjenstår i v1, og grå med stiplet kant er «Ikke i v1».

```mermaid
flowchart LR
    subgraph E1["Epic 1: Se snøforholdene"]
        s1_1["1.1 Skaffolding og CI"] --> s1_2["1.2 Stedskatalog"]
        s1_1 --> s1_4["1.4 SnowScore-modul"]
        s1_2 --> s1_10["1.10 Demodata lokalt"]
        s1_4 --> s1_10
        s1_2 --> s1_3["1.3 Hent og valider værdata"]
        s1_3 --> s1_5["1.5 Beregn og publiser"]
        s1_4 --> s1_5
        s1_10 --> s1_7["1.7 Norgeskart"]
        s1_10 --> s1_8["1.8 Listevisning"]
        s1_7 --> s1_9["1.9 Stedsside"]
        s1_8 --> s1_9
        s1_5 --> s1_11["1.11 Timesjobb og publisering"]
        s1_9 --> s1_6["1.6 Oppe ved nedetid"]
    end

    subgraph E2["Epic 2: Forstå SnowScore"]
        s2_1["2.1 Forklaringsside"] --> s2_2["2.2 Regneeksempel"]
        s2_1 --> s2_3["2.3 Datakilder"]
        s2_1 --> s2_4["2.4 Kalkulator"]
    end

    subgraph E3["Epic 3: Filter"]
        s3_1["3.1 Nysnø, vind, temperatur"] --> s3_2["3.2 Filter i adressen"]
        s3_1 --> s3_3["3.3 Null treff og antall"]
        s3_1 --> s3_5["3.5 Sol"]
        s3_5 --> s3_4["3.4 Hurtigvalg"]
        s3_1 --> s3_6["3.6 Avstand"]
        s3_1 --> s3_7["3.7 Stedstype"]
        s3_1 --> s3_8["3.8 Nysnø siste 24 t"]
    end

    subgraph E4["Epic 4: Mer om et sted"]
        s4_2["4.2 Beste skivindu"]
        s4_1["4.1 PWA"]
        s4_3["4.3 Snøvarsel"] --> s4_4["4.4 Motta snøvarsel"]
    end

    subgraph E5["Epic 5: Tilbakemelding"]
        s5_1["5.1 Send tilbakemelding"] --> s5_2["5.2 Slett gamle"]
    end

    s1_4 --> s2_1
    s1_7 --> s3_1
    s1_8 --> s3_1
    s1_3 --> s3_8
    s1_9 --> s4_2

    classDef ferdig fill:#d7f0dd,stroke:#2e7d32,color:#1b1b1b
    classDef gjenstar fill:#fff1c7,stroke:#b26a00,color:#1b1b1b
    classDef ikkev1 fill:#ececec,stroke:#9e9e9e,color:#555555,stroke-dasharray:4 3
    class s1_1,s1_2,s1_3,s1_4,s1_5,s1_7,s1_8,s1_9,s1_10,s2_1,s2_2,s2_3,s2_4,s3_1,s3_2,s3_3,s3_4,s3_5,s3_6,s3_7,s3_8 ferdig
    class s1_6,s1_11,s4_2 gjenstar
    class s4_1,s4_3,s4_4,s5_1,s5_2 ikkev1
```

### Stories

| ID | Aktivitet | Prioritet | Avhenger av | Sprint | Ansvarlig | Ferdig eller frist |
|---|---|---|---|---|---|---|
| **Epic 1** | **Se snøforholdene i Norge, på kart eller i liste** | | | | | |
| 1.1 | Prosjekt-skaffolding og CI-skjelett | Må ha | – | 1 | Aksel og Joseph | 2026-10-07 (PR #7, #10) |
| 1.2 | Bygg stedskatalogen | Må ha | 1.1 | 1 | Aksel | 2026-10-07 (PR #18) |
| 1.4 | Bygg den delte SnowScore-modulen | Må ha | 1.1 | 1 | Aksel | 2026-10-07 (PR #20) |
| 1.10 | Kjør SnowFinder lokalt med demodata | Må ha | 1.2, 1.4 | 1 | Aksel | 2026-10-07 (PR #22) |
| 1.3 | Hent og valider værdata hver time | Må ha | 1.2 | 2 | Aksel | 2026-10-08 (PR #23) |
| 1.5 | Beregn og publiser SnowScore i dataprogrammet | Må ha | 1.3, 1.4 | 2 | Aksel | 2026-10-08 (PR #24) |
| 1.7 | Se Norgeskartet med fargelagte steder (med 1.7b) | Må ha | 1.10 | 2 | Aksel | 2026-10-08 (PR #25, #28) |
| 1.8 | Bruk tilgjengelig listevisning i stedet for kart | Må ha | 1.10 | 2 | Aksel | 2026-10-08 (PR #27) |
| 1.9 | Åpne en stedsside med full poengsum (med 1.9b og 1.9c) | Må ha | 1.7, 1.8 | 2 | Aksel | 2026-10-08 (PR #30–#32) |
| 1.11 | Kjør dataprogrammet hver time og publiser appen | Må ha | 1.5, GitHub Pages fra faglærer (ellers reserven) | 2, flyttet til 4 | Fordeles på møtet | 2026-11-11, forslag |
| 1.6 | Hold tjenesten oppe når en datakilde er nede | Bør ha | 1.9 | 4 | Fordeles på møtet | 2026-11-11, forslag |
| **Epic 2** | **Forstå og stole på SnowScore** | | | | | |
| 2.1 | Les kort fortalt og steg for steg | Må ha | 1.4 | 1 | Aksel | 2026-10-09 (PR #33) |
| 2.2 | Se det utledede regneeksempelet | Må ha | 2.1 | 1 | Aksel | 2026-10-09 (PR #34) |
| 2.3 | Les om datakilder og begrensninger | Må ha | 2.1 | 1 | Aksel | 2026-10-09 (PR #35) |
| 2.4 | Prøv SnowScore-kalkulatoren selv | Bør ha | 2.1 | 1 | Aksel | 2026-10-09 (PR #36) |
| – | Retrospektiv for Epic 2 og tiltak A1–A5, A11 | – | 2.1–2.4 | 1 | Aksel | 2026-10-09 (PR #37, #38) |
| **Epic 3** | **Finn steder som oppfyller mine krav** | | | | | |
| 3.1 | Filtrer på nysnø, vind og temperatur | Må ha | 1.7, 1.8 | 3 | Aksel | 2026-10-22 (PR #48) |
| 3.2 | Del og gjenåpne et filtrert søk (med 3.2b) | Må ha | 3.1 | 3 | Aksel | 2026-10-23 (PR #49, #50) |
| 3.3 | Få hjelp ved null treff og se antall treff live | Må ha | 3.1 | 3 | Aksel | 2026-10-23 (PR #52) |
| 3.5 | Filtrer på sol | Bør ha | 3.1 | 3 | Aksel | 2026-10-23 (PR #53) |
| 3.4 | Bruk hurtigvalg for vanlige kombinasjoner | Bør ha | 3.5 | 3 | Kelly | 2026-10-25 (PR #57) |
| 3.6 | Filtrer på avstand | Bør ha | 3.1 | 3 | Kelly | 2026-10-27 (PR #63) |
| 3.7 | Filtrer på stedstype | Bør ha | 3.1 | 3 | Sena | 2026-10-28 (PR #66) |
| 3.8 | Filtrer på nysnø siste 24 timer | Bør ha | 3.1, 1.3 | 3 | Sena | 2026-10-28 (PR #71) |
| – | Retrospektiv for Epic 3 (valgfri) | – | 3.1–3.8 | 4 | Fordeles på møtet | 2026-11-03, forslag |
| **Epic 4** | **Få mer ut av et sted jeg følger med på** | | | | | |
| 4.2 | Se beste skivindu på stedssiden | Bør ha | 1.9 | 4 | Aksel | 2026-10-28 (bygget, venter på review) |
| 4.1 | Gjør SnowFinder installerbar som PWA | Ikke i v1 | – | – | – | – |
| 4.3 | Registrer et snøvarsel uten konto | Ikke i v1 | – | – | – | – |
| 4.4 | Motta og meld deg av et snøvarsel | Ikke i v1 | 4.3 | – | – | – |
| **Epic 5** | **Gi tilbakemelding uten konto (Ikke i v1)** | | | | | |
| 5.1 | Send en tilbakemelding uten konto | Ikke i v1 | – | – | – | – |
| 5.2 | Automatisk sletting av gamle tilbakemeldinger | Ikke i v1 | 5.1 | – | – | – |

### Andre aktiviteter

| ID | Aktivitet | Fase | Avhenger av | Ansvarlig | Ferdig eller frist |
|---|---|---|---|---|---|
| P1 | Produktbrief (steg 1) | Oppstart | – | Hele gruppa | 2026-09-22 (F1) |
| P2 | PRD, arkitektur, UX, epics og stories (steg 2–7) | Planlegging | P1 | Hele gruppa | 2026-09-27 |
| P3 | Sprintplan (steg 8) | Planlegging | P2 | Hele gruppa | 2026-10-03 (PR #6) |
| P4 | Forenkling etter faglærers tilbakemelding (steg 8b og 8d) | Planlegging | P3 | Joseph og Aksel | 2026-10-07 (F2, PR #8–#21) |
| P5 | Revisjon og rettinger i dataprogrammet | Gjennomføring | Epic 1 og 2 | Aksel | 2026-10-22 (PR #43–#47) |
| P6 | Wireframes, kursets skjermkrav og brukertestplan (steg 8c, `bmad-ux`) | Planlegging | P4 | Fordeles på møtet | 2026-11-04, forslag (F3) |
| P7 | Kodefrys: alle v1-stories merget | Gjennomføring | 1.6, 1.11, 4.2 | Hele gruppa | 2026-11-11, forslag (M1 og M5) |
| P8 | Brukertest med minst fem personer | Gjennomføring | P6, P7 | Fordeles på møtet | 2026-11-16, forslag (F4) |
| P9 | Rettinger etter brukertesten (bare kritiske funn) | Gjennomføring | P8 | Fordeles etter testen | 2026-11-20, forslag |
| P10 | Sluttrapport, retrospektiv og presentasjon | Avslutning | P8 | Hele gruppa | 2026-11-23, forslag (F5) |
| P11 | Generalprøve: `npm ci && npm run dev` etter README på en ren maskin | Avslutning | P9, P10 | Fordeles på møtet | 2026-11-24, forslag |
| P12 | Levering og demo | Avslutning | P11 | Hele gruppa | 2026-11-25, vedtatt (M6) |

Diagrammene og listen oppdateres når arbeidsflyten endres, for eksempel når et spor er ferdig, når
en story legges til eller tas ut, når en frist flyttes, eller når en regel i `AGENTS.md` endrer
hvordan vi leverer.
