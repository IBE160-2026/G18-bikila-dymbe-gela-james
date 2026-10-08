---
title: 'Story 1.7b: Kartmarkører som skaleres med zoom'
type: 'bugfix'
created: '2026-10-08'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** I en manuell sjekk med `npm run dev` og live-data for 300 steder (2026-10-08) dekket 28 px-markørene hverandre på landsnivå i Sør-Norge, på både desktop og mobil. De fleste stedene kunne ikke holdes over eller klikkes før man zoomet inn. Kartet viste også Norge lite med mye grått rundt.

**Approach (Aksel valgte «Mindre markører ut zoomet», 2026-10-08):** Markørstørrelsen følger zoomnivået. Den er 10 px på landsnivå og vokser lineært til DESIGN.md-størrelsen 28 px ved zoom 8 og tettere. Kanten er 1 px under 16 px og ellers 2 px, og tooltipens avstand følger størrelsen. Kartet tilpasses Norge med finere zoomtrinn (`zoomSnap` 0,25), så landet fyller mer av flaten. Det er ingen ny avhengighet og ingen klynging. Avviket fra DESIGN.md (28 px bare når man er zoomet inn) noteres i dokumentet via `bmad-ux` senere og står i PR-en.

</frozen-after-approval>

## Implementation Notes

- `src/components/kartMarkor.ts`:
  - `markerSizeForZoom(zoom)` gir 10 px ved zoom ≤ 5 og vokser lineært til 28 px ved zoom 8.
  - `markerSizeStyle(size)` gir radius og kant: 1 px under 16 px, ellers 2 px.
  - `markerStyle(sted, size)` tar nå størrelsen. Ufullstendige markører beholder 2 px stiplet kant, fordi kanten er det eneste kjennetegnet deres.
- `src/components/KartVisning.tsx`: `zoomSnap` 0,25. Startstørrelsen kommer fra zoomen etter `fitBounds`. På `zoomend` oppdateres størrelse og tooltip-avstand. `setStyle` setter radius selv.
- Tester:
  - enhetstester for størrelsen ved zoom 3, 5, 6,5, 8 og 12, for kanten og for en liten ufullstendig markør;
  - E2E sjekker at Hemsedal-markøren vokser ved innzooming og krymper igjen ved utzooming.
- Verifisert:
  - lint, typecheck, test (273), build og E2E (6) er grønne;
  - manuelt i `npm run dev` med live-data for 300 steder: markørene er 10 px på landsnivå og ca. 26 px etter tre innzoominger, uten konsollfeil, på både desktop og mobil.

## Review Triage Log

Blind Hunter (oneshot), 12 funn.

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | 10 px markører er under kravet om 44 px trykkflate | medium | defer | Det stemmer. Men 28 px overlappet, så trykk var umulige før. Kartlaget er unntatt AA, og listen er alternativet. En usynlig større trykkflate er utsatt. |
| 2 | Ufullstendige markører blir utydelige med 1 px kant | medium | patch | Kanten er nå alltid 2 px for ufullstendige data, og det er testet. |
| 3 | `setRadius` dobbelt etter `setStyle` | low | patch | Fjernet. `setStyle` setter radius. |
| 4 | Størrelseslogikken står to steder i `KartVisning` | low | avvist | Det er to korte linjer. En egen hjelper gir lite. |
| 5 | En åpen tooltip flytter seg ikke ved zoom | low | avvist | Tooltip vises når musepekeren er over markøren, og lukkes normalt ved zoom. |
| 6 | Ingen nettlesertest av at markørene vokser | medium | patch | E2E sjekker nå bredden før og etter zoom. |
| 7 | Tallet 16 er hardkodet | low | patch | Det er navngitt (`THIN_BORDER_BELOW_PX`) med begrunnelse. |
| 8 | Kommentaren til `MARKER_SIZE_PX` er misvisende | low | patch | Rettet. |
| 9 | Specen er uferdig | false | avvist | Den er ferdigstilt i dette steget. |
| 10 | KI-loggen og DESIGN-avviket mangler | false | avvist | KI-loggen skrives ved leveringen, og DESIGN-avviket er ført i `deferred-work.md`. |
| 11 | Testtittelen leses rart | low | patch | Rettet til «zoom %s gives a %spx marker». |
| 12 | Advarsel om linjeskift (CRLF) | false | avvist | `.gitattributes` normaliserer. Diffen har ingen linjeskiftstøy. |
