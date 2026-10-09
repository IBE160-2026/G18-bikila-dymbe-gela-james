# 2026-10-09: Story 2.2, regneeksempelet

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5). `bmad-build` i oneshot-rute med Blind Hunter som underagent.
**Fase:** Gjennomføring
**Resultat:** [`spec-2-2-regneeksempel.md`](../../project-workspace/implementation-artifacts/spec-2-2-regneeksempel.md), `src/components/Regneeksempel.tsx` og `src/components/Regneeksempel.test.tsx`.

## Prompter

### 1
> ja

(Svar på spørsmålet om å merge PR #33 og fortsette med Story 2.2.)

**Svar (kort):** PR #33 ble merget. Claude bygget Story 2.2 i oneshot-ruten, fordi planene avgjorde alt og endringen var liten. Eksempelet regnes med den delte modulen, og en test binder det til briefens tilfelle i fasittabellen.

**Hva vi gjorde med det:**
- Gjennomgangen viste at T̄ = −2,3 gir B = 6,7 når man regner for hånd, mens siden viste 6,8. Claude foreslo å vise to desimaler.
- E2E-testen ved 375 px fanget at tabellen var for bred, og cellene fikk mindre luft på mobil.
- Skjermlesere og T̄ er utsatt i `deferred-work.md`.

### 2
> bruk én desimal

**Svar (kort):** Eksempelet viser igjen én desimal (T̄ = −2,3, B = 6,8, sum 57,8). Rett under B står det at B regnes med den nøyaktige snittemperaturen, −2,333 … °C, og at den som regner etter med −2,3 derfor får et litt annet svar på andre desimal.

**Hva vi gjorde med det:** Fasitlinjene i testen og E2E-testen ble oppdatert. Alle sjekkene er grønne igjen.
