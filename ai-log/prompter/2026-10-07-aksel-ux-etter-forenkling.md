# 2026-10-07: UX-dokumentene etter forenklingen (Sally)

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-ux` (Sally) i Update-modus
**Fase:** Planlegging
**Resultat:** `SnowFinder-DESIGN.md` og `SnowFinder-EXPERIENCE.md` (begge kopier) v2.

## Prompter

### 1
> gjør foreslåtte endringer før du blir ferdig med alle storisene i epics 1

**Svar (kort):** Claude spurte hva som var ment. Svaret var:

> merge pr#20 og oppdater ux dokumentet med sally. deretter bygg resten av epics . gjør alle pr i løpet av en økt. kun stopp opp om du skal spørre meg om noe. ønsker å bli ferdig med epics 1 i kveld

**Hva vi gjorde med det:**
- **PR #20:** Claude Code stoppet merge av PR #20 («Merge Without Review»). Merging gjøres derfor av Aksel.
- **UX-dokumentene:** oppdatert etter forenklingen og U4 fra endringsrunde 1.
  - Tilbakemelding, snøvarsel og PWA er «Ikke i v1».
  - Nytt demobanner og nytt datakvalitetspanel.
  - Banneret for gamle data utløses av hvor gamle dataene er.
  - Ny flyt for sensor fra et rent klon.
- **Gjenstår:** U1–U3 (wireframes, kursets skjermkrav og brukertestplan) står som åpent spørsmål.
