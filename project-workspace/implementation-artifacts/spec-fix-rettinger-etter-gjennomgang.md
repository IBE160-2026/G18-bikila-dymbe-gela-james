---
title: 'Rettinger etter gjennomgangen av nettsiden 2026-11-18'
type: 'bugfix'
created: '2026-11-18'
status: 'done'
baseline_commit: 'c27ebb8d54f9acb1cd2321f02d3b391eede2224c'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/project-phase-folders/2-Planleggingsfasen/SnowFinder-EXPERIENCE.md'
  - '{project-root}/project-phase-folders/2-Planleggingsfasen/SnowFinder-DESIGN.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Gjennomgangen av den publiserte siden 2026-11-18 fant flere ting som gjør at siden virker uferdig og er vanskeligere å forstå:
- Navn brytes midt i ordet på listekortene («Innerdalstårn/et»).
- Søkefeltet har ingen plassholder og er 1 400 px bredt på PC.
- Stedssiden viser NVE-nysnø i mm, mens listen og filteret regner om til cm.
- Kartet mangler tegnforklaringen som EXPERIENCE.md og SRS-F-15 krever.
- Forsiden sier ikke hvor ferske dataene er.
- Skivinduet («fredag 11–15») står ved siden av «0 · Lite» uten å si at det bare gjelder været.
- «Tilbake» står bare nederst på stedssiden.

**Approach:** Små, separate rettinger i de eksisterende komponentene. Ingen nye krav, ingen ny datakontrakt og ingen ny avhengighet. Alle tekstene er på norsk, og tallene følger avrundingen som filteret allerede bruker.

**Beslutninger (Aksel 2026-11-18):**
1. Stedssiden beholder én desimal, som stemmer med filterets avrunding. Punkt 3 fra gjennomgangen bygges ikke.
2. Tegnforklaringen er en smal stripe rett over kartet, ikke inne i kartet, så den aldri dekker markører (Finnmark) eller bunn-arket. EXPERIENCE.md rettes.
3. «Tilbake» flyttes til toppen av stedssiden, over stedsnavnet, og fjernes nederst. EXPERIENCE.md rettes.

## Boundaries & Constraints

**Always:**
- Steder med ufullstendige data skilles fortsatt ut på en måte som ikke bare bygger på farge.
- Fargen står aldri alene: tegnforklaringen viser både intervall og etikett, og den bruker `TIERS` i `scoreTier.ts`, så grensene bare står ett sted.
- Berøringsflater er minst 44 px.
- axe skal være grønn på Utforsk og på stedssiden.
- Demomodus er deterministisk, med fast demoklokke.

**Never:**
- «Best akkurat nå» (Story 1.12).
- Favoritter og «nær meg».
- Endringer i datafila, i dataprogrammet eller i avrundingen i `shared/avrunding.ts`.
- Nye npm-pakker.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Langt navn | «Innerdalstårnet» på et smalt kort | Navnet brytes ikke midt i ordet uten bindestrek. Badgen flytter heller ned på neste linje | Et navn som er lengre enn hele kortet, brytes som siste utvei |
| NVE i cm | `nveNysnoSisteDognMm: 12` | Stedssiden viser «12 cm» med etiketten «Nysnø siste 24 t (NVE)», som i listen | `null` gir «–» |
| Ferskhet | `generert` er i dag kl. 17:29 | «Oppdatert kl. 17:29» ved Kart \| Liste | En annen dag gir dato og klokkeslett, og en ugyldig tid gir ingen linje |
| Tom tilstand | Ingen ferske steder | Ingen tegnforklaring og ingen linje om ferskhet. Den tomme tilstanden er uendret | – |

</frozen-after-approval>

## Code Map

- `src/App.css:253` -- `.liste-navn` har `overflow-wrap: anywhere`, som gir bruddet midt i ordet. Overskriften på kortet er en grid med `1fr auto` (`.app .liste-rad`, linje 229).
- `src/components/StedSok.tsx:133` og `src/styles/filter.css:484-504` -- input uten `placeholder`, med `width: 100%`.
- `src/pages/Sted.tsx:39-48` -- radene i «Grunnlag». NVE-raden bruker `medEnhet(…, 'mm')`. `Sted.tsx:79` har «Tilbake» (`Lenke tilbake`) nederst.
- `src/components/ListeVisning.tsx:37-41` -- `nysnoFelt` bruker `mmToCm` og etiketten «Nysnø siste 24 t». Begge gjenbrukes.
- `src/components/KartVisning.tsx` -- kartet. `kartMarkor.ts` har `markerStyle` (fargene for trinnene og den stiplede kanten for ufullstendige data). Bruk `colors` fra `src/lib/theme` og `TIERS` og `INCOMPLETE_LABEL` fra `src/lib/scoreTier.ts`.
- `src/pages/Utforsk.tsx:114-119` -- `.utforsk-verktoy` (Kart | Liste og forklaringslenken), der linjen om ferskhet skal stå. `App.tsx:33` sender ikke `generert` videre ennå. `App.tsx:59-61` viser hvordan banneret får `generert` og `now(result.data)`.
- `src/lib/format.ts:85-92` -- `gamleDataTekst` har logikken for klokkeslett og dato. Trekk den ut og gjenbruk den, ikke kopier den.
- `src/components/Skivindukort.tsx` -- kortet med skivinduet. Den nye forklaringslinjen skal stå under overskriften.
- E2E-testene `filter.spec.ts:329,392`, `kart.spec.ts:56` og `liste.spec.ts:73` finner «Tilbake» med `exact: true` og tabber til lenken.

