# 2026-10-08: Story 1.9c, ingen feilkilder

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5). `bmad-build` i oneshot-rute med Blind Hunter som underagent, og Playwright-Chromium til den manuelle sjekken.
**Fase:** Gjennomføring
**Resultat:** [`spec-1-9c-ingen-feilkilder.md`](../../project-workspace/implementation-artifacts/spec-1-9c-ingen-feilkilder.md), `src/hooks/useSteder.ts`, `src/App.tsx`, `src/pages/Utforsk.tsx` og `tests/e2e/tom.spec.ts`.

## Prompter

### 1
> fortsett.KI-gjennomgangen ga 12 funn: 8 rettet og 4 avvist. Lint, typesjekk, tester (302), bygg og 12 E2E-tester er grønne. rett opp slik at vi ikke får noen feilkilder. Forsett til neste stories når du har gjort det

**Svar (kort):** Av de fire avviste funnene fra 1.9b var to prosesspunkter som allerede var gjort. De to andre ble rettet:
- dataalderen ligger nå i én felles lagring, så alle som kaller `useSteder()`, alltid ser det samme;
- den tomme tilstanden leses opp og viser ikke lenger en tom veksler.

Gjennomgangen av rettingen ga 10 nye funn, og alle de 9 reelle er rettet.

**Hva vi gjorde med det:**
- Statusregionen ligger i appskallet, så den leses opp både ved første lasting og når stedene går ut på dato i en åpen fane.
- En lasting som kaster, gir nå feilvisning i stedet for evig skjelett.
- Ny E2E-test (`tom.spec.ts`) med låst klokke og live-data, inkludert axe.
