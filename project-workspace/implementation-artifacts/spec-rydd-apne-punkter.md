---
title: 'Avgjør tre åpne punkter: NVE-døgnet, tidsgrensen for tester og gjentatt visning'
type: 'chore'
created: '2026-10-23'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Tre punkter har stått åpne. Aksel ba Claude 2026-10-23 om å ta avgjørelsene selv.
1. Det var uklart hvilket døgn NVEs verdi stemplet «D kl. 06» gjelder, og om perioden burde regnes i norsk dato (utsatt fra Story 1.3).
2. Tunge tester (demokjøringen og egenskapstestene for SnowScore) går av og til over Vitests standardgrense på 5 s når hele suiten kjører lokalt på Windows. Pre-push-hooken stopper da pushen tilfeldig. CI er grønn.
3. Story 3.2 hadde to små inkonsistenser. Et gjentatt `visning` bruker første verdi, mens et gjentatt filterkrav eller en gjentatt sortering gir standard. Og «Avstand» kan bli stående ved Tilbake/Fram mellom to lister.

**Avgjørelser og tilnærming:**
1. **NVE-døgnet:** seNorge definerer døgnverdiene som perioden fra kl. 06 UTC dagen før til kl. 06 UTC på datoen verdien har (seNorge2, MET). En verdi stemplet D kl. 06 gjelder altså de 24 timene som endte da. `latestNveValue` velger den nyeste stemplingen som ikke er etter kjøringen, altså det sist fullførte døgnet. Logikken er riktig og endres ikke. Tolkningen skrives i koden og i `data-dictionary.md`. Spørsmålet om norsk dato lukkes: koden sammenligner tidspunkter, ikke datoer, og forespørselen slutter på UTC-datoen for kjøringen, så den nyeste stemplingen er alltid med.
2. **Tidsgrense:** Vitest får én felles tidsgrense på 15 s i `vite.config.ts`, med en kommentar om hvorfor. Det egne unntaket for demotestene i `run.test.ts` fjernes. Egenskapstestene beholder 1000 kjøringer. En test som henger på ordentlig, stoppes fortsatt.
3. **Gjentatt `visning`** gir standard (`kart`), som de andre parametrene, med en ruter-test. **«Avstand» ved Tilbake/Fram godtas:** adressen viser aldri avstand, og siden er riktig ved lasting. En retting ville krevd at listen skiller nettleserens Tilbake fra sine egne adresseendringer.
- `deferred-work.md`: punktene om NVE-perioden og om ustabile tester merkes `resolved`.
- **Ferdig når:** de fire sjekkene og E2E er grønne, og `gh pr checks` er grønn.

</frozen-after-approval>

## Implementation Notes

- **NVE:** Kilden er seNorge2 fra MET (https://github.com/metno/seNorge2), som definerer døgnet fra kl. 06 UTC dagen før til kl. 06 UTC på datoen. Logikken er uendret. Tolkningen står i `nve.ts` og `data-dictionary.md`, og testnavnene i `nve.test.ts` sier nå «finished day». To nye tester dekker en kjøring like etter norsk midnatt (22:30 UTC), én for `latestNveValue` og én for `nveUrl`.
- **Tidsgrense:** `testTimeout: 15_000` i `vite.config.ts`. Unntaket i `run.test.ts` er fjernet. Suiten besto tre ganger av tre lokalt.
- **Ruter:** Et gjentatt `visning` gir `kart`, både på Utforsk og på stedssiden, med tester. Kommentaren i `ListeVisning.tsx` forklarer hvorfor «Avstand» kan bli stående ved Tilbake/Fram.
- **Sjekker lokalt:** lint, typecheck, test (429), build og `npm run test:e2e` (54) er grønne.

## Review Triage Log

Blind Hunter (oneshot), 10 funn.

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | Testnavnene i `nve.test.ts` sier at dagen «starter» ved stempelet, mot den nye dokumentasjonen | medium | patch | De sier nå «finished day … ends». Kommentaren øverst i `nve.ts` er rettet. |
| 2 | Tilfellet like etter norsk midnatt har ingen test | low | patch | Nye tester ved 22:30 UTC for `latestNveValue` og `nveUrl`. |
| 3 | Tolkningen av seNorge mangler kilde | low | patch | Lenke til seNorge2 i `nve.ts` og `data-dictionary.md`. |
| 4 | Kommentaren i `vite.config.ts` sier «a second or two», mot målte 0,4 s | low | patch | Sier nå «well under 2 s alone». |
| 5 | `deferred-work.md` fikk den nye nøkkelen `fullført:` | low | patch | Slått sammen til én `resolved:`-linje. |
| 6 | Notater og triagelogg mangler | false | avvist | Skrives her. |
| 7 | KI-logg mangler | false | avvist | Skrives ved leveringen. |
| 8 | Godtakelsen av «Avstand» står ikke i koden | low | patch | Kommentar ved tilstanden i `ListeVisning.tsx`. |
| 9 | Gjentatt `visning` er ikke testet på stedssiden, og kommentaren står bare over `visning` | low | patch | Test lagt til. Kommentaren nevner nå begge parametrene. |
| 10 | Én felles tidsgrense gjør at også ekte heng tar 15 s | low | avvist | En liste med unntak måtte holdes ved like for hver tung test. 15 s stopper fortsatt et ekte heng. Begrunnelsen står i kommentaren. |
