- source_spec: `project-workspace/implementation-artifacts/spec-1-1-prosjekt-skaffolding-og-ci-skjelett.md`
  summary: theme.test.ts sin CSS-parser leser alle --x-deklarasjoner i hele filen, også utenfor :root; begrens den til :root (eller test mørk modus separat) i storyen som innfører mørk modus.
  evidence: Story 1.1-gjennomgang (Blind Hunter, Edge Case Hunter). I dag finnes bare én :root-blokk, men en @media (prefers-color-scheme: dark)-blokk vil gi falsk avvik eller skjule ekte avvik.
- source_spec: `project-workspace/implementation-artifacts/spec-1-1-prosjekt-skaffolding-og-ci-skjelett.md`
  summary: Egne ESLint-blokker med Node-globaler for scripts/ og konfigfiler, og Deno for supabase/functions/, pluss tsconfig-dekning av scripts/, supabase/functions/ og tests/ når den koden kommer (Story 1.2 og 1.3).
  evidence: Story 1.1-gjennomgang (Blind Hunter). eslint.config.js bruker globals.browser for alle filer, og tsconfig.app.json inkluderer bare src og shared; ingen kode finnes ennå i de andre mappene.
- source_spec: `project-workspace/implementation-artifacts/spec-1-1-prosjekt-skaffolding-og-ci-skjelett.md`
  summary: Automatisk sjekk av at CSS bare bruker var(--…) for verdier DESIGN.md navngir (f.eks. stylelint), og av at theme.ts samsvarer med DESIGN.md-frontmatter.
  evidence: Story 1.1-gjennomgang (Blind Hunter). AD-9 krever det, men theme.test.ts sammenligner bare theme.ts med tokens.css; verdiene stemmer i dag (sjekket for hånd av Verification Gap-gjennomgangen).
- source_spec: `project-workspace/implementation-artifacts/spec-1-1-prosjekt-skaffolding-og-ci-skjelett.md`
  summary: Last inn skrifttypen Inter (eller bestem at system-ui er godt nok) i første story med ekte UI, med tanke på ytelseskravet NFR-2.
  evidence: Story 1.1-gjennomgang (Blind Hunter). Alle typografi-tokens navngir 'Inter', men den lastes ikke, så appen faller tilbake til system-ui.
  resolved: Story 1.7 (2026-10-08) beholder system-ui. Inter lastes ikke, fordi en nettfont ville gitt ekstra nedlasting mot NFR-2 (3 s på 4G); tokenene står uendret, så en maskin med Inter installert bruker den.
- source_spec: `project-workspace/implementation-artifacts/spec-1-1-prosjekt-skaffolding-og-ci-skjelett.md`
  summary: Favicon, meta description og theme-color i index.html (naturlig sammen med PWA-manifestet i Story 4.1), og SHA-pinning av GitHub Actions og npm audit/Dependabot i CI.
  evidence: Story 1.1-gjennomgang (Blind Hunter). Dev-serveren gir 404 på /favicon.ico; actions er pinnet til @v4; ingen sårbarhetssjekk i CI ennå.
- source_spec: `project-workspace/implementation-artifacts/spec-lokale-git-hooks.md`
  summary: Når faglærer har slått på GitHub Actions og grenbeskyttelse for main (krev én godkjenning), skal pre-push-hooken nedgraderes til en valgfri hjelp, eller fjernes, og README og AGENTS.md oppdateres.
  evidence: Hooken er en lokal erstatning (gjennomgang 2026-10-07). Regelen om at et annet gruppemedlem godkjenner før merge kan bare håndheves av grenbeskyttelse på GitHub, som krever administratortilgang.
- source_spec: `project-workspace/implementation-artifacts/spec-lokale-git-hooks.md`
  summary: En .gitattributes-regel for hele repoet (* text=auto) som stopper støy fra linjeskift i diffene, og eventuelt en liten automatisk test av hooken.
  evidence: Gjennomgang 2026-10-07: core.autocrlf gir CRLF-advarsler på flere filer. Hooken er bare manuelt verifisert på Windows (Git Bash, Node 26), ikke på Mac, Linux eller Node 24.
