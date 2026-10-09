<!-- bmad:context -->
<!-- Verified 2026-10-09 against f6a5afe. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## SnowFinder (G18, IBE160)

Gruppeprosjekt i IBE160 ved Høgskolen i Molde: en statisk webapp som rangerer ~300 steder i Norge etter prognostiserte snøforhold, med SnowScore (0–100). Vite + React + TypeScript. Dataprogrammet er et Node-script som publiserer én JSON-datafil; det finnes ingen database. Brief, PRD, arkitektur og UX ligger i `project-phase-folders/`, og faglærers tilbakemelding i `project-phase-folders/1-Oppstartsfasen/tilbakemelding-product-brief.md`.

## Policy

- Utfør hvert oppdrag gjennom riktig BMAD-skill, aldri ad hoc: kode og rettinger → `bmad-build`; nye eller endrede krav og omfang → `bmad-correct-course`; arkitektur → `bmad-architecture`; UX → `bmad-ux`; denne filen → `bmad-project-context`.
- Aldri commit eller push til `main`. Hver story får egen gren `story/<story-id>` og leveres som PR med grønne sjekker.
- Logg hver vesentlig KI-økt: én rad i `ai-log/logg.md` (dato, fase, hvem, verktøy/modell, oppgave, endrede/avviste forslag, godkjent av), og promptene ordrett i `ai-log/prompter/ÅÅÅÅ-MM-DD-<navn>-<tema>.md`.
- Svar og skriv nye dokumenter på norsk. Kode, kommentarer og navn i koden skrives på engelsk. Eksisterende engelske dokumenter (arkitekturen, story-specs) redigeres på engelsk.
- Ikke legg til database, brukerkontoer, snøvarsel/push, tilbakemeldingsskjema eller andre tjenester som krever konto eller nøkkel. De er «Ikke i v1» etter faglærers råd; et slikt ønske går til `bmad-correct-course`.
- Ingen hemmeligheter eller `.env` med ekte verdier i repoet. v1 trenger ingen nøkler; MET krever bare en identifiserende User-Agent.
- Ikke rediger `_bmad/config.toml` (installeren overskriver den). Felles overstyringer går i `_bmad/custom/config.toml`.
- Ikke rediger `.claude/skills/`, `.agents/skills/` eller `.github/agents/` for hånd. De er installert av BMad.

## Where things are

- Stegrekkefølge og status: `project-phase-folders/2-Planleggingsfasen/fremdriftsplan.md`. Oppdater status der når et steg er ferdig.
- Planleggingen er ferdig. Nytt arbeid bygges av Amelia (`bmad-build`), én story om gangen, i rekkefølgen i `sprintplan.md`.
- Story-status: `project-workspace/implementation-artifacts/sprint-status.yaml`. Story-specs og epic-kontekst ligger i samme mappe.
- Epics og stories finnes bare i `project-phase-folders/2-Planleggingsfasen/SnowFinder-Epics-og-Stories.md`.
- Utsatte funn fra kodegjennomganger: `project-workspace/implementation-artifacts/deferred-work.md`. Les dem før du bygger i samme område.
- Hvorfor planen ble forenklet: `project-workspace/planning-artifacts/sprint-change-proposal-2026-10-07*.md`.

## Running and verifying

- Node 24, eller 26 og nyere (`engines` i `package.json`). Node 25 støttes ikke av Vitest.
- Kjør `npm run lint`, `npm run typecheck`, `npm test` og `npm run build` før hver commit. CI kjører alle fire, og `npm test` alene typesjekker ikke.
- `npm run test:e2e` kjører i CI (`e2e.yml`), men ikke i pre-push-hooken. Kjør den lokalt før PR når du endrer UI.
- Lås avhengigheter til eksakte versjoner uten `^`, og commit `package-lock.json`. Bruk TypeScript 6.0.x, ikke 7, fordi typescript-eslint krever <6.1.

## Conventions that differ from defaults

- Planleggingsdokumentene finnes i to like kopier. Gjeldende er den i `project-phase-folders/`. Endre begge i samme commit:
  - `project-workspace/planning-artifacts/product-brief.md` ↔ `project-phase-folders/1-Oppstartsfasen/SnowFinder-Produktbrief.md`
  - `project-workspace/planning-artifacts/prd-*/prd.md` ↔ `project-phase-folders/2-Planleggingsfasen/SnowFinder-PRD.md`
  - `project-workspace/planning-artifacts/ux-*/DESIGN.md` og `EXPERIENCE.md` ↔ `SnowFinder-DESIGN.md` og `SnowFinder-EXPERIENCE.md` i `2-Planleggingsfasen/`
  - `project-workspace/planning-artifacts/architecture/architecture-*/ARCHITECTURE-SPINE.md` ↔ `2-Planleggingsfasen/SnowFinder-Arkitektur.md`
