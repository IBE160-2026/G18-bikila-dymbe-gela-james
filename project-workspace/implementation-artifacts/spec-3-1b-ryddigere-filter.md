---
title: 'Story 3.1b: Ryddigere filter (UX-forbedring steg 2)'
type: 'feature'
created: '2026-11-07'
status: 'in-progress'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '96b9b539c238c890c40e2c18b08a96687b354221'
context:
  - '{project-root}/project-phase-folders/2-Planleggingsfasen/SnowFinder-EXPERIENCE.md'
  - '{project-root}/project-phase-folders/2-Planleggingsfasen/SnowFinder-DESIGN.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Filterpanelet er én lang kolonne med mye tekst. Aktive krav vises bare på det lukkede bunn-arket på mobil. På PC og i det åpne arket ser man derfor ikke samlet hva som filtrerer, og man kan ikke fjerne ett krav uten å finne slideren.

**Approach:** Vi bygger det Aksel valgte i `bmad-ux` 2026-11-07, slik det står i EXPERIENCE.md («Filterpanel», «Aktive krav», «Mer om») og DESIGN.md («Filterkontroller»):
- aktive krav som chips med × øverst i panelet;
- gruppene «Vær» og «Sted»;
- de lange forklaringene bak «Mer om»-knapper.

## Boundaries & Constraints

**Always:**
- **Rekkefølge:** panelet viser «Filter» og antall treff, så de aktive kravene, hurtigvalgene, gruppen «Vær» (nysnø, datagrunnlag, vind, temperatur, skydekke), gruppen «Sted» (avstand, stedstype) og til slutt «Nullstill». Det er nøyaktig én «Nullstill» i panelet, og den står sist, ikke ved chipsene. Fokus etter «Nullstill» er uendret.
- **Chipsene i panelet:**
  - De står i `<ul class="filter-chips filter-chips--fjern" aria-label="Aktive krav">`.
  - Hver chip har samme tekst som på det lukkede arket (`kravTekst`, `stedstypeTekst`, `KILDE_CHIP`), i et eget `<span>`, pluss en `<button>` med `aria-label`.
  - Navnene på ×-knappene er «Fjern nysnøkravet» (generelt `Fjern ${KRAV_TEKST[krav].kravet}`), «Fjern stedstypekravet», og «Bytt tilbake til prognose» for kildechipen.
  - × tegnes med `::before` på knappen, så listeelementets `textContent` er bare chip-teksten.
  - Trykkmålet er minst 44 × 44 px.
  - En chip er `display:flex; max-width:100%; min-width:0`, og teksten bryter inne i chipen (`overflow-wrap:anywhere`).
- **Logikken i ×:**
  - Ny ren funksjon `fjernKrav(params, chip: FilterKrav | 'stedstyper' | 'kilde'): FilterParams` i `FilterPanel.tsx`.
  - Et krav blir `null`, `stedstyper` blir `null`, og for kilden blir `nysnoKilde` `'met'`.
  - Etterpå flyttes fokus med `fokuserFilteret(krav)`, `fokuserFilteret('stedstyper')` eller til radioknappen «Prognose» (`nysnoKildeId('met')`).
- **«Mer om skydekke» og «Mer om NVE-dataene»:**
  - Knapper med `aria-expanded` og `aria-controls`, lukket som standard.
  - Det som skjules er selve `<p id="filter-maksSkydekkeDagslys-hint">` og `<p id="filter-nysnokilde-hint">`, med `hidden`. Id-ene er uendret, og CSS-en må ha `.filter-hint[hidden]{display:none}`.
  - `aria-describedby` peker fortsatt på disse.
  - Status-`<p role="status">` for NVE og hjelpeteksten for stedstype ligger utenfor «Mer om» og er alltid synlige.
  - Senas ordlyd og mørketidsteksten er uendret.
- **Grupper:** hver gruppe er `role="group"` med `aria-labelledby` på en `h3`. `h2 «Filter»` er visuelt skjult under 768 px (ikke `display:none`), så overskriftene står i riktig rekkefølge.

**Never:**
- Ingen endring i `shared/filter.ts`, adresse-parametrene, hurtigvalgene eller null-treff-forslaget. Ingen nye avhengigheter.
- Det lukkede arket endres ikke. Chipsene og «Nullstill» på arklinja vises bare når arket er lukket, som i dag, og koden for dem er byte for byte lik. «Filter» og antall treff står alltid, og arklinja er skjult fra 768 px. Det vises aldri to synlige «Aktive krav»-lister samtidig.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Ingen aktive krav | `STANDARD_FILTER` | Ingen liste for aktive krav i panelet | N/A |
| Fjern ett krav | nysnø 10, vind 8, × på nysnø | Nysnø blir `null`, vind er fortsatt 8, og fokus står på nysnø-slideren | N/A |
| Fjern stedstype | `['skisted','by']` | `stedstyper` blir `null`, og fokus står på første avkrysningsboks | N/A |
| Kildechip | `nve`, nysnø på «Alle» | Kilden blir `met`, chipen forsvinner, og fokus står på «Prognose» | N/A |
| NVE og nysnø-krav | `nve`, nysnø 5, × | Nysnø blir `null`, og kilden er fortsatt `nve`. Kildechipen vises etterpå, «Nullstill» står fortsatt, og fokus står på nysnø-slideren | N/A |
| Fjern siste krav | Bare ett krav aktivt | Listen og «Nullstill» forsvinner | N/A |
| «Mer om» | Ved start | `aria-expanded="false"` og `hidden`, men teksten er fortsatt tilgjengelig beskrivelse | N/A |

</frozen-after-approval>

## Code Map

