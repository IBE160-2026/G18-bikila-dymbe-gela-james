# Epic 1 Context: Se snøforholdene i Norge — på kart eller i liste

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Brukeren skal kunne åpne SnowFinder og se ferske SnowScore-data for norske steder, enten som et fargelagt Norgeskart eller som en likeverdig, tilgjengelig liste, og åpne et sted for full detalj. Epicen er kjernen alle andre epics bygger på: stedskatalog, dataprogram (henting → validering → SnowScore → atomisk publisering av én JSON-fil), demodata for rent klon, planlagt kjøring hver time og de lesende flatene (kart, liste, stedsside). Det finnes ingen database; appen er statiske filer som bare leser den publiserte datafila. Epicen ble gjenåpnet 2026-11-18 for Story 1.12 «Best akkurat nå» (FR-33, Bør ha): forsiden skal svare direkte på «hvor er det best i dag?» med de tre beste stedene blant treffene. Storyen er et vedtatt unntak fra regelen om ingen nye stories etter 16. november, og skal være ferdig før kodefrysen 28. november.

## Stories

- Story 1.1: Prosjekt-skaffolding og CI-skjelett (ferdig)
- Story 1.2: Bygg stedskatalogen (ferdig)
- Story 1.3: Hent og valider værdata hver time (ferdig)
- Story 1.4: Bygg den delte SnowScore-modulen (ferdig)
- Story 1.10: Kjør SnowFinder lokalt med demodata (ferdig)
- Story 1.5: Beregn og publiser SnowScore i dataprogrammet (ferdig)
- Story 1.11: Kjør dataprogrammet hver time og publiser appen (ferdig)
- Story 1.7: Se Norgeskartet med fargelagte steder (ferdig)
- Story 1.8: Bruk tilgjengelig listevisning i stedet for kart (ferdig)
- Story 1.8b: Resultatlisten som destinasjonskort (ferdig)
- Story 1.9: Åpne en stedsside med full poengsum (ferdig)
- Story 1.6: Hold tjenesten oppe når en datakilde er nede (ferdig, Bør ha)
- Story 1.6b: Rettinger etter review av Story 1.6 (ferdig)
- Story 1.12: Se de beste stedene akkurat nå (in-progress, Bør ha; bygges på `story/1-12-best-akkurat-naa` oppå `fix`-PR-en med rettingene fra gjennomgangen 2026-11-18)

## Requirements & Constraints

- **Best akkurat nå (FR-33):**
  - Høyst 3 steder, valgt blant de samme treffene som kart og liste viser med det aktive filteret, i samme rekkefølge som listen sortert etter SnowScore (lik score: navn, så id). Ingen egen sorteringsregel.
  - Steder med «ufullstendige data» er aldri med. Steder over 12 t er allerede fjernet. Har bare 1–2 treff poengsum, vises de.
  - Overskrift «Best akkurat nå» uten aktivt filter, «Best blant treffene» med aktivt filter.
  - Raden vises ikke ved null treff (der null treff-kortet allerede står) eller når ingen treff har poengsum. Raden vises også når alle har lav score; badgen sier det ærlig.
  - Hvert sted er én lenke med navn og score-badge (tall + poengnivå) til stedssiden, med filteret og visningen i adressen. Virker med mus, berøring og Enter.
  - Raden leser bare data: endrer aldri filteret, adressen eller datafila.
  - Testkrav: utvalget er en ren funksjon med enhetstester for rekkefølge, lik score, ufullstendige data og færre enn tre treff. E2E i demomodus åpner første sted fra raden og kjører axe på Utforsk med raden synlig.
- **Dataalder:** publiserte data under 3 t, normalt rundt 1 t. Banneret for gamle data vises når datafila (`generert`) er over 90 min gammel. Eldre enn 3 t merkes «utdatert», eldre enn 12 t fjernes fra kart, liste, søk og stedsside. Grensene testes deterministisk mot demo-nå.
- **Robusthet:** feiler MET for mer enn 5 % av stedene, publiseres ingen ny fil, og appen viser forrige gyldige fil. NVE er tilleggsdata og teller ikke mot terskelen. Feilende kall prøves på nytt med økende ventetid, uten tilstand mellom kjøringer.
- **Henting og validering:** én gang per sted per kjøring, identifiserende User-Agent, høyst ett kall per 100 ms per kilde, ingen nøkler. Strenge Zod-skjemaer; ugyldige svar avvises og registreres i kvalitetsrapporten.
- **Publisering:** atomisk, bare ved minst 95 % gyldige steder. Hver kjøring gir én kvalitetsrapport.
- **Demomodus:** `npm ci && npm run dev:demo` uten nett og nøkler viser merket demodata. Produksjon viser aldri demodata.
- **Ytelse:** kartet interaktivt innen 3 s på mobil over 4G.
- **Tilgjengelighet:** WCAG 2.1 AA på alt unntatt kartlaget; null kritiske axe-brudd på liste, stedsside og Utforsk med raden.
- **Ingen nye avhengigheter, tjenester, nøkler eller kontoer.**

