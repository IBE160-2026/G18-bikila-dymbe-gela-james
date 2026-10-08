# 2026-10-08: Story 1.9b, fullfør stedssiden

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5). Playwright-Chromium ble brukt til den manuelle sjekken, og `bmad-build` i oneshot-rute med Blind Hunter som underagent.
**Fase:** Gjennomføring
**Resultat:** [`spec-1-9b-stedsside-fullfort.md`](../../project-workspace/implementation-artifacts/spec-1-9b-stedsside-fullfort.md), `src/hooks/useSteder.ts`, `src/pages/Utforsk.tsx` og `src/pages/Sted.tsx`.

## Prompter

### 1
> ok fiks feilene og gjør den fullstendig før du går videre

**Svar (kort):** Claude kjørte den manuelle sjekken av stedssiden i Chromium, med demo- og live-data, og fant tre feil:
- en åpen fane ble aldri «Utdatert» (punktet var utsatt til 1.6);
- kart og liste ble helt tomme når alle steder var for gamle;
- «Tilbake» hadde for lite trykkmål.

Alle tre er rettet.

**Hva vi gjorde med det:**
- Alderen sjekkes nå hvert minutt i live-modus, og med en gang når fanen blir synlig igjen. Kartet bygges ikke på nytt når bare «Utdatert» endres.
- Den tomme tilstanden forklarer hva som skjer og har knappen «Last inn på nytt».
- Med låst klokke i Chromium: 0 utdaterte ved lasting, alle 300 utdaterte etter 15 minutter, og tom tilstand med forklaring etter 12 timer.
