---
title: 'Story 3.8: Filtrer på nysnø siste 24 timer'
type: 'feature'
created: '2026-10-27'
status: 'done'
route: 'dispatch'
review_loop_iteration: 1
baseline_commit: '0fe105149525129ad1ec318b1da7c4f53221b24a'
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Nysnøkravet bruker bare METs prognose for de neste 24 timene. Brukeren kan ikke finne steder som allerede har fått snø (FR-25).

**Approach:** Et valg av **datagrunnlag** for nysnøkravet: «Prognose» (MET, de neste 24 timene) eller «Siste 24 t» (NVE seNorge, nysnø siste døgn). Med «Siste 24 t» sammenlignes grensen med `nveNysnoSisteDognMm`, omregnet med `mmToCm` (1 mm ≈ 1 cm, som resten av appen). Slideren, spennet og OG-regelen er de samme. Grensesnittet viser tydelig hvilken kilde som er i bruk, og valget ligger i adressen (AD-12).

**Kontroll (Sena, 2026-10-27, 1A):** To radioknapper rett under nysnø-slideren, i en gruppe med overskriften «Datagrunnlag for nysnø»: «Prognose (MET, neste 24 t)», som er valgt som standard, og «Siste 24 t (NVE, modellert)». Begge valgene er alltid synlige.

**Kilden når nysnø står på «Alle» (Sena, 2026-10-27, 2A):** Valget står uansett. Det ligger i adressen og teller som avvik fra standard, så «Nullstill» vises. Det har ingen effekt før nysnøkravet er aktivt, og hjelpeteksten sier det. Radioknappene er aldri deaktivert.

**Ingen kildebytte som forslag (Sena, 2026-10-27, 3A):** Forslaget ved null treff lemper bare grensen, som før. Det foreslår aldri å bytte kilde.

**Modellerte data (Sena, 2026-10-27):** Det skal gå tydelig fram at NVEs nysnøverdier er **modellerte**, ikke faktiske snømålinger. Ordet «modellert» står i etiketten til radioknappen, og hjelpeteksten under gruppen sier det med rene ord: «NVEs nysnø siste døgn er modellerte verdier fra seNorge, ikke målt snø.» Teksten kobles til gruppen med `aria-describedby`, så en skjermleser også hører det. Tonen er rolig og presis og lover ikke snø.

**Omregningen forklart (Sena, 2026-10-27, review-runde 1, 3A):** Hjelpeteksten forklarer omregningen med nøyaktig denne formuleringen: «NVE-verdiene er modellerte estimater. SnowFinder bruker en forenklet omregning der 1 mm vannekvivalent tilsvarer omtrent 1 cm snø. Faktisk snødybde kan variere.» Den erstatter «(1 mm ≈ 1 cm)». Hele hjelpeteksten blir: «NVEs nysnø siste døgn er modellerte verdier fra seNorge, ikke målt snø. NVE-verdiene er modellerte estimater. SnowFinder bruker en forenklet omregning der 1 mm vannekvivalent tilsvarer omtrent 1 cm snø. Faktisk snødybde kan variere. Med «Siste 24 t» valgt og nysnøkravet på skjules steder uten NVE-verdi. Står nysnø på «Alle», har valget ingen effekt.» *(Siste setninger presisert av Sena i review-runde 2, så teksten ikke sier noe galt med «Prognose» valgt.)*

**Listen viser verdien filteret bruker (Sena, 2026-10-27, review-runde 1, 1A):** I listevisningen viser hver rad nysnø fra kilden filteret bruker. Med «Prognose» står det «Nysnø 2,9 cm» som før. Med «Siste 24 t» står det «Nysnø siste 24 t 15 cm» (NVE-verdien omregnet med `mmToCm`), eller «Nysnø siste 24 t –» når stedet mangler NVE-verdi. Kartet viser ikke nysnø og endres ikke.

**Når NVE-data mangler (Sena, 2026-10-27, review-runde 1, 2A):** Er «Siste 24 t» valgt og ingen av stedene har NVE-verdi (for eksempel når NVE var nede i siste kjøring, FR-6a), står det under radioknappene: «NVE-data mangler i denne kjøringen. Velg «Prognose» for å filtrere på nysnø.» Teksten annonseres til skjermleser. Kilden byttes ikke automatisk, og meldingen vises ikke med «Prognose» valgt.

