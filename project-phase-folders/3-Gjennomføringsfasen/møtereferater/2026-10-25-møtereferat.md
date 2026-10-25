# Møtereferat — 2026-10-25

**Til stede:** Joseph, Sena, Aksel og Kelly
**Fravær:** Ingen

## Saker

1. **Status i prosjektet.** Epic 1 og 2 er bygget, og Må ha i Epic 3 (filter) er ferdig. Story 3.5
   er ferdig, og Story 3.4 (hurtigvalg) har en godkjent spec. Story 1.11 venter på at faglærer
   setter GitHub Pages til «GitHub Actions».
2. **Gjennomgang med KI-agentene (round table).** Funn: arbeidet er skjevt fordelt i git, det
   finnes ingen møtereferater, steg 8c (wireframes, kursets skjermkrav og brukertestplan) er ikke
   startet, UX-dokumentene har glidd fra koden, og brukertesten med fem personer er ikke planlagt.
   Svakheter i koden: MET-hentingen respekterer ikke `Expires`, sidene har ikke egne titler
   (WCAG 2.4.2), og SnowScore er ikke sjekket mot observert snø.
3. **Regler for agentene (PR #54).** `AGENTS.md` er ryddet opp. Nye regler: review fra et
   gruppemedlem før en story merges, referat etter hvert møte, og ferdige stories og
   fremdriftsplanen oppdateres i samme PR.
4. **Mappestruktur (PR #54 og #55).** Fremdriftsplanen er flyttet til `3-Gjennomføringsfasen/`.
   Utdatert status er fjernet fra milepæler og sprintplan, og 21 gamle greiner er slettet på GitHub.
5. **Frister og hvem som bygger.**

## Beslutninger

- Levering og demo: **2026-11-25**.
- Joseph rydder mappestrukturen og oppdaterer reglene i `AGENTS.md` (PR #54 og #55).
- Rekkefølgen for å bygge stories: Kelly først (i kveld, når Joseph er ferdig), så Sena, så Aksel.
- Resten av arbeidsoppgavene fordeles på neste møte.
- Review-regelen i PR #54 ble ikke vedtatt i møtet. Den godkjennes eller avvises i PR-en.

## Oppgaver til neste møte

| Oppgave | Ansvarlig | Frist |
|---|---|---|
| Rydde mappestrukturen og oppdatere `AGENTS.md` (PR #54 og #55) | Joseph | 2026-10-25 |
| Bygge neste story (3.4, hurtigvalg) | Kelly | 2026-10-25, i kveld |
| Bygge storyen etter Kelly | Sena | Når Kelly er ferdig |
| Bygge storyen etter Sena | Aksel | Når Sena er ferdig |
| Review og godkjenning av PR #54 og #55 | Fordeles på neste møte | |
| Steg 8c: wireframes, kursets skjermkrav og brukertestplan (`bmad-ux`) | Fordeles på neste møte | |
| Brukertest med fem personer | Fordeles på neste møte | |
| Be faglærer slå på GitHub Pages («GitHub Actions») og grenbeskyttelse på `main` | Fordeles på neste møte | |
| SM-8 i PRD-en via `bmad-correct-course`, hvis review-regelen godtas | Fordeles på neste møte | |
