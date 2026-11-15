# Brukertest-materiell

## 2026-11-15 kl. 15:34 — Aksel Dymbe

### Oppgave
Aksel ba om en plan for brukertesten og godkjente forslaget med tidsplan, roller, materiell og nye datoer.

### Plan
- Testplanen fantes allerede i EXPERIENCE.md (steg 8c). Det som manglet, var planen for selve gjennomføringen.
- Arbeidet ble gjort med Sally (`bmad-ux`) i Update-modus på greinen `docs/brukertest`.
- Forslaget er beskrevet i [prompter/2026-11-15-aksel-sally-brukertest.md](../../ai-log/prompter/2026-11-15-aksel-sally-brukertest.md).

### Resultat
- Ny mappe `project-phase-folders/3-Gjennomføringsfasen/brukertest/`:
  - `README.md`: tidsplan, roller, deltakerliste med koder og sjekkliste for demomodus.
  - `testmanus.md`: det testlederen leser opp ordrett, de fem oppgavene med fasit og Safari-sjekken.
  - `observasjonsskjema.md`: ett skjema per deltaker.
  - `resultater.md`: mal for resultatene målt mot SM-2, SM-3, SM-4 og SUS, og funn med prioritet.
- Fasiten er sjekket mot `demo.json` etter Story 1.8b. Trysil er eneste treff på oppgave 1, Gaustatoppen har 58 poeng, og Kirkenes er utdatert. Etikettene i manuset finnes i koden.
- Nye datoforslag: ingen nye stories etter 16.11, brukertest 17.–19.11 (F4), kodefrys og 1.11 i drift 21.11 (M1/M5). Kodefrysen er delt i to fordi den gamle milepælen frøs koden *før* testen.
- Datoene er oppdatert i `fremdriftsplan.md` («Hvor er vi nå?», gantt og tabell), `milepæler.md` (ny seksjon «Forslaget fra 2026-11-15»), `aktivitetsdiagram.md` og begge kopiene av EXPERIENCE.md. UX-memloggen er oppdatert.
- KI-loggen har fått en ny rad og en promptfil. Commit 0025ea2. Lint er grønn.

### Åpne punkter
- Rekrutter 5–6 deltakere innen 16.11. Minst én bør ha iPhone med Safari.
- Gruppa bekrefter de nye datoene (16.11, 17.–19.11 og 21.11) på neste møte. Bytt så «forslag» med «vedtatt».
