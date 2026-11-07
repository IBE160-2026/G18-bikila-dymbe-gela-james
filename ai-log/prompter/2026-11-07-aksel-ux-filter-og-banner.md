# 2026-11-07: UX-forbedring steg 2, ryddigere filter, og fargene på banneret for gamle data

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5) i VS Code, `bmad-ux` (Sally, oppdatering)
**Fase:** Gjennomføring
**Resultat:** DESIGN.md og EXPERIENCE.md beskriver et ryddigere filter. Banneret for gamle data beholder utformingen fra Story 1.6, og DESIGN.md rettes i PR #90.

## Prompter

### 1
> fortsett

**Svar (kort):** Sally tok opp de to sakene som gjensto fra Story 1.6b: steg 2 i UX-forbedringen (bestillingen fra 2. november: «Organiser filtrene bedre, vis aktive filterverdier og reduser tekstmengden. Behold eksisterende filterlogikk.») og bannerfargene, der koden og DESIGN.md var uenige.

### 2 (valg)
> Spørsmål: Bannerfargene? Svar: «Behold koden, rett DESIGN.md».
> Spørsmål: Hvilke endringer i filteret? Svar: «Aktive krav øverst», «Lange forklaringer bak «Mer om»», «Grupper Vær og Sted».

**Hva vi gjorde med det:** Forslaget om å skjule beskrivelsen av hurtigvalgene ble ikke valgt, så den står fortsatt synlig.

### 3 (valg)
> Spørsmål: Skal chipsene på det lukkede bunn-arket få ×? Svar: «Ren tekst på lukket ark (Recommended)».
> Spørsmål: Godkjenner du teksten? Svar: «Godkjenn og skriv».

**Svar (kort):** Sally skrev filteret i begge kopiene av DESIGN.md og EXPERIENCE.md og la vedtakene i memlog. Senas ordlyd for NVE-forklaringen er uendret, bare lagt bak «Mer om NVE-dataene».

### 4
> push til git. og fortsett

**Svar (kort):** Begge greinene ble pushet, og PR #91 ble laget. Amelia (`bmad-build`) skrev spec-en for Story 3.1b, ryddigere filter.

### 5
> subagent

**Svar (kort):** En subagent gikk gjennom spec-en og fant 10 feil. Claude rettet spec-en etter alle.

### 6
> Godkjenn Story 3.1b og fortsett med implementeringen via Amelia i denne økten. Behold spec-en samlet selv om den overstiger målet på 1 600 tokens. Alle de 10 presiseringene tilhører samme story. Følg spec-en nøyaktig, og sørg for at: eksisterende filterfunksjonalitet ikke får regresjoner; enhetstester og E2E-tester dekker de beskrevne endringene; tilgjengelighet, fokusstyring og responsiv visning fungerer; EXPERIENCE.md oppdateres som spesifisert; alle relevante tester kjøres etter implementering. Ikke merge direkte til main. Opprett en egen branch og PR for gjennomgang. Oppsummer endringene, testresultatene og eventuelle gjenstående avvik før storyen regnes som ferdig.

**Svar (kort):** Amelia bygde storyen. Gjennomgangen i tre lag ga 15 funn: 7 rettet og 8 avvist. Lint, typesjekk, 685 enhetstester, `build:demo` og 143 E2E-tester er grønne.
