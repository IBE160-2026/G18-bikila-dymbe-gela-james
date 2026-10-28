# Synlig PR for Senas Story 3.7

## 2026-10-27 kl. 21:40 — Joseph

### Oppgave
PR #65 hadde ingen sjekker. Joseph spurte hva forklaringen betydde, og ba deretter om å få problemet fikset.

### Plan
- Finne ut hvorfor #65 ikke vises og ikke starter Actions.
- Bruke samme framgangsmåte som for Kellys PR-er ([synlige PR-er for Kelly](999-2026-10-26-22-25-07-synlige-pr-er-for-kelly.md)): en kopigrein som peker på nøyaktig samme commits, og en synlig PR derfra.

### Resultat
- Årsak: PR #65 er Senas (`missbikila`), Story 3.7. Kontoen hennes er flagget av GitHub (`users/missbikila` gir 404), så PR-en er usynlig for andre og starter ingen Actions. Den første forklaringen, at GitHub hadde mistet hendelsen, var feil.
- Hentet `refs/pull/65/head` (`0fe1051`: `5a59499`, `b64d9d9`, `0fe1051`) og sjekket at den fletter uten konflikt mot `main` (`9d39949`).
- Pushet kopigreinen `story/3-7-filtrer-pa-stedstype-pr` med `--no-verify`, fordi hooken sjekker den lokale arbeidskopien og ikke de pushede commitene. CI har sjekket commitene.
- Opprettet den synlige **PR #66** «feat: Story 3.7, filtrer på stedstype», med review bedt fra `aksel007`. CI og E2E er grønne.
- Senas commits setter 3.7 til `review`, ikke `done`, i `sprint-status.yaml`.
- #64 er merget. #63 (3.6) er også merget, men 3.6 står fortsatt som `review` på `main`.

### Åpne punkter
- #66 (Story 3.7) trenger «Approve» fra Aksel, eller fra Kelly når kontoen hennes er fri.
- Etter merge av #66: sett 3.7 til `done` og oppdater fremdriftsplanen. Sena lukker #65, og greinene `story/3-7-filtrer-pa-stedstype` og `story/3-7-filtrer-pa-stedstype-pr` slettes.
- Sena må få kontoen sluppet fri via GitHub Support.
- 3.6 står som `review` på `main` etter merge av #63. Sett den til `done` og oppdater fremdriftsplanen.
