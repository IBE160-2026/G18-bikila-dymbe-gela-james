# Epic 1 Context: Se snøforholdene i Norge — på kart eller i liste

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Levere kjernen i SnowFinder: brukeren åpner appen og ser ekte, ferske SnowScore-data for ca. 300 norske steder, enten på et fargelagt Leaflet-kart eller i en likeverdig, fullt tilgjengelig liste, og kan åpne hvert sted for full detalj. Epicen dekker hele kjeden: skjelett og design-tokens, den offline-bygde stedskatalogen, dataprogrammet (hent → valider → beregn → publiser) som skriver én statisk JSON-datafil, den delte SnowScore-modulen, og Utforsk- og stedssidene. Alle andre epics bygger på den, og den er 100 % Må ha. **Merk:** Etter forenklingen 2026-10-07 finnes det ingen database og ingen Supabase. Epics-filen er ennå ikke oppdatert (John, steg 8d), så story-AC-er der som nevner migrasjoner, `locations`, `conditions_staging`, `api_incidents`, Edge Functions, kretsbryter eller aktiv varsling er utdaterte. Arkitektur v4 og PRD v3 gjelder.

## Stories

- Story 1.1: Prosjekt-skaffolding og CI-skjelett (ferdig)
- Story 1.2: Bygg stedskatalogen
- Story 1.3: Hent og valider værdata hver time
- Story 1.4: Bygg den delte SnowScore-modulen
- Story 1.5: Beregn og publiser SnowScore i pipelinen
- Story 1.7: Se Norgeskartet med fargelagte steder
- Story 1.8: Bruk tilgjengelig listevisning i stedet for kart
- Story 1.9: Åpne en stedsside med full poengsum
- Story 1.6: Hold tjenesten oppe når en datakilde er nede (bygges sist; nummeret beholdes)
- Planlagt, ikke i epics-filen ennå: Story 1.10 (demodata, fjerner Supabase-mappene) og en egen story for den planlagte jobben

## Requirements & Constraints

- **Katalog:** ~300 steder fra OpenStreetMap (skianlegg, langrennsarenaer), Kartverket (navngitte fjelltopper, tettsteder) og en manuelt kvalitetssikret liste. Hvert sted har navn, koordinater med 4 desimaler, høyde og stedstype (skisted/fjelltopp/by). Katalogfilen valideres mot et skjema før den godtas, og versjoneres i repoet.
- **Henting:** én kjøring henter alle steder én gang per time med identifiserende User-Agent og begrenset samtidighet. Ingen tilstand mellom kjøringer, så `If-Modified-Since`/`Expires` og gjenopptakelse brukes ikke. En avbrutt kjøring publiserer ingenting og kjøres på nytt neste time. Ingen nøkler kreves.
- **Validering:** hvert MET/NVE-svar sjekkes mot et strengt Zod-skjema. Ugyldige svar avvises, registreres i kjøringens kvalitetsrapport (sted, kilde, årsak), rettes aldri automatisk og havner aldri i datafilen. Kontraktstester kjører valideringen mot opptatte ekte svar.
- **SnowScore** (timesnedbør pₕ i mm, temperatur Tₕ i °C):
  - f(T) = min(1, max(0, (2 − T)/2)); S = Σ pₕ·f(Tₕ); P = Σ pₕ; T̄ = snitt av Tₕ
  - A = 60·min(1, S/20); B = 25·min(1, max(0, (2 − T̄)/16)); C = 15·S/P; B = C = 0 når P < 0,5 mm
  - SnowScore = round(A + B + C), 0–100. Omregning 1 mm vann ≈ 1 cm snø overalt.
  - Fasiteksempel: 6 timer med P = 12, S = 12, T̄ ≈ −2,3 gir A = 36, B ≈ 7, C = 15, sum **58**.
