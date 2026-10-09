# 2026-10-09: Story 2.3, datakilder, begrensninger og datakvalitet

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5). `bmad-build` i oneshot-rute med Blind Hunter som underagent.
**Fase:** Gjennomføring
**Resultat:** [`spec-2-3-datakilder-og-begrensninger.md`](../../project-workspace/implementation-artifacts/spec-2-3-datakilder-og-begrensninger.md), `src/components/Datakilder.tsx`, `src/components/Datakvalitet.tsx` og testene deres.

## Prompter

### 1
> ja

(Svar på spørsmålet om å starte Story 2.3 etter at PR #34 var merget.)

**Svar (kort):** Claude la to seksjoner inn på forklaringssiden, i rekkefølgen fra EXPERIENCE.md:
- «Datakilder og begrensninger», med lisenser og teksten om at SnowScore er en prognose og ikke en skredfarevurdering, med lenke til Varsom.no;
- «Datakvalitet», som leser rapporten fra dataene appen allerede har lastet.

**Hva vi gjorde med det:** Gjennomgangen ga 14 funn, og 8 ble rettet. De viktigste:
- panelet sier «siste publiserte kjøring»;
- ufullstendige steder telles ikke dobbelt med de gyldige;
- kreditering «© OpenStreetMap contributors» og «MET Norway».

1 funn ble utsatt til Story 1.6 (steder som er utdatert eller fjernet).
