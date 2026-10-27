---
title: 'Story 3.7: Filtrer på stedstype'
type: 'feature'
created: '2026-10-27'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '9d39949b2b9f33697645d3205abd4f6406073240'
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Filteret dekker vær og avstand, men brukeren kan ikke avgrense til stedstypene som passer turen, for eksempel bare skisteder (FR-24).

**Approach:** Et sjette krav, **stedstype**, der brukeren velger én eller flere av skisted, fjelltopp og by. Et sted vises bare når typen er blant de valgte, kombinert med OG som de andre kravene (AD-6). Valget ligger i adressen som de andre kravene (AD-12), så en delt lenke gjenskaper det.

**Kontroll (Sena, 2026-10-27, 1A):** Tre avkrysningsbokser, «Skisted», «Fjelltopp» og «By», i en gruppe med overskriften «Stedstype». Ingen avkrysset betyr «Alle» og er standard. Å krysse av avgrenser til de avkryssede typene, og å fjerne siste kryss gir «Alle» igjen, aldri null treff. Alle tre avkrysset er lov og viser alle steder.

**Forslag ved null treff (Sena, 2026-10-27, 2A):** Stedstypekravet kan foreslås lempet som de andre kravene (Story 3.3), men bare rett til «Alle»: «Prøv uten stedstypekravet.» Det regnes som ett steg og står sist i panelrekkefølgen, så samme rangering gjelder (flest treff, så færrest steg, så panelrekkefølge). «Bruk forslaget» fjerner kryssene og flytter fokus til første avkrysningsboks.

## Boundaries & Constraints

**Always:**
- Samme filterlogikk for kart og liste (`filtrerSteder` i `shared/filter.ts`). Ingen egen filtrering i komponentene.
- Valgte typer skrives til adressen i fast rekkefølge (`STED_TYPES`), så samme valg alltid gir samme adresse. Ugyldig, tom eller gjentatt verdi gir «Alle», og adressen skrives om til ren form.
- Hurtigvalgene nevner ikke stedstype, så de setter den til «Alle» (samme regel som for de andre kravene i 3.4).
- «Nullstill» fjerner også stedstypekravet, og et aktivt stedstypekrav vises som chip på det lukkede bunn-arket.
- Ordinære skjemafelt med synlig etikett, trykkmål på minst 44×44 px, og ingen alvorlige axe-funn ved 1280 og 375 px.

**Never:** Ingen ny avhengighet. Ingen endring i katalogen eller dataprogrammet (`type` finnes allerede på hvert sted). Ingen ny stedstype utover `STED_TYPES`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Én type | Velg skisted | Bare de 8 skistedene i demodata, på kart og i liste; adressen får `type=skisted` | N/A |
| Flere typer | Velg skisted og by | 16 steder; adressen får `type=skisted,by` uansett klikkrekkefølge | N/A |
| Kombinert | Skisted + nysnø minst X | Bare skisteder som også oppfyller nysnøkravet | N/A |
| Lenke | `?type=by,fjelltopp` | Fjelltopp og by er valgt; adressen skrives om til `type=fjelltopp,by` | N/A |
| Ugyldig lenke | `?type=innsjo` eller `?type=` | Stedstype er «Alle»; parameteret fjernes fra adressen | Ingen feil |
| Siste kryss fjernet | Bare by avkrysset, fjern krysset | Stedstype er «Alle», alle steder vises; `type` fjernes fra adressen | N/A |
| Null treff | By + nysnø minst X, der ingen by har nok nysnø men et skisted har | Banneret foreslår den lempingen som gir flest treff; er det stedstype: «Prøv uten stedstypekravet.» | N/A |

</frozen-after-approval>

## Code Map

