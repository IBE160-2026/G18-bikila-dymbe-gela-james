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
