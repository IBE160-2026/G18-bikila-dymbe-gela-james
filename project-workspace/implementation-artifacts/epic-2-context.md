# Epic 2 Context: Forstå og stole på SnowScore

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Brukeren skal kunne åpne én forklaringsside, «Slik beregner vi SnowScore», og forstå nøyaktig hva tallet måler og hvordan det regnes ut: kort fortalt, steg for steg med formelen, et utledet regneeksempel, datakilder og begrensninger, kvaliteten på siste kjøring og (som utvidelse) en kalkulator. Siden gjør SnowScore etterprøvbar og ærlig, og den skal nås fra hver SnowScore-visning i løsningen (kart, liste, stedsside), uansett hvor brukeren kom fra. Målet er at minst 4 av 5 testbrukere kan forklare en vist SnowScore etter å ha lest siden.

## Stories

- Story 2.1: Les kort fortalt og steg for steg
- Story 2.2: Se det utledede regneeksempelet
- Story 2.3: Les om datakilder og begrensninger
- Story 2.4: Prøv SnowScore-kalkulatoren selv (Bør ha)

Byggerekkefølgen er rekkefølgen over. Alle unntatt 2.4 er Må ha.

## Requirements & Constraints

- **Kort fortalt og steg for steg:** Siden sier hva SnowScore måler og ikke måler, viser formelen og har én illustrasjon per delpoeng (A Nysnøpotensial, B Kuldebonus, C Snøandel).
- **Endringslogg:** Siden har en seksjon med versjonsnummer og begrunnelse for hver endring i formelparametrene. Første rad er nevner-endringen i B fra 6 til 16: full kuldebonus først ved T̄ ≈ −14 °C i stedet for −4 °C, så B skiller «akkurat kaldt nok» fra «arktisk kaldt».
- **Lenket fra hver score:** Kart-tooltip, listerad og stedsside lenker til siden, i tillegg til toppnavigasjonen.
- **Regneeksempel:** 6-timerstabellen fra briefen (nedbør 1, 3, 4, 3, 1, 0 mm og temperatur −1, −3, −4, −3, −2, −1 °C). S, P og T̄ utledes eksplisitt før A, B, C og summen (58). En test kjører eksempelets inndata gjennom `shared/snowscore.ts`. Siden og testen skal bruke samme tabell, så de ikke kan sprike. Tilfellet «Briefens eksempel» finnes allerede i `tests/golden/snowscore.json`.
- **Datakilder og begrensninger:** MET (CC BY 4.0) og NVE (NLOD) listes med lisens. Kartgrunnlaget er Kartverket, og stedsnavn fra OpenStreetMap er ODbL. Teksten sier at SnowScore er en prognose og en modell, ikke en målt eller garantert verdi, og at SnowFinder ikke er en skredfarevurdering. Den lenker til Varsom.no for fjellområder.
- **Datakvalitetspanel:** Siste publiserte kjørings rapport i klartekst: tidspunkt, antall steder, andel gyldige, avviste svar per kilde og antall med ufullstendige data. I demomodus vises demodatasettets byggeinformasjon i stedet.
- **Kalkulator (Bør ha):** Nedbør og temperatur kan endres, og A/B/C og summen oppdateres umiddelbart uten sideoppdatering. Komponenten importerer modulen og har aldri en egen kopi av formelen.
- **Tilgjengelighet:** En axe/Playwright-test i CI gir null kritiske WCAG 2.1 AA-brudd på siden.
- **Ingen ny infrastruktur:** Siden er statisk og leser bare datafila som allerede lastes. Den sender ingenting.

## Technical Decisions