## Tasks & Acceptance

**Execution:**
- [x] `src/App.css` -- bruk `overflow-wrap: break-word` og `hyphens: auto` på `.liste-navn`, og la badgen gå ned på neste linje når navnet ikke får plass -- unngår at navn brytes midt i ordet.
- [x] `src/components/StedSok.tsx`, `src/styles/filter.css` -- legg til plassholderen «F.eks. Hemsedal eller Tromsø», og sett en maksbredde på feltet fra 768 px -- feltet skal se ut som et søkefelt.
- [x] `src/pages/Sted.tsx` -- vis NVE-raden i cm med etiketten «Nysnø siste 24 t (NVE)», og flytt «Tilbake» til over `h1` -- samme enhet som listen.
- [x] `src/components/Tegnforklaring.tsx` (ny) og `KartVisning.tsx` eller `Utforsk.tsx` -- fire trinn med prikk, intervall og etikett, og ufullstendige data med stiplet kant, som stripe rett over kartet i `Utforsk.tsx` (bare i kartvisning) -- FR-12 og SRS-F-15.
- [x] `src/lib/format.ts`, `App.tsx`, `Utforsk.tsx` -- `oppdatertTekst(generert, naa)` gir «Oppdatert kl. 17:29», og «Oppdatert 17. november kl. 17:29» en annen dag, som en meta-tekst ved Kart | Liste.
- [x] `src/components/Skivindukort.tsx` -- ny linje: «Gjelder været (vind, skydekke og dagslys), ikke snøen. Snøen står i SnowScore.»
- [x] Tester: enhetstester for `oppdatertTekst`, tegnforklaringen (etikettene kommer fra `TIERS`), NVE i cm og linjen i skivindukortet. E2E-testene oppdateres der de påvirkes.
- [x] EXPERIENCE.md (begge kopiene) -- rett plasseringen av fargeforklaringen (stripe over kartet) og «Tilbake» (øverst), og legg ferskhetslinjen inn i komponentmønstrene.

**Acceptance Criteria:**
- Given demodata på Utforsk, when kartet vises, then står tegnforklaringen med «70–100 Svært godt», «45–69 Godt», «20–44 Middels», «0–19 Lite» og «Ufullstendige data», uten at den dekker en markør eller bunn-arket.
- Given demodata, when Utforsk vises, then står «Oppdatert kl. HH:MM» etter demoklokken ved Kart | Liste.
- Given en stedsside, when siden vises, then står skivinduets forklaringslinje under «Beste skivindu», og «Tilbake» er den eneste tilbake-lenken og står over stedsnavnet.
- Given 390 px og 1440 px, when listen vises, then er ingen navn brutt midt i ordet uten bindestrek. Det sjekkes manuelt i skjermbilder.

## Implementation Notes

- **Navnebrudd:** `hyphens: auto` alene delte fortsatt korte navn («Gaustatop-pen»), fordi badgekolonnen var fast. Derfor er `.app .liste-rad` byttet fra grid til flex-wrap. Et navn som ikke får plass ved siden av badgen, får hele linjen, og badgen går ned. `.liste-detaljer` og `.utdatert` fikk `flex-basis: 100%` i stedet for `grid-column`. Dette er sjekket på skjermbilder på 1440 og 390 px.
- **Tegnforklaringen:** følger `components.map-legend` i DESIGN.md (10 px og meta under 768 px, 14 px og body fra 768 px), men som stripe uten kort. Lista heter «Fargeforklaring» (`aria-label`). DESIGN.md og EXPERIENCE.md er rettet i begge kopiene.
- **Ferskhet:** `oppdatertTekst` og `gamleDataTekst` deler `tidspunktMotNaa` i `format.ts`. `App.tsx` sender teksten til `Utforsk`.
- **«Tilbake»:** pila er `aria-hidden`, så navnet er fortsatt «Tilbake», og E2E-testene med `exact: true` virker uendret. `gap` gir mellomrommet, fordi et mellomrom i et flex-element blir fjernet.
- **Tester:** E2E-testen «the panel is a fixed left side panel» sammenligner nå panelet med `.utforsk-resultat`, fordi kartet står under stripen. Det er ikke en svekkelse: testen sjekker i tillegg at kartet står under toppen av kolonnen.
- **Sjekker:** lint, typecheck, 779 enhetstester, `build:demo` og 164 E2E-tester (Chromium) er grønne.

## Spec Change Log

## Review Triage Log