- source_spec: `project-workspace/implementation-artifacts/spec-1-2-bygg-stedskatalogen.md`
  summary: Gjør orkestreringen i scripts/build-catalog/index.ts testbar (run(deps, paths) + tynn inngangsfil) og test de fatale stiene og den atomiske skrivingen.
  evidence: Story 1.2-gjennomgang (Verification Gap, Blind Hunter). Kastene for uløste seeds og manglende inkluder-navn, og «forrige fil står urørt», har ingen test; index.ts kaller main() ved import.
- source_spec: `project-workspace/implementation-artifacts/spec-1-10-kjor-snowfinder-lokalt-med-demodata.md`
  summary: Test exit-koden til dataprogrammet (ikke publisert → 1, manglende --demo → 2) når Story 1.11 lar CI avhenge av den.
  evidence: Story 1.10-gjennomgang (Verification Gap). `main` i scripts/pipeline/run.ts er ikke eksportert, og alle tester kaller runDemo direkte.
  resolved: Story 1.11 (2026-10-31). `main` er eksportert med injiserbare kjøringer, og `run.test.ts` tester exit-koden. Exit 2 finnes ikke lenger (se punktet fra Story 1.3).
- source_spec: `project-workspace/implementation-artifacts/spec-1-10-kjor-snowfinder-lokalt-med-demodata.md`
  summary: Test at ESLint-regelen mot Date.now()/new Date() i src/ faktisk slår til (ESLint Node-API i Vitest).
  evidence: Story 1.10-gjennomgang (Verification Gap). I dag går lint grønt også hvis selektoren er feil, fordi ingen kode i src/ leser klokka.
- source_spec: `spec-1-3-hent-og-valider-vaerdata-hver-time.md`
  summary: Test exit-koden til `main()` i scripts/pipeline/run.ts med de nye reglene (demo ikke publisert → 1; live krasjet eller under 95 % gyldige → 1; uten `--demo` kjøres live, exit 2 finnes ikke lenger).
  evidence: Story 1.3-gjennomgang (Verification Gap, Blind Hunter). `main` er ikke eksportert, og ingen test dekker rutingen eller exit-koden. Erstatter forutsetningen om exit 2 i punktet fra Story 1.10.
  resolved: Story 1.11 (2026-10-31). `run.test.ts` tester rutingen og exit-koden for demo og live. At krasj gir `publisert: false`, testes i `runLive`-testen for manglende katalog.
- source_spec: `spec-1-3-hent-og-valider-vaerdata-hver-time.md`
  summary: Sjekk om NVE-perioden bør regnes etter norsk dato i stedet for UTC (nveUrl i scripts/pipeline/fetch.ts).
  evidence: maybe-false, ville vært medium. Mellom 00 og 02 norsk tid slutter perioden på forrige norske dato. Avgjøres ved å hente NVE-svar like etter midnatt og se om `latestNveValue` da velger en eldre dag.
  resolved: `spec-rydd-apne-punkter.md` (2026-10-23). Ikke et problem: seNorge-døgnet går fra kl. 06 UTC dagen før til kl. 06 UTC på stempeldatoen, koden sammenligner tidspunkter og ikke datoer, og forespørselen slutter på UTC-datoen for kjøringen, så den nyeste stemplingen er alltid med. Tolkningen står i `nve.ts` og `data-dictionary.md`.
- source_spec: `spec-1-7-se-norgeskartet.md`
  summary: Lag en SPA-reserve for GitHub Pages (en `404.html` som er kopi av `index.html`, eller en omdirigering) slik at direkte lenker og oppfrisking på `/sted/:id` virker, i Story 1.11.
  evidence: Story 1.7-gjennomgang (Blind Hunter, Edge Case Hunter). `vite preview` og dev-serveren faller tilbake til index.html, men GitHub Pages gir sin egen 404 for ukjente stier.
  resolved: Story 1.11 (2026-10-31). `data.yml` kopierer `index.html` til `404.html` i bygget for Pages.
- source_spec: `spec-1-8-listevisning.md`
  summary: Legg sorteringsvalget i listen inn i URL-en (f.eks. `?visning=liste&sortering=navn`) sammen med filterparametrene i Epic 3 (FR-21), så valget overlever Tilbake og delte lenker.
  evidence: Story 1.8-gjennomgang (alle tre lag). Sorteringen ligger i `useState` i ListeVisning og går tilbake til score når komponenten lastes på nytt.
  resolved: Story 3.2 (2026-10-23). `sortering=navn` ligger i adressen og overlever Tilbake og delte lenker. «Avstand» lagres bevisst ikke, så en delt lenke aldri ber mottakeren om posisjon.
