# 2026-11-20: kartet på små telefoner, løsning 1

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-build` med en implementeringsagent og tre agenter som gikk gjennom koden
**Fase:** Gjennomføring
**Resultat:** Løsning 1 er bygget, og synlig kart på 375 × 667 går fra 59 til 291 px. SM-1 blir ikke dårligere. PR-en venter på
gruppas bekreftelse 23.11.

## Prompter

### 1
> Kartet på små telefoner (#125): jeg foreslår løsning 1 – kartet før «Best akkurat nå» under 768 px. Avvik er reserve
> hvis den ikke er merget innen 26.11. [...] STEG 1 – Forbered [...] STEG 2 – Bygg (bmad-build) [...] STEG 3 – Mål og
> verifiser [...] STEG 4 – PR [...]

**Svar (kort):** Forslaget ble ført inn i beslutningstabellen på #125. I spesifikasjonen ble listevisningen holdt utenfor,
og rekkefølgen endres med CSS (`order`).
**Hva vi gjorde med det:** godkjent («godkjent fortsett»).

### 2
Valg i dialog: «Kortere kart på mobil», etter at gjennomgangen fant at Leaflet tar over sveip på kartet.

**Svar (kort):** Kartet og plassholderen er 50vh under 768 px, og en E2E-test sjekker at det finnes en stripe å sveipe på.
**Hva vi gjorde med det:** brukt.

### 3
> hva kan jeg skrive til joseph

**Svar (kort):** Et utkast til melding om review av #124, #126 og PR-en for kartet.
**Hva vi gjorde med det:** Aksel sender den selv.
