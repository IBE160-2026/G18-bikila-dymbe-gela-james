# 2026-10-07: Epics og stories etter forenklingen (steg 8d)

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5), i rollen til John (epics)
**Fase:** Planlegging
**Resultat:** [`SnowFinder-Epics-og-Stories.md`](../../project-phase-folders/2-Planleggingsfasen/SnowFinder-Epics-og-Stories.md) v3.

## Prompter

### 1
> pushe grenen og lage en PR? oppdater epics filen

**Svar (kort):** Pushet Story 1.2 og laget PR #18. Epics-fila ble oppdatert på en egen gren, etter §4.4 i endringsforslaget fra runde 2 og §4.5 i runde 1:
- Story 1.2, 1.3, 1.5 og 1.6 er skrevet om uten database. 1.6 er nå Bør ha.
- Nye stories: 1.10 (demodata, Må ha) og 1.11 (planlagt jobb og publisering, Må ha).
- Epic 5 og Story 4.1, 4.3 og 4.4 er «Ikke i v1», og ID-ene er beholdt.
- Fasittabeller er lagt inn i 1.4, 3.1, 3.3 og 4.2, og kvalitetsrapporten i 2.3.
- Hver overskrift har Må ha eller Bør ha.

**Hva vi gjorde med det:** Sprintplanen og `sprint-status.yaml` er ikke oppdatert ennå. De mangler 1.10 og 1.11, og har fortsatt Epic 4 og 5 som før.

### 2
> Vil du at jeg kjører sprintplanleggingen nå, så steg 8d blir ferdig? — «ja»

**Svar (kort):** Kjørte `bmad-sprint-planning`. Readiness-sjekken ga CONCERNS: UX-dokumentene er ikke oppdatert, og Story 1.11 trenger Actions og Pages. Aksel valgte «Fortsett». Første prøvekjøring viste at «(Må ha)» i overskriftene ble en del av nøklene, så merkingen ble flyttet til en egen linje. Deretter ble `sprint-status.yaml` skrevet og validert, og sprintplanen ble oppdatert.

### 3
> kan vi omgå dette: Story 1.11 krever at faglærer slår på GitHub Actions og Pages.

**Svar (kort):** Claude sjekket repoet med `gh api`. Actions var allerede på, for CI hadde kjørt grønt på PR #18 og #19. Bare Pages mangler, og det krever admin. Claude foreslo tre veier: be faglærer slå på Pages, publiser bare datafila til grenen `data`, eller host fra en fork.

### 4
> gjør det. [...] fortsett fremdrift

**Hva vi gjorde med det:** Rettet påstanden om at Actions er av i fremdriftsplan, sprintplan, epics og README. Story 1.11 fikk reserven med grenen `data` og `raw.githubusercontent.com`. Deretter ble PR #18 og #19 merget i den rekkefølgen.
