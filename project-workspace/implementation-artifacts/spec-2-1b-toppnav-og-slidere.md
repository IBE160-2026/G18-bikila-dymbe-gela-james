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

## Review Triage Log

Gjennomgang med Blind Hunter (11 funn).

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | Fjerningen av lenken bryter Story 2.1 (lenke fra kart og liste) | high | patch | Stemmer for mobil. Aksel valgte «Bare én synlig om gangen». |
| 2 | Testnavnet lover mer enn testen sjekker, og mobil er ikke testet | low | patch | Nytt navn og egen test på 375 px. |
| 3 | Memloggen sier «høyre/opp» | low | patch | Ny memlogg-oppføring retter det. |
| 4 | Ingen test av opp og ned, og bare vind er testet | low | patch | Pil opp og temperatur er lagt til i E2E. |
| 5 | `dir="rtl"` er bare prøvd i Chromium | maybe-false | defer | `deferred-work.md`: prøves i Firefox og Safari i brukertesten. |
| 6 | Spec-en er ufullstendig | low | patch | Notater, logg og status `done` er lagt til. |
| 7 | Storyen mangler i epic-fila, og nøkkelen stemmer ikke med spec-en | low | patch | Story 2.1b står i epic-fila, og nøkkelen er `2-1b-toppnav-og-slidere`. |
| 8 | Fremdriftsplanen kaller storyen ferdig før review | low | patch | Rettet til «bygget, venter på review». |
| 9 | Kommentarer i CSS er utdatert | low | patch | Rettet. Raden med veksleren har lenken igjen. |
| 10 | SVG-fila har egen etikett selv om bildet er dekorativt | low | patch | `aria-hidden="true"`. Fargene er avvist: logoen er et bilde, slik DESIGN.md sier. |
| 11 | Hjelperen `tittel()` er skjør | low | avvist | Den låser markeringen med vilje, slik resten av `App.test.tsx` gjør. |
