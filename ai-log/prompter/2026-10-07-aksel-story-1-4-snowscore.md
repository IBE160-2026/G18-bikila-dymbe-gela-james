# 2026-10-07: Story 1.4, den delte SnowScore-modulen

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-build` (Amelia). Én underagent implementerte og tre gjorde gjennomgangen (Blind Hunter, Edge Case Hunter og Verification Gap).
**Fase:** Gjennomføring
**Resultat:** [`spec-1-4-bygg-den-delte-snowscore-modulen.md`](../../project-workspace/implementation-artifacts/spec-1-4-bygg-den-delte-snowscore-modulen.md), `shared/snowscore.ts`, `src/lib/snowscore.ts` og `tests/golden/snowscore.json`.

## Prompter

### 1
> gjør det. [...] Etter dette er neste story 1.4, SnowScore-modulen. UX-oppdateringen med Sally må være gjort før sprint 2. fortsett fremdrift

**Svar (kort):** Først ble PR #18 og #19 merget. Deretter kjørte Claude `bmad-build` for Story 1.4. Spesifikasjonen hadde ingen åpne spørsmål. Lengden på tidsvinduet er ikke bestemt i planene, så modulen tar imot hele lista den får, og vinduet velges i Story 1.5.

**Valg (Aksel):** «Godkjenn og fortsett».

**Hva vi gjorde med det:**
- Gjennomgangen fant en ekte feil: ti timer med 0,05 mm summeres til 0,49999999999999994, og da ble B og C feilaktig 0 ved den inklusive grensen. Grensen fikk en liten toleranse og en test.
- Fasittabellen sjekker nå også S, P og T̄. Den fikk tre nye grensetilfeller.
- 7 funn ble rettet og 8 avvist med begrunnelse, som står i triage-loggen i spesifikasjonen.
