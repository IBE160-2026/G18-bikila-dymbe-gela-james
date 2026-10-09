# 2026-10-09: Revisjon av arbeidet, og retting av rød E2E

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5). Seks underagenter: `bmad-review` med linsene adversarial og edge-case på dataprogrammet og nettappen, verification-gap og en dokumentrevisjon. I tillegg en ren klone av repoet og `bmad-build` (oneshot) for rettingen.
**Fase:** Gjennomføring
**Resultat:** [`spec-fix-e2e-mobil-tabeller.md`](../../project-workspace/implementation-artifacts/spec-fix-e2e-mobil-tabeller.md), `src/App.css` og `tests/e2e/forklaring.spec.ts`.

## Prompter

### 1
> sjekk at det ikke har blitt gjort noe feil eller er noen svakheter i arbeidet som tildligere er gjort

**Svar (kort):** Alle kommandoene i README-en virket i en ren klone. Det viktigste funnet var en feil Claude selv hadde gjort: GitHub Actions er slått på, og E2E har vært rød siden PR #33, men PR #33–#38 ble merget fordi AGENTS.md sa at Actions var av. Revisjonen fant også feil i dataprogrammet og nettappen, og flere utdaterte dokumenter.

### 2
> klar til å fortsette

### 3
> ja

(Svar på forslaget om å rette rød E2E først og dokumentene deretter.)

**Hva vi gjorde med det:**
- Rotårsaken var at tabellene på forklaringssiden ble for brede med fontene i CI. Tabellene ruller nå i sin egen fokuserbare beholder, og cellene er tettere på mobil.
- En ny E2E med bred font fanger feilen også på Windows.
- Claude merger heretter bare når `gh pr checks` er grønn.