## Technical Decisions

- **Dataprogrammet** (`scripts/pipeline/`) er pipes-and-filters: `run.ts` er eneste inngang; `fetch.ts`, `validate.ts`, `score.ts`, `publish.ts` deler data bare via typet `RunContext`. Nye forsøk ligger i `fetch.ts`.
- **Klienten** er tynn og lagdelt: pages → components → hooks → `lib/data`. `Utforsk.tsx` er én rute for kart og liste (`visning=kart|liste`) med ett datalag, `useSteder()`. Ingen komponent laster stedsdata selv.
- **Story 1.12 krever ingen arkitekturendring:** utvalget bygger på de samme `treff` som kart og liste, sortert med den eksisterende `sorterSteder(…, 'score')` i `src/lib/sortering.ts`. Ingen ny datakontrakt, ingen ny fil i `shared/`, ingen nye design-tokens.
- **Adresser:** stedssidens adresse (`/sted/<id>`) bærer samme query som Utforsk, bygget og lest av de samme funksjonene, så «Tilbake» går til søket. Standardverdier skrives ikke.
- **Delt logikk i `shared/`:** `snowscore.ts`, `filter.ts`, `freshness.ts`, `contracts/`. `zod` er eneste tredjepartsimport der. Logikk kopieres ikke til `src/`.
- **Én klokke:** `src/lib/clock.ts` er eneste kilde til «nå». Lint forbyr `Date.now()` og argumentløs `new Date()` andre steder.
- **Datafiler:** `data/catalog.json`, `public/data/demo.json` (committet), `public/data/latest.json` (gitignored). Appen laster én fil, valgt ved bygging. `npm run data:hent` henter fila fra grenen `data`.
- **Design-tokens:** én kilde i `src/lib/theme.ts`, speilet i `src/styles/tokens.css`, holdt i takt av `theme.test.ts`. Ingen hardkodede hex/px for navngitte tokens.
- **Drift:** `data.yml` kjører omtrent hver time (med gate og `data-timer.yml`) og publiserer til grenen `data`; Vercel publiserer appen fra `main` og henter datafila fra grenen via rewrite.
- **Tester:** Vitest ved siden av koden, E2E i `tests/e2e/` (Chromium; CI på Ubuntu har bredere fonter, så sjekk layout i CI), fasittabeller i `tests/golden/`.

## UX & Interaction Patterns

- **Best akkurat nå-raden:** `section` med `h2`-overskrift og ordnet liste (`ol`). Står på Utforsk mellom søkefeltet og filteret eller kartet på alle bredder, aldri i bunn-arket. Under 768 px tar hvert sted én linje uten sideveis rulling, og raden er kompakt (ingen ekstra tekst). På en liten telefon kan kartet likevel starte under bunn-arket (EXPERIENCE.md). Bruker eksisterende tokens for kort, score-badge og lenker.
- **IA:** fast toppnavigasjon; kart/liste-vekslingen rett under; visningen er del av URL-en.
- **Score:** alltid tall + tekstetikett, 4-trinns `snowscore-0..3` reservert for SnowScore. «Ufullstendige data» vises som tekst, aldri som 0 eller badge.
- **Banner for gamle data:** full bredde øverst på Utforsk og stedssiden, `surface-raised` med 4 px `warning`-venstrekant; blokkerer ikke siden. Demobanneret er nøytralt (`surface-sunken`).
- **Tone:** rolig og presis, lover aldri snø.
- **Tilgjengelighetsgulv:** synlig fokusring i `accent`, trykkmål ≥ 44 px, kontrast ≥ 4,5:1, `prefers-reduced-motion`, ett brytpunkt ved ~768 px.

## Cross-Story Dependencies

- **1.12** bygger på `useSteder()`/`Utforsk` (1.7/1.8), listesorteringen og destinasjonskortene (1.8, 1.8b), stedssiden (1.9), og fra Epic 3 på filteret, null treff-kortet (3.3), adressene med filter og visning (3.2/3.2b) og søkefeltet (3.9), som raden plasseres under. Rettingene fra gjennomgangen 2026-11-18 (blant annet tegnforklaring) bygges som egen `fix`-PR før 1.12 og er ikke del av storyen.
- **Utsatt arbeid:** les `deferred-work.md` før bygging i Utforsk; blant annet er det fortsatt åpent at datakvalitetspanelet (Epic 2) skal si hvor mange steder som er utdatert eller fjernet.
- **Andre epics:** Epic 2 (forklaringsside, datakvalitetspanel), Epic 3 (filter og søk på `useSteder()`/`Utforsk`), Epic 4 (skivindu i stedssiden).