**Meldingen i nulltreff-banneret på mobil (Sena, 2026-10-27, review-runde 2):** Under 768 px er panelet skjult når arket er lukket, så meldingen står også på en egen linje i nulltreff-banneret. Det skjer bare når null treff skyldes NVE: kilden er «Siste 24 t», nysnøkravet er aktivt og ingen sted har NVE-verdi. Fra 768 px er panelet alltid åpent og viser meldingen der, så banneret gjentar den ikke.

## Boundaries & Constraints

**Always:**
- Én filterlogikk (`filtrerSteder`, AD-6). Kilden bestemmer bare hvilken verdi nysnøkravet leser.
- Med «Siste 24 t» og aktivt nysnøkrav skjules et sted uten NVE-verdi (`null`), etter samme regel som andre manglende verdier. En hjelpetekst sier det.
- Standard er «Prognose». Den skrives ikke til adressen. En ugyldig eller gjentatt verdi gir standard, og adressen skrives om til ren form.
- «Nullstill» og hurtigvalgene setter kilden tilbake til «Prognose» (et hurtigvalg nevner ikke kilden, samme regel som i 3.4).
- Chipen og forslaget ved null treff sier hvilken kilde som gjelder, for eksempel «Nysnø siste 24 t minst 5 cm».
- Ordinære skjemafelt med synlig etikett, trykkmål på minst 44×44 px, og ingen alvorlige axe-funn ved 1280 og 375 px.

**Never:** Ingen ny avhengighet. Ingen endring i dataprogrammet, katalogen eller datakontrakten (feltet finnes). Stedssiden og forklaringssiden endres ikke. Ikke et eget, sjuende krav: kilden er et valg på nysnøkravet.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Prognose | Nysnø minst 5 cm, kilde «Prognose» | Som i dag: Gaustatoppen, Jiehkkevárri og Trysil i demodata | N/A |
| Siste 24 t | Nysnø minst 5 cm, kilde «Siste 24 t» | Jiehkkevárri (53 mm) og Oksskolten (15 mm), på kart og i liste | N/A |
| Mangler NVE | «Siste 24 t», aktivt nysnøkrav, sted med `nveNysnoSisteDognMm: null` | Stedet vises ikke | N/A |
| Lenke | `?nysno=5&nysnokilde=nve` | «Siste 24 t» er valgt, samme treff som over | N/A |
| Ugyldig lenke | `?nysno=5&nysnokilde=yr` | Kilde «Prognose»; `nysnokilde` fjernes fra adressen | Ingen feil |
| Null treff | «Siste 24 t», nysnø minst 20 cm, vind høyst 12 m/s | Forslaget lemper nysnøkravet med NVE-verdiene: «Prøv nysnø siste 24 t minst 15 cm.» (Oksskolten, 15 mm og 10,9 m/s; 5 steg, mot 6 for vind 18) | N/A |
| Kilde uten nysnøkrav | «Siste 24 t», nysnø «Alle» | Alle steder vises (kilden har ingen effekt); `nysnokilde=nve` står i adressen, og «Nullstill» vises | N/A |
| Modellert | Utforsk, filterpanelet åpent | Etiketten «Siste 24 t (NVE, modellert)» og hjelpeteksten om modellerte verdier og omregningen er synlige og koblet til gruppen | N/A |
| Liste med NVE | Listevisning, nysnø minst 5 cm, «Siste 24 t» | Oksskoltens rad viser «Nysnø siste 24 t 15 cm», ikke prognosens 2,9 cm | N/A |
| Liste med prognose | Listevisning, «Prognose» | Radene viser «Nysnø X cm» som før | N/A |
| NVE mangler overalt | «Siste 24 t», ingen sted har NVE-verdi | Meldingen «NVE-data mangler i denne kjøringen. Velg «Prognose» for å filtrere på nysnø.» vises under radioknappene; kilden står fortsatt på «Siste 24 t» | Ingen feil |
| NVE mangler, mobil | 375 px, lukket ark, «Siste 24 t», nysnø minst 5 cm, ingen NVE-verdi | Nulltreff-banneret viser meldingen på en egen linje | Ingen feil |
| NVE mangler, bred skjerm | 1280 px, samme tilstand | Banneret viser ikke meldingen, panelet gjør det, så den står én gang | N/A |

