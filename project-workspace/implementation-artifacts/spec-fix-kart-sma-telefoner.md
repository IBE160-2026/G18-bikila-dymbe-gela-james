---
title: 'Kartet før «Best akkurat nå» på små telefoner (løsning 1)'
type: 'bugfix'
created: '2026-11-20'
status: 'done'
baseline_commit: 'f751771ca79e78815f8e84106f2072e9fe1369de'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/planning-artifacts/sprint-change-proposal-2026-11-20-kart-sma-telefoner.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** På 375 × 667 ser brukeren bare 59 px av kartet over bunn-arket når Utforsk åpnes (målt på den publiserte
siden 20.11). Over kartet står søkefeltet, «Best akkurat nå» med tre rader og fargeforklaringen.

**Approach:** Løsning 1 i endringsforslaget (#125). Aksel foreslo den 20.11, og gruppa bekrefter den 23.11.
- **Under 768 px i kartvisningen** er rekkefølgen: søkefelt, fargeforklaring, kart, «Best akkurat nå».
- **Fra 768 px** er alt uendret.

## Boundaries & Constraints

**Always:**
- Bare kartvisningen endres. I listevisningen står raden fortsatt over den første raden i lista på alle bredder,
  fordi lista selv er innholdet og ikke skjules av bunn-arket.
- Bunn-arket med Filter står fortsatt fast nederst (`sok.spec.ts`).
- Raden er fortsatt inne i `.utforsk-resultat`, aldri i arket, og lenken «Slik beregner vi SnowScore» står fortsatt
  i radens overskrift under 768 px (FR-8).
- Ingen sideveis rulling ved 375 px, heller ikke med de bredere fontene i CI.
- Oppdater E2E-testene i `best-naa.spec.ts` og `kart.spec.ts`, og `forklaring.spec.ts` hvis den påvirkes.
- Rett PRD FR-33 (begge kopiene), Story 1.12 og EXPERIENCE.md (begge kopiene): «øverst» og «over kartet» gjelder fra
  768 px. Under 768 px står raden rett under kartet i kartvisningen.
- Grenen er `fix/kart-sma-telefoner`. Unngå linjene #124 endrer: `KartVisning.tsx` og kommentaren ved `treff`-memoen
  i `Utforsk.tsx`.

**Never:** Endringer i SM-12-logikk, i kartet eller i data. Ingen ny JavaScript for å lese skjermbredden (bare CSS).
Ingen endring fra 768 px. PR-en merges ikke før gruppa har bekreftet løsning 1 23.11.

## I/O & Edge-Case Matrix

| Scenario | Tilstand | Forventet |
|---|---|---|
| Kart, 375 px | Utforsk uten filter | Søkefelt → fargeforklaring → kart → «Best akkurat nå». Kartet starter rett under forklaringen |
| Liste, 375 px | `?visning=liste` | Uendret: raden står mellom søkefeltet og den første raden i lista |
| Kart, 1280 px | Utforsk | Uendret: raden står over kartet, ved siden av filterpanelet |
| Null treff, 375 px | Filter som gir 0 treff | Ingen rad. Null treff-kortet står som før |
| Bred font (CI) | Ubuntu, 375 px | Ingen sideveis rulling, og arket står fast |

**Beslutning 2026-11-20 (Claude, i tråd med intensjonen):**
- Rekkefølgen endres med CSS (`order`) under 768 px, ikke i DOM-en. DOM-rekkefølgen (raden før kartet) er uendret,
  så PC og skjermlesere leser som før.
- På mobil kommer raden før kartet i tastaturrekkefølgen, men etter det visuelt. Kartmarkørene får ikke fokus, så
  dette gjelder bare lenkene i raden. Det skrives inn i EXPERIENCE.md.

**Beslutning 2026-11-20 (Aksel), etter gjennomgangen:**
- Leaflet setter `touch-action: none` på kartet, så et sveip på kartet ruller ikke siden. Et kart på 70vh med raden under ville gjort raden tungvint å nå.
- Under 768 px i kartvisningen blir kartet derfor lavere, rundt 50vh. Da er det alltid en stripe av siden over bunn-arket som kan sveipes.
- Synlig kart måles på nytt.

</frozen-after-approval>

## Code Map

- `src/pages/Utforsk.tsx`: `.utforsk-resultat`, rundt linje 136–175, rendrer status, `BestAkkuratNaa`, null treff-kortet og så enten `ListeVisning` eller `Tegnforklaring` og `KartVisning`. Legg til en klasse som sier at kartet vises (for eksempel `utforsk-resultat--kart`). Ikke rør kommentaren ved `treff`-memoen (rundt linje 71–73). #124 endrer den.
- `src/styles/filter.css:12`: `.utforsk-resultat { min-width: 0 }`. Mobilregelen kan ligge her eller i `App.css` ved `.best-naa*`. Sjekk at avstandene er de samme som før (marger slås ikke sammen i flex).
- `src/App.css`: `.best-naa*`, `.tegnforklaring*`, `.kart` (70vh, min. 320 px).
- `tests/e2e/best-naa.spec.ts:51-77`: testen på 375 px sier «between the search and the map». Kartdelen skal snus. Listedelen er uendret.
- `tests/e2e/kart.spec.ts:85-96`: forklaringen står over kartet. Legg til at kartet kommer før raden på 375 px.
- `tests/e2e/forklaring.spec.ts:162-187`: lenken står i radens overskrift. Den skal trolig være uendret.
- `tests/e2e/sok.spec.ts`: arket står fast. Den skal bestå uendret.
- Dokumenter:
  - `project-phase-folders/2-Planleggingsfasen/SnowFinder-PRD.md:418-421` og `project-workspace/planning-artifacts/prd-*/prd.md`, FR-33;
  - `SnowFinder-Epics-og-Stories.md:413-427`, Story 1.12;
  - `SnowFinder-EXPERIENCE.md` og `project-workspace/planning-artifacts/ux-*/EXPERIENCE.md`, raden «Best akkurat nå» og linjen om Utforsk på mobil (rundt linje 164).
- `project-phase-folders/4-Avslutningsfasen/målinger/mal-kart-synlig.cjs` (ny): måler hvor mange px av kartet som er synlig over arket. Hovedøkten tar målingene.

## Tasks & Acceptance

**Execution:**
- [x] `src/pages/Utforsk.tsx` og CSS: rekkefølgen under 768 px i kartvisningen, med samme avstander som før.
- [x] `tests/e2e/best-naa.spec.ts`, `kart.spec.ts` og eventuelt `forklaring.spec.ts`: kartet før raden på 375 px, og listevisningen og 1280 px uendret.
- [x] PRD FR-33 (2 kopier), Story 1.12 og EXPERIENCE.md (2 kopier).
- [x] Commit med `fix:` og en kort norsk tekst. Ikke push.

**Acceptance Criteria:**
- Gitt kartvisningen på 375 × 667, når Utforsk åpnes, så starter kartet rett under fargeforklaringen, og «Best akkurat nå» står under kartet.
- Gitt 1280 px eller listevisningen, så er oppsettet som før.
- Gitt endringen, så består `sok.spec.ts` og alle E2E-testene uendret, bortsett fra de som er oppdatert.

## Implementation Notes

- **Hovedøkten tar målingene:** synlig kart på 375 × 667 før og etter, målt samtidig med samme ferske datafil, og
  SM-1 med `mal-ytelse.cjs`. Hovedøkten tar også skjermbildene, PR-en, ai-loggen og fremdriftsplanen.
- Bruk ikke portene 4175, 4177 og 4178.

- **Resultat:**
  - Synlig kart på 375 × 667: 59 px → 291 px. Kartet er 50vh på mobil.
  - SM-1: #124 alene 95,4 %, og #124 + løsning 1 96,3 %. Løsning 1 gjør ikke SM-1 dårligere.
  - Tallene står i `målinger/README.md`.
- **Commits:**
  - `033d2a2`: rekkefølgen;
  - `060545e`: lavere kart, testen av arket, FR-33 og kommentaren;
  - `cb4f143`: plassholderen har samme høyde.
- **Verifisert lokalt:** lint, typesjekk, test (792 tester), `build:demo` og E2E er grønne.
- **Fletting:** greina og #124 flettes uten konflikt (Git flettet `Utforsk.tsx` automatisk).

## Spec Change Log

## Review Triage Log

Gjennomgang 2026-11-20: Blind Hunter (BH), Edge Case Hunter (EC) og Verification Gap (VG).

| # | Funn | Verdikt | Bevis og rute |
|---|---|---|---|
| 1 | BH, EC: raden er vanskelig å nå på telefon, fordi Leaflet tar over sveip på et kart på 70vh | high | Bekreftet: `.leaflet-touch-drag.leaflet-touch-zoom { touch-action: none }` i `leaflet.css`. Rute: intent_gap. Aksel valgte et lavere kart under 768 px (beslutningen står i den frosne blokken). Patch med E2E-sjekk |
| 2 | BH, EC: lenkene til endringsforslaget peker på en fil som bare finnes på #125 | medium | Bekreftet. Rettes ved rekkefølgen: #125 merges før denne PR-en. Det står i PR-en |
| 3 | EC: den relative lenken i `prd.md` (arbeidskopien) går feil | false | Kopiene skal være like, og de tidligere radene i endringsloggen (2026-11-18) bruker samme sti. Dette mønsteret fantes fra før og skyldes ikke denne endringen |
| 4 | BH: første setning i FR-33 sier fortsatt «øverst, over kartet og listen» | medium | Bekreftet. Patch: skriv setningen om så den gjelder fra 768 px |
| 5 | BH: rekkefølgen på skjermen og i DOM-en er ulik, uten at WCAG er vurdert | low | Beslutningen står i den frosne blokken og i EXPERIENCE.md. Bare tre lenker i raden er berørt. Begrunnelsen står i PR-en. Avvist |
| 6 | EC: `max-width: 767px` treffer ikke bredder mellom 767 og 768 px | low | Prosjektet bruker samme grense i resten av `App.css`, og det skjer bare med zoom på desimalbredder. Avvist |
| 7 | BH, VG: `mal-kart-synlig.cjs` er ikke beskrevet i README for målinger | low | Patch (hovedøkten): beskriv skriptet og resultatet i README |
| 8 | BH, EC: `mal-kart-synlig.cjs` er skjør (sjekker ikke null, mangler `finally`, venter på markører) | low | Patch (hovedøkten): sjekk null, lukk nettleseren i `try/finally`, og bruk høyden på visningen |
| 9 | BH: testen i `kart.spec.ts` sjekker ikke at arket står nederst | low | Patch: sjekk at arket slutter nederst på skjermen |
| 10 | BH: kommentaren over `.best-naa` i `App.css` sier «above the map» | low | Patch: rett kommentaren |
| 11 | VG: avstanden mellom kartet og raden er ikke testet | low | Bare kosmetisk. Avvist |
| 12 | BH: null treff i kartvisningen og selve grensen på 768 px er ikke testet | low | Null treff skjuler raden, og kortet har bare en bunnmarg. Avvist |
| 13 | BH: flex-kolonnen påvirker alle barna | low | Statusavsnittet er skjult, og null treff-kortet har bare en bunnmarg. Ingen synlig endring på skjermbildet. Avvist |
| 14 | BH: ai-loggen og logikken for merge mangler | false | Det er hovedøktens og PR-ens jobb (Implementation Notes) |

## Verification

**Commands:**
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build:demo` -- forventet: grønne.
- `npm run test:e2e` -- forventet: grønne.