- `src/components/FilterPanel.tsx`
  - Gjenbruk `kravTekst`, `stedstypeTekst`, `KILDE_CHIP`, `aktiveKrav`, `fokuserFilteret`, `nysnoKildeId` og `Filterfelt` (med `hint` og `hintErStatus`).
  - Chip-utvalget på det lukkede arket (linje 384–394) kan flyttes til én funksjon som begge listene bruker, men markupen for det lukkede arket må være uendret.
  - Avstandens status-hint skal ikke ha «Mer om».
- `src/styles/filter.css`
  - `.filter-chip` (linje 79) og `.filter-hint` (linje 211) er utgangspunktet.
  - `.filter-tittel-linje` er `display:none` under 768 px (linje 126). Den beholder plassen sin, men `h2` gjøres visuelt skjult.
  - Sidepanelet er 18rem fra 768 px.
- `src/components/FilterPanel.test.tsx`
  - Testene bruker `renderToStaticMarkup` i Node og kan ikke klikke eller sjekke fokus.
  - De nåværende `toContain`-testene for det lukkede arket (linje 143, 176, 182, 318, 322) må fortsatt treffe nettopp det.
  - Telleren for «Nullstill» (2 med lukket ark) står uendret.
- `tests/e2e/filter.spec.ts`
  - Chip-testene på det lukkede arket (194, 223, 580, 711, 975, 1153, 1326, 1343) skal fortsatt passe.
  - Linje 1233 må åpne «Mer om NVE-dataene» først.
  - Linje 1232 og 1397–1398 (beskrivelsen) skal fortsatt passe mens teksten er lukket.
  - Hjelperne `panel(page)`, `BRED_FONT` og `expectNoSidewaysScroll` finnes allerede.
- `src/pages/Utforsk.tsx` -- skal ikke endres.

## Tasks & Acceptance

**Execution:**
- [x] `src/components/FilterPanel.tsx` -- Lag `fjernKrav`, chipsene med ×, gruppene og en liten `MerOm`, etter Always. -- Dette er kjernen i storyen.
- [x] `src/styles/filter.css` -- Stil for chips med ×, overskriftene `h3`, «Mer om» (▸ og ▾), `.filter-hint[hidden]` og visuelt skjult `h2` under 768 px, etter DESIGN.md. -- Følger DESIGN.md.
- [x] `src/components/FilterPanel.test.tsx` -- Test radene i I/O-matrisen for tilstand mot `fjernKrav`. Test også markupen: chip-tekst og `aria-label` i panellisten, at det lukkede arket ikke har `<button>`, rekkefølgen av gruppene, at «Mer om» har `aria-expanded="false"` og `hidden`, og at det er én «Nullstill» sist. -- Akseptansen.
- [x] `tests/e2e/filter.spec.ts` -- Rett linje 1233. Nye tester, med locatorer avgrenset til `panel(page)` og `exact: true`:
  - × fjerner ett krav med fokus på slideren ved 1280 px;
  - NVE: × på nysnø gir kildechipen, og × på den gir fokus på «Prognose»;
  - stedstype-× gir fokus på første boks;
  - «Mer om» åpner og lukker;
  - ingen sideveis rulling med de lengste chipsene og `BRED_FONT` ved 768 px og 320 px (åpent ark);
  - axe uten alvorlige eller kritiske brudd, og ingen `heading-order`.
  -- Ende-til-ende, og dekker fokus.
- [x] `project-phase-folders/2-Planleggingsfasen/SnowFinder-EXPERIENCE.md` og kopien i `ux-*/` -- Legg navnet «Bytt tilbake til prognose» for kildechipens × inn i «Aktive krav». -- Dokumentet skal stemme med koden.
- [x] `SnowFinder-Epics-og-Stories.md`, `sprintplan.md` og `sprint-status.yaml` -- Legg inn Story 3.1b med kriteriene under, et avvik i sprintplanen og nøkkelen `3-1b-ryddigere-filter: in-progress`. -- Prosjektregel.

**Acceptance Criteria:**
- Gitt aktive krav, når panelet er åpent (eller bredden er minst 768 px), så står chipsene med × øverst under «Filter» og antall treff.
- Gitt filteret, når det vises, så kommer hurtigvalg, «Vær» og «Sted» i den rekkefølgen, hver med en overskrift.
- Gitt skydekke eller datagrunnlaget, når panelet åpnes, så er hjelpeteksten skjult bak «Mer om …». Et trykk viser den, og en skjermleser får den som beskrivelse uansett.
- Gitt det lukkede bunn-arket, når krav er aktive, så er chipsene ren tekst med «Nullstill», som før.

## Implementation Notes

- Chip-utvalget ligger i `aktiveChips(params)`, som både det lukkede arket og panellisten bruker. Markupen på det lukkede arket er uendret (de gamle `toContain`-testene treffer fortsatt).
- Navnene på ×-knappene ligger i den eksporterte `fjernNavn(chip)`, så enhetstesten kan sjekke alle sju.
- Pilen i «Mer om» er et `<span aria-hidden="true">` (▸/▾) i stedet for `::before`, så knappens tilgjengelige navn er nøyaktig «Mer om skydekke». Teksten er én tekstnode, så `renderToStaticMarkup` ikke legger inn `<!-- -->`.
- Under 768 px er `.filter-tittel-linje` `display: contents`, `h2` visuelt skjult og linjens eget antall skjult (arklinja viser det allerede). Fra 768 px er alt som før.
- `heading-order` sjekkes med en egen axe-kjøring (`withRules(['heading-order'])`), fordi regelen ikke er i WCAG-taggene.

## Spec Change Log

## Review Triage Log

## Verification

**Commands:**
- `npm run lint`, `npm run typecheck`, `npm test` og `npm run build:demo` -- forventet: alle grønne
- `npm run test:e2e` -- forventet: alle grønne