- `shared/contracts/catalog.ts` -- `STED_TYPES` (linje 7). Legg til og eksporter `type StedType = (typeof STED_TYPES)[number]`.
- `shared/filter.ts` -- `FilterParams` får `stedstyper: readonly StedType[] | null` (`null` = «Alle», ellers ikke-tom og sortert i `STED_TYPES`-rekkefølge). `FilterKrav` snevres til tallkravene (`Exclude<keyof FilterParams, 'stedstyper'>`), så `FILTER_GRENSER`, `FILTER_KRAV`, `FELT` og sliderne er uendret. `Filtrerbar` får `'type'`. `filtrerSteder` sjekker stedstypen i tillegg til `aktiveGrenser`. `STANDARD_FILTER` og begge `HURTIGVALG` får `stedstyper: null`. Ny `harAktiveKrav(params)` (tallkrav eller stedstype) for Nullstill og chips. `parseFilter`/`serializeFilter`: parameter `type`, kommaseparert, etter `avstand`. En ukjent eller gjentatt type, et tomt element eller et gjentatt parameter gir `null`. `Forslag.krav` blir `FilterKrav | 'stedstyper'`. I `forslagVedNullTreff` prøves `stedstyper: null` som ett steg etter tallkravene når stedstype er aktiv, med samme «strengt bedre»-sammenligning, så et tallkrav vinner ved likhet.
- `src/components/FilterPanel.tsx` -- en `<fieldset>` med `<legend>Stedstype</legend>` og tre `<input type="checkbox">` med etikett, etter `FILTER_KRAV`-sliderne og før Nullstill. Bruk `onEndre({ ...params, stedstyper })`, normalisert: sortert i `STED_TYPES`-rekkefølge, og tom gir `null`. `erHurtigvalgAktiv` sammenligner også `stedstyper`. Chip-teksten er «Stedstype skisted, by». `Nullstill` vises via `harAktiveKrav`. `forslagTekst` gir «Prøv uten stedstypekravet.» `fokuserFilteret` godtar `'stedstyper'` og fokuserer første avkrysningsboks (`filter-stedstyper-skisted`).
- `src/pages/Utforsk.tsx` -- `brukForslaget` setter `{ ...filter, [forslag.krav]: forslag.verdi }` og virker uendret for `'stedstyper'` (verdien er `null`). Bare typene må utvides der `Forslag` brukes. `settFilter` er uendret.
- `src/lib/router.ts` -- uendret. Leser og skriver bare via `parseFilter`/`serializeFilter`.
- `tests/golden/filter.json`, `shared/filter.test.ts` -- `type` på alle åtte steder, `stedstyper: null` i alle eksisterende `filter`-objekter, nye tilfeller for én type, flere typer, type kombinert med et tallkrav, et null-treff-tilfelle der stedstype er beste forslag, og et der et tallkrav vinner ved likhet. Parse/serialize-tester for matrisens lenkerader.
- `src/components/FilterPanel.test.tsx`, `src/App.test.tsx`, `src/lib/router.test.ts` -- `stedstyper: null` i håndskrevne `FilterParams`. Markup-test for fieldset, legend og chip-tekst.
- `tests/e2e/filter.spec.ts` -- nye describe-blokker «the place type filter at 1280px/375px» etter mønsteret i «the sun filter». Demodata har 8 av hver type.
- `README.md` -- avsnittet om filteret (rundt linje 40–77): nytt krav og eksempel med `type` i adressen.
- Ikke rør: `ListeVisning.tsx`, `KartVisning.tsx`, avstandslogikken i 3.6.

## Tasks & Acceptance

**Execution:**
- [x] `shared/contracts/catalog.ts`, `shared/filter.ts` -- `StedType`, `stedstyper` i `FilterParams`, filtrering, parse/serialize, `harAktiveKrav`, hurtigvalg -- kjernen alle andre bygger på.
- [x] `tests/golden/filter.json`, `shared/filter.test.ts` -- fasittilfellene og parse/serialize-radene i matrisen.
- [x] `src/components/FilterPanel.tsx`, `FilterPanel.test.tsx` -- fieldset, chip, Nullstill, hurtigvalg-sammenligning.
- [x] `src/App.test.tsx`, `src/lib/router.test.ts` -- legg til `stedstyper: null`, og test at `type` står etter `avstand` og før `sortering`.
- [x] `src/pages/Utforsk.tsx` -- typene for et forslag om stedstype. (Ingen endring trengtes, se Implementation Notes.)
- [x] `tests/e2e/filter.spec.ts` -- matrisen ved 1280 og 375 px, inkludert axe og ingen horisontal rulling.
- [x] `README.md` -- kravet og adresseeksempelet.