</frozen-after-approval>

## Code Map

- `shared/filter.ts` -- `FilterParams` får `nysnoKilde: NysnoKilde` (`'met' | 'nve'`, standard `'met'`), eksportert sammen med `NYSNO_KILDER`. `FilterKrav` er fortsatt bare tallkravene (`Exclude<keyof FilterParams, 'stedstyper' | 'nysnoKilde'>`). `Filtrerbar` får `'nveNysnoSisteDognMm'`. I `oppfyller` leser `minNysnoCm` `mmToCm(sted.nveNysnoSisteDognMm)` når `nysnoKilde === 'nve'`, ellers `nysnoCm` som før (`null` gir fortsatt `false`). `oppfyller` må få `params.nysnoKilde` (eller hele `params`) inn fra `filtrerSteder`. `forslagVedNullTreff` trenger ingen egen logikk, fordi den kaller `filtrerSteder` med `params`. `STANDARD_FILTER` og `HURTIGVALG` får `nysnoKilde: 'met'`. `harAktiveKrav` teller `nysnoKilde !== 'met'` (2A). `aktiveKrav` og forslagsvandringen er uendret (3A). `parseFilter`/`serializeFilter`: parameteren `nysnokilde=nve`, skrevet rett etter `nysno` (før `vind`). Bare `nve` er gyldig, og `met` skrives aldri.
- `shared/snowscore.ts` -- `mmToCm` (linje 68) gjenbrukes uendret.
- `src/components/FilterPanel.tsx` -- en `<fieldset>` med `<legend>Datagrunnlag for nysnø</legend>` og to `<input type="radio" name="nysnokilde">` rett etter nysnø-slideren (1A), med samme `.filter-stedstype`-mønster for 48 px trykkmål. Hjelpeteksten (`filter-hint`, koblet til fieldset-et med `aria-describedby`) er hele teksten fra «Omregningen forklart». `kravTekst`/chip og `forslagTekst` for `minNysnoCm` sier «Nysnø siste 24 t …» når kilden er NVE. Funksjonene trenger da kilden som parameter. `erHurtigvalgAktiv` sammenligner også `nysnoKilde`. Ny prop `nveMangler: boolean`: når den er sann og kilden er `nve`, vises meldingen fra «Når NVE-data mangler» i en `<p role="status">` under radioknappene. Er kilden NVE og nysnø på «Alle», viser det lukkede arket chipen «Datagrunnlag siste 24 t (NVE)» ved siden av «Nullstill».
- `src/pages/Utforsk.tsx` -- sender kilden videre der `forslagTekst` kalles, regner ut `nveMangler = steder.every((s) => s.nveNysnoSisteDognMm === null)` (over `steder`, ikke `treff`) og gir den til `FilterPanel`. *(Bygget: `ListeVisning` trenger ikke kilden fra `Utforsk`, se neste punkt.)*
- `src/components/ListeVisning.tsx` -- radteksten for nysnø (linje 105). Med `nve` blir teksten `Nysnø siste 24 t ${medEnhet(nveCm, 'cm')}`, der `nveCm` er `mmToCm(sted.nveNysnoSisteDognMm)` eller `null`. Med `met` er den uendret. Sorteringen og resten av listen endres ikke. *(Bygget annerledes enn planlagt: kilden leses fra den eksisterende propen `sok.filter.nysnoKilde`, ikke fra en ny prop. Markupen testes i `App.test.tsx`, ikke i en ny `ListeVisning.test.tsx`. Se Implementation Notes, runde 1.)*
- `src/lib/router.ts` -- uendret.
- `tests/golden/filter.json`, `shared/filter.test.ts` -- `nveNysnoSisteDognMm` på de åtte stedene og `nysnoKilde: "met"` i alle eksisterende filtre. Nye tilfeller: NVE-kilde alene, NVE med `null`, NVE kombinert med et annet krav, og null treff med NVE-kilde. Parse/serialize-tester for matrisens lenkerader, og demodatatesten (2 mot 3 treff).
- `src/components/FilterPanel.test.tsx`, `src/App.test.tsx`, `src/lib/router.test.ts` -- `nysnoKilde: 'met'` i håndskrevne `FilterParams`. Markup for radiogruppen og chiptekst med kilde.
- `tests/e2e/filter.spec.ts` -- «the new snow source at 1280px/375px» etter mønsteret i «the place type filter». Testen sjekker også at etiketten og hjelpeteksten sier «modellert», og at gruppens tilgjengelige beskrivelse inneholder den.
- `README.md` -- avsnittet om filteret, med at NVE-verdiene er modellerte og ikke målte, og eksempeladressen med `nysnokilde=nve`.
- Ikke rør: dataprogrammet (`scripts/`), `shared/contracts/`, `Sted.tsx`, `KartVisning.tsx`, forklaringssiden.

