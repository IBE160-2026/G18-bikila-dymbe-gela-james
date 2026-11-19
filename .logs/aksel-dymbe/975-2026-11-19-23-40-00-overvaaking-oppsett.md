# Overvåking-oppsett

## 2026-11-19 kl. 23:40 — Aksel Dymbe

### Oppgave
Sette opp overvåkingsagenten som en planlagt Claude-økt (NFR-6), og få den til å virke.

### Plan
- Opprette rutinen med `/schedule` og kjøre prøver.
- Da nettsiden var blokkert: endringsforslag via `bmad-correct-course`
  ([sprint-change-proposal-2026-11-19-overvaaking-fra-data-grenen.md](../../project-workspace/planning-artifacts/sprint-change-proposal-2026-11-19-overvaaking-fra-data-grenen.md)).

### Resultat
- Rutinen `trig_01KqK786NUhCuEwP1JzeDDQJ` (SnowFinder-overvåking):
  - cron `0 5,11,17,23 * * *` UTC, Sonnet 5.5, Bash/Read/Glob/Grep og ingen connectors;
  - miljø `env_01DAJZdP1y8Ga6QRvK1sFddY`.
- Fem prøvekjøringer (22.46–23.18) ble stoppet av sperren mot `snowfinder-seven.vercel.app`, også med «Full». Agenten laget ingen
  issues og varslet hver gang. Det andre miljøet (`env_01PMk…`) hentet en gammel `main`.
- Endringsforslaget er godkjent. Agenten leser `latest.json` på grenen `data` og statusen `Vercel` på `main` gjennom GitHub.
- Endret i greina `docs/overvaaking-fra-data-grenen`:
  - NFR-6, SRS-N-11 (versjon 2.6) og AD-11;
  - epics og README;
  - `drift/overvaakingsagent.md`;
  - fremdriftsplanen, ai-log og prompter.
- Rutinen er **slått av**.

### Åpne punkter
- Etter merge: oppdater prompten i rutinen (uten nettadressen), slå den på og kjør de fire prøvene. Legg lenken til issuet inn i fremdriftsplan.md.
- Agenten ser ikke om nettsiden er nede etter en vellykket publisering. Ta det med i sluttrapporten.
