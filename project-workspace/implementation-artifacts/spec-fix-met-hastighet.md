---
title: 'Begrens hvor mange kall per sekund dataprogrammet sender til MET og NVE'
type: 'bugfix'
created: '2026-10-22'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Revisjonen 9. oktober fant at det ikke er noen grense for hvor ofte dataprogrammet kaller MET. `fetchAll` i `scripts/pipeline/fetch.ts` har høyst 5 kall i gang samtidig per kilde, men ingen pause mellom dem. Svarer MET på 50 ms, blir det rundt 100 kall i sekundet. MET-vilkårene krever en egen avtale over 20 kall i sekundet per applikasjon, og den som bryter vilkårene, kan bli blokkert (HTTP 429 eller 403). Da står hele tjenesten uten data.

**Approach:**
- I tillegg til samtidighetsgrensen starter hver kilde høyst ett kall per 100 ms, altså høyst 10 kall i sekundet. Det er halvparten av MET-grensen. NVE får samme grense av høflighet. Med 300 steder tar hentingen da minst 30 sekunder per kilde, og kildene hentes parallelt. Det holder godt innenfor en kjøring hver time.
- Grensen kan settes i `FetchOptions`, og testene styrer tiden, så de ikke må vente.
- PRD (FR-2) og arkitekturen (AD-2) får grensen nevnt, i begge kopiene.
- **Ferdig når:** de fire sjekkene og E2E er grønne, og `gh pr checks` er grønn.

</frozen-after-approval>

## Implementation Notes

- **Endring:** `scripts/pipeline/fetch.ts` har fått `startGate`, en port som hvert kall venter på før det starter. Hver kilde har sin egen port. Callerne slippes gjennom én om gangen, og hver venter fra forrige faktiske start, målt med en monoton klokke (`performance.now`). `DEFAULT_MIN_INTERVAL_MS` er 100. `fetchAll` og `runLive` tar `minIntervalMs`, og testene som ikke handler om hastighet, setter den til 0.
- **Overraskelse:** Den første versjonen reserverte tidspunkter på forhånd. Når hendelsesløkka sto stille i 60 ms, fyrte tre timere samtidig, og tre kall startet innenfor 3 ms. Porten venter derfor fra forrige faktiske start, og den venter på nytt hvis en timer fyrer for tidlig.
- **Overraskelse 2:** Den lokale testsuiten feiler av og til fordi demotesten «rejects broken fixtures …» i `run.test.ts` går over grensen på 5 s. Det så først ut som en følge av ekte pauser i de nye testene. Et kontrollert forsøk viste noe annet: den feilet også med testene i ekte tid hoppet over, og på `main` uten endringene (to av seks ganger 2026-10-22). Testene som ikke handler om hastighet, setter likevel `minIntervalMs: 0`, så de ikke venter unødig. Hastigheten testes med en falsk klokke (`startGate`) og med to korte tester i ekte tid. Ustabiliteten er ført opp i `deferred-work.md`.
- **Tester:** samtidige callere får starttider 1000, 1100 og 1200; en timer som fyrer for tidlig, ventes ut; en feilet ventetur stopper bare sitt eget kall; `fetchAll` med standardinnstilling bruker minst 200 ms på tre MET-kall; seks kall med 20 ms intervall starter minst 19 ms fra hverandre per kilde.
- **Dokumenter:** PRD (FR-2) og arkitektur (AD-2) i begge kopiene, og README (hentingen tar minst et halvt minutt).

## Review Triage Log

Blind Hunter (oneshot), 12 funn.

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | `type Outcome ={` mangler mellomrom | low | patch | Rettet. |
| 2 | Testen av «10 kall i sekundet» sjekker bare en konstant | medium | patch | Erstattet av en test der `fetchAll` med standardinnstilling bruker minst 200 ms på tre MET-kall. |
| 3 | Ingen test viser at standardinnstillingen faktisk bremser | medium | patch | Samme test som over. |
| 4 | Ingen test viser at samtidighetsgrensen holder sammen med porten | low | avvist | Porten ligger inne i `mapLimit`-plassen, og samtidighetstesten for 300 steder gjelder fortsatt. En port kan bare gjøre færre kall samtidige. |
| 5 | En feilet ventetur stopper alle senere kall | low | patch | Køen fortsetter fra en tur som ikke kan feile, og en test viser at neste kall slipper gjennom. Standardpausen kan ikke feile. |
| 6 | `minIntervalMs` valideres ikke (negativ, NaN, Infinity) | low | avvist | Valget er internt og settes bare i testene. Ingen kommandolinje eller miljøvariabel setter det. |
| 7 | Spec-en er uferdig | false | avvist | Skrives ved leveringen. |
| 8 | KI-loggen er ikke oppdatert | false | avvist | Skrives ved leveringen. |
| 9 | PRD-ens v4-krav står ikke i versjonsoversikten | low | patch (delvis) | Punktet viser nå til revisjonen 2026-10-09. Andre v4-punkter mangler også i oversikten, så det er ikke nytt med denne endringen. |
| 10 | README sier ikke at hentingen tar minst et halvt minutt | low | patch | Lagt til under Live-data. |
| 11 | Arkitekturen sier ikke at ventetiden ligger utenfor tidsavbruddet, eller hva som skjer ved HTTP 429 | low | avvist | Tidsavbruddet starter i `getOnce` etter porten, som koden viser. HTTP 429 blir en avvisning uten nytt forsøk. Nye forsøk er Story 1.6 (FR-6b). |
| 12 | Lange linjer med `minIntervalMs: 0` i `run.test.ts` | low | patch | Samlet i `noRateLimit` med en kommentar om hvorfor. |
