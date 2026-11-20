---
title: 'Story 1.8b: Resultatlisten som destinasjonskort'
type: 'feature'
created: '2026-11-02'
status: 'done'
baseline_commit: '7c9d4ab34390b8996d9a3cd253e69951e12c1923'
route: 'oneshot'
review_loop_iteration: 0
context: ['project-phase-folders/2-Planleggingsfasen/SnowFinder-EXPERIENCE.md', 'project-phase-folders/2-Planleggingsfasen/SnowFinder-DESIGN.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Steg 1 av Aksels UX-forbedring (godkjent 2026-11-02). Hver rad i listen har navn, score og nøkkeltall på én linje, så det er vanskelig å sammenligne steder.

**Approach:** Hver rad blir et destinasjonskort, og UX er oppdatert i `7c9d4ab`.

- Hele kortet er fortsatt én lenke.
- Øverst står stedsnavnet til venstre og score-badgen til høyre.
- Under står faste felt i samme rekkefølge: Nysnø (eller «Nysnø siste 24 t» med NVE), Vind, Temp, og Avstand når listen er sortert etter avstand. Etiketten står i `meta`, og verdien under i `numeric`.
- Merknaden om gamle data står der den står i dag.
- Én kolonne under 768 px, og kolonner på minst 240 px fra 768 px.
- Det skjermleseren hører, og data, sortering og filter er uendret.

</frozen-after-approval>

## Implementation Notes

- **Nummer:** først kalt 2.1c, men endret til 1.8b etter gjennomgangen. Kortene endrer listen fra Story 1.8 i Epic 1, slik 1.7b og 1.9b gjorde. UX-commit `7c9d4ab` har det gamle nummeret i meldingen, og memloggen har en rettelse.
- **`ListeVisning.tsx`:** hvert felt er en etikett og en verdi med et mellomrom mellom, så skjermleseren hører «Vind 12 m/s» som før. Avstanden viser «Avstand» over «12 km». Etiketten er skjult for skjermleseren, og « unna» er skjult for øyet, så skjermleseren hører «12 km unna» som før.
- **`App.css`:**
  - **Listen:** `.liste-rader` er `minmax(0, 1fr)` på smale skjermer, så kortene kan krympe. Fra 768 px brukes `repeat(auto-fill, minmax(min(240px, 100%), 1fr))`.
  - **Kortet:** bruker `align-content: space-between`, og hvert felt er en kolonne med verdien nederst. Da står tallene på linje også når et navn går over to linjer, når kortet har «Utdatert» og når etiketten er «Nysnø siste 24 t».
- **Bredde:** med filterpanelet ved siden av gir 240 px-kolonnene flere kort i bredden fra rundt 1024 px. Mellom 768 og 1024 px er det én kolonne. DESIGN.md og akseptkriteriet sier «når listen har plass».
- **Prøvd:**
  - Skjermbilder på 1280 og 375 px.
  - På 320 px med bred font var kortene først 5 px for brede, noe som er rettet.
- **Tester:**
  - `App.test.tsx`: markeringen og teksten skjermleseren får.
  - `liste.spec.ts`: tall på linje i hver rad av kort på 1280 px; én kolonne, NVE-etiketten og ingen sideveis rulling på 320 og 375 px med bred font; og avstanden synlig og for skjermleseren.

## Review Triage Log

Gjennomgang med Blind Hunter (12 funn).

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | Tallene står ikke på linje loddrett når et navn går over to linjer | medium | patch | Stemmer etter skjermbildet. Feltene står nederst i kortet. |
| 2 | Testen for at tallene står på linje, kan ikke fange det | medium | patch | Testen sjekker nå hver rad av kort, med kort som har lange navn og «Utdatert». |
| 3 | «Side om side fra 768 px» stemmer ikke før rundt 1024 px | low | patch | Teksten i DESIGN.md og akseptkriteriet er rettet til «når listen har plass». |
| 4 | Avstand er ikke testet, og «Avstand / 12 km unna» er dobbelt | medium | patch | Viser «12 km». E2E-test på 375 px med bred font. |
| 5 | NVE-etiketten er ikke testet og kan skyve verdien ned | medium | patch | Verdien står nederst i feltet. E2E-test med `nysnokilde=nve`. |
| 6 | Tomme bokser (`null`) lar testene gå gjennom | low | patch | Ny hjelper `boks()` feiler på `null`. |
| 7 | Påstanden om uendret skjermlesertekst er ikke bevist | low | avvist | Raden var også et rutenett før, så Chrome la allerede mellomrom foran kommaene. Ordene og rekkefølgen er testet. |
| 8 | EXPERIENCE.md er utdatert og har feil eksempel | low | patch | Rettet i begge kopier. |
| 9 | Statusen er oppgitt ulikt | low | patch | Spec-en er `done`. «Venter på review» gjelder PR-en. |
| 10 | Spec-en mangler notater og vurderingslogg | low | patch | Lagt til. |
| 11 | Storyen står i feil epic | low | patch | Nå Story 1.8b i Epic 1. |
| 12 | `Felt` er deklarert etter bruk, og testhjelperen er skjør | low | patch/avvist | Typen er flyttet. Hjelperen låser markeringen med vilje, som resten av `App.test.tsx`. |
