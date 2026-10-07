# Epic 1 Context: Se snøforholdene i Norge — på kart eller i liste

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Brukeren skal kunne åpne SnowFinder og se ferske SnowScore-data for norske steder, enten som et fargelagt Norgeskart eller som en likeverdig, tilgjengelig liste, og åpne et sted for full detalj. Epicen er kjernen alle andre epics bygger på: stedskatalog, dataprogram (henting → validering → SnowScore → atomisk publisering av én JSON-fil), demodata for rent klon, planlagt kjøring hver time, og de tre lesende flatene (kart, liste, stedsside). Det finnes ingen database og ingen Supabase. Appen er statiske filer som bare leser den publiserte datafilen.

## Stories

- Story 1.1: Prosjekt-skaffolding og CI-skjelett (ferdig)
- Story 1.2: Bygg stedskatalogen (ferdig)
- Story 1.3: Hent og valider værdata hver time
- Story 1.4: Bygg den delte SnowScore-modulen (ferdig, i review)
- Story 1.10: Kjør SnowFinder lokalt med demodata
- Story 1.5: Beregn og publiser SnowScore i dataprogrammet
- Story 1.11: Kjør dataprogrammet hver time og publiser appen
- Story 1.7: Se Norgeskartet med fargelagte steder
- Story 1.8: Bruk tilgjengelig listevisning i stedet for kart
- Story 1.9: Åpne en stedsside med full poengsum
- Story 1.6: Hold tjenesten oppe når en datakilde er nede (Bør ha)

Byggerekkefølgen er rekkefølgen over. Alle unntatt 1.6 er Må ha.

## Requirements & Constraints

- **Henting:** MET og NVE hentes én gang per sted per kjøring, med identifiserende User-Agent og begrenset samtidighet, uten nøkler og uten tilstand mellom kjøringer (ingen `If-Modified-Since`/`Expires`). En avbrutt kjøring publiserer ingenting.
- **Validering:** Hvert svar valideres mot et strengt Zod-skjema. Ugyldige svar avvises, rettes aldri automatisk og registreres i kvalitetsrapporten (sted, kilde, årsak). Skjemaene dokumenteres som dataordbok (felt, enhet, gyldig område, kilde), og kontraktstester kjører mot opptatte ekte svar.
- **SnowScore:** Mangler mer enn 10 % av timene, blir resultatet «ufullstendige data», aldri en tallverdi. Slike steder teller som gyldige mot terskelen.
- **Publisering:** Skjer bare når minst 95 % av stedene har gyldige data. Terskelen teller bare avviste eller manglende svar. Ellers står forrige fil urørt. Fila skrives atomisk (midlertidig navn, så rename). Et sted som feilet i en kjøring som likevel publiseres, vises som «ufullstendige data». Fila bærer aldri verdier fra en tidligere kjøring.
- **Sporbarhet og kvalitetsrapport:** Hver stedspost har kjørings-ID og kildens tidsstempel. Hver kjøring, også en mislykket, gir én rapport: start, varighet, antall steder, andel gyldige, avviste per kilde, antall ufullstendige, og om den ble publisert og ellers hvorfor ikke. For en publisert kjøring ligger rapporten i datafila. Ellers havner den i jobbloggen og som workflow-artifact, og kjøringen blir rød i Actions.
- **Dataalder:** Normalt under 90 min. Eldre enn 3 t merkes «utdatert». Eldre enn 12 t fjernes helt fra kart, liste og stedsside. Grensene testes deterministisk mot demo-nå.
- **Demomodus:** `npm ci && npm run dev` på et rent klon, uten nøkler og nettverk, viser et merket demodatasett (ca. 20–30 steder). Det har minst ett sted med «ufullstendige data» og ett utdatert. Regenerering gir byte-lik fil. Produksjon viser aldri demodata.
- **Ytelse:** Kartet er interaktivt (pan/zoom) innen 3 s på en representativ mobil over 4G.
- **Tilgjengelighet:** WCAG 2.1 AA på alt unntatt selve kartlaget. Listen er det fullverdige AA-alternativet. Liste og stedsside skal ha null kritiske brudd i en automatisert axe/Playwright-test i CI.
- **Sikkerhet og personvern:** Ingen skrivbare endepunkter, ingen hemmeligheter, ingen konto. Appen sender ingenting.
- **Testing:** En E2E-røyktest i demomodus dekker kart → stedsside (Epic 3 utvider den med filter). Egenskapstestene for SnowScore bruker minst 1000 inndata.

