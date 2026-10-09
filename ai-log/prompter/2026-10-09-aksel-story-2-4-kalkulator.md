# 2026-10-09: Story 2.4, kalkulatoren «Prøv selv»

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5). `bmad-build` i oneshot-rute med Blind Hunter som underagent.
**Fase:** Gjennomføring
**Resultat:** [`spec-2-4-snowscore-kalkulator.md`](../../project-workspace/implementation-artifacts/spec-2-4-snowscore-kalkulator.md), `src/components/Kalkulator.tsx` og `src/components/Kalkulator.test.tsx`.

## Prompter

### 1
> bygg story 2.4. deretter pusher du alt inn i git hub repoet

**Svar (kort):** Kalkulatoren har to felt, slik EXPERIENCE.md beskriver. For å bruke den delte modulen uendret fordeler den nedbøren jevnt over 24 timer med samme temperatur hver time, og det står i teksten. Policyen tillater ikke push direkte til `main`, så alt ble levert som PR og merget.

**Hva vi gjorde med det:** Gjennomgangen ga 11 funn, og 7 ble rettet. De viktigste:
- iPhonens desimaltastatur har ikke minustegn, så temperaturfeltet bruker nå tekst-tastaturet;
- bare sumlinjen er en live-region, så skjermlesere ikke leser hele lista for hvert tastetrykk;
- en test viser at kalkulatoren gir nøyaktig modulens svar for 64 kombinasjoner.
