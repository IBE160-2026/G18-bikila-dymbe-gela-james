---
title: 'Story 2.2: Se det utledede regneeksempelet'
type: 'feature'
created: '2026-10-09'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-2-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Forklaringssiden viser formelen, men ikke et komplett eksempel. Brukeren kan derfor ikke etterprøve tallet selv (FR-9).

**Approach:** Ny seksjon «Regneeksempel» mellom «Steg for steg» og «Endringslogg», med briefens 6-timerstabell (nedbør 1, 3, 4, 3, 1, 0 mm og temperatur −1, −3, −4, −3, −2, −1 °C):
- Tabellen viser f(T) og nedbør × f(T) per time.
- Deretter utledes S, P og T̄, så A, B og C med tallene satt inn, og til slutt summen (58).
- Alle tall regnes ut med `computeSnowScore` og `snowFraction` fra `shared/snowscore.ts`.
- Eksempelets timer ligger ett sted i appen. En test sjekker at de er like briefens tilfelle i `tests/golden/snowscore.json`, og at siden viser modulens resultat for de samme timene.
- Siden sier at delpoengene vises avrundet (B = 6,8, ikke briefens ≈ 7), men at summen regnes av de uavrundede verdiene.

</frozen-after-approval>

## Implementation Notes

- Ny komponent `src/components/Regneeksempel.tsx` med `REGNEEKSEMPEL` (eneste kopi i appen) og `timerMedSnoandel()`. Den legges inn i `SlikBeregnerViSnowScore.tsx` mellom «Steg for steg» og «Endringslogg».
- **Avvik fra Intent:** Intent sier «B = 6,8», men eksempelet viser to desimaler (T̄ = −2,33, B = 6,77). Med én desimal ville den som regner etter for hånd fått B = 6,7 og ikke 6,8, og da kunne ikke eksempelet etterprøves (FR-9). Hensikten i Intent holder fortsatt: tallene vises avrundet, og summen regnes uavrundet. Aksel må godkjenne avviket i PR-en.
- `Regneeksempel.test.tsx`:
  - timene er de samme som i briefens tilfelle i `tests/golden/snowscore.json`;
  - modulen gir fasitsvaret;
  - summen av nysnø-leddene i tabellen er lik modulens S;
  - linjene vises i fasitrekkefølge, og alle seks timeradene er riktige.
- Overraskelse: ved 375 px gjorde tabellen med fem kolonner siden 24 px for bred, og E2E-testen fanget det. Cellene i eksempeltabellen har derfor mindre luft under 768 px.
- Sjekker: lint, typecheck, test (327), build og `npm run test:e2e` (23) er grønne.

## Review Triage Log

Blind Hunter (oneshot), 11 funn.

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | B kan ikke regnes etter fra de viste tallene (T̄ −2,3 gir 6,7, ikke 6,8) | medium | patch | Eksempelet viser nå to desimaler: T̄ = −2,33 og B = 6,77, som stemmer når man regner for hånd. |
| 2 | Eksempelet viser aldri en f(T) mellom 0 og 1 | low | patch | Én setning med f(1 °C) = 0,5, regnet med `snowFraction`. |
| 3 | Det står ikke at en ekte score bruker 24 timer | low | patch | Innledningen sier nå at ekte SnowScore bruker `WINDOW_HOURS` timer og at eksempelet er kortere. |
| 4 | Påstanden `= ${b}` i testen sjekker nesten ingenting | low | patch | Erstattet av hele fasitlinjene. |
| 5 | Testen sjekker bare 2 av 6 timerader, og det på en skjør måte | low | patch | Alle rader leses fra `<tr>` og sammenlignes med fasit. |
| 6 | Navnet på E2E-testen sier fortsatt «three sections» | low | patch | Omdøpt. |
| 7 | Mindre celleluft på mobil gjelder også endringsloggen, og kolonneoverskriftene står ikke rett over tallene | low | patch | Regelen gjelder nå bare `.regneeksempel-tabell`, og tallkolonnenes overskrifter er høyrejustert. |
| 8 | Ingen test sjekker at tabellen passer på en mobil | false | avvist | 375 px-testen i `forklaring.spec.ts` måler `scrollWidth` på forklaringssiden og fanget nettopp feilen. |
| 9 | Spec, KI-logg og triage mangler | false | avvist | Skrives ved leveringen, før PR-en. |
| 10 | Nysnø per time regnes i komponenten, ikke i modulen | low | patch | Ny test: summen av leddene er lik modulens `newSnowMm`, så de kan ikke spre seg fra hverandre. |
| 11 | Skjermlesere kan lese «T̄» (T med kombinerende strek) feil | low | defer | Gjelder hele forklaringssiden fra 2.1, ikke bare eksempelet. |
