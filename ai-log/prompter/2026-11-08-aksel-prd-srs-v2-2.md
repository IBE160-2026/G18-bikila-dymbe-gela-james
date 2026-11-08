# 2026-11-08: Gjennomgang av PRD og SRS, og versjon 2.2

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5)
**Fase:** Gjennomføring
**Resultat:** `SnowFinder-PRD-og-SRS.html` versjon 2.2 med endringslogg, rettinger i `SnowFinder-PRD.md` og kopien `prd.md` (like), og et beslutningsnotat til gruppa (privat side på claude.ai, ikke i repoet).

## Prompter

### 1
> Jeg vil ha en gjennomgang av PRD og SRS før vi gjør endringer. Ikke endre filer, ikke bytt eller lag grein, og ikke push før jeg har godkjent. Les filene fra origin/main (git show origin/main:<fil>), så du ikke forstyrrer greinen som er sjekket ut.
>
> Filer:
> - project-phase-folders/2-Planleggingsfasen/SnowFinder-PRD-og-SRS.html (versjon 2.1, gjeldende, med SRS-ID-er)
> - project-phase-folders/2-Planleggingsfasen/SnowFinder-PRD.md og project-workspace/planning-artifacts/prd-G18-bikila-dymbe-gela-james-2026-09-27/prd.md (to identiske kopier med FR/NFR-ID-er)
>
> Sjekk dette:
> 1. Samsvar: stemmer FR/NFR i PRD-filene med SRS-kravene i HTML-fila (innhold, prioritet, status)? Er de to md-kopiene fortsatt identiske?
> 2. Samsvar med det som er bygget: sammenlign kravene med sprint-status.yaml, spec-ene i implementation-artifacts og de åpne PR-ene (#83, #85, #89–#94). Finn krav som er bygget annerledes enn beskrevet, og krav som ikke er bygget (f.eks. fargeforklaringen i SRS-F-15, som bygges nå i UX-steg 4). Sjekk også om nye stories (1.8b, 2.5, 3.1b) er dekket av kravteksten de viser til, eller om kravene bør presiseres.
> 3. «Ikke i v1»-krav: er de tydelig merket og konsekvente med epics og sprintplanen?
> 4. Åpne beslutninger: hva står fortsatt «til beslutning» (f.eks. dagvalg og skala), og hva må avgjøres før kodefrysen 11. november?
> 5. Sporbarhet: har alle FR/NFR og SRS-F-ID-er en story eller test som dekker dem? Finnes det ID-er i koden eller testene som ikke står i dokumentene?
> 6. Språk og målbarhet: krav som er vage, ikke testbare eller motsier hverandre.
>
> Lever en rapport her i chatten:
> - Funn sortert etter alvor (må rettes / bør rettes / kan vente), med fil, krav-ID og ett konkret forslag per funn.
> - En kort liste over hva som bør med i versjon 2.2.
>
> Regler:
> - Ikke endre eksisterende krav-ID-er. Nye krav får nye nummer.
> - Ikke rør SnowFinder-Epics-og-Stories.md, den endres i flere åpne PR-er.
> - Når jeg har godkjent hvilke funn som skal rettes, og UX-arbeidet i den andre økta er ferdig: lag grein docs/prd-srs-v2-2 fra oppdatert main. Hold de to md-kopiene identiske, oppdater HTML-fila til versjon 2.2 med endringslogg, logg prompten i ai-log/prompter/, og vis meg diffen før push.

**Svar (kort):** Claude leverte en rapport med 8 funn som må rettes (M1–M8), 11 som bør rettes (B1–B11) og 5 som kan vente. De viktigste: tittelen sa «utkast v2 · ikke committet», brukerreisene var nummerert på nytt (UJ-2/UJ-3 betydde noe annet enn i gjeldende PRD og epics), SRS-F-16 sa at avstandssorteringen skjules uten posisjon (koden viser den og ber om posisjon), FR-30 og §8.2 i md-PRD-en beskrev ting som ikke stemmer med koden, og md-PRD-en og SRS-en har gått fra hverandre (500 ms mot 2 s og flere krav som bare står i SRS-en). Funn i epics ble ført opp for en egen PR.

**Hva vi gjorde med det:** Aksel valgte funnene i prompt 2.

### 2
> Rett disse når UX-økta er ferdig: M1, M2, M3, M4, M6, M7, B1–B7, B9, B10, B11.
>
> Presiseringer:
> - Bare dokumenttekst. Ingen endringer i kode eller tester i denne PR-en.
> - B1: beskriv banneret og ny henting slik de virker på main i dag (fra Story 1.6). Ikke ta med endringene i #90 (Story 1.6b), den er ikke godkjent eller merget. Ingen correct-course, siden kravet bare beskriver det som er bygget.
> - B2: rett bare kravteksten (definisjonen av «ord» og eksemplet «granvin»). Endringen av nullteksten i koden tas ikke her.
> - B7: ta bare timeren inn i SRS-F-02. Innstrammingen av data-workflow.test.ts blir en egen story senere.
> - B3: #95 er ikke merget ennå. Ta utgangspunkt i nivåene og etikettene i scoreTier.ts på main.
>
> Vent med disse til gruppa har vedtatt:
> - M5 (500 ms eller 2 s, og hvilket dokument som vinner ved konflikt). Kjør bmad-correct-course etter vedtaket.
> - M8, formelen, dagvalg, skala og datoen for kodefrysen. Lag et kort beslutningsnotat jeg kan legge fram for gruppa, med forslag og konsekvens for hvert punkt.
>
> B8 (testkolonnen) venter til etter kodefrysen.
> Funnene som gjelder Epics-fila tar vi i en egen PR når #83, #85 og #90–#94 er merget.

**Svar (kort):** Claude laget beslutningsnotatet med seks saker (formelen, dagvalg, skala, 500 ms eller 2 s, hvilket dokument som gjelder, og datoen for kodefrysen), hver med forslag og konsekvens. Notatet peker også på at det mangler referat fra møtet 2026-11-01. Claude spurte om UX-økta var ferdig, siden ingen annen økt kjørte og #95 var åpen. Aksel svarte «Start nå». Claude laget `docs/prd-srs-v2-2` fra main og rettet de valgte funnene. På main henter appen ikke datafila på nytt (det kommer i 1.6b), så SRS-F-34 beskriver at en åpen side sjekker alderen hvert minutt.

**Hva vi gjorde med det:** brukt. Endringene står i endringsloggen for versjon 2.2 i dokumentet. Diffen ble vist til Aksel før push.
