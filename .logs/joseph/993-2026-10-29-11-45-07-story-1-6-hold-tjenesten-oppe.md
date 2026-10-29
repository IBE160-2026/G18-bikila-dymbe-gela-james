# Story 1.6: hold tjenesten oppe når en datakilde er nede

## 2026-10-29 kl. 11:45 — Joseph

### Oppgave
Bygge Story 1.6 (Bør ha, FR-6b): nye forsøk når MET eller NVE feiler i dataprogrammet, og banneret for gamle data på Utforsk og stedssiden. Joseph tok over storyen fra Aksel etter avtale.

### Plan
- Installerte `uv` og GitHub CLI i brukermappen (`winget` og Python mangler på skolemaskinen). `gh` er logget inn som PoleDuNord.
- Oppdaterte lokal `main` (69 commits bak) og laget grenen `story/1-6-hold-tjenesten-oppe`.
- `bmad-build` (dispatch): ny `epic-1-context.md`, spec, implementering i en subagent og tre gjennomgangslag.
- Spec med beslutninger og vurderingslogg: [spec-1-6-hold-tjenesten-oppe.md](../../project-workspace/implementation-artifacts/spec-1-6-hold-tjenesten-oppe.md)

### Resultat
- `scripts/pipeline/fetch.ts`: nettverksfeil, 429 og 5xx prøves inntil tre ganger, med 1 s og så 2 s pause, og hvert forsøk går gjennom kallporten. Tidsavbrudd og andre 4xx prøves ikke på nytt. Årsaken får tillegget «(etter N forsøk)».
- Banneret «Viser siste kjente data fra kl. HH:MM» står på Utforsk og stedssiden når `generert` er mer enn 90 min gammel. Det har hvit bakgrunn med kant i `warning` (Josephs valg A, fordi DESIGN.md sitt fargevalg gir 2,92:1). Statusregionen er alltid montert, så skjermlesere leser banneret opp.
- Gjennomgangen ga 22 funn: 9 rettet, 1 utsatt og resten avvist.
- Verifisert lokalt på Windows: lint, typecheck, 629 tester, build og 124 E2E-tester er grønne.
- Commits på grenen: `53c2b6c` (feat) og `562ccf0` (docs: KI-logg, fremdriftsplan, sprint-status `done`, epic-kontekst, deferred-work). Ikke pushet.
- Git-identitet satt lokalt i repoet: Joseph <210066@himolde.no>.

### Åpne punkter
- Sjekk at E2E er grønn i CI (Ubuntu) før merge av 1.6-PR-en. Den er bare kjørt på Windows.
- Oppdater AD-2 i arkitekturen («one attempt») via `bmad-architecture`, og fargene til `banner-stale-data` i DESIGN.md via `bmad-ux`, begge kopier (står i `deferred-work.md`).
- Tidsbudsjett for trege 5xx-svar i `fetch.ts` vurderes når 1.11 går (står i `deferred-work.md`).
- Datakvalitetspanelet skal vise hvor mange steder som er utdatert eller fjernet (utsatt fra 2.3, fortsatt åpent).
