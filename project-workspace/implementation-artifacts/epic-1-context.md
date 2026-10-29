# Epic 1 Context: Se snøforholdene i Norge — på kart eller i liste

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Brukeren skal kunne åpne SnowFinder og se ferske SnowScore-data for norske steder, enten som et fargelagt Norgeskart eller som en likeverdig, tilgjengelig liste, og åpne et sted for full detalj. Epicen er kjernen alle andre epics bygger på: stedskatalog, dataprogram (henting → validering → SnowScore → atomisk publisering av én JSON-fil), demodata for rent klon, planlagt kjøring hver time, og de tre lesende flatene (kart, liste, stedsside). Det finnes ingen database. Appen er statiske filer som bare leser den publiserte datafilen. Gjenstående arbeid er timesjobben (1.11). Robusthet når en datakilde er nede (1.6, Bør ha) er bygget i `spec-1-6-hold-tjenesten-oppe.md`.

## Stories

- Story 1.1: Prosjekt-skaffolding og CI-skjelett (ferdig)
- Story 1.2: Bygg stedskatalogen (ferdig)
- Story 1.3: Hent og valider værdata hver time (ferdig)
- Story 1.4: Bygg den delte SnowScore-modulen (ferdig)
- Story 1.10: Kjør SnowFinder lokalt med demodata (ferdig)
- Story 1.5: Beregn og publiser SnowScore i dataprogrammet (ferdig)
- Story 1.11: Kjør dataprogrammet hver time og publiser appen (backlog)
- Story 1.7: Se Norgeskartet med fargelagte steder (ferdig)
- Story 1.8: Bruk tilgjengelig listevisning i stedet for kart (ferdig)
- Story 1.9: Åpne en stedsside med full poengsum (ferdig)
- Story 1.6: Hold tjenesten oppe når en datakilde er nede (Bør ha; se `sprint-status.yaml` for status)

Byggerekkefølgen er rekkefølgen over. Alle unntatt 1.6 er Må ha.

## Requirements & Constraints

- **Robusthet ved nedetid:**
  - *Siste gyldige data (Må ha, allerede levert av 1.5):* feiler MET for mer enn 5 % av stedene, publiseres ingen ny fil, og appen viser forrige gyldige fil – aldri en tom eller delvis. Et sted som feilet i en kjøring som likevel publiseres, vises som «ufullstendige data». Fila bærer aldri verdier fra en tidligere kjøring.
  - NVE er tilleggsdata: inngår ikke i SnowScore og teller ikke mot terskelen. Feiler NVE, publiseres fila likevel med tomt NVE-felt («–»), og avvisningene står i kvalitetsrapporten.
  - *Nye forsøk (Bør ha, 1.6):* et feilende kall prøves på nytt et fast antall ganger med økende ventetid. Ingen kretsbryter, ingen tilstand mellom kjøringer, ingen varslingskanal.
  - Nedetid verifiseres ved å simulere at MET eller NVE er utilgjengelig i test.
- **Dataalder:** normalt under 90 min. Over 90 min vises banneret for gamle data. Eldre enn 3 t merkes «utdatert». Eldre enn 12 t fjernes helt fra kart, liste og stedsside. Grensene testes deterministisk mot demo-nå.
- **Henting:** én gang per sted per kjøring, identifiserende User-Agent, begrenset samtidighet og høyst ett kall per 100 ms per kilde (MET krever avtale over 20 kall/s). Nye forsøk må holde seg innenfor dette. Ingen nøkler, ingen `If-Modified-Since`.
- **Validering:** strenge Zod-skjemaer. Ugyldige svar avvises, rettes aldri, og registreres i kvalitetsrapporten (sted, kilde, årsak).
- **Publisering:** atomisk (midlertidig navn, så rename), bare når minst 95 % av stedene har poengsum. «Ufullstendige data» (>10 % manglende timer) teller ikke som gyldig.
- **Kvalitetsrapport:** hver kjøring, også mislykket, gir én rapport. Publisert: i datafila. Ellers: jobbloggen, workflow-artifact og rød kjøring i Actions.
- **Demomodus:** `npm ci && npm run dev` uten nøkler og nett viser merket demodata, med minst ett ufullstendig og ett utdatert sted. Regenerering gir byte-lik fil. Produksjon viser aldri demodata.
- **Ytelse:** Kartet er interaktivt (pan/zoom) innen 3 s på en representativ mobil over 4G.
- **Tilgjengelighet:** WCAG 2.1 AA på alt unntatt kartlaget. Listen er det fullverdige AA-alternativet. Liste og stedsside har null kritiske axe-brudd i CI.
- **Testing:** En E2E-røyktest i demomodus dekker kart → stedsside (Epic 3 utvider den med filter). Egenskapstestene for SnowScore bruker minst 1000 inndata.
- **Sikkerhet:** ingen skrivbare endepunkter, hemmeligheter eller kontoer. Appen sender ingenting.

## Technical Decisions

