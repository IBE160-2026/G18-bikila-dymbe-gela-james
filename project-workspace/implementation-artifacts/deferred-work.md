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
