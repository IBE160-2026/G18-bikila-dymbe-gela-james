# Epic 3 Context: Finn steder som oppfyller mine krav

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Brukeren skal kunne sette presise krav (minimum nysnø, maks vind og en temperaturgrense, og som utvidelse sol, avstand, stedstype og nysnø siste 24 t) og bare få stedene som oppfyller alle kravene, både på kartet og i listen. Treff-antallet oppdateres mens brukeren justerer. Ved null treff foreslår appen hvilket krav som bør lempes, i stedet for å vise en tom flate. Søket ligger i nettadressen og kan deles. Epicen fullfører kjerneflyten kart → filter → stedsside (UJ-1 og UJ-3). Målet er at minst 4 av 5 testbrukere finner et sted som oppfyller et gitt krav på under 2 minutter, uten hjelp.

## Stories

- Story 3.1: Filtrer på nysnø, vind og temperatur
- Story 3.2: Del og gjenåpne et filtrert søk
- Story 3.3: Få hjelp ved null treff og se antall treff live
- Story 3.4: Bruk hurtigvalg for vanlige kombinasjoner (Bør ha)
- Story 3.5: Filtrer på sol (Bør ha)
- Story 3.6: Filtrer på avstand (Bør ha)
- Story 3.7: Filtrer på stedstype (Bør ha)
- Story 3.8: Filtrer på nysnø siste 24 timer (Bør ha)

Byggerekkefølgen er rekkefølgen over. 3.1–3.3 er Må ha.

## Requirements & Constraints

- **Kombinert med OG, aldri ELLER.** Hvert vilkår er én grense satt av brukeren. Et sted vises bare når det oppfyller alle aktive vilkår. Det gjelder også Bør ha-filtrene.
- **Ytelse:** Filtreringen skjer i nettleseren over de ~300 stedene i datafila, og 95 % av søkene skal svare på under 2 sekunder.
- **Nysnø i cm** bruker samme faste omregning, 1 mm ≈ 1 cm, som SnowScore og forklaringssiden.
- **Fasittabell:** `tests/golden/filter.json` har 5–8 steder og flere kombinasjoner, med forventede treff og forventet forslag ved null treff. Den kjøres som CI-blokkerende test mot den samme filterlogikken som appen bruker. Tabellen skal si om grensene er inkluderende eller ekskluderende, hvordan null-verdier behandles og hva som avgjør ved likhet.
- **Delbar lenke:** En åpnet lenke gjenskaper nøyaktig samme filterverdier, samme visning (`kart`/`liste`, standard `kart`) og samme treffliste, gitt samme data.
- **Treff-antall live:** Antallet er synlig og annonseres til skjermleser med `aria-live="polite"` (for eksempel «14 treff»).
- **Null treff:** Systemet finner det enkeltkriteriet som ville gitt flest nye treff om det ble lempet, og foreslår nettopp det, for eksempel «Ingen treff. Prøv vind under 8 m/s i stedet». Lempingen er så liten som mulig: for hvert aktivt krav finner systemet nærmeste sliderverdi i retning «Alle» som gir minst ett treff når de andre kravene står, og velger kravet som da gir flest treff. Ved likhet vinner færrest steg og deretter panelets rekkefølge. Hjelper ingen enkeltendring, foreslås «Nullstill». Forslaget er en knapp som setter verdien med ett trykk.
- **Hurtigvalg (Bør ha):** «Pudderdag» og «Sol etter snøfall» fyller filteret med en fast, dokumentert kombinasjon i én handling. Ingen skjult heuristikk.
- **Sol (Bør ha):** maks skydekke i dagslystimer.
- **Avstand (Bør ha):** Posisjonen brukes bare i nettleseren og sendes aldri noe sted. Det verifiseres med en nettverkstest som viser at ingen utgående forespørsel inneholder posisjon.
- **Stedstype (Bør ha):** ett eller flere av skisted, fjelltopp og by.
- **Nysnø siste 24 t (Bør ha):** NVE seNorge-verdien brukes i stedet for MET-prognosen for nysnøkriteriet, og grensesnittet viser tydelig hvilken kilde som er i bruk.
- **Gamle data:** Steder med data eldre enn 12 timer er allerede fjernet før filteret ser dem.
- **Tilgjengelighet:** Filteret skal oppfylle WCAG 2.1 AA fullt ut, og listen med filter er det fullverdige alternativet til kartet.
- **Ingen ny infrastruktur:** Ingen konto, ingen lagring av brukerdata og ingen ny tjeneste. Alt skjer i nettleseren mot datafila som allerede lastes.

## Technical Decisions