## Technical Decisions

- **To paradigmer:**
  - `scripts/pipeline/` er pipes-and-filters. `run.ts` er eneste inngang: den lager kjørings-ID, kaller stegene og skriver kjøringsrapporten i `finally`. Stegene er `fetch.ts`, `validate.ts`, `score.ts` og `publish.ts`. De er idempotente og sender data videre bare via den typede `RunContext` (`shared/contracts/run.ts`), uten mellomfiler. Programmet kjøres med `tsx`.
  - `src/` er en tynn, lagdelt klient: pages → components → hooks → `lib/data`.
- **Delt domenelogikk i `shared/`:** `snowscore.ts`, `filter.ts`, `freshness.ts` og `contracts/`. `snowscore.ts` finnes allerede: `computeSnowScore(hours)` gir `{kind:'score',…}` eller `{kind:'incomplete',missingShare}`. `zod` er eneste tredjepartsimport i `shared/`. Ingenting kopieres andre steder, og `src/lib/snowscore.ts` bare re-eksporterer.
- **Kontrakter:** `PublishedData`, `Sted`, `RunReport` og `Catalog` (finnes) er Zod-skjemaer med camelCase-felt i `shared/contracts/`. `publish.ts` validerer mot `PublishedData` før skriving, og `src/lib/data/` parser med samme skjema ved lasting.
- **Datafiler, med én skriver hver:**
  - `data/catalog.json` (300 steder) skrives bare av `scripts/build-catalog/`. Dataprogrammet leser den uten å endre den.
  - `public/data/demo.json` er committet og lages av `npm run data:demo` fra `tests/contract/fixtures/`, med en egen liten demokatalog.
  - `public/data/latest.json` lages av `npm run data` og er gitignored.
- **Ingen modusbryter i appen:** `src/lib/data/` laster `latest.json` og faller tilbake til `demo.json`. Fila har `mode: "demo" | "live"`, som bare brukes til demobanneret. Ingen miljøvariabel styrer atferd.
- **Én klokke:** `src/lib/clock.ts` er eneste kilde til «nå». Den gir fila sin `referenceTime` i demo og veggklokka i live. Lint forbyr `Date.now()` og argumentløs `new Date()` andre steder. I demo er `referenceTime` det nyeste tidsstempelet i fixturene, kjørings-ID-en er fast og varigheten er 0.
- **Kart og liste er én rute:** `Utforsk.tsx` leser `visning=kart|liste` (standard `kart`) og velger `KartVisning` eller `ListeVisning`. Begge bruker samme `useSteder()`-hook, og ingen annen komponent laster stedsdata selv. Stedssiden ligger på `/sted/:id`.
- **Design-tokens:** én kilde i `src/lib/theme.ts`, speilet i `src/styles/tokens.css` og holdt i takt av `theme.test.ts`. Leaflet-markørfarger importeres fra `theme.ts`. Ingen hardkodede hex- eller px-verdier for noe DESIGN.md navngir.
- **CI og drift:**
  - `ci.yml`: lint, typecheck, enhets-, egenskaps-, kontrakts- og fasittester, build.
  - `e2e.yml`: Playwright mot `vite preview` i demomodus.
  - `data.yml`: kjører hver time, ved push til `main` og manuelt, med `concurrency` uten avbrudd.
  - Actions er på, men Pages er det ikke. Reserven er å publisere `latest.json` til grenen `data` (`permissions: contents: write`) og lese den fra `raw.githubusercontent.com`. Produksjonsbygget feiler hvis `latest.json` ikke ble laget.
- **Konvensjoner:**
  - Tidsstempler lagres i UTC (ISO 8601) og vises i norsk lokaltid bare i UI-et.
  - Kommentarer forklarer bare *hvorfor*, gjerne med AD-referanse.
  - Avhengigheter låses eksakt: zod 4.6.5, tsx 4.23.13, fast-check 4.10.1, Leaflet 1.9.4, Playwright 1.63.0.
  - Tester ligger ved siden av koden (`*.test.ts`). E2E ligger i `tests/e2e/`, kontraktstester i `tests/contract/` og fasittabeller i `tests/golden/`.
