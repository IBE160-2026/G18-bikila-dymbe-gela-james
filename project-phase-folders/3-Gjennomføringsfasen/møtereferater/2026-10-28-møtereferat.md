# Møtereferat — 2026-10-28

**Til stede:** Joseph, Aksel, Kelly og Sena
**Fravær:** Ingen

## Saker

1. **Epic 3 (filteret) er ferdig.** M4 ble nådd i dag, fire dager før forslaget (2026-11-01).
   - **Story 3.7 (stedstype, PR #66):** Flettekonflikten med `main` var bare i tre dokumentfiler
     (`ai-log/logg.md`, `fremdriftsplan.md` og `sprint-status.yaml`). Merge-commiten ble først pushet
     med konfliktmarkører (`e9d2941`) og rettet i neste commit (`ede91c7`). Aksel godkjente PR-en
     etter å ha testet den lokalt, og den ble merget kl. 18:27.
   - **Story 3.8 (nysnø siste 24 timer, PR #71):** Sena bygget storyen 27. oktober. Aksel åpnet en
     synlig PR med commitene hennes, løste flettekonflikten og satte 3.7 og 3.8 til `done`. Joseph
     godkjente, og Aksel merget kl. 19:42. Testene har økt fra 545 til 572.
   - PR #69 (3.7 satt til `done`) ble lukket, fordi #71 gjorde det samme.
2. **Kelly og Sena har fortsatt flaggede GitHub-kontoer.** PR-ene deres er usynlige for andre og
   starter ingen sjekker, så de kan ikke jobbe i repoet før GitHub Support har sluppet kontoene fri.
   Til da må arbeidet deres gå via synlige kopi-PR-er, slik det ble gjort med #66 og #71.
3. **Nytt forslag til milepæler og aktivitetsliste (PR #70, merget kl. 19:57).**
   - Milepælene har fått kodefrys 2026-11-11 (M1 og M5), en uke til rettinger etter brukertesten
     (17.–20. november) og generalprøve etter README 2026-11-24.
   - Tidslinjen i fremdriftsplanen er oppdatert.
   - `aktivitetsdiagram.md` har fått en aktivitetsliste med alle 29 stories og aktivitetene P1–P12,
     og et diagram over avhengighetene mellom storyene.
   - Fristene etter i dag er fortsatt forslag.
4. **Fordeling av sprint 4 og Story 1.11.**
   - 1.6 (robusthet ved nedetid) og 4.2 (beste skivindu) avhenger bare av 1.9 og kan startes nå.
   - GitHub Pages er slått på, men med kilden «Deploy from branch: `main`». Story 1.11 trenger
     kilden «GitHub Actions», og den kan bare faglærer endre. Til da kan reserven i storyen bygges:
     datafila publiseres til grenen `data`.
   - Push av endringer i `.github/workflows/` krever `workflow`-tilgang i gh-innloggingen.
5. **Andre punkter i fremdriftsplanen.** Følgende har ingen ansvarlig ennå: steg 8c (wireframes,
   kursets skjermkrav og brukertestplan), brukertesten med fem personer, sluttrapporten og
   generalprøven.
6. **Lærdom fra i dag.**
   - #66 ble merget uten at 3.7 var satt til `done`, så det måtte rettes i en egen PR. Sett storyen
     til `done` og oppdater fremdriftsplanen før review, så revieweren også godkjenner statusen.
   - Kjør `git diff --check` før commit. Den finner konfliktmarkører som er glemt.
7. **Statusside og demo.** Det ble laget en statusside og en klikkbar demo av appen slik `main` er
   nå, med demodata. Begge ligger utenfor repoet og deles i gruppa ved behov.

## Beslutninger

- Aksel bygger Story 1.11 (timesjobb og publisering, M1), Story 1.6 (robusthet ved nedetid) og
  Story 4.2 (beste skivindu), som til sammen gir M5 kodefrys.
- Joseph koordinerer med Aksel de andre punktene i fremdriftsplanen: steg 8c, brukertesten,
  sluttrapporten og generalprøven.
- Kelly og Sena kan ikke jobbe i repoet før GitHub Support har sluppet kontoene deres fri. Til da
  lager Joseph eller Aksel synlige kopi-PR-er av arbeidet deres.
- PR #69 lukkes, fordi #71 har gjort det samme.
- Fristene i milepælene står fortsatt som forslag. De vedtas på neste møte.

## Oppgaver til neste møte

| Oppgave | Ansvarlig | Frist |
|---|---|---|
| Bygge Story 1.6, robusthet ved nedetid (`bmad-build`) | Aksel | 2026-11-11 (forslag) |
| Bygge Story 4.2, beste skivindu (`bmad-build`) | Aksel | 2026-11-11 (forslag) |
| Bygge Story 1.11, timesjobb og publisering. Reserven brukes hvis Pages ikke er endret innen 2026-11-04 | Aksel | 2026-11-11 (forslag) |
| Be faglærer endre GitHub Pages-kilden til «GitHub Actions» og slå på grenbeskyttelse på `main` | Joseph og Aksel | 2026-11-04 |
| Steg 8c: wireframes, kursets skjermkrav og brukertestplan (`bmad-ux`) | Joseph og Aksel | 2026-11-04 (forslag) |
| Rekruttere minst fem testpersoner og avtale tidspunkter for brukertesten | Joseph og Aksel | 2026-11-11 (forslag) |
| Brukertest med minst fem personer | Joseph og Aksel | 2026-11-16 (forslag) |
| Sluttrapport og presentasjon | Joseph og Aksel | 2026-11-23 (forslag) |
| Generalprøve: `npm ci && npm run dev` etter README på en ren maskin | Joseph og Aksel | 2026-11-24 (forslag) |
| Kontakte GitHub Support for å få kontoene sluppet fri | Kelly og Sena | Så snart som mulig |
| Vedta fristene i milepælene og bytte «forslag» med «vedtatt» | Hele gruppa | Neste møte |
| Tiltak A6 og A9 fra retrospektiven etter Epic 2 | Aksel | Neste møte |
| Slette greinene som er merget (3.4, 3.6, 3.7 og kopigreinene) | Joseph | Neste møte |