- **Egenskapstester** (≥1000 tilfeldige inndata i CI): 0–100; mer nysnø senker aldri A; lavere snittemperatur senker aldri B; P < 0,5 gir alltid B = C = 0; deterministisk.
- **Ufullstendige data:** mangler >10 % av timene, vises «ufullstendige data» i stedet for et tall, aldri 0 eller en gjettet verdi.
- **Publisering:** atomisk, og bare når ≥95 % av stedene er gyldige; ellers står forrige fil urørt. Terskelen teller bare avviste eller manglende svar (ufullstendige data teller som gyldige). I en publisert kjøring vises et sted som feilet som ufullstendige data; filen bærer aldri verdier fra en tidligere kjøring. Én kjøring om gangen.
- **Robusthet (Må ha):** når en kilde er nede, viser appen siste gyldige fil, aldri en tom eller delvis. Retries med økende ventetid er Bør ha; kretsbryter og egen varslingskanal er fjernet. En feilet kjøring synes som rød i Actions-fanen og i kvalitetsrapporten.
- **Kvalitetsrapport og sporbarhet:** hver kjøring skriver én rapport (start, varighet, antall steder, andel gyldige, avviste per kilde, antall ufullstendige, publisert eller ikke og hvorfor). Hver publisert stedspost har kjørings-ID og kildens tidsstempel.
- **Friskhet:** normalt <90 min. 3–12 t gammelt merkes «Utdatert» med tidsstempel; eldre enn 12 t fjernes fra kart, liste og stedsside.
- **Demomodus (Må ha):** `npm ci && npm run dev` virker fra rent klon med committet demodatasett (ca. 20–30 steder) uten nettverk. Demo har egen liten katalog dekket av fixtures, fast referansetid, fast kjørings-ID, og inneholder minst ett sted med ufullstendige data og ett utdatert. Merkes «Demodata – ikke ekte prognoser».
- **Ytelse:** kartet er panorerbart/zoombart innen 3 s på en mellomklasse-mobil over 4G.
- **Tilgjengelighet:** WCAG 2.1 AA på alt unntatt selve Leaflet-kartlaget; listen er det fulle AA-alternativet. Axe/Playwright i CI skal gi null kritiske brudd på liste- og stedssiden.
- **Stedsside:** stabil, delbar `/sted/:id` uten sesjon. Viser SnowScore med A/B/C, temperatur, nysnø, vind, skydekke, høyde og kildetidsstempel.
- Ingen kontoer, ingen skriving fra brukere, ingen hemmeligheter. Kun norsk UI. Ikke en skredvurdering.

## Technical Decisions

- **Stack:** Node 24 LTS, React 19.3.0, TypeScript 6.0.3, Vite 8.3.0, Leaflet 1.9.4, Zod 4.6.5, Vitest 5.0.1, fast-check 4.10.1, Playwright 1.63.0. `tsx` kjører dataprogrammet (versjon pinnes i Story 1.3). Én npm-pakke i repo-rot, eksakte versjoner. Hosting og planlagt jobb: GitHub Actions + GitHub Pages (antagelse; en admin må slå på Actions og Pages).
- **Oppsett:** `src/{pages,components,hooks,lib,styles}`, `shared/` (+ `shared/contracts/`), `scripts/{pipeline,build-catalog}/`, `data/catalog.json`, `public/data/`, `tests/{e2e,contract/fixtures,golden}/`, `.github/workflows/{ci,e2e,data}.yml`.
- **Katalogen bygges offline (AD-5):** `scripts/build-catalog/` kjøres for hånd og produserer bare `data/catalog.json`, validert mot Zod-skjemaet `Catalog` i `shared/contracts/` og committet. Dataprogrammet leser katalogen og endrer den aldri. Ingenting utenfor `scripts/build-catalog/` importerer skriptet.
- **Dataprogram (AD-2):** `scripts/pipeline/` med `run.ts` (eneste inngang, lager kjørings-ID, kaller stegene i rekkefølge, skriver kjøringsrapporten i `finally`), `fetch.ts`, `validate.ts`, `score.ts`, `publish.ts`. Stegene er idempotente og sender data videre bare via den typede `RunContext` (`shared/contracts/run.ts`), aldri via mellomfiler. `publish.ts` skriver til midlertidig navn og renamer på plass.
- **Datafiler (AD-1, AD-10):** én skriver per fil. `public/data/demo.json` (committet, fra `npm run data:demo` på `tests/contract/fixtures/`) og `public/data/latest.json` (gitignored, fra `npm run data`). `src/lib/data/` henter `latest.json` med vanlig `fetch` og faller tilbake til `demo.json`. Filen har `mode: "demo" | "live"`, som appen bare bruker til demobanneret. Produksjonsbygget i `data.yml` feiler hvis `latest.json` mangler.
- **Én klokke (AD-10):** `src/lib/clock.ts` er eneste kilde til «nå» i `src/` (filens `referenceTime` i demo, veggklokke i live). Lint forbyr `Date.now()`/`new Date()` uten argumenter ellers. Alder vurderes av `shared/freshness.ts`.
- **Delt domenelogikk (AD-6):** `shared/snowscore.ts`, `filter.ts`, `freshness.ts` og `contracts/` er ren TypeScript brukt av både Vite og Node; `zod` er eneste tillatte tredjepartsimport. `src/lib/snowscore.ts` re-eksporterer modulen. Ingen kopier andre steder.
- **Kontrakter (AD-11, AD-12):** `PublishedData`, `Sted`, `RunReport` og `Catalog` er Zod-skjemaer med camelCase-felt. `publish.ts` validerer før skriving, og `src/lib/data/` parser med samme skjema. MET/NVE-skjemaene dokumenteres i `shared/contracts/data-dictionary.md` (felt, enhet, gyldig område, kilde).
- **Én Utforsk-rute (AD-8):** `src/pages/Utforsk.tsx` leser `visning=kart|liste` (standard `kart`) og viser `KartVisning` eller `ListeVisning`, begge via `src/hooks/useSteder.ts`. Stedssiden er `src/pages/Sted.tsx`.
- **Tokens (AD-9):** `src/lib/theme.ts` er kilden, `src/styles/tokens.css` speiler den, `theme.test.ts` feiler ved avvik. Markørfarger importeres fra `theme.ts`; ingen hardkodede hex/px-verdier som DESIGN.md navngir.
- **Tester (AD-4):** Vitest/fast-check som `*.test.ts` ved siden av koden (også i `scripts/` og `shared/`), Playwright i `tests/e2e/`, kontraktstester i `tests/contract/`, fasittabeller som JSON i `tests/golden/`.
- **Konvensjoner:** camelCase for TS og JSON-felt, PascalCase for komponenter og typer. Tidsstempler i UTC (ISO 8601) i datafiler, norsk tid bare i UI. Eneste konfigurasjon er MET User-Agent-kontakten, med standardverdi i koden. Kommentarer forklarer bare *hvorfor* (f.eks. `// AD-2: ...`).

