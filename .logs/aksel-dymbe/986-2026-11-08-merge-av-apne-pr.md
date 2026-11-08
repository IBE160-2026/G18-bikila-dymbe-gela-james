# Merge av åpne PR-er

## 2026-11-08 — Aksel Dymbe

### Oppgave
Merge de åpne PR-ene etter gruppas review, én om gangen i rekkefølgen #89 → #96, #83, #85. Story-PR-er bare med «Approved» fra et annet gruppemedlem. Oppdater greinen og basen der det trengs, behold alle linjer ved konflikter i loggene, og stopp ved konflikter i DESIGN.md, EXPERIENCE.md, Epics-fila eller kode. Til slutt: status i `sprint-status.yaml` og `fremdriftsplan.md` i en egen docs-PR.

### Plan
- For hver PR: sjekk godkjenning, flett main inn lokalt ved konflikt, push, vent på grønne sjekker, merge, slett greinen, vent på grønn main (CI, E2E, Data).
- Stablede PR-er: #92 satt til base `main` etter #91, #94 og #95 etter #93, før basegreinen ble slettet.

### Resultat
- Merget: #89 (`b55998c`), #90 (`3571b12`), #91 (`acd841e`), #92 (`988cfcc`), #93 (`077cd75`), #94 (`0c715a5`), #95 (`6f33143`) og #96 (`d7b1424`). Main var grønn etter hver av dem.
- Story-PR-ene #90, #92 og #94 hadde «Approved» fra joseph210066.
- Alle unntatt #89 hadde konflikter mot main, bare i `.logs/aksel-dymbe/issues.md`, `ai-log/logg.md`, `sprintplan.md`, `fremdriftsplan.md` og UX-`.memlog.md`. Alle var rene tillegg, og begge sider ble beholdt. Ingen konflikter i DESIGN.md, EXPERIENCE.md, Epics-fila eller kode.
- #83 (1.8b) og #85 (3.9) ble hoppet over: ingen godkjenning, og begge har konflikter mot main.
- `sprint-status.yaml` er ikke endret: 1.6b, 3.1b og 2.5 sto allerede som `done`, og 3.9 kan ikke settes til `done` før #85 er merget.
- Docs-PR fra `docs/status-etter-merge-2026-11-08` med nytt punkt i «Hvor er vi nå?», merknad i steg 9, rad i `ai-log/logg.md` og prompten i `ai-log/prompter/2026-11-08-aksel-merge-av-apne-pr.md`.
- Lukket fem punkter i `issues.md` som merge av #89–#96 løste.

### Åpne punkter
- #83 (1.8b) og #85 (3.9) trenger godkjenning og løsing av flettekonflikter før merge; sett 3.9 til `done` etterpå.
