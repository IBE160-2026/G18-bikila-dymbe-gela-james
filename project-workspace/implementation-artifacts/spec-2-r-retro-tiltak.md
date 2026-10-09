---
title: 'Tiltak fra retrospektiven for Epic 2 (A1–A5, A11)'
type: 'refactor'
created: '2026-10-09'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-2-retro-2026-10-09.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Retrospektiven for Epic 2 fant svakheter på tvers av storyene. Testen «følger konstantene» lover mer enn den sjekker, to tekster bygger på data fra en annen story uten test, sidekommentaren stemmer ikke, ingenting binder parameterne til versjonen, koblingen fra App til kvalitetspanelet testes bare i E2E, og kalkulatoren kan forveksles med de automatiske tallene.

**Approach:** Én PR med seks små rettinger. `shared/snowscore.ts` endres ikke (Aksel lot Claude velge, 2026-10-09).

- **A1:**
  - Testen bytter ut de eksporterte konstantene og sjekker at hver parameter siden viser, følger med. Navn og kommentar sier tydelig at utledede tall (regneeksempel, kalkulator) ikke dekkes, og hvorfor: de regnes av `computeSnowScore`, som har egen fasittest.
  - Seksjonene som skal sjekkes, merkes med et attributt i stedet for å kutte rå markup.
  - NVE-frasen tas ut ved å fjerne frasen, ikke hele seksjonen.
- **A2:** «f(T) er 1 hver time» utledes fra tabellens egne verdier. Kalkulatorens sammenligning med regneeksempelet bygges av de to utregnede poengsummene og vises bare når de faktisk er ulike. En test binder dem sammen.
- **A3:** Kommentaren øverst i `SlikBeregnerViSnowScore.tsx` sier hva som er unntak: eksempeldataene, kalkulatorens grenser og endringsloggen. Den sier også at bare kvalitetspanelet leser `result`.
- **A4:** En test binder alle verdiene i `SNOWSCORE` til `SNOWSCORE_VERSION`, slik at en endret parameter feiler til versjon og endringslogg er oppdatert.
- **A5:** `App.test.tsx` sjekker kvalitetspanelets tekst på forklaringssiden ved lasting, feil og demodata.
- **A11:** Innledningen til «Prøv selv» sier at kalkulatoren er en læringshjelp, og at tallene i kartet regnes automatisk fra prognosen fra Meteorologisk institutt.

</frozen-after-approval>

## Implementation Notes

- **A1, besluttet:** `shared/snowscore.ts` endres ikke. Det åpne spørsmålet i retrospektiven om å gi `computeSnowScore` parameterne som argument er besvart med nei. Aksel lot Claude velge, og en endring i den delte modulen ville bare tjent testen. Testen heter nå «shows every parameter …», og kommentaren sier hva den dekker og ikke dekker. Utledede tall dekkes av fasittabellen, `Regneeksempel.test.tsx` og `Kalkulator.test.tsx`.
- **A1, avvik fra Intent:** Intent sier at seksjonene som skal sjekkes, merkes. I stedet merkes den ene seksjonen som er unntatt, endringsloggen, med `data-fast-tekst`. Da blir nye seksjoner sjekket automatisk. Testen sjekker at den merkede seksjonen ikke har nestede seksjoner, så regex-kuttet ikke stopper for tidlig.
- **A2:** `snoandelSetning()` i `Regneeksempel.tsx` leser tabellens f(T)-verdier. `startverdier()` og `sammenligning()` i `Kalkulator.tsx` er rene funksjoner, og begge grenene er testet.
- **Endring fra Story 2.4:** Gjennomgangen viste at forklaringen på 57 mot 58 var feil. Forskjellen kom bare fra at −2,33 ble avrundet til −2, ikke fra at temperaturen varierer. Kalkulatoren starter derfor nå på −2,3 (som siden viser T̄) og gir 58, det samme som eksempelet. Begrunnelsen vises bare hvis tallene faktisk er ulike.
- **A4:** `PARAMETERE_PER_VERSJON` i `shared/snowscore.test.ts` registrerer parameterne for hver versjon og skal aldri redigeres. En endret parameter feiler derfor til det er laget en ny versjon. Kommentaren lister alle stedene som må oppdateres.
- **A5:** `App.test.tsx` sjekker hele kvalitetspanelet (`kvalitetLinjer(result)`) for lasting, feil og demodata.
- **A3 og A11:** Kommentaren øverst på siden er skrevet om. «Prøv selv» sier nå at kalkulatoren er en læringshjelp, og at tallene i kartet regnes automatisk fra MET (i demomodus fra innspilte svar).
- **Sjekker:** lint, typecheck, test (366), build og `npm run test:e2e` (24) er grønne.

## Review Triage Log

Blind Hunter (oneshot), 11 funn.

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | Begrunnelsen for 57 mot 58 («temperaturen varierer») er feil: forskjellen kommer av at T̄ ble avrundet til −2 | high | patch | Kalkulatoren starter nå på −2,3 og gir 58. En begrunnelse vises bare når tallene er ulike, og den nevner både lik temperatur og avrundet snitt. |
| 2 | Sammenligningen vises også når tallene er like, og den grenen er ikke testet | medium | patch | Ved like tall vises bare hvor startverdiene kommer fra. Begge grenene er testet. |
| 3 | Testen for f(T)-setningen beviser ikke at setningen er utledet | low | patch | `snoandelSetning` er en ren funksjon, og begge grenene er testet. |
| 4 | Versjonssperren kan omgås ved å endre verdiene uten ny versjon | medium | patch | Verdiene står per versjon og redigeres aldri. En endring feiler til det finnes en ny versjon. |
| 5 | A1-testen låser en linje som er inkonsistent under mocken | low | patch | Forventningen `A = 63 · min(1, 12 / 23)` er fjernet. Kommentaren forklarer hva som ikke dekkes. |
| 6 | Merkingen er motsatt av Intent, og regex-kuttet kan stoppe ved nestede seksjoner | low | patch | Avviket er notert over. Testen sjekker at seksjonen er flat. |
| 7 | A11-teksten stemmer ikke i demomodus | medium | patch | Teksten sier nå «(i demomodus fra innspilte svar)». |
| 8 | A5 kopierer demoteksten og sjekker bare første linje | low | patch | Testen bruker `kvalitetLinjer(result)` og sjekker alle linjene. |
| 9 | `START` regnes ut når modulen lastes og kan velte hele bundelen | low | patch | `startverdier()` kalles i komponenten og kaster ikke. |
| 10 | Kommentaren i A4 lister ikke alle stedene som må oppdateres | low | patch | Den lister nå fasittabellen, `Regneeksempel.test.tsx` og `Kalkulator.test.tsx`. |
| 11 | Spec, KI-logg og status på tiltakene mangler | false | avvist | Skrives ved leveringen, før PR-en. |