- **Én filterlogikk (AD-6):** Den rene filterlogikken bor i `shared/filter.ts` og kopieres aldri. `zod` er eneste tredjepartsimport i `shared/`. Kart og liste bruker samme funksjon.
- **URL-kontrakt (AD-12):** `shared/filter.ts` eier `FilterParams` og de eneste `parse`/`serialize`-funksjonene mellom URL og filter. Spørrestrengen er `visning`, `nysno`, `vind`, `temp`, `sky` og `sortering`, alltid i den rekkefølgen, så samme søk gir samme adresse. Standardverdier (`kart`, «Alle», `score`) skrives ikke. En ugyldig eller gjentatt verdi regnes som standard, og adressen skrives om til ren form ved lasting. Filter- og sorteringsendringer bruker `replaceState`; bytte av visning eller åpning av et sted legger til en historikkoppføring. Avstandssortering skrives aldri. Stedssidens adresse (`/sted/<id>`) bærer samme spørrestreng, bygd og lest av de samme funksjonene.
- **Én rute og ett datalag (AD-8):** `Utforsk` er eneste rute, og begge visninger leser de samme filterparametrene og bruker `useSteder()`. Ingen side henter eller filtrerer steder på annen måte. `Utforsk` får i dag `steder` ferdig filtrert på alder fra `useSteder`. Filteret legges på etter det.
- **Feltene finnes allerede i `Sted`** (`shared/contracts/published.ts`): `nysnoCm`, `vindMaks` (høyeste vind i vinduet, m/s), `temperatur` (T̄, °C), `skydekke` (snitt i %), `nveNysnoSisteDognMm` og `type` (`STED_TYPES`). Alle måleverdiene kan være `null`, og `snowScore.kind` kan være `incomplete`. Fasittabellen må bestemme hvordan slike steder behandles.
- **Avstand:** `avstandKm` (haversine) og typen `Posisjon` finnes i `src/lib/sortering.ts`, og `ListeVisning` henter allerede posisjon med `navigator.geolocation`, med egne tekster ved avslag og tidsavbrudd. Gjenbruk dette. Ikke skriv en ny avstandsfunksjon.
- **Kartet:** `KartVisning` bygger markørene på nytt når `steder` endres. Pass på at filtrering ikke nullstiller zoom og utsnitt hver gang brukeren flytter en slider.
- **Testplassering:** Enhetstester ved siden av koden, fasit i `tests/golden/filter.json` og Playwright i `tests/e2e/` etter mønsteret i `liste.spec.ts` (axe med `wcag2a`, `wcag2aa`, `wcag21a` og `wcag21aa`, der også `serious` feiler). Røyktesten skal kjøre kart → filter → stedsside i demomodus. Demodataene har 24 steder og må gi meningsfulle treff.

## UX & Interaction Patterns

- **Responsivt, ett brytpunkt ved 768 px:** Under 768 px ligger filterpanelet i et bunn-ark som starter delvis synlig, viser aktive filterverdier som chips og kan dras opp til full høyde. Fra 768 px er det et fast venstre sidepanel, og kart eller liste fyller resten. Begge bredder testes i Playwright. Husk at CI kjører på Ubuntu med bredere fonter.
- **Slidere:** De har tynt spor, et gripepunkt på 24 px og en aksentfarget fylt del. Tallverdien vises alltid ved gripepunktet. De betjenes med mus, touch og piltaster (`role="slider"`, `aria-valuenow`). En skjermleserbruker skal kunne bruke ordinære skjemafelt, ikke bare visuelle slidere.
- **Nullstill-knappen** er alltid synlig når minst ett filter avviker fra standard.
- **Hurtigvalg-chips** fyller filteret og oppdaterer resultatet i samme handling, uten bekreftelsesdialog.
- **Null treff:** Vis et banner med forslag, aldri en tom flate uten handling.
- **Ugyldig inndata:** Feilmeldingen står rett under feltet og kobles med `aria-describedby`.
- **Tilgjengelighetsgulv:** Trykkmål er minst 44×44 px, også for gripepunkter og chips. Kontrasten er minst 4,5:1, og fokusringen er i `accent`. `prefers-reduced-motion` stopper bunn-arkets animasjon. `accent` brukes for aktive filterverdier, og SnowScore-fargene bare der en score vises.
- **Mikrotekst:** Tonen er rolig og presis og lover aldri snø.

## Cross-Story Dependencies

- **3.1** lager `shared/filter.ts`, filterpanelet og fasittabellen. Alle andre stories bygger på dem.
- **3.2** utvider ruteren og `FilterParams` med URL-støtte. Bør ha-filtrene (3.5–3.8) og sorteringen må legges inn i samme parse/serialize.
- **3.3** legger forslaget ved null treff inn i fasittabellen fra 3.1.
- **3.4** forutsetter at filtrene i hurtigvalgene finnes. «Sol etter snøfall» trenger solfilteret fra 3.5.
- **3.6** gjenbruker posisjonshentingen fra listevisningen (1.8).
- **3.8** leser `nveNysnoSisteDognMm` fra dataprogrammet (1.3 og 1.5). Verdien kan mangle når NVE har feilet.
- **Epic 2:** Lenken «Slik beregner vi SnowScore» ved kart/liste-veksleren i `Utforsk` må overleve den nye layouten.
- **Direkte lenker** med filter i spørrestrengen treffer `/`, så de krever ingen egen SPA-reserve.