**Acceptance Criteria:**
- Given Utforsk med grunnfilteret fra 3.1, when jeg velger én eller flere stedstyper, then kombineres valget med de andre kravene (OG), på både kart og liste.
- Given et aktivt stedstypekrav, when jeg trykker «Nullstill» eller et hurtigvalg, then er stedstype «Alle» igjen.
- Given null treff der stedstype er beste forslag, when jeg trykker «Bruk forslaget», then fjernes kryssene, treffene kommer tilbake, og fokus står på første avkrysningsboks.
- Given lint, typecheck, test, build og `npm run test:e2e`, when de kjøres, then er alle grønne.

## Implementation Notes

- Implementert direkte i bygge-økten, uten en egen agent, med specen som eneste kilde.
- **Avvik fra Code Map, `src/lib/router.ts`:** Code Map sa «uendret», men `URLSearchParams.toString()` gjør komma om til `%2C`. Uten rettingen ville adressen blitt `type=skisted%2Cby` og ikke `type=skisted,by`, som den låste matrisen krever. `utforskQuery` gjør nå `%2C` om til `,` igjen, og det er den eneste endringen i ruteren. Det er trygt fordi ingen andre verdier i adressen kan inneholde komma: tallene er heltall, og `visning`/`sortering` er faste ord. Komma er lov ukodet i en spørrestreng (RFC 3986). `parseFilter` godtar både `,` og `%2C`.
- `Forslag` er nå en unionstype. Grenen `{ krav: 'stedstyper'; verdi: null }` gjør at et forslag for stedstype aldri kan ha en tallverdi. Rangeringen er flyttet til en ren hjelper, `bedre()`, slik at tallkravene og stedstypen sammenlignes med nøyaktig samme regel. Stedstypen prøves etter alle tallkravene, så «strengt bedre» lar et tallkrav vinne ved full likhet. Fasittabellen dekker begge retninger.
- `FELT` er snevret til `Exclude<keyof Filtrerbar, 'type'>`, fordi `Filtrerbar` nå har `type` (tekst), som `rundTilEnDesimal` ikke kan ta.
- `Utforsk.tsx` er uendret. `brukForslaget` (`{ ...filter, [forslag.krav]: forslag.verdi }`) og `fokuserFilteret(forslag.krav)` typesjekker uten endring, fordi `fokuserFilteret` nå godtar `'stedstyper'` og fokuserer `filter-stedstyper-skisted`. `settFilter` trengte heller ingen endring.
- `erHurtigvalgAktiv` sammenligner `String(params.stedstyper) === String(verdier.stedstyper)`. Begge er alltid normalisert (eller `null`), så sammenligningen er entydig.
- Avkrysningsboksene ligger i `<label>` rundt `<input>`, uten `htmlFor`. Hele etiketten er trykkmålet (`min-height: var(--spacing-7)`, 48 px, samme som sliderne). Det er målt i E2E ved 320 og 375 px med bred font.
- Fasittabellen har nå `type` på alle åtte steder: tre skisteder, tre fjelltopper og to byer. Det gir fire nye vanlige tilfeller (by alene, skisted+by, alle tre, fjelltopp + nysnø) og to nye null-treff-tilfeller: stedstype vinner med flest treff (5 mot 2), og vind vinner ved full likhet (1 treff og 1 steg hver).
- Lokal oppsett-merknad: `npm ci` og `npx playwright install chromium` måtte kjøres først på denne maskinen.

**Verifisert:** `npm run lint`, `npm run typecheck`, `npm test` (545/545) og `npm run build` er grønne. `npm run test:e2e` er grønn (98/98, med de 11 nye i «the place type filter at 1280px/375px»).

## Spec Change Log

## Review Triage Log

### Runde 1

Tre lag: Blind Hunter (12 funn), Edge Case Hunter (1 funn) og Verification Gap (1 funn). Ingen intent_gap eller bad_spec, så det ble ingen loopback.