- source_spec: `spec-1-7b-markorer-etter-zoom.md`
  summary: Oppdater DESIGN.md (begge kopier) via `bmad-ux`: kartmarkøren er 28 px fra zoom 8 og krymper til 10 px på landsnivå. Vurder også en usynlig, større trykkflate rundt små markører (kravet om 44 px på mobil).
  evidence: Manuell sjekk 2026-10-08 med 300 steder: 28 px-markørene overlappet på landsnivå. Aksel valgte mindre markører ut zoomet. Blind Hunter påpekte at 10 px er under kravet om trykkflate.
- source_spec: `spec-1-9-stedsside.md`
  summary: Regn dataalderen på nytt mens siden er åpen (ikke bare ved lasting), så «Utdatert» og fjerning etter 12 t også gjelder en fane som har stått åpen lenge i live-modus. Naturlig sammen med banneret for gamle data i Story 1.6.
  evidence: Story 1.9-gjennomgang (Blind Hunter, Edge Case Hunter). `medFerskhet` kjøres én gang i den delte loaderen, og resultatet hurtigbufres for hele sideinnlastingen.
  status: løst i `spec-1-9b-stedsside-fullfort.md` (2026-10-08). Live-data sjekkes hvert minutt og når fanen blir synlig igjen.
- source_spec: `spec-2-1-kort-fortalt-og-steg-for-steg.md`
  summary: Test at ☰-menyen åpnes og lukkes i en sjekk som kjører ved push (i dag bare i Playwright), når CI kjører E2E eller pre-push-hooken tar med `npm run test:e2e`.
  evidence: Story 2.1-gjennomgang (Verification Gap). `App.test.tsx` ser bare den lukkede markupen. En meny som aldri lukkes ville passert lint, typecheck, test og build.
- source_spec: `spec-2-1-kort-fortalt-og-steg-for-steg.md`
  summary: Spør Sally (`bmad-ux`) om ☰ på mobil er riktig når menyen bare skjuler én lenke («Slik beregner vi SnowScore»), eller om lenken kan stå synlig i headeren.
  evidence: Story 2.1-gjennomgang (Blind Hunter). EXPERIENCE.md sier at navigasjonen kollapser til ☰, men med én lenke koster det et ekstra trykk uten å spare plass.
- source_spec: `spec-2-1-kort-fortalt-og-steg-for-steg.md`
  summary: Sett `document.title` per rute og flytt fokus til sidens h1 ved navigasjon i appen, så skjermlesere og nettleserfaner viser at en ny side er lastet.
  evidence: Story 2.1-gjennomgang (Blind Hunter). Ingen kode setter `document.title`, og fokus blir liggende på lenken. Dette gjelder alle ruter og fantes før denne storyen.
- source_spec: `spec-2-2-regneeksempel.md`
  summary: Gi formlene på forklaringssiden en tekst som skjermlesere kan lese, for eksempel «gjennomsnittstemperatur» for T̄, som er T med en kombinerende strek over.
  evidence: Story 2.2-gjennomgang (Blind Hunter). Mange skjermlesere leser U+0304 som «macron» eller hopper over tegnet. Det gjelder alle formlene fra 2.1 og 2.2.
- source_spec: `spec-2-3-datakilder-og-begrensninger.md`
  summary: La datakvalitetspanelet på forklaringssiden også si hvor mange steder som er merket «Utdatert» eller fjernet fordi dataene er for gamle, når banneret for gamle data kommer i Story 1.6.
  evidence: Story 2.3-gjennomgang (Blind Hunter). Etter nedetid kan rapporten si «300 av 300 gyldige» mens kartet viser færre steder, fordi alder måles i appen og ikke i kjøringen.
- source_spec: `spec-fix-met-hastighet.md`
  summary: Demotesten «rejects broken fixtures into the report and does not publish below 95 %» i `scripts/pipeline/run.test.ts` går av og til over Vitests grense på 5 s når hele suiten kjører lokalt på Windows. Gjør den rask (for eksempel uten `cp` av hele fixture-mappa) eller gi den en egen tidsgrense.
  evidence: 2026-10-22 feilet den to av seks ganger på `main` uten endringer (5,2 s og 5,9 s), og like ofte på grenen. Alene bruker den under 0,4 s. Den kopierer fixture-mappa til en midlertidig mappe, så filsystemet (for eksempel virusskanning) er en sannsynlig årsak. Ikke sett i CI.
  resolved: Delvis i `spec-fix-gamle-nve-verdier.md` (2026-10-22), med 15 s for demotestene. Fullført i `spec-rydd-apne-punkter.md` (2026-10-23): alle Vitest-tester har en felles tidsgrense på 15 s i `vite.config.ts`, så også egenskapstestene for SnowScore har plass, og unntaket for demotestene er fjernet.