- Fjernede krav slettes ikke: merk dem «Ikke i v1» og behold ID-en, så sensor ser hvordan planen utviklet seg.

## Known pitfalls

- Merge aldri før `gh pr checks <n> --watch` viser at alle sjekkene er grønne: CI og E2E kjører på hver PR og push til `main`. PR #33–#38 ble merget med rød E2E fordi sjekkene bare var kjørt lokalt. Grønt lokalt på Windows er ikke grønt i CI: E2E kjører på Ubuntu med bredere fonter, så en layout som passer lokalt kan bli for bred der.
- Push av endringer i `.github/workflows/` blir avvist uten `workflow`-tilgang i gh-innloggingen: kjør `gh auth refresh -h github.com -s workflow`.
- `ai-log/logg.md` får flettekonflikt når flere PR-er legger til rader. Behold alle radene, i datorekkefølge.

<!-- /bmad:context -->

# Prosjektkontekst for agenter

Kort og bindende. Detaljer om krav, arkitektur og design står i brief, PRD, arkitektur og UX i `project-phase-folders/` – les dem der.

## 1. Slik jobber du

- **Hold det enkelt.** Bygg kjeden stedskatalog → data → SnowScore → kart/liste → stedsside → filter ferdig og stabil før noe annet (faglærers råd). Foreslå aldri ny infrastruktur, tjeneste eller avhengighet uten `bmad-correct-course`.
- **Kvalitet framfor mengde.** Ingeniørnivået vises i korrekte tall og meningsfulle tester, ikke i flere deler. Brukervennlighet er hovedpunktet i UX.
- **Sensor skal kunne kjøre alt** med `npm ci && npm run dev` etter README, uten nøkler. Oppdater README når oppsett eller kommandoer endres.
- **Unngå sensors varseltegn:** én stor commit, dokumenter som beskriver noe annet enn koden, README-kommandoer som ikke virker, tester som feiler eller bare tester trivielle ting, og død kode eller rester fra forkastede KI-forsøk.

## 2. Git-strategi (GitHub Flow)

- `main` virker alltid, og ingen jobber direkte på den.
- Én grein per oppgave: `story/<nr>-<kort-navn>` for kode og `docs/<tema>` for dokumentasjon og planlegging. Greinen slettes etter merge.
- Små commits på norsk i imperativ («Legg til …», «Fiks …»), med story-nummer når det finnes.
- Alt leveres som Pull Request. Beskrivelsen lenker til story og krav, og sier hva som er testet og hva som er utsatt.
- Den som lager PR-en kan merge den selv når sjekkene er grønne. Gruppemedlemmer kan gjerne kommentere PR-er, men godkjenning kreves ikke (gruppas beslutning 2026-10-07).
- Kodegjennomgang i to lag: først Amelias KI-gjennomgang i `bmad-build` (funn i spec-ens Review Triage Log), deretter eventuelle kommentarer fra gruppemedlemmer i PR-en.

## 3. Kontinuerlig integrasjon

- Hver PR kjører `npm ci`, lint, typesjekk, tester og bygg (`.github/workflows/ci.yml`) og E2E (`.github/workflows/e2e.yml`). Rød CI stopper merge.
- Pre-push-hooken (`.githooks/pre-push`) kjører de fire sjekkene før push, og stopper push til `main`. Lim resultatet inn i PR-en.
- Playwright-røyktesten i `tests/e2e/` kjører på demodata. Filteret tas med når Epic 3 bygges.

## 4. Teststrategi

- **Enhetstester** (Vitest, ved siden av koden): SnowScore med egenskapstester og fasittabell, filteret med fasittabell, og dataprogrammets steg.
- **Integrasjonstester:** kontraktstester mot lagrede MET- og NVE-svar, og dataprogrammet kjørt på disse (publiserer bare ved minst 95 % gyldige, viser siste gyldige data ved nedetid).
- **Akseptansetester:** hver story har Given/When/Then-kriterier med tester som kjører, pluss røyktesten og en brukertest med minst fem personer.
- **Ansvar:** den som bygger en story skriver testene og sjekker at de tester det kriteriene sier, før merge.

## 5. Åpent for gruppa

- Kursets skjermkrav (profil, innsjekking, feed, arrangementer; pålogging er droppet 2026-10-09) kobles til SnowFinder av Sally (`bmad-ux`) – legg aldri til kontoer eller sosiale funksjoner selv.
- `CONTRIBUTING.md` ligger lokalt hos Joseph og overlapper denne filen; avgjør om den skal inn eller slettes.