- **Dataprogrammet** (`scripts/pipeline/`) er pipes-and-filters: `run.ts` er eneste inngang, lager kjørings-ID og skriver rapporten i `finally`. Stegene `fetch.ts`, `validate.ts`, `score.ts`, `publish.ts` er idempotente og deler data bare via typet `RunContext` (`shared/contracts/run.ts`). Kjøres med `tsx`.
- **Nye forsøk ligger inne i `fetch.ts`**, uten tilstand mellom kjøringer. Kretsbryter, `api_incidents` og aktiv varsling er fjernet for godt.
- **Klienten** (`src/`) er tynn og lagdelt: pages → components → hooks → `lib/data`. `Utforsk.tsx` er én rute for kart og liste (`visning=kart|liste`) med én `useSteder()`-hook. Stedssiden er `/sted/:id`.
- **Delt logikk i `shared/`:** `snowscore.ts`, `filter.ts`, `freshness.ts` (alder = nå − kildens tidsstempel; 3 t utdatert, 12 t skjult) og `contracts/` (`PublishedData`, `Sted`, `RunReport`, `Catalog`, camelCase). `zod` er eneste tredjepartsimport der. Logikk kopieres ikke til `src/`.
- **Én klokke:** `src/lib/clock.ts` er eneste kilde til «nå» (fila sin `referenceTime` i demo, veggklokka i live). Lint forbyr `Date.now()` og argumentløs `new Date()` andre steder. Alderssjekk for banneret må gå via klokka og `shared/freshness.ts`.
- **Datafiler, én skriver hver:** `data/catalog.json` (`scripts/build-catalog/`), `public/data/demo.json` (committet, `npm run data:demo`), `public/data/latest.json` (gitignored, `npm run data`). `src/lib/data/` laster `latest.json` og faller tilbake til `demo.json`. `mode: "demo" | "live"` brukes bare til demobanneret. Ingen miljøvariabel styrer atferd.
- **Design-tokens:** én kilde i `src/lib/theme.ts`, speilet i `src/styles/tokens.css`, holdt i takt av `theme.test.ts`. Leaflet-markørfarger importeres fra `theme.ts`. Ingen hardkodede hex/px for navngitte tokens.
- **CI og drift:** `ci.yml` (lint, typecheck, tester, build), `e2e.yml` (Playwright i demomodus), `data.yml` (hver time, `concurrency` uten avbrudd). Uten Pages publiseres `latest.json` til grenen `data`.
- **Konvensjoner:** UTC ISO 8601 lagret, norsk lokaltid bare i UI. Kommentarer forklarer *hvorfor*. Eksakte versjoner. Tester ved siden av koden; E2E i `tests/e2e/`, kontraktstester i `tests/contract/`, fasittabeller i `tests/golden/`.

## UX & Interaction Patterns

- **IA:** Fast toppnavigasjon («SnowFinder» · «Slik beregner vi SnowScore»), som blir ☰ på mobil. Kart/liste-vekslingen ligger alltid rett under navigasjonen. Visningen er del av URL-en.
- **Kartmarkør:** sirkel med hvit kant og tykkere aksentkant når stedet er valgt. Hover viser navn og score i en tooltip, og klikk åpner stedssiden.
- **Listerad:** kort med stedsnavn, score-badge og nysnø/vind/temp i `numeric` (`tnum`). Betjenes med Tab/Enter. Sortering med `<select>` eller knapperad, aldri dra-og-slipp. Hele raden er klikkmålet.
- **Stedsside:** score i `display`, delpoeng A/B/C, temperatur, nysnø, vind, skydekke, høyde og kildetidsstempel. Én kolonne på mobil, to på desktop. Lenker til forklaringssiden.
- **`banner-stale-data`** (bygget i 1.6; avvik fra DESIGN.md, se `deferred-work.md`):
  - Full bredde øverst på Utforsk og stedssiden, ikke på forklaringssiden. `surface-raised`-bakgrunn, 4 px venstrekant i `warning` og `ink-primary`-tekst (16,6:1). DESIGN.md sin `warning`-bakgrunn med `ink-primary` gir bare 2,92:1, under WCAG AA.
  - Utløses når datafila (`generert`) er over 90 min gammel, ikke av en kretsbryter.
  - Tekst: «Viser siste kjente data fra kl. XX:XX» (norsk lokaltid, med dato når fila er fra en annen dag). Ingen årsak, fordi appen bare ser siste publiserte fil.
  - Blokkerer ikke resten av siden og kan ikke lukkes.
- **Demobanneret** er bevisst nøytralt (`surface-sunken`, tynn `ink-secondary`-kant) så det ikke forveksles med banneret for gamle data. `warning` er semantisk reservert for «siste kjente data»; `danger` brukes til utdaterte/fjernede data.
- **Tilstander:** lasting som skjelett i `surface-sunken`; «Utdatert» som liten `meta`-tekst med tidsstempel; «Ufullstendige data» som tekst, aldri 0 eller badge; steder over 12 t fjernes.
- **Score:** alltid tall + tekstetikett, 4-trinns `snowscore-0..3` reservert for SnowScore.
- **Tone:** rolig og presis, lover aldri snø.
- **Tilgjengelighetsgulv:** synlig fokusring i `accent`, trykkmål ≥ 44 px, kontrast ≥ 4,5:1, `prefers-reduced-motion`, ett brytpunkt ved ~768 px.

## Cross-Story Dependencies

- **1.6** bygger på 1.3 (`fetch.ts`), 1.5 (siste gyldige fil, terskel) og 1.7/1.9 (Utforsk og stedssiden, `shared/freshness.ts`, `clock.ts`).
- **Utsatte funn knyttet til 1.6:** at datakvalitetspanelet (Epic 2) skal si hvor mange steder som er utdatert eller fjernet, er fortsatt åpent. Ny beregning av alderen mens siden står åpen ble løst i 1.9b (sjekk hvert minutt i live), og banneret bruker samme sjekk. Les `deferred-work.md` før bygging.
- **1.11** trenger 1.5. Banneret blir først reelt i drift når timesjobben går.
- **Andre epics:** Epic 2 (forklaringsside, datakvalitetspanel leser `RunReport`), Epic 3 (filter på `useSteder()`/`Utforsk`), Epic 4 (skivindu i `Sted.tsx` og `score.ts`).