- source_spec: `spec-3-1-filtrer-nysno-vind-temperatur.md`
  summary: Oppdater EXPERIENCE.md (begge kopier) via `bmad-ux`: bunn-arket med filteret åpnes med knappen «Filter», ikke ved å dra det opp. Lukket viser det knappen, de aktive kravene som chips og «Nullstill». DESIGN.md sier også at filter og kart deler skjermen 50/50 på desktop; appen har et fast venstre sidepanel (18rem), som spec-en ber om.
  evidence: Aksels beslutning 2026-10-22 i Story 3.1: en knapp virker med tastatur og skjermleser og er stabil å teste. EXPERIENCE.md (Responsive & Platform og UJ-1 steg 2) beskriver fortsatt et ark som «kan dras opp».
  resolved: Steg 8c (2026-10-28). EXPERIENCE.md og DESIGN.md (begge kopier) beskriver knappen «Filter» og sidepanelet på 18rem.
- source_spec: `spec-3-1-filtrer-nysno-vind-temperatur.md`
  summary: Filteret nullstilles når brukeren åpner en stedsside og går tilbake, fordi tilstanden ligger i `Utforsk`, som avmonteres. Story 3.2 flytter filteret inn i URL-en og skal ha en E2E-test for kart → sted → Tilbake med filteret i behold.
  evidence: Gjennomgangen av 3.1 (Blind Hunter, Edge Case Hunter). `useState` i `src/pages/Utforsk.tsx`; `App.tsx` rendrer `Sted` i stedet for `Utforsk` på `/sted/:id`.
  resolved: Story 3.2 (`spec-3-2-del-og-gjenapne-filtrert-sok.md`, 2026-10-23). Filteret ligger i adressen, og E2E dekker kart → sted → Tilbake med nettleserknappen og med «Tilbake».
- source_spec: `spec-3-2-del-og-gjenapne-filtrert-sok.md`
  summary: UJ-1 steg 6 sier «URL har filter + sted». Stedssidens adresse (`/sted/<id>`) har ikke filteret, så en delt stedslenke, eller «Tilbake» på en stedsside som er åpnet direkte, gir kartet uten filter. Vurder om stedssiden skal bære filteret videre, eller om UJ-1 skal presiseres (`bmad-correct-course`).
  evidence: Gjennomgangen av 3.2 (Blind Hunter). I appen virker Tilbake fra et sted som er åpnet fra kart eller liste, fordi historikken har den filtrerte adressen. Bare direkte åpnede stedslenker mister filteret.
  resolved: Story 3.2b (`spec-3-2b-filter-i-stedsadressen.md`, 2026-10-23). Aksel valgte «Filter + sted i adressen». Stedssidens adresse bærer søket, for eksempel `/sted/gaustatoppen?visning=liste&nysno=2&temp=0`, og «Tilbake» på en direkte åpnet stedsside går til Utforsk med det søket. E2E dekker hver rad i spec-ens matrise.
- source_spec: `spec-3-5-filtrer-pa-sol.md`
  summary: Oppdater EXPERIENCE.md og DESIGN.md (begge kopier) via `bmad-ux` med filterpanelets fjerde slider, «Skydekke i dagslys» (0–100 %, steg 10), hjelpeteksten om mørketid, og antall treff og forslaget ved null treff fra Story 3.3. Kan tas sammen med oppføringen om bunn-arket fra 3.1.
  evidence: Gjennomgangen av 3.5 (Blind Hunter). UX-dokumentene nevner slidere for nysnø, vind og temperatur og sol som Bør ha, men ikke spennet, tekstene eller hjelpeteksten.
  resolved: PR #74 (2026-10-28). Arkitekturen (AD-2, AD-12) og EXPERIENCE.md/DESIGN.md (begge kopier) er oppdatert via `bmad-architecture` og `bmad-ux` så de stemmer med koden.
