---
title: 'Fiks ustabil axe-sjekk mens bunn-arket fader inn'
type: 'bugfix'
created: '2026-10-25'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Axe-sjekkene i `tests/e2e/filter.spec.ts` kjører av og til mens bunn-arket ved 375 px fortsatt fader inn (`animation: filter-inn 150ms` i `src/styles/filter.css`). Da måles aksentfargen `#0B6FB8` med delvis opacity (`#3185c3`, kontrast 3,98), og testen feiler i CI uten at appen har en feil (run 40203787744 på PR #54, grønn ved ny kjøring).

**Approach:** Testhjelperen `expectNoBlockingViolations` venter til alle endelige animasjoner på siden er ferdige før axe kjører. Appen og animasjonen endres ikke, og ingen test slås av.

</frozen-after-approval>

## Implementation Notes

- Første versjon ventet på `document.getAnimations()` i siden. Den feilet i typesjekken, fordi testene ikke har DOM-typer. Etter Blind Hunters forslag emulerer hjelperen nå `prefers-reduced-motion: reduce` før axe kjører. Appens CSS skrur da av animasjonene og stopper en som allerede går. Endret fil: `tests/e2e/filter.spec.ts` (`expectNoBlockingViolations`).
- Bevist med animasjonen satt kunstig til 3 s: uten rettingen feiler testen (kontrast 1,27), og med rettingen består den. CSS-en er tilbakestilt etterpå.
- Lokalt: lint og typecheck er grønne, og `tests/e2e/filter.spec.ts` med `--repeat-each=3` gir 123 av 123 grønne.

## Review Triage Log

Ett lag: Blind Hunter (8 funn).

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | En pauset animasjon får hjelperen til å henge | false | avvist | Hjelperen venter ikke lenger på animasjoner, men skrur dem av med redusert bevegelse. |
| 2 | Enklere løsning med `reducedMotion: 'reduce'` | low | patch | Tatt i bruk. Den trenger ingen DOM-typer og bruker appens egen vei for redusert bevegelse. |
| 3 | De andre E2E-filene (liste, sted, forklaring, tom) kjører axe uten samme beskyttelse | maybe-false | defer | Ingen av dem åpner bunn-arket, og ingen har feilet i CI. Leaflets overganger styres ikke av redusert bevegelse. En samlet axe-hjelper vurderes hvis de feiler. |
| 4 | Ingenting viser at rettingen virker | low | patch | Bevist med kunstig treg animasjon, se Implementation Notes. |
| 5 | Specen er ikke ferdig | low | patch | Fullført her. |
| 6 | KI-loggen mangler | low | patch | Raden og promptene er ført inn. |
| 7 | Kommentaren nevner én bestemt animasjon og blir utdatert | low | patch | Kommentaren beskriver nå den generelle grunnen. |
| 8 | En animasjon som starter under axe-kjøringen slipper gjennom | false | avvist | Redusert bevegelse gjelder resten av testen, så CSS-animasjoner som starter senere, er også av. |
