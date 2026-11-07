# 2026-11-07: Status og PRD/SRS versjon 2.1 inn i repoet

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5)
**Fase:** Gjennomføring
**Resultat:** `project-phase-folders/2-Planleggingsfasen/SnowFinder-PRD-og-SRS.html` (versjon 2.1), oppdatert «Hvor er vi nå?» og steg 9 i `fremdriftsplan.md`, og lenke i fasens `README.md`.

## Prompter

### 1
> gi meg en status på gruppeoppgaven

**Svar (kort):** Claude leste `fremdriftsplan.md`, `sprint-status.yaml` og åpne PR-er: alle v1-stories er ferdige unntatt 1.11, PR #83 (1.8b) og #85 (3.9) venter på review, kodefrys 11. november og levering 25. november. Fremdriftsplanen manglet at 1.11g (PR #87) var merget.

**Hva vi gjorde med det:** Aksel ba om at fremdriftsplanen oppdateres, se 2.

### 2
> ja . legg inn den oppdaterte prd/srs-en (med søkefeltet som srs-f-32). legg inn i repoet

**Svar (kort):** Claude fant versjon 2 (`SnowFinder_PRD_og_SRS.html`, 2026-11-04) og tre avvik fra det gruppa har vedtatt. Aksel valgte: SRS-F-32, F3.4 og SRS-F-26 rettes etter FR-32, så steder med data eldre enn 12 timer ikke finnes i søket (NFR-3); søk merkes vedtatt i §7, mens dagvalg og skala fortsatt er til beslutning; SRS-F-15 får en merknad om at fargeforklaringen er utsatt og ikke bygget.

**Hva vi gjorde med det:** brukt. Endringene står i endringsloggen for versjon 2.1 i dokumentet.
