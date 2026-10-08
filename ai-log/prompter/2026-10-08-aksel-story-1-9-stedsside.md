# 2026-10-08: Story 1.9, stedsside med full poengsum

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-build` (Amelia). Underagenter implementerte og gjorde gjennomgangen (Blind Hunter, Edge Case Hunter og Verification Gap).
**Fase:** Gjennomføring
**Resultat:** [`spec-1-9-stedsside.md`](../../project-workspace/implementation-artifacts/spec-1-9-stedsside.md), `shared/freshness.ts`, `src/pages/Sted.tsx`, `src/hooks/useSteder.ts`, `src/lib/format.ts` og `tests/e2e/sted.spec.ts`.

## Prompter

### 1
> oppdater via bmad-ux. gå videre til story 1.9

**Svar (kort):** Etter UX-oppdateringen (egen logg) startet Claude Story 1.9. PRD og arkitektur avgjorde alt: delpoengene heter A Nysnøpotensial, B Kuldebonus og C Snøandel, «utdatert» gjelder over 3 t, stedet fjernes over 12 t, og alderen regnes mot `clock.ts`. Det var derfor ingen spørsmål.

**Hva vi gjorde med det:**
- Stedssiden viser score, delpoeng med maksverdier og grunnlaget: nysnø, temperatur, vind, skydekke, høyde, NVE-nysnø og MET-tidspunkt i norsk tid.
- Fjerningen av for gamle steder skjer ett sted (`useSteder`), så kart, liste og stedsside alltid viser de samme stedene.
- Gjennomgangen ga 17 funn, og 5 er rettet. At alderen også bør regnes på nytt mens siden står åpen, er utsatt til Story 1.6.
- Zoomtesten fra Story 1.7b var ustabil, og den er gjort robust.
