# Epic 3 Context: Finn steder som oppfyller mine krav

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Brukeren skal kunne sette presise krav og få bare de stedene som oppfyller alle kravene, både på kartet og i listen. Grunnkravene er nysnø, vind og temperatur, og som utvidelse kommer sol, avstand, stedstype og nysnø siste 24 t. Treff-antallet oppdateres mens brukeren justerer, ved null treff foreslår appen hvilket krav som bør lempes, og søket ligger i adressen og kan deles. Brukeren skal også kunne finne ett bestemt sted ved navn. Epicen fullfører kjerneflytene kart → filter → stedsside (UJ-1, UJ-3) og søk → stedsside (UJ-4). Målet er at minst 4 av 5 testbrukere finner et sted som oppfyller et gitt krav på under 2 minutter, uten hjelp. Status 2026-11-07: 3.1–3.8 og 3.2b er ferdige, og 3.9 er i backlog. Filterpanelet får nå en ryddigere utforming (UX-endringen fra 2026-11-07, se under).

## Stories

- Story 3.1: Filtrer på nysnø, vind og temperatur
- Story 3.2: Del og gjenåpne et filtrert søk (med 3.2b: stedssidens adresse bærer søket)
- Story 3.3: Få hjelp ved null treff og se antall treff live
- Story 3.4: Bruk hurtigvalg for vanlige kombinasjoner (Bør ha)
- Story 3.5: Filtrer på sol (Bør ha)
- Story 3.6: Filtrer på avstand (Bør ha)
- Story 3.7: Filtrer på stedstype (Bør ha)
- Story 3.8: Filtrer på nysnø siste 24 timer (Bør ha)
- Story 3.9: Søk etter et sted ved navn (Må ha, ny 2026-11-04)

## Requirements & Constraints

- **Kombinert med OG, aldri ELLER.** Et sted vises bare når det oppfyller alle aktive krav, også Bør ha-kravene.
- **Ytelse:** Filter og søk kjører i nettleseren over stedene i datafila. 95 % av filtersøkene svarer på under 2 sekunder.
- **Nysnø i cm** bruker samme faste omregning, 1 mm ≈ 1 cm, som SnowScore og forklaringssiden.
- **Fasittabeller er CI-blokkerende:** `tests/golden/filter.json` dekker kombinasjoner, grenser (inkluderende eller ekskluderende), null-verdier, likhet og forslaget ved null treff. Søket får sin egen `tests/golden/sok.json`.
- **Delbar lenke:** Lenken gjenskaper samme filter, visning (standard `kart`) og treffliste, gitt samme data. Stedssidens adresse bærer det samme søket.
- **Treff-antall live** annonseres med `aria-live="polite"` («14 treff»).
- **Null treff:** For hvert aktivt krav finnes nærmeste verdi i retning «Alle» som gir minst ett treff når de andre kravene står. Kravet som da gir flest treff, foreslås. Ved likhet vinner færrest steg og så panelets rekkefølge. Hjelper ingen enkeltendring, foreslås «Nullstill». Forslaget bytter aldri nysnøkilde.
- **Hurtigvalg:** «Pudderdag» og «Sol etter snøfall» er faste, dokumenterte kombinasjoner uten skjult heuristikk.
- **Avstand:** Posisjonen brukes bare i nettleseren og sendes eller skrives aldri. Det verifiseres med en nettverkstest.
- **Nysnø siste 24 t:** NVE seNorge-verdien (modellert, ikke målt) erstatter MET-prognosen for nysnøkravet, og grensesnittet viser hvilken kilde som er i bruk.
- **Søk (FR-32):** Søket skiller ikke mellom store og små bokstaver og tåler æ/ø/å skrevet som ae/o/a. Søketeksten må være starten på et ord i navnet. Treff der hele navnet starter med teksten, kommer først, deretter alfabetisk. Høyst 8 forslag fra første tegn. Skjulte eller ufullstendige steder vises med status som tekst. Søketeksten står aldri i adressen og endrer aldri filteret eller treff-antallet.
- **Gamle data:** Steder med data eldre enn 12 timer er fjernet før filter og søk ser dem.
- **Tilgjengelighet:** WCAG 2.1 AA fullt ut. Listen med filter er det fullverdige alternativet til kartet.
- **Ingen ny infrastruktur:** ingen konto, ingen søketjeneste og ingen lagring av brukerdata.

## Technical Decisions

- **Én filterlogikk (AD-6):** `shared/filter.ts` er den eneste rene filterfunksjonen, og kart og liste bruker den samme. Søket blir én ren funksjon i `shared/` med fasittabell (AD-4). `zod` er eneste tredjepartsimport i `shared/`.
- **URL-kontrakt (AD-12):** `shared/filter.ts` eier `FilterParams` og de eneste `parseFilter`/`serializeFilter`. Rekkefølgen er alltid `visning`, `nysno`, `nysnokilde`, `vind`, `temp`, `sky`, `avstand`, `type`, `sortering`. `nysnokilde=nve` følger `nysno`. `type` er kommaseparert i `STED_TYPES`-rekkefølge. Standardverdier (`kart`, «Alle», `met`, `score`) skrives ikke. Ugyldige eller gjentatte verdier blir standard, og adressen skrives om til ren form. Filterendringer bruker `replaceState`, mens bytte av visning eller åpning av sted legger til en historikkoppføring. Avstandssortering og posisjon skrives aldri.
- **Én rute og ett datalag (AD-8):** `Utforsk` er eneste rute for kart og liste, og den leser steder via `useSteder()`, som allerede er filtrert på alder.
- **Data:** Feltene i `Sted` (`shared/contracts/published.ts`) kan være `null`, og `snowScore.kind` kan være `incomplete`. Fasittabellen avgjør hvordan slike steder behandles.
- **Gjenbruk:** Avstandsberegningen ligger i `shared/avstand.ts`, og posisjonshentingen finnes allerede i listevisningen. Ikke skriv nye.
- **Kartet** må ikke nullstille zoom og utsnitt når filteret endres.
- **Tester:** Enhetstester ligger ved siden av koden. Playwright ligger i `tests/e2e/` med axe (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, også `serious` feiler) i begge bredder. Røyktesten kjører kart → filter → stedsside og søk i demomodus. CI kjører på Ubuntu med bredere fonter.