## Tasks & Acceptance

**Execution:**
- [x] `shared/filter.ts` -- `nysnoKilde`, verdien kravet leser, parse/serialize, `harAktiveKrav`, hurtigvalg.
- [x] `tests/golden/filter.json`, `shared/filter.test.ts` -- fasittilfellene, parse/serialize og demodata.
- [x] `src/components/FilterPanel.tsx`, `FilterPanel.test.tsx`, `src/styles/filter.css` -- radiogruppen, hjelpeteksten om modellerte verdier, chip- og forslagstekst med kilde.
- [x] `src/pages/Utforsk.tsx`, `src/App.test.tsx`, `src/lib/router.test.ts` -- kilden til forslagsteksten, og `nysnoKilde` i literaler. Test at `nysnokilde` står rett etter `nysno`.
- [x] `tests/e2e/filter.spec.ts` -- matrisen ved 1280 og 375 px, inkludert axe og ingen horisontal rulling.
- [x] `README.md` -- valget, at NVE-verdiene er modellerte, og adresseeksempelet.
- [x] `src/components/ListeVisning.tsx`, `ListeVisning.test.tsx`, `src/pages/Utforsk.tsx` -- radteksten følger kilden (runde 1, 1A).
- [x] `src/components/FilterPanel.tsx`, `FilterPanel.test.tsx`, `src/pages/Utforsk.tsx` -- `nveMangler`-meldingen (2A), den nye hjelpeteksten (3A), og chipen «Datagrunnlag siste 24 t (NVE)» på det lukkede arket.
- [x] `shared/filter.ts` -- `nysnoVerdi` tester på `'nve'`, og `serializeFilter` bruker `findIndex` for `nysno`.
- [x] `shared/filter.test.ts`, `FilterPanel.test.tsx`, `router.test.ts` -- fjern `nysnoKilde: 'met'` der objektet allerede sprer `STANDARD_FILTER`.
- [x] `tests/e2e/filter.spec.ts` -- radene «Liste med NVE», «Liste med prognose» og «NVE mangler overalt».
- [x] `README.md` -- tydelig regel for steder uten NVE-verdi, omregningen og listevisningen.

**Acceptance Criteria:**
- Given Utforsk med grunnfilteret, when jeg velger «Siste 24 t» som datagrunnlag for nysnø-filteret, then brukes NVE seNorge-verdien i stedet for MET-prognosen for det kriteriet, og grensesnittet viser tydelig hvilken kilde som er i bruk.
- Given «Siste 24 t» er valgt, when jeg trykker «Nullstill» eller et hurtigvalg, then er kilden «Prognose» igjen.
- Given filterpanelet, when jeg leser valget for datagrunnlag, then går det tydelig fram, i etiketten og i hjelpeteksten, at NVEs verdier er modellerte og ikke målt snø.
- Given lint, typecheck, test, build og `npm run test:e2e`, when de kjøres, then er alle grønne.

## Implementation Notes

