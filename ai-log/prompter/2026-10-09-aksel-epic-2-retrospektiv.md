# 2026-10-09: Retrospektiv for Epic 2

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5). `bmad-retrospective` med `bmad-review` (tre linser som underagenter), `git_evidence.py` og en gjennomgang i Chromium via Playwright.
**Fase:** Gjennomføring
**Resultat:** [`epic-2-retro-2026-10-09.md`](../../project-workspace/implementation-artifacts/epic-2-retro-2026-10-09.md) og 11 tiltak i `sprint-status.yaml`.

## Prompter

### 1
> push alt inn i git hub. gi en retroperspektiv av epic 2

**Svar (kort):** Alt var allerede på GitHub (lokal `main` lik `origin/main`). Retrospektiven leste spec-ene, triage-loggene, KI-loggene og diffen `75dc121..ecf882f`, kjørte tre gjennomgangslinser over hele epicen og gikk gjennom siden i nettleseren. Vurderingen ble accepted-with-open-items.

**Hva vi gjorde med det:**
- De viktigste funnene på tvers av storyene:
  - testen som skal vise at siden følger konstantene, bytter bare ut de eksporterte konstantene, så regneeksempelet og kalkulatoren viser feil tall under mocken uten at testen feiler;
  - to tekster bygger på data fra en annen story uten test;
  - kommentaren øverst på siden stemmer ikke lenger.
- 11 tiltak er foreslått. Kodeendringene gjøres i en egen PR gjennom `bmad-build`, og avstemmingen av epic-teksten gjennom `bmad-correct-course`.
- Lærdom: UI-stories med interaksjon eller tilgjengelighet bør gå gjennom alle tre gjennomgangslagene.
