---
title: 'Lokale git-hooks som erstatter CI til Actions er på'
type: 'chore'
created: '2026-10-07'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** GitHub Actions er ikke slått på i repoet, og bare faglærer har tilgang til å gjøre det. Derfor kjører ikke CI (`lint`, `typecheck`, `test`, `build`) på pull requests. Ingenting hindrer heller at noen pusher direkte til `main` eller pusher kode som feiler.

**Approach:** En versjonert `pre-push`-hook i `.githooks/` gjør to ting. Den avviser push til `main`, og den kjører de fire sjekkene og stopper pushen hvis én feiler. Hooken slås på automatisk ved `npm ci`/`npm install` gjennom et `prepare`-script som setter `core.hooksPath`. Det krever ingen ny avhengighet og ingen konto. README forklarer hooken og hvordan den hoppes over i nødstilfeller. Regelen om at et annet gruppemedlem godkjenner før merge kan ikke håndheves lokalt og er utenfor omfanget.

</frozen-after-approval>

## Implementation Notes

- `.githooks/pre-push`: POSIX `sh`. Den leser refene git sender på stdin og avviser hvis målet er `refs/heads/main`. Deretter kjører den `npm run lint`, `typecheck`, `test` og `build` i den rekkefølgen, og stopper ved første feil. Den er committet med kjørbar modus (100755).
- `package.json`: `"prepare": "git config core.hooksPath .githooks || exit 0"`. `|| exit 0` virker både i `sh` og i Windows `cmd`, så `npm ci` feiler ikke der git mangler (for eksempel i et byggmiljø uten `.git`). `package-lock.json` er uendret.
- `.gitattributes` (ny): `.githooks/* text eol=lf`. Uten den ville `core.autocrlf` på Windows gitt CRLF-linjeskift, og da virker ikke `#!/bin/sh` på Mac og Linux.
- `README.md`: ny del «Sjekk før push».
- **Verifisert manuelt** (Windows, Git Bash, Node 26):
  - push til `main` gir exit 1 med melding;
  - push til en vanlig grein kjører alle fire sjekkene og gir exit 0;
  - en midlertidig typefeil stopper pushen ved `typecheck` med exit 1;
  - `npm run prepare` setter `core.hooksPath` til `.githooks`.
- Ingen automatisk test. Hooken er et shell-script uten logikk utover det som er verifisert over, og en test ville krevd et eget git-repo i testmiljøet.

## Review Triage Log

Gjennomgang 2026-10-07 med Blind Hunter (ett lag, oneshot-ruten). Edge Case Hunter og Verification Gap inngår ikke i oneshot.

| # | Funn | Vurdering | Avgjørelse |
|---|---|---|---|
| 1 | Hooken tester filene på disk, ikke de pushede commitene | medium | **patch:** hooken stopper ved ucommittede endringer i sporede filer. Verifisert: exit 1 med melding. |
| 2 | README sier at hooken «gjør samme jobb som CI» | low | **patch:** omformulert til lokal erstatning med kjente forskjeller |
| 3 | `--no-verify` hopper også over vernet mot push til `main` | low | **patch:** README sier at det bare skal brukes ved feilende sjekker, aldri mot `main` |
| 4 | Ingen instruks for kloner som allerede finnes, og bare `npm ci` nevnes | low | **patch:** README nevner `npm run prepare`, `git config core.hooksPath` og `npm install` |
| 5 | Sletting av greiner og tagger kjører alle sjekkene | low | **avvist:** sjeldent (greiner slettes vanligvis i GitHub) og ufarlig; retting gir mer kompleksitet |
| 6 | `prepare` overskriver en eksisterende `core.hooksPath` | low | **avvist:** ingen i gruppa bruker globale hooks; retting gir mer kompleksitet |
| 7 | Godkjenningsregel og nedgradering når Actions er på | — | **defer** → `deferred-work.md` |
| 8 | `.gitattributes` for hele repoet, automatisk test, ikke testet på Mac/Linux | low | **defer** → `deferred-work.md` |
| 9 | Spec-status og triagelogg mangler | false | Fylles ut i dette steget, som workflowen sier |
| 10 | Ingen rad i sprint-status eller ai-log | false | Ikke en epic-story (ingen story-nøkkel). KI-loggen skrives med commiten. |
| 11 | AGENTS.md nevner ikke hooken | false | AGENTS.md i PR #14 nevner den allerede (§3) |
