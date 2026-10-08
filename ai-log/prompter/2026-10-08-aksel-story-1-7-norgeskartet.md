# 2026-10-08: Story 1.7, se Norgeskartet med fargelagte steder

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-build` (Amelia). Underagenter implementerte og gjorde gjennomgangen (Blind Hunter, Edge Case Hunter og Verification Gap).
**Fase:** Gjennomføring
**Resultat:** [`spec-1-7-se-norgeskartet.md`](../../project-workspace/implementation-artifacts/spec-1-7-se-norgeskartet.md), `src/components/KartVisning.tsx`, `src/pages/`, `src/hooks/useSteder.ts`, `src/lib/router.ts`, `src/lib/scoreTier.ts` og `tests/e2e/kart.spec.ts`.

## Prompter

### 1
> kjør

**Svar (kort):** Claude startet Story 1.7. Planene sa ikke hvilke scoregrenser de fire fargetrinnene skal ha, hvordan ufullstendige data skal vises på kartet, eller hvilket bakgrunnskart som skal brukes, så Claude spurte.

**Valg (Aksel):**
- Trinn: 0–19 «Lite», 20–44 «Middels», 45–69 «Godt», 70–100 «Svært godt» (strengere toppklasse).
- Ufullstendige data: hul markør med stiplet grå kant.
- Bakgrunnskart: Kartverket topo (ingen nøkkel).

**Hva vi gjorde med det:**
- Rutingen er skrevet selv (ingen react-router), fordi nye avhengigheter utenfor arkitekturen krever `bmad-correct-course`. Leaflet og Playwright står allerede i arkitekturens versjonsliste.
- Leaflet lastes i en egen bit (ca. 43 kB gzip). All JavaScript er ca. 141 kB gzip, under målet på 150 kB for NFR-2.
- Gjennomgangen ga 26 funn. 6 er rettet: E2E-testen sjekker nå tooltip, lenken tilbake, den hule markøren og «Fant ikke stedet». Kartet viser en feilmelding hvis Leaflet ikke kan lastes, og lasteskjelettet har samme høyde som kartet. Direkte lenker på GitHub Pages trenger en `404.html` og er utsatt til Story 1.11.