- Implementert direkte i bygge-økten, med specen som eneste kilde. Ingen avvik fra Code Map.
- `oppfyller` får kilden som eget argument fra `filtrerSteder`. En ny hjelper, `nysnoVerdi(sted, kilde)`, gir enten `nysnoCm` eller `mmToCm(nveNysnoSisteDognMm)`, og `null` når NVE-verdien mangler. Resten av sammenligningen (avrunding til én desimal, `null` gir `false`) er uendret. **Steder uten NVE-verdi skjules bare når nysnøkravet er aktivt:** `oppfyller` kalles bare for kravene i `aktiveGrenser`, så med nysnø på «Alle» blir NVE-verdien aldri lest. Det dekkes av et fasittilfelle (`storm` og `ufullstendig` uten NVE-verdi vises på «Alle»), en demodatatest og en E2E-test som gir appen en kopi av demofila der Jiehkkevárri mangler NVE-verdi.
- Forslaget ved null treff trengte ingen ny kode (3A). `forslagVedNullTreff` kaller `filtrerSteder` med `{ ...params, [krav]: forsok }`, så kilden følger med i hvert forsøk og byttes aldri.
- `serializeFilter` legger `nysnokilde=nve` rett etter `nysno` når nysno er aktivt, og først blant filterparameterne ellers. `parseNysnoKilde` godtar bare nøyaktig én `nve`. Alt annet, også `met`, gir standard, så adressen skrives om.
- ~~**Chip uten nysnøkrav (implementeringsvalg):** Med kilden NVE og nysnø på «Alle» viser det lukkede arket «Nullstill» (2A), men ingen chip, fordi kilden ikke skjuler noe. `<ul class="filter-chips">` rendres da ikke, i stedet for å bli en tom liste.~~ *Erstattet i review-runde 1: kilden får chipen «Datagrunnlag siste 24 t (NVE)», og listen rendres alltid.*
- Radiogruppen bruker CSS-klassen `filter-valg` og deler reglene med 3.7s `filter-stedstype` (48 px trykkmål, `accent-color`, fokusring). `flex: none` på input hindrer at rundingen klemmes når en lang etikett brytes på 320 px.
- `kravTekst` og `forslagTekst` fikk en valgfri `kilde`-parameter med `met` som standard, så alle eksisterende kall gir samme tekst som før.
- Fasittabellen har nå `nveNysnoSisteDognMm` på alle åtte steder. To av dem er `null`, og `uten-vind` har mer NVE-snø enn prognose. Det gir fem nye tilfeller: kilde uten krav, NVE ≥ 3 (avrunding og `null`), NVE ≥ 5, NVE + vind, og null treff som lempes langs NVE-verdiene.

**Verifisert (runde 0):** `npm run lint`, `npm run typecheck`, `npm test` (568/568) og `npm run build` er grønne. `npm run test:e2e` er grønn (109/109, med 10 nye i «the new snow source at 1280px/375px»).

**Review-runde 1 (bygget videre på runde 0, etter Senas valg):**
- **Avvik fra Code Map, `ListeVisning.tsx`:** Code Map ba om en ny prop `nysnoKilde`. Komponenten får allerede hele søket gjennom `sok` (`UtforskRoute`, fra 3.2b), så `nysnoTekst(sted, sok.filter.nysnoKilde)` leser kilden derfra. `Utforsk.tsx` trengte ingen endring for listen, og komponenten får ingen ny prop. Markupen for listen testes i `App.test.tsx`, der de andre listeradene allerede testes, ikke i en ny `ListeVisning.test.tsx`.
- `nveMangler` regnes ut i `Utforsk.tsx` over alle ferske `steder` (ikke `treff`) med `useMemo`. Meldingen rendres bare når kilden er NVE og ingen sted har NVE-verdi, som `<p role="status">`, etter samme mønster som statusteksten for avstand i 3.6. Da forblir antall treff Utforsks eneste faste live region (testen «without announcing it itself»).
- Hjelpeteksten har Senas formulering ordrett. Den første setningen fra runde 0 («… modellerte verdier fra seNorge, ikke målt snø.») står foran, fordi også den er en frossen beslutning. De to første setningene sier delvis det samme.
- Chipen «Datagrunnlag siste 24 t (NVE)» vises på det lukkede arket når kilden er NVE og nysnø står på «Alle». Med aktivt nysnøkrav dekker «Nysnø siste 24 t minst …» det. Chiplisten er derfor aldri tom når «Nullstill» vises, og den betingede `<ul>`-en fra runde 0 er fjernet.
- `nysnoVerdi` (og `nysnoTekst` i listen) tester nå på `'nve'`, så alt annet gir prognosen. `serializeFilter` finner `nysno` med `findIndex`.
- 17 overflødige `nysnoKilde: 'met'` er fjernet fra testobjekter som sprer `STANDARD_FILTER`, `PUDDERDAG` eller `FILTRERT.filter`.

