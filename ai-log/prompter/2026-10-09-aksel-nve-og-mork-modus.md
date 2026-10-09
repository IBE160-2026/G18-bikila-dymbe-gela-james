# 2026-10-09: NVE-nedetid og mørk modus

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5). `bmad-correct-course` i batch-modus.
**Fase:** Planlegging
**Resultat:** [`sprint-change-proposal-2026-10-09.md`](../../project-workspace/planning-artifacts/sprint-change-proposal-2026-10-09.md). Produktbrief, PRD, arkitektur og DESIGN.md er endret i begge kopier, og kommentaren i `src/styles/tokens.css` er oppdatert.

## Prompter

### 1
> rett de to valgene så psuher du til git hub så avslutter vi økten for i kveld

**Svar (kort):** Claude tok de to valgene fra revisjonen:
- **NVE:** NVE-nedetid stopper ikke publiseringen. NVE inngår ikke i SnowScore, så kravet (FR-6a, NFR-4) ble endret til å samsvare med koden, som allerede er testet.
- **Mørk modus:** Merket «Ikke i v1» for å holde omfanget lite, med tokenene beholdt for senere.

**Hva vi gjorde med det:** Endringsforslaget er skrevet og lagt inn. Endringene ble levert som PR og merget når sjekkene på GitHub var grønne.
