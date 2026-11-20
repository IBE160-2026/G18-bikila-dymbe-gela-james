---
title: 'Story 2.1b: Logo i toppnavigasjonen, én forklaringslenke og slidere som starter til venstre'
type: 'feature'
created: '2026-11-02'
status: 'done'
baseline_commit: 'f5764e34c8af6dda171698e3030cab8f4950f506'
route: 'oneshot'
review_loop_iteration: 0
context: ['project-phase-folders/2-Planleggingsfasen/SnowFinder-EXPERIENCE.md', 'project-phase-folders/2-Planleggingsfasen/SnowFinder-DESIGN.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Aksel vil ha en bedre UX på nettsiden.

- Logoen mangler ved «SnowFinder».
- «Slik beregner vi SnowScore» står to ganger på Utforsk.
- Sliderne for vind, temperatur, skydekke i dagslys og avstand starter til høyre, mens nysnø starter til venstre.

**Approach:** Godkjent av Aksel 2026-11-02, og UX er oppdatert i DESIGN.md og EXPERIENCE.md (`f5764e3`).

1. SnowFinder-logoen (`src/assets/snowfinder-logo.svg`) står til venstre for «SnowFinder» i toppnavigasjonen. Den er dekorativ (`alt=""`), `{spacing.6}` høy og har `{spacing.2}` avstand til navnet.
2. ~~Lenken ved Kart/Liste på Utforsk fjernes.~~ **Beslutning (Aksel, 2026-11-02, etter gjennomgangen):** «Bare én synlig om gangen». Lenken ved Kart/Liste vises bare under 768 px, der toppnavigasjonens lenke ligger bak ☰, så Story 2.1 (lenke fra kart og liste) fortsatt er oppfylt. Lenken i toppnavigasjonen og lenken i SnowScore-kortet beholdes.
3. Alle fem sliderne starter på «Alle» til venstre og blir strengere mot høyre. Piltast høyre gjør kravet strengere. Den fylte delen går fra tommelen til høyre. Adressene, filterlogikken og tekstene er uendret.

</frozen-after-approval>

## Implementation Notes

- **Logo:** `Toppnavigasjon.tsx` viser `<img src={logo} alt="" className="app-logo" />` foran «SnowFinder». Vite legger den lille SVG-en inn som data-URL. `App.css` gir `.app-logo` `--spacing-6` og `.app-title` `gap: --spacing-2`. SVG-fila har `aria-hidden="true"` i stedet for egen etikett.
- **Lenken:** `Utforsk.tsx` beholder lenken ved Kart/Liste med klassen `utforsk-forklaring`, som `App.css` skjuler fra 768 px. Under 768 px ligger toppnavigasjonens lenke bak ☰, så det er alltid nøyaktig én lenke synlig og i tilgjengelighetstreet.
- **Sliderne:** `FilterPanel.tsx` gir de fire «høyst»-sliderne `dir="rtl"`. Verdien er fortsatt det ekte tallet, så adressen, `aria-valuenow` og testene som setter verdien direkte, er uendret. Piltast høyre gjør kravet strengere, og opp og ned følger tallet. Den fylte delen bruker tommelens plass fra venstre, fordi gradienten ikke følger `dir`.
- **Dokumenter:** Sally (`bmad-ux`) oppdaterte DESIGN.md og EXPERIENCE.md (begge kopier, `f5764e3`). Etter gjennomgangen ble «høyre og opp» rettet, og lenkeregelen endret. Story 2.1b står i epic-fila med Given/When/Then.
- **Tester:**
  - `App.test.tsx`: logoen og lenken med klassen.
  - `FilterPanel.test.tsx`: `dir` og fylt spor.
  - `filter.spec.ts`: peker, piltaster på vind og temperatur.
  - `forklaring.spec.ts`: én lenke på PC med logoen lastet, og lenken ved Kart/Liste på 375 px.

- **Firefox og WebKit (2026-11-02, før godkjenningen av PR #82):** en midlertidig Playwright-test, som ikke er committet, kjørte alle fem sliderne i Firefox og WebKit (Safari-motoren) på 1280 px. Den sjekket musklikk i hver ende, piltastene, det fylte sporet og at lenken står én gang på 1280 og 375 px.
  - **Firefox:** alt var riktig.
  - **WebKit:** musklikk var riktig, men pil høyre økte tallet på de speilede sliderne, så «høyst»-kravet ble løsere.
  - **Rettingen:** `FilterPanel.tsx` håndterer pil venstre og pil høyre selv på de fire speilede sliderne. Pil høyre gir ett steg lavere tall, altså strengere, i alle nettlesere. Pil opp og ned, Home, End og Page-tastene følger tallet som før.
  - **Etter rettingen:** 14 av 14 tester i Firefox og WebKit, og skjermbildene viser «Alle» til venstre og fylt spor fra tommelen mot høyre i begge.

- **Fast regresjonstest (bestilt av Aksel 2026-11-02):**
  - **Testen:** `tests/e2e/slidere.spec.ts` sjekker de fire speilede sliderne. Pil høyre gir ett og to steg strengere, pil venstre tilbake til «Alle» og ikke lenger. Klikk i høyre ende gir strengeste krav, og pil høyre går ikke lenger. Klikk i venstre ende gir «Alle».
  - **Prosjekter:** `playwright.config.ts` har prosjektene `firefox` og `webkit`, som bare kjører den fila. Chromium kjører den med resten av E2E.
  - **Skript:** `npm run test:e2e` kjører `--project=chromium --project=normalmodus`, så ingen trenger Firefox eller WebKit lokalt. `npm run test:e2e:nettlesere` kjører Firefox og WebKit.
  - **CI:** `e2e.yml` har jobben `nettlesere` ved siden av `e2e`, så PR-en ikke venter lenger.
  - **Bevis:** med rettingen slått av feilet 4 av 4 i WebKit. Med den besto 133 i Chromium og 8 i Firefox og WebKit, lokalt på Windows.
  - **Ekte Safari på Mac og iPhone** prøves i brukertesten, også touch og VoiceOver, som ikke er testet.
  - **Etter gjennomgangen:**
    - Testen dekker nå alle fem sliderne, også nysnø, som ikke er speilet. Den sjekker pil opp og ned, Home og End, og det fylte sporet. 10 av 10 består i Firefox og WebKit, og 5 av 5 i Chromium.
    - Den dobbelte sjekken i `filter.spec.ts` er fjernet.
    - `npm run test:e2e:nettlesere` starter bare demobygget.
    - **Engangsfeil:** én kjøring rett etter hele Chromium-pakken feilet på nysnø i Firefox og WebKit. Playwright fant ikke slideren etter klikket i venstre ende. Testen består når den kjøres alene, to ganger med `--repeat-each=2`, og hele kjøringen besto fem ganger på rad etterpå. Testen leser nå sliderens posisjon på nytt før hvert klikk, og CI prøver en gang til ved feil.

## Review Triage Log

Gjennomgang med Blind Hunter (11 funn).

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | Fjerningen av lenken bryter Story 2.1 (lenke fra kart og liste) | high | patch | Stemmer for mobil. Aksel valgte «Bare én synlig om gangen». |
| 2 | Testnavnet lover mer enn testen sjekker, og mobil er ikke testet | low | patch | Nytt navn og egen test på 375 px. |
| 3 | Memloggen sier «høyre/opp» | low | patch | Ny memlogg-oppføring retter det. |
| 4 | Ingen test av opp og ned, og bare vind er testet | low | patch | Pil opp og temperatur er lagt til i E2E. |
| 5 | `dir="rtl"` er bare prøvd i Chromium | medium | patch | Først prøvd med en midlertidig test i Firefox og WebKit, på Aksels ønske. WebKit (Safari-motoren) flyttet en speilet slider etter tallet, så pil høyre gjorde kravet løsere. Rettet med `onKeyDown`. Etter det ble den faste testen `tests/e2e/slidere.spec.ts` lagt inn for alle tre motorene. Ekte Safari på Mac og iPhone står åpent til brukertesten. |
| 6 | Spec-en er ufullstendig | low | patch | Notater, logg og status `done` er lagt til. |
| 7 | Storyen mangler i epic-fila, og nøkkelen stemmer ikke med spec-en | low | patch | Story 2.1b står i epic-fila, og nøkkelen er `2-1b-toppnav-og-slidere`. |
| 8 | Fremdriftsplanen kaller storyen ferdig før review | low | patch | Rettet til «bygget, venter på review». |
| 9 | Kommentarer i CSS er utdatert | low | patch | Rettet. Raden med veksleren har lenken igjen. |
| 10 | SVG-fila har egen etikett selv om bildet er dekorativt | low | patch | `aria-hidden="true"`. Fargene er avvist: logoen er et bilde, slik DESIGN.md sier. |
| 11 | Hjelperen `tittel()` er skjør | low | avvist | Den låser markeringen med vilje, slik resten av `App.test.tsx` gjør. |

### Gjennomgang av regresjonstesten

Gjennomgang med Blind Hunter (9 funn).

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | `test:e2e:nettlesere` starter også bygget i normal modus | medium | patch | `playwright.config.ts` starter bare demobygget når bare `firefox` og `webkit` er valgt. |
| 2 | Dokumentene beskriver bare den midlertidige testen | medium | patch | Rad 5, notatene og `deferred-work.md` er rettet. Commit-meldingen til `fab8c85` står som den er. |
| 3 | Den faste testen dekker mindre enn den midlertidige | low | patch | Nysnø og det fylte sporet er med. Lenken er dekket av `forklaring.spec.ts` i Chromium. |
| 4 | Opp, ned, Home og End er ikke prøvd utenfor Chromium | medium | patch | Testen sjekker dem i alle tre motorene, og de består. |
| 5 | `deferred-work.md` sier «løst» for tidlig | low | patch | Punktet står åpent til ekte Safari, touch og VoiceOver er prøvd. |
| 6 | AGENTS.md nevner ikke `test:e2e:nettlesere` | low | defer | Må gjennom `bmad-project-context` med Aksels godkjenning. README er oppdatert. |
| 7 | Retningen sjekkes to steder i Chromium | low | patch | Fjernet fra `filter.spec.ts`. |
| 8 | CI-jobben er ny og ikke kjørt | maybe-false | defer | Token har `workflow`-tilgang. PR #82 merges ikke før `nettlesere` er grønn på Ubuntu. |
| 9 | Ingen enhetstest for `onKeyDown` | low | avvist | Krever Testing Library, en ny avhengighet. E2E dekker det i tre motorer. |
