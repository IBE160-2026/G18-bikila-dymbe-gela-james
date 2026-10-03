<!-- bmad:context -->
<!-- Verified 2026-10-03 against 6a1e7ff. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## SnowFinder (G18, IBE160)

Gruppeprosjekt i IBE160 ved Høgskolen i Molde: en webapp som rangerer steder i Norge etter prognostiserte snøforhold, med SnowScore (0–100). Planlagt stack: Vite + React + TypeScript, Supabase og GitHub Actions. Ingen kode finnes ennå, og Story 1.1 lager skjelettet. Krav, design og arkitektur ligger i `project-phase-folders/2-Planleggingsfasen/`.

## Policy

- Aldri commit eller push til `main`. Hver story får egen gren `story/<story-id>` og leveres som PR med grønne tester, godkjent av et annet gruppemedlem.
- Logg hver vesentlig KI-økt: én rad i `ai-log/logg.md` (dato, fase, hvem, verktøy/modell, oppgave, endrede/avviste forslag, godkjent av), og promptene ordrett i `ai-log/prompter/ÅÅÅÅ-MM-DD-<navn>-<tema>.md`.
- Svar og skriv nye dokumenter på norsk. Kode, kommentarer og navn i koden skrives på engelsk. Eksisterende engelske dokumenter (arkitekturen, story-specs) redigeres på engelsk.
- Ikke rediger `_bmad/config.toml` (installeren overskriver den). Felles overstyringer går i `_bmad/custom/config.toml`.
- Ikke rediger `.claude/skills/`, `.agents/skills/` eller `.github/agents/` for hånd. De er installert av BMad.

## Where things are

- Stegrekkefølge og status: `project-phase-folders/2-Planleggingsfasen/fremdriftsplan.md`. Oppdater status der når et steg er ferdig.
- Agentrekkefølge: Mary → John → Sally → Winston → John (epics) → sprintplanlegging → Amelia. Planleggingen er ferdig, så nytt arbeid bygges av Amelia (`bmad-build`), én story om gangen, i rekkefølgen i `sprintplan.md`.
- Story-status: `project-workspace/implementation-artifacts/sprint-status.yaml`. Story-specs og epic-kontekst ligger i samme mappe.
- Epics og stories finnes bare i `project-phase-folders/2-Planleggingsfasen/SnowFinder-Epics-og-Stories.md`.

## Running and verifying

- TODO etter Story 1.1: Node 24 og npm; `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Verifiseres ved første refresh etter at koden finnes.
- Lås avhengigheter til eksakte versjoner uten `^`, og commit `package-lock.json`. Bruk TypeScript 6.0.x, ikke 7, fordi typescript-eslint krever <6.1.

## Conventions that differ from defaults

- Planleggingsdokumentene finnes i to like kopier. Endre begge i samme commit:
  - `project-workspace/planning-artifacts/product-brief.md` ↔ `project-phase-folders/1-Oppstartsfasen/SnowFinder-Produktbrief.md`
  - `project-workspace/planning-artifacts/prd-*/prd.md` ↔ `project-phase-folders/2-Planleggingsfasen/SnowFinder-PRD.md`
  - `project-workspace/planning-artifacts/ux-*/DESIGN.md` og `EXPERIENCE.md` ↔ `SnowFinder-DESIGN.md` og `SnowFinder-EXPERIENCE.md` i `2-Planleggingsfasen/`
  - `project-workspace/planning-artifacts/architecture/architecture-*/ARCHITECTURE-SPINE.md` ↔ `2-Planleggingsfasen/SnowFinder-Arkitektur.md`

<!-- /bmad:context -->