- **Én formel (AD-6):** Alle tall og parametere på siden hentes fra `shared/snowscore.ts`, via re-eksporten i `src/lib/snowscore.ts`. `SNOWSCORE` har `maxA` 60, `maxB` 25, `maxC` 15, `fullSnowMm` 20, `allSnowAtOrBelowC` 0, `noSnowAtOrAboveC` 2, `coldRangeC` 16, `minPrecipitationMm` 0,5, `maxMissingShare` 0,1 og `cmPerMm` 1. Bruk konstantene i teksten i stedet for å skrive 60/25/15/16 for hånd, så teksten følger en formelendring. `computeSnowScore` gir uavrundede delpoeng (`a`, `b`, `c`) og `newSnowMm`/`precipitationMm`/`meanTemperatureC` (S, P, T̄). Bare totalen avrundes. Vis delpoengene avrundet i UI-et, men regn med de uavrundede verdiene. Briefens B ≈ 7 er 6,77 i modulen. `snowFraction` og `mmToCm` finnes også. Vinduet er 24 timer (`WINDOW_HOURS`). Det er verdt å nevne under «kort fortalt».
- **Versjonsnummer:** Modulen har ingen versjonskonstant i dag. Hvis endringsloggen skal vise en versjon, må 2.1 bestemme hvor den bor. Ett sted, helst ved `SNOWSCORE`.
- **Ny rute:** `src/lib/router.ts` har i dag `utforsk`, `sted` og `ikke-funnet`. Siden trenger en ny `Route`-variant med `parseRoute`/`href`-støtte og tester i `router.test.ts`. Arkitekturen kaller siden `src/pages/SlikBeregnerViSnowScore.tsx`. URL-stien er ikke bestemt i planen, så 2.1 velger den. Lenker går gjennom `Lenke` (in-app-navigasjon, Ctrl/midtklikk virker).
- **App-skallet:** `App.tsx` viser i dag bare «SnowFinder» i headeren. Toppnavigasjonen trenger lenken «Slik beregner vi SnowScore». `Innhold` viser skjelett mens data lastes og feil når data mangler. Forklaringstekst, regneeksempel og kalkulator trenger ikke data og bør ikke vente på dem. Bare datakvalitetspanelet bruker `result.data.report`.
- **Kvalitetsrapporten:** `RunReport` i `shared/contracts/published.ts` har `runId`, `mode`, `start`, `varighetMs`, `antallSteder`, `andelGyldige`, `avvistePerKilde.{met,nve}`, `antallUfullstendige`, `publisert`, `ikkePublisertFordi` og `avviste`. `PublishedData` bærer `report`, `generert`, `referenceTime` og `mode`. Les dem via `useSteder()`. Ingen annen komponent laster data selv (AD-8). Tid vises i norsk lokaltid. Bruk de eksisterende hjelperne i `src/lib/format.ts`, og «nå» kommer bare fra `src/lib/clock.ts`.
- **Score-tekst:** `src/lib/scoreTier.ts` har fire trinn: ≥ 70 «Svært godt», ≥ 45 «Godt», ≥ 20 «Middels», ellers «Lite». I tillegg kommer `INCOMPLETE_LABEL` «Ufullstendige data». Forklaringssiden bør forklare trinnene og bruke `scoreText`/`ScoreBadge` i stedet for egne grenser.
- **Testplassering:** Enhetstester ligger ved siden av koden. Regneeksempelets fasit ligger i `tests/golden/`, og axe-testen i `tests/e2e/`, etter mønsteret i `sted.spec.ts`/`liste.spec.ts` (tags `wcag2a`, `wcag2aa`, `wcag21a` og `wcag21aa`, der også `serious` feiler).

## UX & Interaction Patterns

- **IA:** Siden er én av tre flater og nås fra den faste toppnavigasjonen («SnowFinder» · «Slik beregner vi SnowScore»), som blir ☰ på mobil. Den nås også fra enhver score-visning. Rekkefølgen på siden: kort fortalt, steg for steg, regneeksempel, datakilder og begrensninger, datakvalitet, kalkulator og endringslogg.
- **Lenker fra score-visninger:** `ScoreBadge` er en `span`. Badgen er bevisst ikke en egen lenke, for hele listeraden og kortet er klikkmålet. Listeraden er allerede en lenke til stedssiden, og en lenke kan ikke ligge inne i en annen. Leaflet-tooltipen (`tooltipText` i `kartMarkor.ts`) er bare tekst som vises ved hover og kan ikke klikkes. 2.1 må derfor finne en tilgjengelig plassering for lenken på hver flate, for eksempel en lenke ved listens sortering, ved kartet og i SnowScore-kortet på `Sted.tsx`. Avklar dette i spec-en i stedet for å gjøre badgen til en lenke.
- **Typografi og flater:** `heading` brukes på seksjonstitler og `numeric` (`tnum`) på tall og tabeller. Datakvalitetspanelet er et `surface-raised`-kort uten SnowScore-farger, og avviste svar vises som tall, ikke i danger-rødt. SnowScore-fargene brukes bare der en score vises.
- **Mikrotekst:** Tonen er rolig og presis og lover aldri snø. Skriv for eksempel «Siste kjøring: 297 av 300 steder gyldige, kl. 14:05», ikke «Datakvalitet: OK».
- **Kalkulator:** To numeriske inndata. Ved ugyldig inndata står feilmeldingen rett under feltet, koblet med `aria-describedby`.
- **Tilgjengelighetsgulv:** Fokusringen er i `accent`. Trykkmål er minst 44 px og kontrasten minst 4,5:1. Illustrasjonene trenger tekstalternativ, og ingen informasjon skal formidles bare med farge. Siden har ett brytpunkt ved ~768 px.

## Cross-Story Dependencies

- **2.1** lager ruten, siden og lenkene fra navigasjon, kart, liste og stedsside. 2.2, 2.3 og 2.4 legger seksjoner inn i samme side.
- **2.2 og 2.4** bygger på `shared/snowscore.ts` fra 1.4 og kan ikke endre formelen. En formelendring er en planendring og går gjennom `bmad-correct-course`, med en ny rad i endringsloggen.
- **2.3** leser `report` fra datafila fra 1.5 og 1.10 og må virke i demomodus.
- **Direkte lenker:** Direkte lenker og oppfrisking på den nye ruten krever SPA-reserven for GitHub Pages fra 1.11 (utsatt funn), på samme måte som `/sted/:id`.
- **Epic 3** legger filter i `Utforsk`. Forklaringssiden påvirkes ikke, men lenkene fra kart og liste må overleve at Utforsk-layouten endres.
