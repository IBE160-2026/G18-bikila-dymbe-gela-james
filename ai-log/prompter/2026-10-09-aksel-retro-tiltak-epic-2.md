# 2026-10-09: Tiltak fra retrospektiven for Epic 2

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5). `bmad-build` i oneshot-rute med Blind Hunter som underagent.
**Fase:** Gjennomføring
**Resultat:** [`spec-2-r-retro-tiltak.md`](../../project-workspace/implementation-artifacts/spec-2-r-retro-tiltak.md). Tiltak A1–A5 og A11 er satt til done i `sprint-status.yaml`.

## Prompter

### 1
> gjør det du mener er best

(Svar på de to spørsmålene etter retrospektiven: om `computeSnowScore` skal ta parameterne som argument, og om de små rettingene skal gjøres før Epic 3.)

**Svar (kort):** Claude valgte å gjøre rettingene nå, som én PR. Den delte SnowScore-modulen ble ikke endret, fordi konstantene og utregningen i virkeligheten ikke kan spre seg fra hverandre. Testen ble i stedet gjort ærlig om hva den sjekker.

**Hva vi gjorde med det:**
- Gjennomgangen fant at Claudes egen tekst i kalkulatoren ga feil forklaring på 57 mot 58. Forskjellen kom bare av at snittemperaturen −2,33 ble avrundet til −2. Kalkulatoren starter nå på −2,3, gir 58 som eksempelet, og forklarer bare en forskjell når den faktisk finnes.
- Versjonssperren registrerer parameterne per versjon, så en endret parameter feiler til det er laget en ny versjon.