## UX & Interaction Patterns

- **Tokens:** lys modus som standard, mørk følger systemet. `accent` `#0B6FB8` bare til handlinger og fokusring. Inter/system-ui uten ekstern lasting, `tnum` på tall. Spacing 4/8/12/16/24/32/48, 16px gutter.
- **SnowScore-skala:** `snowscore-0..3` (grå → dypblå), forbeholdt markører, score-badge og listerad-indikator. Sirkler og helt runde former er også forbeholdt SnowScore.
- **Score-badge:** alltid tall + tekstetikett (f.eks. «82 · Svært godt»), ≥4,5:1 kontrast; hele kortet/raden er klikkmålet.
- **Kartmarkør:** 28px sirkel, hvit 2px kant, aksentkant når valgt, tooltip ved hover på desktop, klikk åpner stedssiden. Klynging bare ved svært lav zoom.
- **Listerad:** hevet kort med navn (overskrift), badge, nysnø/vind/temperatur. Tab/Enter. Sortering (score/avstand/navn) med `<select>` eller knapper.
- **Tilstander:** skjelett-lasting i `surface-sunken` (aldri bare spinner); «Utdatert» + tidsstempel ved 3–12 t; fjernet ved >12 t; «Ufullstendige data» i stedet for badge; `banner-stale-data` (warning-bakgrunn, ink-primary tekst) når siste data er eldre enn normalt, uten å blokkere siden; demobanner i demomodus.
- **Layout:** fast toppnavigasjon (SnowFinder · Slik beregner vi SnowScore), ☰ på mobil. «Tilbakemelding» i UX-dokumentene er ute av v1. Kart/liste-veksler rett under navigasjonen. Ett brytpunkt på 768px. Stedssiden: én kolonne på mobil, to på desktop.
- **Tilgjengelighetsgulv:** synlig fokusring, logisk tab-rekkefølge, trykkmål ≥44px, `prefers-reduced-motion`, ingen autoavspilling eller uendelig scroll.
- **Tone:** rolig og presis; lover aldri snø eller sikkerhet.

## Cross-Story Dependencies

- Rekkefølge: 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.7 → 1.8 → 1.9 → 1.6. 1.4 og 1.10 er neste etter forenklingen; 1.2 kan bygges uavhengig av dem.
- 1.2 leverer `data/catalog.json` og `Catalog`-skjemaet i `shared/contracts/`, som 1.3 leser. Demoens egen lille katalog og fixtures hører til 1.10, ikke 1.2.
- 1.2 og 1.3 trenger ESLint-blokk med Node-globaler og tsconfig-dekning for `scripts/` (utsatt fra 1.1).
- Story 1.1 lagde tomme `supabase/` og `src/lib/supabase/`; 1.10 fjerner dem og legger til `src/lib/data/`. Ikke bygg noe der.
- 1.5 trenger 1.3 (`RunContext` med validerte data) og 1.4 (modulen). 1.7–1.9 leser datafilen fra 1.5/1.10. 1.8 gjenbruker `useSteder`. 1.6 legger banneret på sidene fra 1.7 og 1.9.
- Senere epics: Epic 2 lenkes fra hver SnowScore-visning og viser kvalitetsrapporten; Epic 3 utvider `Utforsk`/`useSteder` med filter via `shared/filter.ts`; Epic 4 (skivindu) utvider `Sted.tsx` og `score.ts` med `skivinduUtenDagslys`. Ikke bygg Epic 3/4 her.
