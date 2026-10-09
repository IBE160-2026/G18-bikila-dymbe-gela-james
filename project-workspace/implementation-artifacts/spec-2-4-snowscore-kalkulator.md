---
title: 'Story 2.4: Prøv SnowScore-kalkulatoren selv'
type: 'feature'
created: '2026-10-09'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-2-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Brukeren kan lese formelen og regneeksempelet, men kan ikke prøve egne verdier og se hvordan poengsummen endrer seg (FR-10, Bør ha).

**Approach:** Ny seksjon «Prøv selv» mellom «Datakvalitet» og «Endringslogg», med to felt som i EXPERIENCE.md: nedbør i hele vinduet (mm) og snittemperatur (°C).

- **Beregning:** Kalkulatoren lager `WINDOW_HOURS` timer med nedbøren fordelt jevnt og samme temperatur hver time, og regner dem ut med `computeSnowScore` fra `shared/snowscore.ts`. Den har ingen egen kopi av formelen (AD-6). Teksten forklarer forenklingen.
- **Visning:** A, B og C («x av maks») og summen med `ScoreBadge` oppdateres mens brukeren skriver, uten sideoppdatering.
- **Gyldige verdier:** Feltene godtar desimalkomma.
  - Nedbør må være mellom 0 og 500 mm, og temperatur mellom −50 og 30 °C.
  - Ved ugyldig verdi står feilmeldingen rett under feltet, koblet med `aria-describedby` og `aria-invalid`.
  - Resultatet viser da siste gyldige utregning ikke. I stedet står det at verdiene må rettes.
- **Startverdier:** 12 mm og −2 °C.

</frozen-after-approval>

## Implementation Notes

- Ny komponent `src/components/Kalkulator.tsx` med tre rene funksjoner som testes uten nettleser:
  - `lesTall` leser tall med desimalkomma og sjekker grensene;
  - `kalkulatorTimer` lager vinduet;
  - `kalkuler` regner ut med `computeSnowScore`.
- Seksjonen ligger mellom «Datakvalitet» og «Endringslogg» i `SlikBeregnerViSnowScore.tsx`.
- Kalkulatoren importerer modulen gjennom `src/lib/snowscore.ts`, som bare re-eksporterer `shared/snowscore.ts`. En test sjekker begge leddene. En annen test viser at `kalkuler` gir nøyaktig modulens svar for 64 kombinasjoner av nedbør og temperatur.
- Temperaturfeltet bruker `inputMode="text"`, fordi iPhonens desimaltastatur ikke har minustegn.
- Bare sumlinjen er en live-region, så skjermlesere ikke leser hele lista for hvert tastetrykk.
- Intent-teksten har en setning med feil ordstilling: «Resultatet viser da siste gyldige utregning ikke». Den betyr at resultatet ikke viser den siste gyldige utregningen, og koden følger den meningen. Blokken er frosset og er ikke endret.
- Sjekker: lint, typecheck, test (361), build og `npm run test:e2e` (24, axe inkludert) er grønne.

## Review Triage Log

Blind Hunter (oneshot), 11 funn.

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | Minus kan ikke skrives på iPhone med `inputMode="decimal"` | high | patch | Temperaturfeltet bruker nå tekst-tastaturet. Testen sjekker `inputMode` per felt. |
| 2 | Setning i Intent med feil ordstilling, og tom spec | low | avvist | Blokken er frosset. Meningen er notert i Implementation Notes, og spec og triage skrives ved leveringen. |
| 3 | KI-logg og fremdriftsplan mangler | false | avvist | Skrives ved leveringen, før PR-en. |
| 4 | Testnavnet sier at 12 mm og −2 °C gir det samme som regneeksempelet (57 mot 58) | low | patch | Testen er omdøpt, og teksten forklarer at kalkulatoren gir litt annet tall fordi temperaturen er lik hver time. |
| 5 | Hele resultatet er en live-region og leses opp for hvert tastetrykk | medium | patch | Bare sumlinjen er nå `aria-live`. |
| 6 | AD-6-testen søker etter navn i kildekoden | low | patch | Erstattet av en atferdstest over 64 kombinasjoner og en test av importleddet. |
| 7 | Tilstand som kaster og velter hele siden | false | avvist | Alle timene har begge verdier, så modulen gir alltid en score. Det er riktig å feile høyt i en tilstand som ikke kan nås. |
| 8 | «5,», «,5» og «+3» avvises, så feil blinker under skriving | low | patch | Godtas nå, med tester. |
| 9 | Manglende tester: begge felt ugyldige, P = 0,5 mm og grensene | low | patch | Lagt til i `Kalkulator.test.tsx`. |
| 10 | Feltet hopper 1 px når det blir ugyldig | low | patch | Den tykkere kanten er nå en innvendig skygge. |
| 11 | Grensene vises ikke før det oppstår en feil | low | avvist | Feilmeldingen sier grensene, og startverdiene viser formatet. Et hint under hvert felt ville gitt mer `aria-describedby`-kobling for lite gevinst. |
