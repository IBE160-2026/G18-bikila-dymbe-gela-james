# 2026-10-07: Story 1.10, lokal kjøring med demodata

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-build` (Amelia). Underagenter laget epic-konteksten på nytt, implementerte og gjorde gjennomgangen (Blind Hunter, Edge Case Hunter og Verification Gap).
**Fase:** Gjennomføring
**Resultat:** [`spec-1-10-kjor-snowfinder-lokalt-med-demodata.md`](../../project-workspace/implementation-artifacts/spec-1-10-kjor-snowfinder-lokalt-med-demodata.md), `scripts/pipeline/`, `shared/contracts/`, `tests/contract/fixtures/`, `public/data/demo.json` og `src/lib/data/`.

## Prompter

### 1
> lov til å merge

**Svar (kort):** Claude merget PR #20 og #21 og startet Story 1.10. Planene sa ikke hvor langt SnowScore-vinduet skal være, eller om NVE skal med nå, så Claude spurte.

**Valg (Aksel):** neste 24 timer, og MET og NVE nå.

**Hva vi gjorde med det:**
- Spesifikasjonen ble på ca. 2600 tokens og ble beholdt samlet, siden Aksel hadde bedt om færrest mulig stopp.
- Fixtures er ekte MET- og NVE-svar, innspilt 7. oktober. Bodø har ingen NVE-rute og ble byttet med Mo i Rana.
- Gjennomgangen fant at en serverfeil på `latest.json` ville gitt demodata i produksjon. Det er rettet, sammen med 10 andre funn.
