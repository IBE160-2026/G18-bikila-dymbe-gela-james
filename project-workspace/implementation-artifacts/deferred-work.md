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
- source_spec: `project-workspace/implementation-artifacts/spec-1-10-kjor-snowfinder-lokalt-med-demodata.md`
  summary: Test at ESLint-regelen mot Date.now()/new Date() i src/ faktisk slår til (ESLint Node-API i Vitest).
  evidence: Story 1.10-gjennomgang (Verification Gap). I dag går lint grønt også hvis selektoren er feil, fordi ingen kode i src/ leser klokka.
- source_spec: `spec-1-3-hent-og-valider-vaerdata-hver-time.md`
  summary: Test exit-koden til `main()` i scripts/pipeline/run.ts med de nye reglene (demo ikke publisert → 1; live krasjet eller under 95 % gyldige → 1; uten `--demo` kjøres live, exit 2 finnes ikke lenger).
  evidence: Story 1.3-gjennomgang (Verification Gap, Blind Hunter). `main` er ikke eksportert, og ingen test dekker rutingen eller exit-koden. Erstatter forutsetningen om exit 2 i punktet fra Story 1.10.
- source_spec: `spec-1-3-hent-og-valider-vaerdata-hver-time.md`
  summary: Sjekk om NVE-perioden bør regnes etter norsk dato i stedet for UTC (nveUrl i scripts/pipeline/fetch.ts).
  evidence: maybe-false, ville vært medium. Mellom 00 og 02 norsk tid slutter perioden på forrige norske dato. Avgjøres ved å hente NVE-svar like etter midnatt og se om `latestNveValue` da velger en eldre dag.
- source_spec: `spec-1-7-se-norgeskartet.md`
  summary: Lag en SPA-reserve for GitHub Pages (en `404.html` som er kopi av `index.html`, eller en omdirigering) slik at direkte lenker og oppfrisking på `/sted/:id` virker, i Story 1.11.
  evidence: Story 1.7-gjennomgang (Blind Hunter, Edge Case Hunter). `vite preview` og dev-serveren faller tilbake til index.html, men GitHub Pages gir sin egen 404 for ukjente stier.
- source_spec: `spec-1-8-listevisning.md`
  summary: Legg sorteringsvalget i listen inn i URL-en (f.eks. `?visning=liste&sortering=navn`) sammen med filterparametrene i Epic 3 (FR-21), så valget overlever Tilbake og delte lenker.
  evidence: Story 1.8-gjennomgang (alle tre lag). Sorteringen ligger i `useState` i ListeVisning og går tilbake til score når komponenten lastes på nytt.
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