**Verifisert (runde 1):** `npm run lint`, `npm run typecheck`, `npm test` (570/570) og `npm run build` er grønne. `npm run test:e2e` er grønn (113/113, med 14 for kilden: 10 fra runde 0 og 4 nye for listen, NVE som mangler overalt og chipen).

## Spec Change Log

- **Utløst av:** review-runde 1. To intent_gap-funn: listen viste prognosens nysnø mens filteret brukte NVE, og ingen melding når NVE mangler for alle steder. I tillegg en valgfri presisering av omregningen. **Endret:** Sena besvarte alle tre (1A, 2A, 3A med egen formulering) 2026-10-27, og svarene er skrevet inn i den frosne intensjonen og matrisen. Code Map og Tasks er utvidet med `ListeVisning.tsx`, `nveMangler` og den nye hjelpeteksten. **Kjent-dårlig tilstand unngått:** en liste der en rad som oppfyller «Nysnø siste 24 t minst 5 cm» viser en lavere prognoseverdi, og en tom flate uten forklaring når NVE var nede. **KEEP:** Sena valgte å bygge videre på den eksisterende implementeringen i stedet for å rulle tilbake. Filterlogikken, adressen, radiogruppen, fasittilfellene og de ti E2E-testene fra runde 0 er riktige og beholdes uendret.

## Review Triage Log

### Runde 1

Tre lag: Blind Hunter (14 funn), Edge Case Hunter (5 funn) og Verification Gap (ingen hull). To funn er intent_gap og er lagt fram for Sena før noe rettes.

- **medium → intent_gap** (Blind Hunter og Edge Case Hunter, samme rotårsak): Listevisningen (`ListeVisning.tsx:105`) viser alltid prognosens «Nysnø X cm», også når filteret bruker NVE. Oksskolten treffer «Nysnø siste 24 t minst 5 cm» med 15 mm, men raden viser 2,9 cm. Det strider mot intensjonen om at grensesnittet tydelig skal vise hvilken kilde som er i bruk. Code Map tok ikke med listen, og det finnes flere mulige lesninger (vise NVE-verdien i stedet, vise begge, eller bare merke kilden), så det må avgjøres av mennesket. Kartet viser ikke nysnø, og stedssiden viser allerede begge verdiene.
- **medium → intent_gap** (Edge Case Hunter): Når NVE er nede, publiseres data likevel (FR-6a v4), og da er alle NVE-verdier `null`. Med kilden NVE og aktivt nysnøkrav forsvinner da alle steder, og banneret sier bare «Prøv uten nysnøkravet», ikke hvorfor. En egen melding er ny, synlig tekst som intensjonen ikke dekker.
- **low → patch** (Blind Hunter og Edge Case Hunter): Med kilden NVE og nysnø på «Alle» viser det lukkede arket «Nullstill» uten noen chip, så brukeren ser ikke hva knappen nullstiller. Det var et implementeringsvalg, ikke en del av intensjonen. Rettes når intent_gap er avklart.
- **low → patch** (Blind Hunter): `nysnoVerdi` faller tilbake til NVE for alt som ikke er `met`. Typene og `parseFilter` hindrer det i dag, men standardverdien bør være prognosen. Direkte retting: test på `'nve'`.
- **low → patch** (Blind Hunter): README sier «vises ikke når nysnøkravet er på, men aldri når det står på «Alle»», som kan leses motsatt. Omformuleres.
- **low → patch** (Blind Hunter): `splice` i `serializeFilter` antar at `nysno` står først. Bruk `findIndex`, så rekkefølgen sier seg selv.
- **low → patch** (Blind Hunter): Rundt 15 testobjekter fikk `nysnoKilde: 'met'` ved siden av `...STANDARD_FILTER`, der feltet allerede finnes. Fjernes, så diffen viser de reelle endringene.
- **false** (Blind Hunter): «Siste 24 t» og «siste døgn» brukes om hverandre. Etiketten «Siste 24 t (NVE, modellert)» står i den frosne intensjonen og er godkjent av Sena. Teksten kan bare endres av henne.
- **low → lagt fram** (Blind Hunter): «1 mm ≈ 1 cm» forklarer ikke at mm er vannekvivalent. Hjelpeteksten står ordrett i den frosne intensjonen, så endringen er lagt fram for Sena som en valgfri presisering.
- **false** (Blind Hunter og Edge Case Hunter): Forslaget nevner ikke kilden når det fjerner nysnøkravet eller lemper et annet krav. Den frosne regelen gjelder et forslag om nysnø («for eksempel Nysnø siste 24 t minst 5 cm»). «Prøv uten nysnøkravet» fjerner kravet, så kilden er uten betydning der. Et vindforslag handler ikke om nysnø, og chipen viser fortsatt kilden.
- **false** (Blind Hunter): `sprint-status.yaml` står på `in-progress` mens specen står på `in-review`. Steg 5 synker til `review` før commit, som i 3.7.
- **false** (Blind Hunter): Hjelpeteksten nevner NVE også når «Prognose» er valgt. Teksten og plasseringen står i den frosne intensjonen (fast hjelpetekst under gruppen).
- **false** (Blind Hunter): Ingen test viser at kilden overlever endringer i andre kontroller. Alle endringer går gjennom `{ ...params, … }`, og E2E-testen for «Bruk forslaget» viser at kilden blir stående. Radioknappene er vanlige `<input type="radio">` med nettleserens egen tastaturstyring.
- **false** (Blind Hunter): Hvis `page.route` ikke treffer, kjører E2E-testen på ekte demodata, og da ville den feilet. Med ekte data gir «minst 5 cm» både Jiehkkevárri og Oksskolten, mens testen krever bare Oksskolten. Testen viser altså at ruten traff.
- **false** (Blind Hunter): Fasittabellen mangler et grensetilfelle for NVE-verdien 0.