- source_spec: `project-workspace/implementation-artifacts/spec-fix-e2e-axe-animasjon.md`
  summary: Samle axe-kallet i én felles E2E-hjelper som emulerer redusert bevegelse, slik `filter.spec.ts` nå gjør, og bruk den også i `liste`, `sted`, `forklaring` og `tom`.
  evidence: maybe-false, ville vært medium. De andre filene åpner ikke bunn-arket og har ikke feilet i CI, men Leaflets overganger kan gi samme feil. Avgjøres hvis en av dem feiler på kontrast med en blandet farge.
- source_spec: `project-workspace/implementation-artifacts/spec-3-7-filtrer-pa-stedstype.md`
  summary: Oppdater adresselisten i AD-12 i arkitekturen (begge kopier, på engelsk, via `bmad-architecture`) med `avstand` (Story 3.6) og `type` (Story 3.7, kommaseparert, i `STED_TYPES`-rekkefølge, etter `avstand`), og oppdater UX-dokumentene via `bmad-ux` med stedstypefilterets tre avkrysningsbokser og hjelpeteksten.
  evidence: Gjennomgangen av 3.7 (Blind Hunter). `SnowFinder-Arkitektur.md` linje 260 lister bare `visning`, `nysno`, `vind`, `temp`, `sky` og `sortering`, mens koden også skriver `avstand` og `type`.
  resolved: PR #74 (2026-10-28). Arkitekturen (AD-2, AD-12) og EXPERIENCE.md/DESIGN.md (begge kopier) er oppdatert via `bmad-architecture` og `bmad-ux` så de stemmer med koden.
- source_spec: `project-workspace/implementation-artifacts/spec-3-8-filtrer-pa-nysno-siste-24-timer.md`
  summary: Ta med `nysnokilde=nve` (Story 3.8, rett etter `nysno`) i adresselisten i AD-12 sammen med `avstand` og `type` fra oppføringen for 3.7, og beskriv valget av datagrunnlag for nysnø, hjelpeteksten om modellerte estimater og meldingen når NVE-data mangler, i UX-dokumentene (`bmad-architecture`, `bmad-ux`).
  evidence: Story 3.8 la til parameteret og grensesnittet. `SnowFinder-Arkitektur.md` og `SnowFinder-EXPERIENCE.md` nevner dem ikke.
  resolved: PR #74 (2026-10-28). Arkitekturen (AD-2, AD-12) og EXPERIENCE.md/DESIGN.md (begge kopier) er oppdatert via `bmad-architecture` og `bmad-ux` så de stemmer med koden.
- source_spec: `project-workspace/implementation-artifacts/spec-4-2-beste-skivindu.md`
  summary: Avvik fra FR-30 og epic 4-konteksten («demodatasettet får ett sted i mørketid»): demodataene har ikke noe sted i mørketid. Vurder i `bmad-correct-course` om kravet skal endres, eller om demodata skal få et sted i mørketid (for eksempel en egen fixture fra desember).
  evidence: Aksels beslutning 2026-10-28 (A) i Story 4.2. Demodataene gjelder 7. oktober, da det ikke er mørketid noe sted i Norge, og gruppa legger ikke til et fiktivt demosted. Mørketid dekkes av fasittabellen `tests/golden/skivindu.json`, enhetstester i `shared/skivindu.test.ts` og `scripts/pipeline/score.test.ts`, og en E2E-test i `tests/e2e/sted.spec.ts` som setter `skivinduUtenDagslys` i en kopi av datafila.
- source_spec: `project-workspace/implementation-artifacts/spec-4-2-beste-skivindu.md`
  summary: I mørketid er alle timer like gode kandidater, så skivinduet kan havne midt på natta (for eksempel «tirsdag 03–07»). Vurder i `bmad-correct-course` om mørketidsvinduet skal foretrekke timene rundt middag (skumring), og legg da til et fasittilfelle.
  evidence: Gjennomgangen av 4.2 (Blind Hunter). Fasittilfellet for mørketid i Tromsø gir start 02:00Z. Regelen følger FR-17 og den frosne intensjonen («alle timer»), så en endring er en kravendring, ikke en retting.
