# 2026-10-08: Story 1.5, beregn og publiser SnowScore

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-build` (Amelia), oneshot-rute. En underagent gjorde gjennomgangen (Blind Hunter).
**Fase:** Gjennomføring
**Resultat:** [`spec-1-5-beregn-og-publiser-snowscore.md`](../../project-workspace/implementation-artifacts/spec-1-5-beregn-og-publiser-snowscore.md), `scripts/pipeline/run.ts`, `scripts/pipeline/publish.ts`, `shared/snowscore.ts` og `public/data/demo.json`.

## Prompter

### 1
> lov til å merge

**Svar (kort):** Claude merget PR #23 (Story 1.3) og foreslo Story 1.5 som neste.

### 2
> ja

**Svar (kort):** Claude startet Story 1.5. Publiseringssteget fantes allerede fra Story 1.10, så storyen var liten og gikk den korte veien (oneshot): `runLive` kaller nå `publish.ts` med `latest.json` som mål.

**Hva vi gjorde med det:**
- Den første ekte `npm run data` publiserte ikke. Ett sted fikk delpoeng C = 15.000000000000002, og skjemaet tillater høyst 15. Feilen lå i `shared/snowscore.ts` fra Story 1.4: `(15 × N) / P` gir avrundingsfeil. Den er rettet til `15 × min(1, N / P)`, og en test fanger feilen. Tre verdier i `demo.json` endret seg i siste desimal, og poengsummene er uendret.
- Gjennomgangen ga 10 funn. 3 er rettet: avvisningene logges nå også når kjøringen publiseres, README sier at en gammel `latest.json` blir liggende, og et notat i specen er korrigert.
- Prøvekjøring: 300 steder publisert, 100 % gyldige, 4 kyststeder uten NVE-data.
