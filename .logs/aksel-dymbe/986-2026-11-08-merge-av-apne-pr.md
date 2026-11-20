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

## 2026-11-09 kl. 06:03 — Aksel Dymbe

### Oppgave
Oppdatere #83 og #85 mot main så de er klare når godkjenningen kommer, vise konflikter i kode, DESIGN.md, EXPERIENCE.md og Epics-fila før de løses, beholde alt i loggfilene, og merge etterpå.

### Plan
- Flett main inn i begge greinene, vis konfliktene og løs dem etter Aksels valg.
- Vent på grønne sjekker, og vent på «Approve» fra et annet gruppemedlem før merge (AGENTS.md).

### Resultat
- #97 (statusoppdatering) merget som `731931d`; main grønn.
- #83 (1.8b) oppdatert som `1ce2f05`: «Fargeforklaring» fra main og ny «Listerad (destinasjonskort)» fra #83 i DESIGN.md og EXPERIENCE.md (begge kopiene like). `fremdriftsplan.md` fra main, #83s tillegg under 2. november (kveld).
- #85 (3.9) oppdatert som `1364259`: begge blokkene i `filter.css` (+100 linjer mot main), `epic-3-context.md` fra main pluss linjen om «Oppfyller ikke filteret» og `aria-live` for antall forslag. Lokalt 159 E2E-tester grønne.
- Loggfilene: alle linjene beholdt.
- Alle sjekkene er grønne på begge PR-ene, men ingen fikk «Approve» i løpet av sju timers venting (sjekket hvert tiende minutt til 06:02). Derfor er ingen av dem merget, og 1.8b og 3.9 er ikke satt til `done`.

### Åpne punkter
- #83 og #85 venter på «Approve» fra et annet gruppemedlem; merge så #83 → #85 og sett 1.8b og 3.9 til `done` i en docs-PR.
- SRS-F-34 må oppdateres nå som #90 (1.6b) er merget (står alt i `issues.md`).