### Runde 2 (etter Senas valg 1A, 2A og 3A)

Tre lag: Blind Hunter (15 funn), Edge Case Hunter (3 funn) og Verification Gap (1 hull og 1 annet funn). Ingen intent_gap eller bad_spec, så det ble ingen ny loopback.

- **medium → patch** (Blind Hunter og Edge Case Hunter, to funn med samme rotårsak): Meldingen om manglende NVE-data ble satt inn med `role="status"` og teksten samtidig. Mange skjermlesere annonserer bare endringer i et statusområde som allerede finnes, så den frosne regelen «teksten annonseres» var ikke sikret. Rettet: `<p role="status">` står alltid i panelet, og bare teksten endres (`.filter-hint:empty` tar ingen plass). To eldre tester som krevde at panelet ikke har noe statusområde, er presisert til hensikten sin: antall treff skal ikke annonseres fra panelet.
- **low → patch** (Verification Gap og Blind Hunter): Ingen test sjekket «Nysnø siste 24 t –» for et sted uten NVE-verdi. Ny test i `App.test.tsx` (Gaustatoppen uten NVE-verdi viser streken, ikke prognosens 10 cm).
- **low → patch** (Edge Case Hunter): `harAktiveKrav` og `serializeFilter` sammenlignet med `NYSNO_KILDER[0]`, mens verdien kravet leser, testet på `'nve'`. En ugyldig kilde ville gitt «Nullstill» og `nysnokilde=<søppel>` uten å filtrere. Alle steder tester nå på `'nve'`.
- **low → patch** (Blind Hunter): Koden som serverer endrede demodata, var kopiert tre ganger i E2E-fila. Den er samlet i hjelperen `serveDemoUtenNve`.
- **low → patch** (Blind Hunter): README sa ikke at NVE-verdien er en døgnverdi. Nå står det at det er det sist fullførte døgnet (kl. 06–06 UTC), ikke et glidende 24-timersvindu.
- **low → patch** (Blind Hunter, to funn): Code Map beskrev en ny prop til `ListeVisning` som ikke ble bygget, og merknaden om chipen fra runde 0 motsa runde 1. Code Map har fått en merknad om hva som faktisk ble bygget, og den gamle merknaden er strøket.
- **false** (Verification Gap og Blind Hunter): `nveMangler` er sann når `steder` er tom. Utforsk viser da tom-tilstanden «Ingen ferske data» uten filterpanel (`Utforsk.tsx:94`), så meldingen kan aldri vises.
- **false** (Blind Hunter): Meldingen dekker bare et fullt NVE-brudd. Senas beslutning 2A gjelder nettopp når ingen steder har NVE-verdi. Ved et delvis brudd forklarer den faste hjelpeteksten at steder uten NVE-verdi ikke vises.
- **low → lagt fram** (Blind Hunter): På 375 px med lukket ark vises meldingen først når arket åpnes. Plasseringen «under radioknappene» er Senas frosne beslutning. Banneret sier fortsatt hva som kan lempes. Lagt fram for Sena.
- **low → lagt fram** (Blind Hunter): Den faste hjelpeteksten sier «Steder uten NVE-verdi vises ikke …» også når «Prognose» er valgt, og da stemmer det ikke. Teksten står ordrett i den frosne intensjonen, så bare Sena kan endre den. Lagt fram.
- **false** (Blind Hunter): Chipen og forslaget nevner ikke «NVE» eller «modellert». Den frosne intensjonen gir selv eksempelet «Nysnø siste 24 t minst 5 cm», og «modellert» står i etiketten og hjelpeteksten.
- **false** (Blind Hunter): Fasittabellen mangler et sted med NVE-verdi og uten prognose. `nysnoVerdi` leser aldri `nysnoCm` når kilden er NVE. Grenen er låst fra begge sider av `storm` (prognose uten NVE) og `uten-vind` (NVE høyere enn prognose).
- **false** (Blind Hunter): Mangler et tilfelle der omregningen gir en desimal på grensen til et steg. `grense-avrundet` har 2,96 mm, som regnes om og så avrundes til 3,0 og treffer «minst 3», mens `rett-over` (2,94) ikke gjør det. Rekkefølgen (omregn, så avrund) er dermed låst.
- **false** (Blind Hunter): `sprint-status.yaml` står på `in-progress`. Steg 5 synker til `review` før commit.
- **low → avvist** (Blind Hunter): `kilde` er valgfri i `kravTekst` og `forslagTekst`. Alle kall som gjelder kilden, sender den, og standarden `met` gir samme tekst som før. Å gjøre parameteren påkrevd endrer alle kall og tester, uten at noen feil er påvist.
- **false** (Blind Hunter): README sier ikke hvor ferske NVE-verdiene er sammenlignet med MET. Det står nå at verdien gjelder det sist fullførte døgnet. Data eldre enn 24 timer er allerede `null` i dataprogrammet (`data-dictionary.md`).

