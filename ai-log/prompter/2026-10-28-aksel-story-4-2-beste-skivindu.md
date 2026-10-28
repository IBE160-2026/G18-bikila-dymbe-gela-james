# 2026-10-28 – Aksel: Story 4.2, beste skivindu

Verktøy: Claude Code (Opus 5.5), `bmad-build` (dispatch) med underagenter: epic-kontekst, kodeundersøkelse,
implementering og tre gjennomgangslag (Blind Hunter, Edge Case Hunter, Verification Gap).

## Promptene ordrett

1. kjør 4.2
2. ok legg story 4.2 inn i git hub
3. ok takk

## Valgene Aksel tok (spørsmål fra Claude, svar fra Aksel)

1. **For få sammenhengende dagslystimer:** «Kortere vindu (Anbefalt)». Vis det beste kortere vinduet med
   teksten «Bare N sammenhengende dagslystimer». Alternativene var «Ingen vindu, forklar» og «Bruk alle timer».
2. **Mørketid i demodata:** «Test, ikke demosted (Anbefalt)». Demodataene gjelder 7. oktober, da det ikke er
   mørketid noe sted i Norge. Mørketid dekkes av tester, og avviket fra FR-30 går til `bmad-correct-course`.
   Alternativet var et fiktivt testpunkt på 86° nord.
3. **Rangering:** «Vind først (Anbefalt)». Lavest snittvind avrundet til hele m/s, så skydekke, så tidligst.
   Alternativet var en samlet poengsum der vind og skydekke teller likt.

## Hva Claude gjorde

- Satte sammen `epic-4-context.md`, undersøkte koden og skrev `spec-4-2-beste-skivindu.md`.
- En implementeringsagent bygde funksjonen `shared/skivindu.ts`, fasittabellen, kontraktfeltene, dataprogrammet,
  kortet på stedssiden, tester og README etter spec-en.
- Tre gjennomgangslag fant 21 funn. 5 ble rettet, 2 utsatt til `deferred-work.md` (mørketidsvindu om natta
  og AD-12/UX-dokumentene), og resten ble avvist med begrunnelse i spec-ens Review Triage Log.
- Lint, typesjekk, 607/607 tester, build og 121/121 E2E er grønne lokalt.