- source_spec: `project-workspace/implementation-artifacts/spec-4-2-beste-skivindu.md`
  summary: Beskriv `skivindu` og `skivinduUtenDagslys` i AD-12 (arkitekturen, begge kopier, på engelsk, via `bmad-architecture`), og kortets tekster i UX-dokumentene via `bmad-ux`: «Fant ikke noe skivindu de neste 48 timene.», «Bare N sammenhengende dagslystimer/timer», «etter snøfallet», og at kortet alltid vises.
  evidence: Gjennomgangen av 4.2 (Blind Hunter). Feltene står i `shared/contracts/data-dictionary.md`, men ikke i `SnowFinder-Arkitektur.md` eller `SnowFinder-EXPERIENCE.md`.
  resolved: PR #74 (2026-10-28). Arkitekturen (AD-2, AD-12) og EXPERIENCE.md/DESIGN.md (begge kopier) er oppdatert via `bmad-architecture` og `bmad-ux` så de stemmer med koden.
- source_spec: `project-phase-folders/2-Planleggingsfasen/SnowFinder-EXPERIENCE.md` (steg 8c)
  summary: Vurder en tegnforklaring for fargeskalaen på kartet (Lite, Middels, Godt, Svært godt). I dag forklares fargene bare i verktøytipset.
  evidence: Wireframene i steg 8c (2026-10-28) viste at kartet ikke har tegnforklaring, selv om EXPERIENCE.md la opp til at farge aldri står alene. Brukertesten (oppgave 1) kan vise om det trengs. Krever en story med `bmad-build`.
- source_spec: `project-phase-folders/2-Planleggingsfasen/SnowFinder-EXPERIENCE.md` (steg 8c)
  summary: Vurder å vise stedstypen (skisted, fjelltopp, by) på stedssiden, nå som den kan filtreres på (Story 3.7).
  evidence: Wireframene i steg 8c (2026-10-28) viste at stedssiden bare viser navnet og høyden. Krever en story med `bmad-build`.
- source_spec: `project-workspace/implementation-artifacts/spec-1-6-hold-tjenesten-oppe.md`
  summary: Oppdater AD-2 i arkitekturen (begge kopier, på engelsk, via `bmad-architecture`): linje 110 sier «v1 makes one attempt per location», men `fetch.ts` prøver nå et kall inntil tre ganger (1 s og så 2 s pause, gjennom kildens kallport) ved nettverksfeil, 429 og 5xx, og aldri ved tidsavbrudd eller andre 4xx. Oppdater også `banner-stale-data` i DESIGN.md (begge kopier, via `bmad-ux`): `warning`-bakgrunn med `ink-primary`-tekst gir 2,92:1, under WCAG AA, så banneret bruker `surface-raised`-bakgrunn, tykk venstrekant i `warning` og `ink-primary`-tekst (16,6:1). Teksten er «Viser siste kjente data fra kl. HH:MM», med dato foran når fila er fra en annen dag, og grensen er 90 min regnet fra `generert`.
  evidence: Story 1.6, beslutningen om bannerets farger (2026-10-29) i spec-en. `SnowFinder-Arkitektur.md` linje 110 og `SnowFinder-DESIGN.md` stemmer ikke lenger med koden.
- source_spec: `project-workspace/implementation-artifacts/spec-1-6-hold-tjenesten-oppe.md`
  summary: Vurder et tidsbudsjett per kall eller per kjøring i `scripts/pipeline/fetch.ts`, så trege 5xx- eller 429-svar like under tidsavbruddet på 20 s ikke gir tre forsøk hver og en kjøring på rundt en time, som kolliderer med neste timesjobb (Story 1.11).
  evidence: maybe-false, ville vært medium. Gjennomgangen av 1.6 (Blind Hunter, Edge Case Hunter). Tidsavbrudd prøves ikke på nytt av nettopp denne grunnen, men et 5xx-svar etter 19 s gjør det. Avgjøres når 1.11 går: se på `varighetMs` i kjøringsrapportene fra en periode der MET er ustabil.
- source_spec: `project-workspace/implementation-artifacts/spec-1-11-timesjobb-og-publisering.md`
  summary: Kjør `data.yml` for hånd rett etter merge og se at reserven virker. Framtving én rød kjøring og se at `data-run-log` har kvalitetsrapporten. Prøv Pages-veien og en direkte lenke til `/sted/<id>` første gang etter at Pages står på «GitHub Actions».
  evidence: Gjennomgangen av 1.11 (Verification Gap). Disse veiene krever ekte tilstand på GitHub og kan ikke kjøres på en PR uten å publisere. Per 2026-10-31 viser API-et `has_pages: false`.
