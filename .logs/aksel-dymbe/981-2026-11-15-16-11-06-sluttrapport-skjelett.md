# Skjelett til sluttrapporten

## 2026-11-15 kl. 16:11 — Aksel Dymbe

### Oppgave
Aksel godkjente merge av PR #104 og et skjelett til sluttrapporten. Seksjonene er mål og omfang, resultat mot suksessmålene i PRD §9, avvik, brukertest, prosess og KI-bruk, og videre arbeid.

### Plan
- Merge #104 etter grønne sjekker.
- Hente suksessmålene fra PRD §9 og koble hvert mål til testene som dekker det.
- Fylle inn det som allerede er målt, og merke resten *[Fylles inn]*.

### Resultat
- PR #104 er merget (49cfe22).
- Ny fil `project-phase-folders/4-Avslutningsfasen/SnowFinder-Sluttrapport.md` med ti seksjoner. Den lenkes fra `4-Avslutningsfasen/README.md`.
- Hvert A-mål er koblet til testene som dekker det: E2E, fasittabeller i `tests/golden/`, `numRuns: 1000` i `shared/snowscore.test.ts` og axe i E2E.
- SM-13 er fylt inn med målingen fra 15.11. Avvikstabellen har fem rader.
- SM-8 holder ikke helt. 92 PR-er er merget, men steg 3–7 ble committet direkte til main 2026-09-27, og faglærer har committet direkte. Det står ærlig i rapporten.
- KI-loggen har en ny rad, og promptene er lagt til i `2026-11-15-aksel-sally-brukertest.md`. Commit 20d3376 på `docs/sluttrapport-skjelett`.

### Åpne punkter
- Mål SM-1 (500 ms i filteret) og SM-12 (kartet på 4G) manuelt, og før resultatene inn i sluttrapporten.
- Bekreft A-målene i sluttrapporten fra den siste CI-kjøringen før levering.
