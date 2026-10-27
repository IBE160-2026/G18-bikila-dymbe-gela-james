# 2026-10-27: Opplæring, status og Story 3.7 (filter på stedstype)

**Hvem:** Sena
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-build` (dispatch) med tre gjennomgangslag (Blind Hunter, Edge Case Hunter og Verification Gap)
**Fase:** Gjennomføring
**Resultat:**
- Forklaring av prosjektet for en nybegynner (frontend, backend, database) og en statusoversikt.
- Spec for Story 3.7 (`spec-3-7-filtrer-pa-stedstype.md`) er godkjent av Sena med valgene 1A (avkrysningsbokser, ingen avkrysset = «Alle») og 2A (stedstype kan foreslås lempet ved null treff).
- Story 3.7 er bygget og gjennomgått på greina `story/3-7-filtrer-pa-stedstype` (commit `5a59499`). Den er ikke pushet, har ingen PR ennå og står som `review` i `sprint-status.yaml` til gruppa har tatt review.

## Prompter

### 1
> Jeg er nybegynner i programmering og ønsker å lære agentic programming gjennom SnowFinder-prosjektet. Les product-brief.md og forklar meg hvordan prosjektet er tenkt å fungere, hvilke teknologier vi trenger, og hva frontend, backend og database betyr i vårt prosjekt. Forklar pedagogisk og stegvis. Ikke endre filer eller kjør kommandoer uten å spørre meg først.

**Svar (kort):** En stegvis forklaring av SnowFinder, SnowScore og frontend/backend/database med en restaurant-analogi. Forklaringen bygde på `product-brief.md` i rotmappa, som nevner Supabase.
**Hva vi gjorde med det:** Brukt som opplæring. I svar 2 rettet Claude det selv: rotfila er utdatert. Etter faglærers råd 7. oktober finnes det ingen database, ingen Supabase og ingen innlogging. Gjeldende brief er `project-phase-folders/1-Oppstartsfasen/SnowFinder-Produktbrief.md`.

### 2
> Jeg har nettopp oppdatert prosjektet fra GitHub. Les AGENTS.md, CLAUDE.md og relevante prosjektfiler. Finn hvilke stories som er ferdige, og hvilken story jeg skal overta etter Kellys arbeid med 3.4 og 3.6. Sjekk også om det finnes uferdige eller åpne pull requests. Ikke endre filer eller kjør kommandoer ennå. Gi meg en kort oversikt og anbefal neste steg.

**Svar (kort):** Epic 1 (uten 1.6 og 1.11), hele Epic 2 og 3.1–3.5 er ferdige. Etter møtet 25.10 er Sena neste, og neste ubygde story i sprintplanen er 3.7. PR-er kunne ikke sjekkes uten å kjøre `gh`.
**Hva vi gjorde med det:** Brukt.

### 3
> ja

**Svar (kort):** `gh pr list --state open` viste ingen åpne PR-er.
**Hva vi gjorde med det:** Brukt.

### 4
> Ja, vi starter Story 3.7 – Filter på stedstype. Følg prosjektets AGENTS.md, CLAUDE.md og BMAD-arbeidsflyt. Opprett en egen gren fra oppdatert main med navnet story/3-7-filtrer-pa-stedstype. Start med bmad-build og utarbeid spesifikasjonen for story 3.7. Vis meg spesifikasjonen før du begynner å implementere. Ikke endre main, og ikke push eller merge noe uten min godkjenning.

**Svar (kort):** Greina ble laget fra oppdatert `main`. Claude så at `main` hadde fått PR #63 (Story 3.6) uten godkjent review på GitHub. Utkastet til spec hadde to åpne spørsmål: kontrolltype (1A/1B/1C) og om stedstype kan foreslås ved null treff (2A/2B). Specen var også lengre enn BMADs anbefalte 1600 tokens.
**Hva vi gjorde med det:** Spørsmålene ble besvart i prompt 5.

### 5
> Vi utsetter spørsmålet om Story 3.6, PR #63 og godkjenningsprosessen til gruppemøtet i morgen. Ikke gjør endringer knyttet til dette.
>
> For Story 3.7 velger jeg foreløpig 1A, 2A og å beholde hele spesifikasjonen samlet. Oppdater spesifikasjonen med disse valgene, men vis meg den endelige versjonen før implementering. Ikke begynn å skrive kode ennå.

**Svar (kort):** Valgene ble skrevet inn i den frosne delen av specen, og den endelige versjonen ble vist uten kode.
**Hva vi gjorde med det:** Brukt. 3.6 og PR #63 er ikke rørt.

### 6
> Jeg godkjenner spesifikasjonen for Story 3.7.
>
> Sett den til ready-for-dev og fortsett med implementeringen på en egen feature-branch, i henhold til AGENTS.md og prosjektets BMAD-prosess.
>
> Følg implementeringsplanen og test løsningen grundig. Ikke gjør endringer direkte på main.
>
> Ikke gjør endringer knyttet til Story 3.6 eller PR #63. Disse spørsmålene tar vi i gruppemøtet i morgen.
>
> Når implementeringen er ferdig, gi meg en oversikt over hva som er gjort, hvilke tester som er kjørt, og hva som gjenstår før pull request og review. Ikke merge noe uten min godkjenning.

**Svar (kort):** Claude implementerte direkte fra specen. Ett avvik er ført i specen: ruteren skriver komma ukodet, så adressen blir `type=skisted,by`. De tre gjennomgangslagene ga 14 funn: 7 rettet, 6 avvist med begrunnelse og 1 utsatt til `deferred-work.md` (arkitektur og UX nevner ennå ikke `avstand` og `type`). Lint, typesjekk, 545/545 enhetstester, bygg og 99/99 E2E er grønne. Alt ble committet lokalt (`5a59499`).
**Hva vi gjorde med det:** Brukt. Ikke pushet.

### 7
> Ja, gjennomfør punkt 1–3 i henhold til AGENTS.md.
>
> Oppdater KI-loggen, fremdriftsplanen og sesjonsloggen. Kontroller at dokumentasjonen stemmer med arbeidet som faktisk er utført.
>
> Commit dokumentasjonsendringene på samme feature-branch, men ikke push eller opprett PR ennå.
>
> Ikke endre Story 3.6, PR #63 eller main. Ikke marker Story 3.7 som endelig godkjent før gruppens review.
>
> Gi meg beskjed når alt er klart, med oppdatert git-status.

**Svar (kort):** Denne fila, en rad i `ai-log/logg.md`, fremdriftsplanen og sesjonsloggen. 3.7 står fortsatt som `review`, ikke `done`.
**Hva vi gjorde med det:** Brukt.
