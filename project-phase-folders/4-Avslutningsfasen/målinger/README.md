# Målinger av SM-1 og SM-12

*Første måling 15.11 står rett under. Målingen 20.11 av tiltak A og B står i [egen seksjon](#måling-2011-tiltak-a-og-b).*

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

## Måling 20.11: tiltak A og B

Målt 2026-11-20 av Aksel med KI-assistanse (Claude Code). Spesifikasjonen er
[`spec-ytelse-mobil.md`](../../../project-workspace/implementation-artifacts/spec-ytelse-mobil.md).

**Tiltakene:**
- **A** (commit `d8edd5b` og `2dc53bd`): kartet oppdaterer bare markørene som kommer til eller faller bort. Før ble
  alle 300 laget på nytt ved hver filterendring.
- **B** (commit `5e3e190`): datafila og Leaflet ble hentet ved oppstart, parallelt med React. **B ga ingen målbar
  effekt og er fjernet igjen** (`973cdd9`).

### Metode

- **Samme skript og profil som 15.11:** [`mal-ytelse.cjs`](mal-ytelse.cjs), med 4G og CPU fire ganger tregere.
- **Varianter:** den publiserte siden og tre lokale produksjonsbygg (`main` på `f751771`, A og A+B).
  - Forhåndsvisningene på Vercel krever innlogging, så greinen kunne ikke måles der.
  - De lokale byggene serveres med gzip som hos Vercel, av [`serve-gzip.cjs`](serve-gzip.cjs). `vite preview`
    komprimerer ikke.
- **Låst datagrunnlag:** alle tre lokale varianter bruker samme kopi av `latest.json` (runId
  `20261120T084001Z-bf103870`, data fra 20.11 kl. 09.40 norsk tid, 300 steder). **Den publiserte siden bruker
  live-data**, altså datafila som gjaldt da den ble målt (kl. 10.32–11.04).
- **10 målinger per variant**, tatt etter tur (publisert, `main`, A, A+B, så ny runde), så endringer i hvor travel
  maskinen er, treffer alle variantene likt. Hver måling er én SM-12-kjøring og én SM-1-økt med 114 endringer.

```sh
node "project-phase-folders/4-Avslutningsfasen/målinger/serve-gzip.cjs" dist 4175
node "project-phase-folders/4-Avslutningsfasen/målinger/mal-ytelse.cjs" http://127.0.0.1:4175/ 1 4
```

### Resultat

| Variant | SM-12 median (krav < 3 s) | Under 3 s | SM-1 samlet (krav 95 %) | Økter ≥ 95 % | Dårligste økt | p95, median |
|---|---|---|---|---|---|---|
| Publisert side (live-data) | 5104 ms | 0 av 10 | 91,1 % | 3 av 10 | 74,6 % | 564 ms |
| Lokal `main` | 4841 ms | 0 av 10 | 94,8 % | 5 av 10 | 84,2 % | 504 ms |
| **Lokal A** | 4996 ms | 0 av 10 | **99,4 %** | **10 av 10** | **98,2 %** | **264 ms** |
| Lokal A+B | 4896 ms | 0 av 10 | 98,9 % | 10 av 10 | 96,5 % | 264 ms |

**Konklusjon:**
- **SM-1 holder med tiltak A.** Andelen endringer under 500 ms går fra 94,8 % til 99,4 %, og p95 er halvert. Alle
  ti øktene er over kravet.
- **SM-12 holder ikke.**
  - Ingen variant har en eneste kjøring under 3 s. Medianen er rundt 5 s, og den publiserte siden ligger på 5,1 s.
  - Forskjellene mellom `main`, A og A+B er mye mindre enn variasjonen mellom kjøringene (4,1–10,5 s for `main`).
    Tiltak B fjernet altså ventetid på nettet som ikke var flaskehalsen.
  - På denne profilen venter kartet på CPU-en: tolke og kjøre JavaScript, tegne React og lage 300 markører.

**Hvorfor én måling per variant ikke holdt:** én SM-1-økt per variant ga 80 % lokalt og 89 % på den publiserte siden.
Med ti økter er tallene 94,8 % og 91,1 %, og lokal `main` alene varierer fra 84 % til 100 % mellom øktene. Det meste
av forskjellen den første gangen var tilfeldig variasjon. Det som er igjen, kan komme av at den publiserte siden
bruker live-data, slik at hvert steg i sliderne gir andre treff. SM-12 er litt raskere lokalt fordi den lokale
serveren slipper TLS, Vercels CDN og omveien til `raw.githubusercontent.com` for datafila.

### Utkast til avvik for SM-12

*Utkast 2026-11-20, til gruppa. Fristen for å avgjøre er 25.11.*

> **SM-12 (Må ha): kartet er interaktivt innen 3 s på en mobil over 4G.** Kravet er ikke nådd på mobilprofilen.
>
> - **Målt:**
>   - Med 4G og CPU fire ganger tregere er medianen 5,1 s på den publiserte siden og 4,8–5,0 s på lokale bygg, med
>     10 målinger per variant (20.11). Ingen kjøring var under 3 s.
>   - Med 4G og rask CPU var medianen 2,7 s 15.11, med 4 av 5 under 3 s.
> - **Prøvd:**
>   - Tiltak A (bare endrede markører) løste SM-1, men påvirker ikke SM-12.
>   - Tiltak B (hente datafila og Leaflet parallelt med React) ga ingen målbar effekt og er fjernet.
> - **Hvorfor det ikke holdt:** tiden går med til arbeid på CPU-en, ikke til venting på nettet. Det er å tolke og
>   kjøre rundt 115 kB komprimert JavaScript (React og zod) og 43 kB for Leaflet, å tegne siden og å lage 300
>   SVG-markører.
> - **Det som trolig kreves:**
>   - en mindre bunt (for eksempel `zod/mini`, eller mindre validering ved oppstart);
>   - markører tegnet på canvas.
>
>   Begge er større endringer. Canvas må også ha nye E2E-tester og en ny løsning for tilgjengelighet. Det rekker vi
>   ikke før kodefrysen 28.11.
> - **Forbehold:** profilen er en PC med CPU-struping, ikke en ekte telefon. **SM-12 skal også måles på en ekte
>   telefon i mellomsegmentet over 4G** før avviket er endelig.

### Rådata 20.11

Kolonner: runde, variant, SM-12 (ms), SM-1 p50 (ms), SM-1 p95 (ms), endringer ≥ 500 ms, antall endringer, klokkeslett.

```text
1 live 9574 320 976 29 114 10:32:17
1 main 4069 168 352 0 114 10:33:08
1 A 4228 48 104 0 114 10:33:46
1 AB 3635 40 104 0 114 10:34:21
2 live 3653 248 976 19 114 10:35:29
2 main 10461 256 712 18 114 10:36:49
2 A 5621 80 296 1 114 10:37:39
2 AB 5530 80 320 0 114 10:38:28
3 live 5284 216 568 10 114 10:39:32
3 main 5382 216 560 8 114 10:40:35
3 A 4955 80 312 1 114 10:41:25
3 AB 5005 80 264 2 114 10:42:12
4 live 10883 184 536 9 114 10:43:17
4 main 4796 168 552 7 114 10:44:14
4 A 7309 88 368 2 114 10:45:08
4 AB 9484 72 360 4 114 10:46:03
5 live 5066 160 384 2 114 10:46:58
5 main 5172 192 424 2 114 10:47:53
5 A 4627 72 192 0 114 10:48:35
5 AB 4280 56 248 1 114 10:49:19
6 live 4763 168 480 5 114 10:50:15
6 main 4270 176 448 1 114 10:51:10
6 A 4843 56 184 0 114 10:51:52
6 AB 4933 72 248 0 114 10:52:37
7 live 4921 176 440 1 114 10:53:30
7 main 4815 160 384 1 114 10:54:24
7 A 5020 64 264 1 114 10:55:09
7 AB 4858 48 288 1 114 10:55:51
8 live 4028 160 576 10 114 10:56:48
8 main 4867 176 512 8 114 10:57:46
8 A 5992 64 216 1 114 10:58:32
8 AB 4577 56 264 3 114 10:59:17
9 live 5408 200 576 8 114 11:00:20
9 main 5419 192 576 10 114 11:01:23
9 A 4971 64 264 0 114 11:02:09
9 AB 6548 72 272 0 114 11:02:57
10 live 5141 176 560 8 114 11:03:55
10 main 4462 160 496 4 114 11:04:47
10 A 5904 64 280 1 114 11:05:34
10 AB 4297 64 232 1 114 11:06:18
```

## Bør sjekkes

Mål på en ekte telefon i mellomsegmentet over 4G, for eksempel under brukertesten. Det avgjør om
mobilprofilen her er for streng eller treffer.
