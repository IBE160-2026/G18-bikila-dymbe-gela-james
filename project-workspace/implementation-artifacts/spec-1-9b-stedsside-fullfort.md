---
title: 'Story 1.9b: Fullfør stedssiden (alder i åpen fane, tom tilstand, trykkmål)'
type: 'bugfix'
created: '2026-10-08'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Aksel ba om å «fikse feilene og gjøre den fullstendig» før vi går videre (2026-10-08). En manuell sjekk av Story 1.9 i Chromium, med demo- og live-data, fant tre feil:
1. I live-modus ble alderen regnet bare ved lasting. En åpen fane merket aldri steder «Utdatert» og fjernet dem aldri etter 12 t. Punktet var utsatt til 1.6, men skal løses nå.
2. Når alle steder er eldre enn 12 t, ble kart og liste helt tomme uten forklaring (EXPERIENCE: aldri en tom flate).
3. «Tilbake» på stedssiden var en tekstlenke på ca. 20 px, mens EXPERIENCE krever trykkmål på minst 44 px.

**Approach:**
- `useSteder()` beholder de rå dataene. I live-modus regnes aldersgrensene på nytt hvert minutt, med `oppdaterFerskhet`. Resultatet byttes bare når et sted endrer status, og `data` beholdes når bare «Utdatert» endres, så kartet ikke bygges på nytt.
- Utforsk viser en forklaring i `role="status"` når ingen steder er igjen.
- «Tilbake» får `min-height` og `min-width` lik `--spacing-7` (48 px).

</frozen-after-approval>

## Implementation Notes

- **Manuell sjekk (Chromium via Playwright, `npm run dev`):**
  - **Demo:** Gaustatoppen (30,0 + 13,1 + 15,0 = 58 · Godt), Kirkenes med «Utdatert» og Trondheim med «Ufullstendige data» vises riktig på desktop og mobil, uten konsollfeil.
  - **Live:** dataene var 2 t 55 min gamle, og ingen sted var merket.
- `src/hooks/useSteder.ts`:
  - Den delte loaderen er nå generisk og beholder de rå dataene. `medFerskhet` kjøres i hooken.
  - `trengerFerskhetssjekk(raw)` sier ja bare for live-data. Da kjøres `oppdaterFerskhet` hvert minutt (`FERSKHET_SJEKK_MS`) og ved `visibilitychange`, når fanen blir synlig igjen.
  - Uendret status gir det samme objektet tilbake. Endres bare «Utdatert», beholdes `data`, så kartet ikke bygges på nytt.
- `src/pages/Utforsk.tsx`: tom tilstand med teksten `INGEN_STEDER` og knappen «Last inn på nytt» i `role="status"`. Teksten lover ikke timeoppdatering, fordi den først kommer i Story 1.11.
- `src/pages/Sted.tsx`, `src/App.css`: «Tilbake» har klassen `sted-tilbake`, med høyde og bredde minst `--spacing-7`. Ny klasse `.knapp` med tokens.
- **Tester:**
  - `oppdaterFerskhet`: uendret, utdatert, fjernet og feil;
  - `trengerFerskhetssjekk`: live, demo, feil og `null`;
  - tom tilstand for kart og liste;
  - live-testen med fast klokke;
  - E2E: «Tilbake» er minst 44 px i begge retninger.
- **Verifisert:**
  - lint, typecheck, test (302), build og E2E (12) er grønne;
  - Chromium med låst klokke: 0 utdaterte ved lasting, alle 300 utdaterte etter 15 min i åpen fane, og tom tilstand med forklaring etter over 12 t.

## Review Triage Log

Blind Hunter (oneshot), 12 funn.

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | En åpen fane henter aldri nye data, bare eldre data | medium | patch | Den tomme tilstanden har nå knappen «Last inn på nytt». Automatisk ny henting hører hjemme i Story 1.11/1.6, når data faktisk publiseres hver time. |
| 2 | Teksten lover «oppdateres hver time» og mangler handling | medium | patch | Teksten er rettet, og knappen er lagt til (EXPERIENCE: «med handling»). |
| 3 | Opptil ett minutts forsinkelse når fanen vises igjen | low | patch | `visibilitychange` sjekker med en gang. |
| 4 | Hookens live/demo-regel er ikke testet | medium | patch | Regelen er trukket ut i `trengerFerskhetssjekk` og testet. |
| 5 | `oppdaterFerskhet` mangler test for ny `data` og for feil | low | patch | Begge er lagt til. |
| 6 | «Tilbake» er bare sjekket i høyden, og bare på desktop | low | patch | Bredden sjekkes også. CSS-en er lik på alle skjermbredder, så mobil gir ikke noe nytt. |
| 7 | Det utsatte punktet er ikke markert løst, og fremdriftsplanen mangler | low | patch | Punktet har fått `status: løst`, og planen oppdateres ved leveringen. |
| 8 | Specen er uferdig | false | avvist | Den er ferdigstilt i dette steget. |
| 9 | KI-loggen mangler | false | avvist | Den skrives ved leveringen. |
| 10 | `role="status"` leses kanskje ikke opp ved første visning | low | avvist | Teksten står synlig på siden og leses i vanlig rekkefølge. Veksleren er ufarlig. |
| 11 | Kommentaren i live-testen forklarer ikke klokka | low | patch | Kommentaren er utvidet. |
| 12 | Flere kall til `useSteder()` kan gi ulik tilstand | false | avvist | Bare `App` kaller hooken (AD-8), og det er sjekket med grep. |