- **Nye forsøk (1.6, Bør ha)** ligger inne i `fetch.ts`: et fast antall forsøk med økende ventetid, uten tilstand og uten kretsbryter.

## UX & Interaction Patterns

- **IA:** Fast toppnavigasjon («SnowFinder» · «Slik beregner vi SnowScore»), som blir ☰ på mobil. Kart/liste-vekslingen ligger alltid rett under navigasjonen. Visningen er del av URL-en.
- **SnowScore-skala:** 4 trinn, `snowscore-0`..`snowscore-3` (grått → sterkt blått), og bare til SnowScore. Score vises aldri bare som farge, men alltid som tall og tekstetikett («82 · Svært godt») i badge, tooltip og listerad. Sirkelformen er reservert for score.
- **Kartmarkør:** sirkel med hvit kant og tykkere aksentkant når stedet er valgt. Hover viser navn og score i en tooltip, og klikk åpner stedssiden. Markører klynges bare ved svært lav zoom.
- **Listerad:** et kort med stedsnavn, score-badge og nysnø/vind/temp i `numeric` (`tnum`). Betjenes med Tab/Enter. Sortering på score/avstand/navn skjer med `<select>` eller knapperad, aldri dra-og-slipp. Hele raden er klikkmålet, ikke badgen.
- **Stedsside:** score i `display`, delpoeng A/B/C, temperatur, nysnø, vind, skydekke, høyde og kildetidsstempel. Én kolonne på mobil, to på desktop. Siden lenker til forklaringssiden.
- **Tilstander:**
  - Lasting vises som skjelett i `surface-sunken`, aldri bare en spinner.
  - «Utdatert» er en liten `meta`-tekst med tidsstempel.
  - Over 12 t gamle steder fjernes helt.
  - «Ufullstendige data» vises som tekst i stedet for badge, aldri som 0.
- **Bannere:**
  - Demobanneret «Demodata – ikke ekte prognoser» vises på alle flater under navigasjonen når `mode: "demo"`. Det er nøytralt (`surface-sunken`, tynn `ink-secondary`-kant), kan ikke lukkes, blokkerer ingenting og lenker til README.
  - `banner-stale-data` (1.6) har warning-bakgrunn og ink-primary-tekst. Det vises når de nyeste dataene er over 90 min gamle: «Viser siste kjente data fra kl. XX:XX».
- **Tone:** rolig og presis, lover aldri snø. Skriv «Prognose — oppdatert for 42 min siden», ikke «Garantert pudder!».
- **Tilgjengelighetsgulv:**
  - synlig fokusring i `accent`;
  - trykkmål på minst 44 px;
  - kontrast ≥ 4,5:1, så det mørkeste score-trinnet får hvit tekst;
  - `prefers-reduced-motion` respekteres;
  - ett brytpunkt ved ~768 px.

## Cross-Story Dependencies

- **1.10** kommer rett etter 1.4. Den bygger den delen av dataprogrammet den trenger (`run.ts`, `score.ts`, `publish.ts` mot fixtures), og i tillegg `src/lib/data/`, `clock.ts` og demobanneret. Den fjerner også de tomme mappene `supabase/` og `src/lib/supabase/` fra 1.1, og legger kopisjekken for planleggingsdokumentene inn i `ci.yml`.
- **1.3 og 1.5** kobler de ekte kildene inn i samme program. 1.5 trenger validerte data fra 1.3 og modulen fra 1.4.
- **1.11** trenger 1.5.
- **1.7, 1.8 og 1.9** trenger en datafil fra 1.5 eller demodata fra 1.10, og må virke i demomodus.
- **1.9** innfører aldersgrensene i `shared/freshness.ts`, som også gjelder kart og liste.
- **1.6** kommer etter 1.7 og 1.9, fordi banneret skal ligge på Utforsk og stedssiden.
- **Andre epics:**
  - Epic 2 er forklaringssiden, som hver SnowScore-visning her lenker til. Datakvalitetspanelet der leser `RunReport` fra datafila.
  - Epic 3 legger filter (`shared/filter.ts`, URL-parametere) på `useSteder()` og `Utforsk`, og utvider E2E-testen med filter.
  - Epic 4 (skivindu) utvider `Sted.tsx` og `score.ts` med `skivinduUtenDagslys`.
