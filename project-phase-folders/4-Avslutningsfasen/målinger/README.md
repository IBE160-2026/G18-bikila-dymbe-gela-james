# Målinger av SM-1 og SM-12

Målt 2026-11-15 av Aksel med KI-assistanse (Claude Code), mot den publiserte nettsiden
<https://snowfinder-seven.vercel.app> med ekte data for 300 steder. Skriptet er
[`mal-ytelse.cjs`](mal-ytelse.cjs).

## Slik måles det

Måleskriptet styrer Chromium, som Playwright allerede installerer for E2E-testene. Hver kjøring
starter med tom hurtigbuffer.

Mobilprofilen er den samme som Lighthouse bruker for mobil:

- **Skjerm:** 412 × 823 med berøring.
- **Nett:** 4G med 150 ms forsinkelse, 1,6 Mbit/s ned og 750 kbit/s opp.
- **CPU:** fire ganger tregere enn maskinen. Det skal tilsvare en telefon i mellomsegmentet.

Målingene er tatt på en stasjonær Windows-PC. Hvor treg en «4× tregere» CPU blir, avhenger av
maskinen, så tallene er et anslag og ikke en måling på en ekte telefon.

- **SM-12 (NFR-2):**
  - Kartet regnes som interaktivt når Leaflet har tegnet markørene og et trykk på «Zoom inn»
    endrer zoomen. Kartflisene er ikke med.
  - Tiden måles fra navigeringen starter, over fem kjøringer.
- **SM-1 (NFR-1):**
  - Gjennomføres på den samme siden:
    - 80 steg med piltastene på de fem sliderne;
    - de to hurtigvalgene;
    - 32 tastetrykk i søkefeltet.
  - Event Timing-API-et i nettleseren måler hver endring, fra brukeren trykker til neste
    skjermbilde er tegnet. Det er samme mål som INP.
  - Filteret har ingen forsinkelse (debounce), så treffantallet og trefflisten er tegnet på nytt
    i det skjermbildet.
  - Endringer under 16 ms rapporteres ikke av nettleseren. De regnes som under 500 ms.

```sh
node "project-phase-folders/4-Avslutningsfasen/målinger/mal-ytelse.cjs"                  # mobilprofil (CPU 4×)
node "project-phase-folders/4-Avslutningsfasen/målinger/mal-ytelse.cjs" <url> 5 0        # bare 4G, rask CPU
```

## Resultat

| Profil | SM-12: kart interaktivt (krav < 3 s) | SM-1: endringer under 500 ms (krav 95 %) |
|---|---|---|
| 4G og CPU 4× (mobil i mellomsegmentet) | Median 9,0 s, verst 11,2 s. 0 av 5 under 3 s | 69 av 114 (61 %). Median 408 ms, p95 1320 ms, verst 2336 ms |
| 4G med rask CPU (PC eller rask telefon) | Median 2,7 s, verst 3,2 s. 4 av 5 under 3 s | 114 av 114 (100 %). Median 40 ms, p95 112 ms, verst 272 ms |

**Konklusjon:**

- På en rask enhet holder SM-1, og SM-12 holder nesten (4 av 5 kjøringer).
- På mobilprofilen holder ingen av dem. Begge målene er Må ha.

### Hvorfor mobilprofilen er treg

Funnene er fra ressurstidene og «long tasks» i nettleseren og fra koden.

**Kartlastingen går i serie:**

1. HTML og JavaScript lastes.
2. Appen starter og ber om `latest.json`.
3. Først da lastes Leaflet, som importeres inne i kartkomponenten.
4. Til slutt tegnes 300 SVG-markører.

Med 4G og rask CPU starter `latest.json` etter 1,3 s og Leaflet etter 1,7 s. På mobilprofilen
står hovedtråden opptatt i lange oppgaver på til sammen rundt 2,8 s.

**Hver filterendring tegner kartet på nytt:** `KartVisning.tsx` fjerner alle markørene og lager dem
på nytt som SVG med tooltip. Trefflisten tegnes også på nytt. Dette er en sannsynlig årsak, men den
er ikke profilert i detalj.

Mulige rettinger, som må bygges via `bmad-build`:

- hente `latest.json` og Leaflet parallelt med appen (`<link rel="preload">` / `modulepreload`);
- tegne markørene med canvas (`preferCanvas`), eller bare oppdatere de markørene som endres.

## Rådata

```text
URL: https://snowfinder-seven.vercel.app/  runs: 5  CPU slowdown: 4x  2026-11-15T17:06:57.194Z
SM-12 run 1: markers drawn and zoomable after 8989 ms (LCP 8992 ms, 300 markers, zoom ok)
SM-12 run 2: markers drawn and zoomable after 8470 ms (LCP 8480 ms, 300 markers, zoom ok)
SM-12 run 3: markers drawn and zoomable after 8146 ms (LCP 8160 ms, 300 markers, zoom ok)
SM-12 run 4: markers drawn and zoomable after 10384 ms (LCP 10392 ms, 300 markers, zoom ok)
SM-12 run 5: markers drawn and zoomable after 11156 ms (LCP 11176 ms, 300 markers, zoom ok)
SM-12: median 8989 ms, worst 11156 ms, under 3000 ms in 0/5
SM-1 changes made: {"slider":80,"hurtigvalg":2,"sok":32}; 114 in all, 117 of them took 16 ms or more
SM-1: p50 408 ms, p95 1320 ms, max 2336 ms, 45 of 114 changes at or over 500 ms (the rest under 16 ms count as under 500)

URL: https://snowfinder-seven.vercel.app/  runs: 5  CPU slowdown: none  2026-11-15T17:09:25.321Z
SM-12 run 1: markers drawn and zoomable after 3181 ms (LCP 2624 ms, 300 markers, zoom ok)
SM-12 run 2: markers drawn and zoomable after 2401 ms (LCP 1884 ms, 300 markers, zoom ok)
SM-12 run 3: markers drawn and zoomable after 2676 ms (LCP 2608 ms, 300 markers, zoom ok)
SM-12 run 4: markers drawn and zoomable after 2848 ms (LCP 3000 ms, 300 markers, zoom ok)
SM-12 run 5: markers drawn and zoomable after 2235 ms (LCP 1604 ms, 300 markers, zoom ok)
SM-12: median 2676 ms, worst 3181 ms, under 3000 ms in 4/5
SM-1 changes made: {"slider":80,"hurtigvalg":2,"sok":32}; 114 in all, 95 of them took 16 ms or more
SM-1: p50 40 ms, p95 112 ms, max 272 ms, 0 of 114 changes at or over 500 ms (the rest under 16 ms count as under 500)
```

«117 of them» er høyere enn 114 fordi trykket på Filter-knappen og Escape også blir målt. De to
regnes med i persentilene, så tallene er litt strengere enn de ellers ville vært.

En første prøvekjøring med mobilprofilen ga 14,5 s for kartet. Den var sannsynligvis kald
hurtigbuffer hos Vercel og GitHub og er ikke tatt med.

## Bør sjekkes

Mål på en ekte telefon i mellomsegmentet over 4G, for eksempel under brukertesten. Det avgjør om
mobilprofilen her er for streng eller treffer.
