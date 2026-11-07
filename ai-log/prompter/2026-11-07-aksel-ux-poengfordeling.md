# 2026-11-07: UX-forbedring steg 3, poengfordeling med stolper

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5) i VS Code, `bmad-ux` (Sally, oppdatering)
**Fase:** Gjennomføring
**Resultat:** DESIGN.md og EXPERIENCE.md (begge kopier) beskriver en stolpe per delpoeng i SnowScore-kortet, i regneeksemplet og i kalkulatoren. Koden er ikke endret ennå.

## Prompter

### 1
> ok fortsett

**Svar (kort):** Claude fant at neste steg i UX-forbedringen er steg 3, poengfordelingen, og startet Sally (`bmad-ux`). I dag står delpoengene A, B og C bare som tekst («18 av 60»).

### 2 (valg)
> Spørsmål: Hvor skal poengfordelingen vises? Svar: «Stedssiden og forklaringssiden». Spørsmål: Hvilken form? Svar: «Én stolpe per delpoeng». Spørsmål: Kort begrunnelse per rad? Svar: «Nei, bare tall og stolpe».

**Svar (kort):** Sally spurte om fargen, fordi SnowScore-skalaen er forbeholdt SnowScore og aksentblått er forbeholdt handlinger.

### 3 (valg)
> Spørsmål: Hvilken farge skal stolpene ha? Svar: «Nøytral grå (ink-secondary)».

**Svar (kort):** Sally skrev valgene i memloggen, la til tokenet `score-part-bar` og beskrivelsen av delpoengstolpen i DESIGN.md, og oppdaterte SnowScore-kortet og kalkulatoren og la til regneeksemplet i EXPERIENCE.md. Stolpen er `aria-hidden`, og teksten «x av N» bærer tallet.

### 4
> ja

**Svar (kort):** Claude pushet greinen og laget PR #93. Amelia (`bmad-build`) skrev spec-en for Story 2.5, delpoengstolper, på greinen `story/2-5-delpoengstolper`, og en subagent kompilerte Epic 2-konteksten på nytt.

### 5 (valg)
> Spørsmål: Hvor skal stolpene stå i regneeksemplet? Svar: «Liste under formlene».

### 6
> To små rettelser før godkjenning: 1. Flytt punktet om Regneeksemplet (Aksels valg 2026-11-08) fra «Never» til «Always». Det er et krav om noe som skal gjøres, ikke et forbud. 2. I E2E-oppgaven: «riktig fyllbredde» skal sjekkes via style-attributtet (f.eks. width: 50%), ikke ved å måle piksler, så testen ikke blir ustabil. Ellers ingen endringer. Deretter: godkjenn og stopp

**Svar (kort):** Claude rettet begge punktene og satte spec-en til `ready-for-dev`. Koden er ikke endret.
