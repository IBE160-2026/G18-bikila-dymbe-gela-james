---
title: 'Story 2.3: Les om datakilder og begrensninger'
type: 'feature'
created: '2026-10-09'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-2-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Forklaringssiden sier ikke hvor dataene kommer fra, at SnowScore er en prognose og ikke målt snø, eller hvor god siste datakjøring var (FR-11, NFR-DQ2).

**Approach:** Etter «Regneeksempel» kommer to nye seksjoner:

- **«Datakilder og begrensninger»** (statisk tekst):
  - MET Locationforecast (CC BY 4.0) og NVE seNorge (NLOD) med lisenslenker.
  - Kartverket (kartgrunnlag og stedsnavn) og OpenStreetMap (skianlegg i stedskatalogen, ODbL).
  - At SnowScore er en prognose og en modell, ikke målt eller garantert snø.
  - At SnowFinder ikke er en skredfarevurdering, med lenke til Varsom.no for fjellområder.
- **«Datakvalitet»** (et `surface-raised`-kort uten SnowScore-farger og uten danger-rødt):
  - **Live:** siste publiserte kjørings rapport i klartekst: tidspunkt i norsk tid, «X av Y steder gyldige», avviste svar per kilde som tall, og antall steder med ufullstendige data.
  - **Demo:** demodatasettets byggeinformasjon i stedet: at dataene er innspilte svar, når de ble bygget, antall steder og antall ufullstendige.
  - **Lasting og feil:** mens data lastes står det at rapporten hentes, og ved feil står det at den ikke kunne lastes. Resten av siden venter aldri på data.
  - Rapporten leses fra `useSteder()`-resultatet som `App` allerede har. Ingen ny lasting.

</frozen-after-approval>

## Implementation Notes

- To nye komponenter: `src/components/Datakilder.tsx` (statisk, med `VARSOM_URL`) og `src/components/Datakvalitet.tsx`. `kvalitetLinjer()` gir rapporten som setninger og er en ren funksjon, så den testes uten nettleser.
- `SlikBeregnerViSnowScore` får `result` fra `App`. Bare kvalitetspanelet leser det, og resten av siden vises med en gang.
- Panelet bruker `generert` (publiseringstidspunktet) som tidspunkt for «siste publiserte kjøring».
- Kontrakten regner ufullstendige steder som gyldige. Teksten sier derfor «X av de gyldige har ufullstendige data» i stedet for å liste dem som en egen gruppe.
- Overraskelse: testen fra 2.1 som bytter ut konstantene forbyr ordet «døgn» for å fange et håndskrevet tidsvindu. NVE-teksten «nysnø siste døgn» er NVEs egen faste periode, så datakilde-seksjonen holdes utenfor den sjekken (som endringsloggen), og testen feiler hvis en seksjon flyttes.
- Sjekker: lint, typecheck, test (335), build og `npm run test:e2e` (23, axe inkludert) er grønne.

## Review Triage Log

Blind Hunter (oneshot), 14 funn.

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | «Siste kjøring» er feil når siste kjøring ikke ble publisert | medium | patch | Panelet sier nå «Siste publiserte kjøring». Datafila har bare rapporten fra den publiserte kjøringen. |
| 2 | Gyldige og ufullstendige steder telles dobbelt | medium | patch | `andelGyldige` regner ufullstendige som gyldige. Teksten sier nå «X av de gyldige har ufullstendige data». |
| 3 | Klønete tekst når tallene er 0 | low | patch | Egen «Ingen …»-tekst for avviste svar og ufullstendige data, med test. |
| 4 | Steder som er utdatert eller fjernet nevnes ikke i panelet | low | defer | Rapporten gjelder kjøringen, mens alder måles i appen. Det passer med banneret for gamle data i Story 1.6. |
| 5 | Tidspunktet er `generert` og ikke `report.start` | false | avvist | Panelet sier «publisert», og `generert` er publiseringstidspunktet. `start` er når kjøringen startet. |
| 6 | Kommentaren i `App.tsx` sier at siden ikke trenger data | low | patch | Kommentaren er skrevet om: bare kvalitetspanelet bruker dataene. |
| 7 | Tekstkuttet i testen kan feile i det stille | low | patch | Testen sjekker nå at begge seksjonsmarkørene finnes. |
| 8 | Fargetesten er nesten triviell og dekker ikke feiltilstanden | low | patch | Live og feil rendres begge, og hele markupen må være overskrift, statusregion og avsnitt med ren tekst. |
| 9 | Lasting og feil testes ikke ende til ende | false | avvist | `App.test.tsx` rendrer forklaringssiden ved `null` og `error` uten skjelett eller feilmelding, og `kvalitetLinjer` har test for begge tekstene. |
| 10 | `role="status"` ligger rundt hele panelet | low | avvist | En statusregion leser ikke opp innholdet den har når siden lastes, bare endringer. Rapporten kommer én gang. |
| 11 | OpenStreetMap mangler «© OpenStreetMap contributors» | medium | patch | Krediteringen er lagt til, slik ODbL krever. |
| 12 | MET skal krediteres som «MET Norway», med lenke til lisenssiden | low | patch | Navnet er endret, og lisenslenken går nå til `api.met.no/doc/License`. |
| 13 | Spec, KI-logg og fremdriftsplan mangler | false | avvist | Skrives ved leveringen, før PR-en. |
| 14 | Lisens-URL-ene bør være eksporterte konstanter | low | avvist | Testene sjekker URL-ene direkte. Konstanter ville bare flyttet strengene. |
