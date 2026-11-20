---
title: 'Story 1.11g: Timesjobben starter neste kjøring selv'
type: 'feature'
created: '2026-11-04'
status: 'done'
baseline_commit: 'ad717485d6a8d0abcac88be462c092641bdf6ba3'
route: 'oneshot'
review_loop_iteration: 0
context: ['project-workspace/planning-artifacts/sprint-change-proposal-2026-11-04-timer.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Etter 1.11f startet GitHub bare 7 planlagte kjøringer av `data.yml` på omtrent 49 timer. Dataene på nettsiden var ofte 4 til 8 timer gamle, så FR-2 (hver time) og NFR-3 (under 90 min) er ikke oppfylt, og Story 1.11 kan ikke settes til `done`.

**Approach:** Godkjent endringsforslag `sprint-change-proposal-2026-11-04-timer.md` (Aksel, 2026-11-04). Hver kjøring av `data.yml` på `main` som har hentet data, også en avvist, starter den nye `data-timer.yml` med `workflow_dispatch`. Timeren sover til dataene er rundt 55 min gamle (minst 30 min), leser alderen på nytt og starter `data.yml` bare når dataene er minst 50 min gamle. Bare én timer om gangen (`cancel-in-progress`). Timeplanen og `gate` er uendret og står som reserve. Fila forklarer hvordan sovingen byttes ut med et environment med wait timer når en admin har laget det. Testen av workflowen utvides, og README, Story 1.11, PRD FR-2 og arkitekturen (begge kopier) oppdateres. Annen funksjonalitet endres ikke.

</frozen-after-approval>

## Implementation Notes

- **`data-timer.yml` (ny):** bare `workflow_dispatch`, `concurrency: data-timer` med `cancel-in-progress: true`, `timeout-minutes: 70`, tilgangene `actions: write` og `contents: read`. Steg 1 leser tidspunktet for siste commit på grenen `data` gjennom API-et, som `gate`, og sover `55 − alder` minutter, men minst 30 (55 når alderen ikke kan leses). Steg 2 leser alderen på nytt og kjører `gh workflow run data.yml --ref main` bare når dataene er minst 50 min gamle, eller når alderen ikke kan leses.
- **`data.yml`:** ny siste jobb `timer` med `needs: [gate, data, branch, verify]` og `if: always() && main && ikke PR && gate slapp gjennom`. Den har bare `actions: write` og kjører `gh workflow run data-timer.yml --ref main`. Kommentaren øverst forklarer hvorfor. Timeplanen og `gate` er uendret.
- **Hvorfor bare kjøringer som har hentet:** et planlagt forsøk som `gate` stopper, ville ellers startet en ny timer og avbrutt den som venter, så nedtellingen begynte på nytt.
- **Test:** `scripts/pipeline/data-workflow.test.ts` leser nå også `data-timer.yml` og sjekker vilkårene for `timer`, at timeren bare startes med dispatch og bare én venter, at målalderen gir minst 20 min før banneret, minstetiden på minst 30 min, at sperren er lik grensen i `gate`, og at `timeout-minutes` er lengre enn den lengste ventetiden.
- **Prøvd for hånd:** begge stegene ble kjørt mot det ekte API-et, med `sleep` og `gh` byttet med `echo`: ferske data (venter 46 min, og steg 2 starter ingenting), gamle data (venter minstetiden 30 min), feil adresse (advarsel, venter 55 min) og data eldre enn sperren (starter `data.yml`).
- **Kan ikke prøves i PR-en:** GitHub tillater bare `workflow_dispatch` på workflows som finnes på standardgreinen. Kjeden prøves første time etter merge, i Actions-fanen og på nettsiden.
- **Dokumenter:** README, Story 1.11, PRD FR-2 og arkitekturen (begge kopier, sjekket like med `cmp`), `epic-1-context.md`, `deferred-work.md`, fremdriftsplanen og KI-loggen.
- **Måling etter merge:** et døgn med målinger hvert 10. minutt av alderen på `https://snowfinder-seven.vercel.app/data/latest.json`. Story 1.11 settes til `done` når dataene er under 90 min gamle i minst 20 av 24 timer. Til da står 1.11 som `in-progress`.
- **Etter gjennomgangen:** jobben `timer` starter også når `gate` feilet (`run != 'false'`). En dispatch som feiler, gir en advarsel og ikke en rød kjøring. Testen sjekker `workflow_dispatch` i `data.yml` og `actions: write` i begge filene. `data-timer.yml` forklarer at alderen regnes fra commit-tidspunktet. README sier hva som skjer når «Data timer» er slått av.

## Review Triage Log

Gjennomgang med Blind Hunter (13 funn).

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | Timeren regner alder fra commit-tidspunktet, banneret fra `generert` | low | patch | Stemmer. Forskjellen er én kjøring, rundt 1,5 min (`varighetMs` 91 s). Står nå i `data-timer.yml`. |
| 2 | 20 min margin er under verste fall på rundt 35 min | low | avvist | Verste fall er en treg MET. En vanlig kjøring tar rundt 1,5 min, så neste fil kommer etter rundt 58 min. Lavere målalder enn sperren på 50 min ville stoppet kjeden. |
| 3 | En avslått «Data timer» gjør hver kjøring rød | medium | patch | Stemmer. Dispatch som feiler, gir nå en advarsel. |
| 4 | En feilet dispatch gjør en publisert kjøring rød | medium | patch | Samme rot som 3. |
| 5 | Kjeden stopper når `gate` feiler | low | patch | Vilkåret er nå `run != 'false'`. Timeren regner ventetid fra alderen, så en ny timer begynner ikke nedtellingen på nytt. |
| 6 | Ingen test for `workflow_dispatch` i `data.yml` og `actions: write` | low | patch | Lagt til. Testen feiler når vilkåret settes tilbake. |
| 7 | Skriptet i timeren er ikke testet i repoet | low | avvist | Samme som utsatt post for `gate` og `verify` (1.11f #5). Prøvd for hånd i fire tilfeller. |
| 8 | Negativ alder starter `data.yml` | low | avvist | Krever en commit fra framtida. Oppfører seg som `gate`. |
| 9 | Fremdriftsplan og KI-logg mangler | false | avvist | Lagt inn før commit, som spec-en sier. Datoene i «Tidslinje» og `milepæler.md` er uendret. |
| 10 | 1.11g står ikke i `sprint-status.yaml` eller `sprintplan.md` | false | avvist | Del av Story 1.11, som 1.11b–f. 1.11 står som `in-progress`. |
| 11 | 20 av 24 timer er svakere enn NFR-3 | false | avvist | Samme kriterium som Aksel godkjente for 1.11f og i endringsforslaget. NFR-3 sier «normalt». |
| 12 | En dispatchet kjøring kan erstattes av et planlagt forsøk i køen | false | avvist | Forsøket kommer når dataene er over 50 min gamle, så `gate` slipper det gjennom, og det starter en ny timer. |
| 13 | `deferred-work.md` har LF | false | avvist | Git normaliserer linjeskift ved commit (advarselen gjelder arbeidskopien). |