- **false** (Blind Hunter): `sprint-status.yaml` viser `in-progress` mens specen viser `in-review`. Steg 5 (Present) synker sprint-status til `review` før commit, som i 3.4 og 3.6, så denne mellomtilstanden blir aldri skipet.
- **low → defer** (Blind Hunter): Design Notes lovet en oppføring i `deferred-work.md` om AD-12-listen, men den manglet. Lagt inn, sammen med oppdatering av UX-dokumentene. Retting av arkitekturen hører hjemme i `bmad-architecture`.
- **false** (Blind Hunter): Alle tre avkrysset gir en egen adresse, chip og «Nullstill». Den frosne intensjonen (1A) sier eksplisitt: «Alle tre avkrysset er lov og viser alle steder.» Det er en egen, synlig tilstand, ikke en duplisert adresse for samme filter.
- **low → patch** (Blind Hunter): En skjermleser hørte ikke at ingen avkrysset betyr «Alle», mens sliderne sier «Alle». Rettet med hjelpeteksten «Ingen avkrysset viser alle stedstyper.», koblet til fieldset-et med `aria-describedby`.
- **low → patch** (Blind Hunter): Testnavnet «all five requirements» og kommentaren «distance last of all» var utdatert. Testen dekker nå alle seks krav, også `type`.
- **low → patch** (Blind Hunter): Ingen test ved 375 px av «Bruk forslaget» med lukket ark, der fokus skal falle tilbake til «Filter». Ny E2E-test lagt til.
- **low → avvist** (Blind Hunter): `replaceAll('%2C', ',')` i ruteren gjelder hele spørrestrengen. Ingen parameter i dag kan inneholde komma, og `router.test.ts` fester formen. En smalere retting krever omskriving av `utforskQuery`, mer enn en direkte retting, og en fremtidig fritekstparameter er usannsynlig.
- **low → avvist** (Blind Hunter): `String()`-sammenligningen i `erHurtigvalgAktiv` er skjør. Begge sider er alltid normalisert eller `null`, så den gir riktig svar. En hjelper legger til flate uten en navngitt feil.
- **low → patch** (Blind Hunter): Chipen bygget teksten fra type-id-ene, ikke fra `STEDSTYPE_NAVN`. Den bygges nå fra visningsnavnene med små bokstaver, så chip og etikett ikke kan gli fra hverandre.
- **low → patch** (Blind Hunter): README sa «vises alle steder igjen», noe som er feil når andre krav er aktive, og gjentok regelen om hurtigvalg. Rettet, og linjene er brutt som resten av avsnittet.
- **false** (Blind Hunter): Avviket i ruteren står ikke i Spec Change Log. Den loggen er bare for loopbacks fra review. Avviket står i Implementation Notes, der malen ber om avgjørelser og overraskelser fra implementeringen.
- **false** (Blind Hunter): Ingen enhetstest av avkrysningsboksenes `onChange`. Filens toppkommentar fastsetter at markup testes i enhetstester og oppførsel i E2E, som er arbeidsdelingen fra 3.6. `normaliserStedstyper` er enhetstestet, og E2E dekker avkryssing, rekkefølge og fjerning av siste kryss.
- **false** (Edge Case Hunter): Et håndlaget `stedstyper: []` skjuler alle steder. Ingen vei i koden lager det: panelet, `parseFilter` og `serializeFilter` normaliserer alle via `normaliserStedstyper`, og feltets doc-kommentar sier «never empty».
- **patch** (Verification Gap, pre-verifisert): Hurtigvalgets `aria-pressed` sammen med en avkrysset stedstype var utestet. Én assert er lagt til i `FilterPanel.test.tsx` (`{ ...PUDDERDAG, stedstyper: ['by'] }` gir `aria-pressed="false"`).

**Verifisert etter rettingene:** `npm run lint`, `npm run typecheck`, `npm test` (545/545) og `npm run build` er grønne. `npm run test:e2e` er grønn (99/99).

## Design Notes

`FilterKrav` holdes til tallkravene fordi `FILTER_GRENSER`, sliderne og forslagsvandringen alle antar «ett tall langs en skala». Stedstype er en mengde, ikke en skala, så den får sitt eget felt i stedet for å presses inn i den modellen. Arkitekturens adresseliste (AD-12) nevner ennå ikke `avstand` fra 3.6. Begge oppdateres i en egen `docs/`-PR via `bmad-architecture`, og føres i `deferred-work.md`.

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alle grønne
- `npm run test:e2e` -- expected: alle grønne
