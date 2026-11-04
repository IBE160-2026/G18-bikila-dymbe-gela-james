---
title: 'Story 1.11f: Timesjobben tåler at GitHub hopper over kjøringer'
type: 'feature'
created: '2026-11-02'
status: 'done'
baseline_commit: '765bc4f78e4efb571433e0d7e80b72ab66681071'
route: 'oneshot'
review_loop_iteration: 0
context: ['project-workspace/planning-artifacts/sprint-change-proposal-2026-11-02-timesjobb.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Natt til 2. november startet GitHub bare 2 av 14 planlagte kjøringer av `data.yml` (`cron: '17 * * * *'`). Dataene på nettsiden ble opptil 6 t 36 min gamle, og banneret «Viser siste kjente data» (90 min) sto det meste av natten. Kjøringene som startet, nådde nettsiden.

**Approach:** Godkjent endringsforslag `sprint-change-proposal-2026-11-02-timesjobb.md` (Aksel, 2026-11-02). Timeplanen blir `'5,15,25,35,45,55 * * * *'`. En ny første jobb, `gate`, uten tilgang og uten checkout, leser `generert` i `latest.json` på grenen `data` og stopper bare planlagte kjøringer når fila er yngre enn 50 min. Kan alderen ikke leses, kjører alt som før. `data` får `needs: gate`. En Vitest-test leser `data.yml` og holder intervall og grense i takt med banner-grensen. README, Story 1.11, PRD FR-2 og arkitekturen (begge kopier) oppdateres. Annen funksjonalitet endres ikke.

</frozen-after-approval>

## Implementation Notes

- **`data.yml`:** timeplanen er `5,15,25,35,45,55 * * * *`. Ny første jobb `gate` (`contents: read`, ingen checkout) leser tidspunktet for siste commit på grenen `data` gjennom GitHub-API-et med `GITHUB_TOKEN`. `data` har `needs: gate` og `if: needs.gate.outputs.run == 'true'`. `branch` og `verify` hopper over seg selv når `data` er skipped.
- **Avvik fra endringsforslaget:** forslaget sa at `gate` skulle lese `generert` i `latest.json`. `raw.githubusercontent.com` cacher i 5 min, og en `?t=`-parameter hjelper ikke (målt `X-Cache: HIT`). Et forsøk i køen kunne da se den gamle fila og hente på nytt. Commit-tidspunktet ligger rundt 30 s etter `generert` og leses uten cache.
- **Prøvd for hånd:** skriptet ble kjørt mot det ekte API-et med gamle data (`run=true`), med en grense over alderen (`run=false`), mot en gren som ikke finnes (advarsel og `run=true`), og med `EVENT=push` (`run=true`).
- **Test:** `scripts/pipeline/data-workflow.test.ts` leser `data.yml` og sjekker at timeplanen har minst fire forsøk i timen, og at det er minst to intervaller mellom grensen og `GAMLE_DATA_ETTER_MS`. Den sjekker også at grensen er minst 45 min, og at bare `schedule` kan hoppe over.
- **Dokumenter:** README, Story 1.11, PRD FR-2 og arkitekturen (begge kopier), `epic-1-context.md`, fremdriftsplanen og KI-loggen.
- **Måling etter merge:** Aksel eller Claude kjører et døgn med målinger hvert 10. minutt av `generert` på `https://snowfinder-seven.vercel.app/data/latest.json`, med samme skript som natt til 2. november. Story 1.11 kan settes til `done` når dataene er under 90 min gamle i minst 20 av 24 timer, og `gate` har hoppet over minst én gang.
- `sprint-status.yaml` beholder 1.11 som `in-progress` til målingen er gjort. 1.11 er hele storyen, ikke bare denne spec-en.

## Review Triage Log

Gjennomgang med Blind Hunter (14 funn).

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | `gate` leser fila gjennom cachen i raw og kan hente to ganger | medium | patch | Målt: `?t=` gir fortsatt `X-Cache: HIT`. Leser nå commit-tidspunktet gjennom API-et. |
| 2 | «Fire forsøk mellom 50 og 90 min» regner ikke med kjøretid | low | patch | Kommentaren sier nå at fire forsøk *starter* i vinduet. En vanlig kjøring tar rundt 30 s (`varighetMs`). |
| 3 | Testen regner ikke med kjøretid og cache | low | avvist | Kjøretiden er rundt 30 s. Testen sjekker forsøk som starter, slik kommentaren sier. |
| 4 | Ventende push- eller PR-kjøring kan bli erstattet av et planlagt forsøk | maybe-false | defer | Vinduet er kort. Avgjøres etter merge av PR #81. |
| 5 | Logikken i `gate` er ikke testet i repoet | medium | defer | Prøvd for hånd i fire tilfeller. Samme post som skriptet i `verify`. |
| 6 | Spec-en mangler akseptkriterier, oppgaver og vurderingslogg | false | avvist | Oneshot-ruten bruker bare Intent og notater. Loggen er lagt til nå. |
| 7 | KI-loggraden mangler tall for funnene | low | patch | Lagt til. |
| 8 | `epic-1-context.md` mistet testkrav, design-tokens og annet | high | patch | Stemmer. Fila er tilbakestilt, og bare 1.11f er lagt til. |
| 9 | Foreldet tekst om «neste time» i PRD, README og `data.yml` | low | patch | Rettet. |
| 10 | Utsatt post om lange kjøringer gjelder nå oftere | low | defer | Koblet i `deferred-work.md`. |
| 11 | Restrisikoen er ikke registrert | low | patch | Ny post i `deferred-work.md`. |
| 12 | Ingen konkret plan for målingen som avgjør `done` | low | patch | Står over. |
| 13 | Lang linje i README, og README nevner ikke antallet kjøringer | low | patch | Rettet. |
| 14 | `aktivitetsdiagram.md` og «Tidslinje» er ikke oppdatert | false | avvist | Arbeidsflyten fram til levering og datoene er uendret. Ingen steg er ferdig. |