- source_spec: `project-workspace/implementation-artifacts/spec-1-11-timesjobb-og-publisering.md`
  summary: Før den varige grenen `data` og `data.yml` inn i `AGENTS.md` via `bmad-project-context`, så regelen om å slette greiner etter merge ikke treffer `data`.
  evidence: Gjennomgangen av 1.11 (Blind Hunter). `AGENTS.md` sier «én grein per oppgave» og «slett greinen etter merge», og nevner bare CI og E2E som kjørende workflows.
  resolved: 2026-10-31, godkjent av Aksel. `AGENTS.md` nevner nå grenen `data` og `data.yml`.
- source_spec: `project-workspace/implementation-artifacts/spec-1-11b-ekte-data-som-standard.md`
  summary: La siden «Ingen ferske data» peke til `npm run dev:demo` lokalt, så sensor ikke står fast hvis timesjobben har stoppet.
  evidence: Gjennomgangen av 1.11b (Blind Hunter). GitHub slår av planlagte kjøringer etter 60 dager uten aktivitet, og da viser `npm run dev` denne siden. Bare README nevner demomodus i dette tilfellet.
- source_spec: `project-workspace/implementation-artifacts/spec-1-11b-ekte-data-som-standard.md`
  summary: Sjekk på et rent klon i steg 6, fra terminalen i VS Code, at `npm run dev` henter fila fra grenen `data`, og at inngangen i `hent-data.ts` slår til også med liten stasjonsbokstav.
  evidence: maybe-false, ville vært medium. Gjennomgangen av 1.11b (Edge Case Hunter, Verification Gap). Grenen `data` finnes ikke ennå, og PowerShell normaliserer stasjonsbokstaven, så det kunne ikke prøves. Slår sjekken feil, hentes ingenting, uten logglinje.

- source_spec: `project-workspace/implementation-artifacts/spec-1-11c-e2e-mot-demomodus.md`
  summary: `AGENTS.md` linje 36 ber om `npm run build` før commit og sier at CI kjører det, og seksjon 3 sier at røyktesten kjører på demodata.
  evidence: CI og hooken kjører nå `build:demo`, `npm run build` krever nett gjennom `prebuild`, og E2E har også et bygg i normal modus. Filen endres bare gjennom `bmad-project-context` med godkjenning fra Aksel.

- source_spec: `project-workspace/implementation-artifacts/spec-1-11d-publisering-med-tilbakelesing.md`
  summary: Skriptet i jobben `verify` i `data.yml` har ingen test som kjører i repoet.
  evidence: Det ligger inne i workflowen og kjører ikke på PR. Lokale resultater står i spec-en, og første ekte kjøring er steg 6 i endringsforslaget.

- source_spec: `project-workspace/implementation-artifacts/spec-1-11d-publisering-med-tilbakelesing.md`
  summary: Pages-veien er uprøvd, også tilbakelesingen, delvis feil og at `page_url` slutter med skråstrek. Erstatter «se at reserven virker» i posten over.
  evidence: maybe-false, ville vært medium. API-et viser `has_pages: false`, så veien kan ikke kjøres før Pages er på. Avgjøres i steg 7 i endringsforslaget: mangler skråstreken, blir kjøringen rød med adressen i meldingen.

- source_spec: `project-workspace/implementation-artifacts/spec-1-11b-ekte-data-som-standard.md`
  summary: Løst 2026-11-01: `npm run dev` på rent klon henter fila fra grenen `data`, og `data:hent` virker med liten stasjonsbokstav (kjørt fra cmd).
  evidence: Posten om sjekken i steg 6 er dermed lukket. Posten fra spec-1-11c om `AGENTS.md` er også lukket, med commit `4bc4e6f`.

- source_spec: `project-workspace/implementation-artifacts/spec-1-11e-vercel.md`
  summary: Alle besøk på nettsiden går til `raw.githubusercontent.com`, siden Vercel svarte `MISS` to ganger, så en kort CDN-cache bør vurderes.
  evidence: Målt med curl 2026-11-01. Lite trafikk i emnet gjør det lite sannsynlig med rate-begrensning, men brukertesten bør følges.

- source_spec: `project-workspace/implementation-artifacts/spec-1-11e-vercel.md`
  summary: Posten om Pages-veien er utgått, siden Pages er slått av i emnet. Tilbakelesingen fra nettsiden og en rød kjøring må i stedet prøves på `main`.
  evidence: Lesesteget mot nettsiden kjører bare på `main`.

