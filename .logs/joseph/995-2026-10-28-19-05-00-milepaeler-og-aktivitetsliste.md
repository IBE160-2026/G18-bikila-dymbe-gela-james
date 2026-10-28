# Milepæler og aktivitetsliste

## 2026-10-28 kl. 19:05 — Joseph

### Oppgave
Sette Story 3.7 til `done` etter at PR #66 ble merget uten det, og lage et fornuftig forslag til milepæler og en aktivitetsliste ut fra epics og stories, både grafisk og skriftlig, på riktig sted i prosjektfasemappene.

### Plan
- 3.7: fem endringer i `sprint-status.yaml` og `fremdriftsplan.md` på greina `docs/sett-3-7-ferdig`.
- Milepæler: fire uker igjen, omtrent én uke per del, kodefrys før brukertesten og en uke til rettinger.
- Aktivitetsliste i `aktivitetsdiagram.md` (ingen ny statusfil, jf. AGENTS.md), med avhengigheter fra sprintplanen og epics-dokumentet, og datoer fra PR-historikken.
- Flettekonflikten i #66 tidligere i dag: [flettekonflikt-pr-66](996-2026-10-28-18-11-17-flettekonflikt-pr-66.md) (ligger på greina `docs/webapp-terminologi`).

### Resultat
- `3e8a8a1` på `docs/sett-3-7-ferdig`: 3.7 satt til `done`, og fremdriftsplanen er oppdatert.
- `0eff6d9` på `docs/milepaeler-og-aktivitetsliste` (bygger på `3e8a8a1`):
  - `milepæler.md`: M4 med 3.1–3.7 nådd, M5 «Bør ha og kodefrys» 2026-11-11, reserven for 1.11 avgjøres 2026-11-04, og ny seksjon «Forslaget fra 2026-10-28».
  - `fremdriftsplan.md`: tidslinjen har fått 3.8, 1.6, retrospektiv for Epic 3, rettinger etter brukertesten og generalprøve.
  - `aktivitetsdiagram.md`: oppdatert flyt, avhengighetsdiagram for alle 29 stories og tabeller for stories og aktivitetene P1–P12.
  - README i 2- og 3-mappa, og KI-loggen med prompter.
- Lint, typesjekk, 545/545 tester og bygg er grønne. Ingenting er pushet.

### Åpne punkter
- Gruppa vedtar eller endrer de nye fristene på neste møte, og fordeler ansvarlig for 1.6, 1.11, 4.2, steg 8c, brukertesten og generalprøven.
- Mermaid-diagrammene er ikke sjekket med en renderer. Se at de vises riktig på GitHub i PR-en.
- 3.8 trenger synlig kopi-PR og review.
