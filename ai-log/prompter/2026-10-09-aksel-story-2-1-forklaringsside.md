# 2026-10-09: Story 2.1, forklaringssiden «Slik beregner vi SnowScore»

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5). `bmad-build` i dispatch-rute: én underagent implementerte fra spec-en, og Blind Hunter, Edge Case Hunter og Verification Gap gjennomgikk koden.
**Fase:** Gjennomføring
**Resultat:** [`spec-2-1-kort-fortalt-og-steg-for-steg.md`](../../project-workspace/implementation-artifacts/spec-2-1-kort-fortalt-og-steg-for-steg.md), `src/pages/SlikBeregnerViSnowScore.tsx`, `src/components/Toppnavigasjon.tsx`, `src/components/ForklaringIllustrasjon.tsx` og `tests/e2e/forklaring.spec.ts`.

## Prompter

### 1
> fortsett der vi slapp igår

**Svar (kort):** Story 1.9c var merget, og grenen for Story 2.1 var laget med epic-konteksten. Claude startet Story 2.1 gjennom `bmad-build` og tok de små valgene selv:
- URL-stien er `/slik-beregner-vi-snowscore`.
- `SNOWSCORE_VERSION` er 1.0 og står ved `SNOWSCORE`.
- Lenken fra scoren står ved veksleren og i SnowScore-kortet, siden tooltipen og listeraden ikke kan inneholde en lenke.

**Hva vi gjorde med det:**
- Siden er bygget, og alle tall i den kommer fra `shared/snowscore.ts`. En test bytter ut konstantene og sjekker at teksten følger med.
- Gjennomgangen ga 16 funn. 5 ble rettet:
  - den historiske loggraden har nå fast tekst;
  - menyen lukkes ved enhver ruteendring;
  - testen dekker alle konstantene;
  - det finnes en E2E-test fra kartet;
  - versjonslinjen har fått en egen klasse.
- 3 funn ble utsatt i `deferred-work.md`: test av menyen ved push, ☰ med én lenke (til Sally) og sidetittel og fokus ved navigasjon. 8 ble avvist med begrunnelse i spec-en.