### Etter runde 2: Senas to valgfrie forbedringer

Sena godkjente begge punktene som var lagt fram (hjelpeteksten med «Prognose» valgt, og meldingen på mobil). Begge er bygget:
- Hjelpetekstens siste setninger er nå «Med «Siste 24 t» valgt og nysnøkravet på skjules steder uten NVE-verdi. Står nysnø på «Alle», har valget ingen effekt.»
- `Utforsk.tsx` regner ut `nveForklaring`: null treff, kilden NVE, `minNysnoCm` blant `aktiveKrav` og `nveMangler`. Banneret får da linjen `<p class="ingen-treff-nve">` med `NVE_MANGLER` (eksportert fra `FilterPanel`, så teksten bare finnes ett sted). Den vises bare under 768 px. Fra 768 px skjuler `display: none` den, fordi panelet alltid er åpent og viser den samme meldingen. Utforsks skjulte live region er uendret, så meldingen ikke annonseres to ganger når panelet er synlig. Under 768 px med lukket ark er panelets status skjult, og da leser skjermleseren bannerlinjen når brukeren går gjennom banneret.

**Verifisert etter runde 2 og de to forbedringene:** `npm run lint`, `npm run typecheck`, `npm test` (572/572) og `npm run build` er grønne. `npm run test:e2e` er grønn (116/116, hvorav 17 for kilden). For «minst»-kravet oppfører 0 og `null` seg likt når kravet er aktivt (begge skjules), og på «Alle» vises begge. Fasittilfellet «kilde NVE uten krav» viser det siste.

## Design Notes

Kilden er et eget felt og ikke et nytt `FilterKrav`, av samme grunn som stedstype i 3.7: den er ikke en grense langs en skala, og den skal ikke vandres av forslaget ved null treff. `minNysnoCm` beholder navn, spenn og URL-parameter. Bare verdien den leser, byttes. Da gjelder all eksisterende logikk for avrunding, null-verdier og forslag uendret for NVE.

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alle grønne
- `npm run test:e2e` -- expected: alle grønne