- source_spec: `project-workspace/implementation-artifacts/spec-1-11e-vercel.md`
  summary: Filer i `/assets/` caches ikke, og CI kjører ikke byggekommandoen fra `vercel.json`.
  evidence: Målt `max-age=0` på nettsiden. Vurderes sammen med NFR-2.

- source_spec: `project-workspace/implementation-artifacts/spec-1-11f-paalitelig-timesjobb.md`
  summary: Skriptet i `gate` i `data.yml` har ingen test i repoet, på samme måte som skriptet i `verify`. Flytt begge til egne skript som kan kjøres med faste tidspunkt og svar.
  evidence: Prøvd for hånd mot GitHub-API-et 2026-11-02 med gamle data, ferske data og en gren som ikke finnes. Testen i `data-workflow.test.ts` leser bare teksten.
- source_spec: `project-workspace/implementation-artifacts/spec-1-11f-paalitelig-timesjobb.md`
  summary: En push-, PR- eller manuell kjøring som venter i `concurrency`-gruppen bak en pågående kjøring, kan bli erstattet av et planlagt forsøk, som så hopper over hentingen når dataene er ferske. Vurder egen gruppe eller en merknad i README hvis det skjer.
  evidence: maybe-false, ville vært medium. GitHub beholder bare én ventende kjøring per gruppe. En vanlig kjøring tar rundt et halvt minutt, så vinduet er kort. Avgjøres ved å se om push-kjøringen etter merge av PR #81 blir «cancelled».
- source_spec: `project-workspace/implementation-artifacts/spec-1-11f-paalitelig-timesjobb.md`
  summary: Banneret kan fortsatt komme når GitHub dropper fire forsøk på rad. En garanti krever en tjeneste med nøkkel, og det er utenfor v1. Posten om lange kjøringer (Story 1.6, tidsbudsjett per kall) gjelder nå hvert 10. minutt, ikke neste time.
  evidence: Natten 1.–2. november startet bare 2 av 14 planlagte kjøringer. Avgjøres med et døgn med målinger på nettsiden etter merge.

- source_spec: `project-workspace/implementation-artifacts/spec-2-1b-toppnav-og-slidere.md`
  summary: De speilede sliderne (`dir="rtl"`) er bare prøvd i Chromium. Prøv peker, piltaster og fylt spor i Firefox og Safari i brukertesten. *(Delvis løst 2026-11-02: pil høyre i WebKit ble rettet med `onKeyDown`, og `tests/e2e/slidere.spec.ts` kjører nå i Chromium, Firefox og WebKit. Fortsatt åpent: ekte Safari på Mac og iPhone, med touch og VoiceOver, i brukertesten.)*
  evidence: maybe-false, ville vært medium. Playwright kjører bare Chromium i dette prosjektet. Begge nettleserne støtter `dir="rtl"` på range, men det er ikke sett her.

- source_spec: `project-workspace/implementation-artifacts/spec-2-1b-toppnav-og-slidere.md`
  summary: Før `npm run test:e2e:nettlesere` og at E2E nå kjører i to jobber inn i «Running and verifying» i AGENTS.md, via `bmad-project-context`.
  evidence: AGENTS.md nevner bare `npm run test:e2e`, som nå bare kjører Chromium. README er oppdatert.

- source_spec: none
  summary: Fargeforklaring på kartet, med poengintervall per trinn og et skille for ufullstendige data som ikke bare bygger på farge (SRS-F-15 i PRD/SRS v2).
  evidence: Skilt ut fra sprint-change-proposal-2026-11-04-sok.md 2026-11-04, slik at søket kunne bygges først. Trenger eget endringsforslag før den bygges.

- source_spec: `project-workspace/implementation-artifacts/spec-1-11g-timer.md`
  summary: Bytt sovingen i `data-timer.yml` med `environment: data-timer` med wait timer på 55 min, så ingen maskin er opptatt mens timeren venter.
  evidence: Bare admin kan lage environments med wait timer, og i repoet er det bare `bipa` og `TesAgi-HiMolde`. Kontrollen av alderen skal stå igjen, så kjeden ikke går i løkke om wait timeren mangler (`sprint-change-proposal-2026-11-04-timer.md`).