## UX & Interaction Patterns

- **Layout:** Det er ett brytpunkt ved 768 px. Under det ligger filteret i et bunn-ark som åpnes med knappen «Filter» (`aria-expanded`, ingen dra-gest). Lukket viser arket «Filter» med antall treff, aktive krav som chips i ren tekst og «Nullstill». Åpent tar det høyst 60 % av høyden og ruller selv. Fra 768 px er filteret et fast venstre sidepanel.
- **Ryddigere filterpanel (2026-11-07):** Rekkefølgen er «Filter» og antall treff, «Aktive krav», hurtigvalg, gruppen «Vær» (nysnø med datagrunnlag, vind, temperatur, skydekke i dagslys), gruppen «Sted» (avstand, stedstype) og «Nullstill». Gruppeoverskriftene står i liten `heading`-stil uten egen flate, så panelet er fortsatt ett kort.
  - **Aktive krav:** listen vises bare når et krav er aktivt, på alle bredder. Hver chip har samme tekst som på det lukkede arket («Nysnø minst 10 cm», «Stedstype skisted, by») og en ×-knapp med navn som «Fjern nysnøkravet». × setter bare det kravet til «Alle» og flytter fokus til kravets slider, eller til første avkrysningsboks for stedstype. Kildechipen «Datagrunnlag siste 24 t (NVE)» setter kilden tilbake til «Prognose». Chipsene brytes over flere linjer og ruller aldri sideveis. På det lukkede bunn-arket er chipsene fortsatt ren tekst.
  - **«Mer om skydekke» og «Mer om NVE-dataene»** er tekstknapper med `aria-expanded` og ▸/▾, lukket som standard. Hjelpeteksten (mørketid-hintet og NVE-teksten med uendret ordlyd) er koblet med `aria-describedby` også når den er skjult. Statustekster (NVE-data mangler, posisjon) og hjelpeteksten for stedstype står alltid synlige.
  - Filterlogikken og adressen endres ikke av denne utformingen.
- **Slidere:** Alle fem starter på «Alle» til venstre og blir strengere mot høyre. Piltast høyre gjør kravet strengere, og opp/ned følger tallet. Tallet vises ved gripepunktet. De har `role="slider"` og `aria-valuenow`, og de kan betjenes som ordinære skjemafelt.
- **Stedstype:** tre avkrysningsbokser. Ingen avkrysset betyr «Alle».
- **Null treff:** Teksten sier for eksempel «Ingen treff. Prøv vind høyst 8 m/s.» med «Bruk forslaget», som setter verdien og flytter fokus til slideren, og «Nullstill» ved siden av. Det blir aldri en tom flate uten handling.
- **Søkefelt (3.9):** Feltet har den synlige etiketten «Søk etter sted» og står mellom Kart | Liste og kartet eller listen, aldri i bunn-arket. Det følger combobox-mønsteret (`aria-expanded`, `aria-controls`, `aria-activedescendant`). Escape lukker listen, og andre trykk tømmer feltet. Antall forslag annonseres med `aria-live="polite"`. Uten treff står «Fant ingen steder som heter «…». SnowFinder dekker N steder i Norge.» Feltet skjules når ingen steder har ferske data.
- **Tilgjengelighetsgulv:** Trykkmål er minst 44×44 px, også for gripepunkter, hurtigvalg og ×-knapper. Kontrasten er minst 4,5:1, og fokusringen er i `accent`. `prefers-reduced-motion` stopper arkets animasjon. Feilmeldinger kobles med `aria-describedby`. Mikroteksten lover aldri snø.

## Cross-Story Dependencies

- 3.1 eier `shared/filter.ts`, filterpanelet og fasittabellen, og alle filterstories bygger på dem. Nye krav må inn i samme parse/serialize og i fasittabellen.
- 3.4 forutsetter filtrene i hurtigvalgene. «Sol etter snøfall» trenger solfilteret fra 3.5.
- 3.8 leser `nveNysnoSisteDognMm` fra dataprogrammet (1.3, 1.5). Verdien kan mangle når NVE har feilet.
- 3.9 deler datalaget med kart og liste, og åpner stedssiden med søket i adressen som i 3.2b.
- 3.9 bruker filteret fra 3.1 til å merke steder som «Oppfyller ikke filteret» i forslagene.
- Epic 2: Lenken «Slik beregner vi SnowScore» ved Kart | Liste vises bare under 768 px og må overleve endringer i layouten.
- Utsatte funn fra gjennomgangene står i `deferred-work.md`. Les dem før du endrer filteret.
