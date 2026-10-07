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