Runde 1 (2026-11-18): Blind Hunter, Edge Case Hunter og Verification Gap kjørte i parallell. Alle `patch`-funnene er rettet. Etterpå var lint, typecheck, 782 enhetstester, `build:demo` og 168 E2E-tester grønne.

| # | Lag | Funn | Verdikt | Bevis | Rute |
|---|---|---|---|---|---|
| 1 | blind | Tokenblokken `map-legend` i DESIGN.md beskriver fortsatt et kort (bakgrunn, kant, radius, padding) | low | Teksten sier «uten kort», og CSS-en bruker ingen av verdiene | patch: kortverdiene er fjernet i begge kopiene |
| 2 | blind | DESIGN.md sier «hvit kant som kartmarkøren» og «høyeste trinn øverst» | low | Prikkene har ingen kant, og stripen ligger vannrett | patch: teksten sier nå «først», uten kant |
| 3 | blind | SRS-F-15 sier at fargeforklaringen ikke er bygget | medium | `SnowFinder-PRD-og-SRS.html` hadde merknaden «ikke bygget ennå: den er utsatt» | patch: merknaden sier nå at den er bygget 2026-11-18 |
| 4 | blind | Fremdriftsplanen, sluttrapporten og deferred-work kaller forklaringen utsatt | false | Linjene i fremdriftsplanen er historikk med dato. Sluttrapporten sier «hvis den ikke er bygget». deferred-work er bare til å legge til | avvist |
| 5 | blind | EXPERIENCE.md nevner ikke NVE i cm, skivindulinjen og plassholderen | low | Radene for Grunnlag, Beste skivindu og Søkefelt beskrev det gamle | patch: alle tre radene er oppdatert i begge kopiene |
| 6 | blind | Dokumentene sier «aldri midt i et ord», men CSS-en kan dele et svært langt ord | low | `hyphens: auto` deler et ord som er bredere enn hele kortet | patch: dokumentene nevner nå unntaket |
| 7 | blind + VG | E2E-testen viser ikke at badgen flytter ned eller blir stående | medium | Testen sjekket bare ordbrudd, ikke hvor badgen står | patch: ny test for Trysil (badgen ved siden av) og Store Skagastølstind (badgen under), 1440 px |
| 8 | blind + VG | Linjen «Oppdatert» er valgfri, og ingen test sjekker datoen i appen | low | `oppdatert?` ga `null` stille hvis den manglet. Datoen var bare testet i hjelpefunksjonen | patch: propen er påkrevd, og App.test sjekker «Oppdatert 6. oktober kl. 22:30» |
| 9 | blind | Banneret og «Oppdatert» viser samme tid to ganger ved gamle data | low | Begge vises, men de stemmer med hverandre og ingen av dem er feil | avvist: low, og en retting ville trengt en ny gren |
| 10 | blind | Tegnforklaringen vises over et tomt kart ved null treff | low | `Tegnforklaring` ble vist uavhengig av `treff` | patch: `treff.length > 0` |
| 11 | blind | EXPERIENCE.md sier at forklaringen ikke dekker zoomknappene, noe som ikke lenger gjelder | low | Påstanden er sann, men overflødig for en stripe | patch: teksten er rettet sammen med #10 |
| 12 | blind | Ingen rad i ai-log, og spesifikasjonen er ikke sporet | false | Commit og logg er ikke gjort ennå. De kommer i steg 5, før PR-en | avvist |
| 13 | edge | `align-content: space-between` legger badgelinjen midt i et høyt kort | medium | Med flex-wrap på `.liste-rad` ble navnet, badgen og feltene tre linjer, og plassen ble fordelt mellom dem | patch: navnet og badgen står i `.liste-topp` med egen wrap, og kortet er en grid igjen |
| 14 | edge | Chromium på Linux uten norsk ordbok kan dele et svært langt ord uten bindestrek | low | Gjelder bare et ord som er bredere enn hele kortet, og ingen ord i demodataene er det | avvist: low og usannsynlig |
| 15 | edge | Testen feiler på en riktig orddeling med bindestrek | low | Testen er strengere enn kravet, men ingen ord i demodataene deles | avvist: low |
| 16 | edge | `boundingBox()` som er null, gjør at sammenligningen `?? 0` passerer uten å sjekke noe | low | `0 <= 0` passerer uten å teste | patch: testen kaster en feil hvis en boks mangler |
| 17 | edge | `.replace('kl. 20:30', 'kl. 22:30')` i App.test er skjør | low | Den bommer hvis testdataene får en dato fra en annen dag | patch: regex fjerner hele «Oppdatert …» på begge sider |
| 18 | edge + VG | Tegnforklaringen er ikke testet på mobil | medium | Den eneste testen kjørte på 1280 px | patch: ny test på 375 px, som sjekker at forklaringen er synlig og står over kartet og bunn-arket |

## Verification

**Commands:**
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build:demo` -- forventet: alt grønt.
- `npm run test:e2e` -- forventet: grønt, også axe.

**Manual checks:**
- Skjermbilder av Utforsk (kart og liste) og stedssiden på 390 px og 1440 px i demomodus.
