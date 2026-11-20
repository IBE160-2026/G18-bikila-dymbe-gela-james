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

## 2026-11-20 kl. 09:10 — Aksel Dymbe

### Oppgave
Få overvåkingsagenten i drift etter at den ikke fikk skrive issues (403), og kjøre prøvene.

### Plan
- Endringsforslag om push-varsel ([sprint-change-proposal-2026-11-19-overvaaking-push-varsel.md](../../project-workspace/planning-artifacts/sprint-change-proposal-2026-11-19-overvaaking-push-varsel.md)), PR #119.
- Rette sjekk 1 etter at prøve A ga en falsk «Publiseringen har feilet», PR #120.
- Prøvene A, B og C.

### Resultat
- PR #119 og #120 er merget. Sjekk 1 leser Vercel-statusen gjennom PR-en som ble merget, og en status agenten ikke får lest, regnes som ukjent.
- Prøve A (grense 1 min): avvik, 403, og så push-varsel. Bestått.
- Prøve B: issue #121 laget for hånd. Agenten så det og sendte ikke varsel. Bestått, men den kom fram til det fordi ingen diagnose passet (`data.yml` kjørte), ikke fordi diagnosen var den samme.
- Prøve C (vanlig prompt, 2 t): kommentaren ga 403, og så kom push-varselet «I orden igjen. Lukk #121». Bestått. #121 er lukket for hånd.
- Rutinen er på med den vanlige prompten. Neste kjøring er kl. 12.03.

### Åpne punkter
- Overvåkingen varsler bare Aksel. Får Claude-appen skrivetilgang til issues, lager agenten issuene selv.
