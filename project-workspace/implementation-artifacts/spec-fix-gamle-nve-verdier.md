---
title: 'Vis ikke en flere dager gammel NVE-verdi som «nysnø siste døgn»'
type: 'bugfix'
created: '2026-10-22'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Revisjonen 9. oktober fant at dataprogrammet kan bruke gamle NVE-verdier. `latestNveValue` i `shared/contracts/nve.ts` velger den siste dagsverdien som ikke ligger etter referansetiden, uansett hvor gammel den er. Slutter NVE-serien flere dager før (for eksempel fordi NVE henger etter, eller svaret dekker en kortere periode enn vi spurte om), vises en flere dager gammel verdi på stedssiden som «nysnø siste døgn». Det er feil tall med feil merkelapp. PRD-en sier også at datafilen aldri skal bære gamle verdier (FR-6a).

**Approach:**
- En NVE-verdi brukes bare når dagen den gjelder, startet mindre enn 24 timer før referansetiden. Dagsverdiene kommer med 24 timers mellomrom, så den nyeste dagen ligger alltid innenfor når serien er à jour. Er den nyeste dagen eldre, blir feltet `null` («–» på stedssiden), som når NVE feiler.
- Demodataene er uendret: den nyeste NVE-dagen i fixturene er 14,5 timer eldre enn referansetiden.
- PRD-en (FR-6a) og datakatalogen (`nveNysnoSisteDognMm`) beskriver regelen, PRD-en i begge kopiene.
- **Ferdig når:** de fire sjekkene og E2E er grønne, og `gh pr checks` er grønn.

</frozen-after-approval>

## Implementation Notes

- **Endring:** `latestNveValue` i `shared/contracts/nve.ts` gir `null` når den nyeste dagsverdien på eller før referansetiden er stemplet 24 timer eller mer før den. Ellers er oppførselen den samme: NoDataValue gir `null`, og funksjonen faller ikke tilbake til en eldre dag.
- **Sjekket mot NVE (2026-10-22 17:19 UTC):** NVE svarer for hele perioden vi ber om, også dagen etter i dag (`EndDate` 23.10 06:00, verdier for alle dager). Serien slutter derfor ikke tidlig i vanlig drift, og en kjøring om morgenen får dagens verdi. Regelen slår bare til når NVE henger etter eller svaret er kortere enn forespurt.
- **Demo:** `demo.json` er uendret (`npm run data:demo` gir ingen diff). Den nyeste NVE-dagen i fixturene er 14,5 timer eldre enn referansetiden. Demotesten sjekker nå at minst ett sted har en NVE-verdi over 0, så en fixture-opptak som henger en dag etter, oppdages.
- **Tester:** `nve.test.ts` har grensene (dagen starter, 24 timer minus ett sekund, nøyaktig 24 timer, en serie som sluttet for tre dager siden, en serie som starter etter referansetiden). `score.test.ts` viser at et sted med for gammel NVE-verdi får `null` og likevel poengsum.
- **Utenfor planen, i samme PR:**
  - Demotestene i `run.test.ts` har fått en tidsgrense på 15 s. Det er den utsatte saken fra PR #44. Testsuiten feilet lokalt nesten hver gang fordi maskinen var tregere (demotesten brukte 1,9 s alene mot 0,4 s før). Tidlig i økten hang også en vitest-prosess i en evig løkke fra en stoppet kjøring og brukte CPU. Det er rettet.
  - De to tidstestene fra PR #44 sjekket avstanden mellom hvert kall i ekte tid og feilet under last. Nå sjekker de det totale spennet. Den nøyaktige avstanden testes fortsatt med falsk klokke.
- **Kjent:** Under tung last kan andre tunge tester (for eksempel egenskapstestene for SnowScore) fortsatt gå over 5 s lokalt. CI har ikke vist det.

## Review Triage Log

Blind Hunter (oneshot), 10 funn.

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | Regelen på 24 timer kan gi `null` overalt om morgenen hvis NVE publiserer sent | false | avvist | Sjekket mot NVE: svaret dekker hele perioden, også i morgen, så dagens dag finnes alltid. Står i notatene over. |
| 2 | Det er uklart om stempelet D 06:00 er starten eller slutten av døgnet | low | patch (ordlyd) | Det er et eldre, åpent spørsmål. Dokumentene sier nå «stemplet», ikke «startet», så de ikke påstår noe om det. |
| 3 | En for gammel NVE-verdi blir `null` uten spor i rapporten | low | avvist | Det ville krevd et nytt felt i rapporten. Det skjer ikke i vanlig drift (se 1), og feltet viser «–» som ved NVE-feil. |
| 4 | Den utsatte saken om NVE-perioden i UTC er ikke oppdatert | low | avvist | Gamle oppføringer i `deferred-work.md` endres ikke. Med den nye regelen blir en for gammel dag `null`, ikke et feil tall, så saken blir mindre alvorlig. |
| 5 | Ingenting vokter NVE-verdiene i demodataene | low | patch | Demotesten krever minst én NVE-verdi over 0. |
| 6 | Brukeren får ikke vite hvorfor feltet er tomt | low | avvist | Samme «–» som når NVE feiler (FR-6a), og det skjer ikke i vanlig drift. |
| 7 | Spec og KI-logg er ikke ferdige | false | avvist | Skrives ved leveringen. |
| 8 | Den nye NoDataValue-testen gjentar en eksisterende | low | patch | Fjernet. Ugyldig `referenceTime` er avvist som funn: den lages alltid av programmet. |
| 9 | Tittelen på score-testen dekker ikke det nye tilfellet | low | patch | Tilfellet er flyttet til en egen test. |
| 10 | «fordi NVE henger etter» kan leses som at NVE alltid henger etter | low | patch | PRD og datakatalog sier nå «henger etter eller svaret slutter tidligere», og at det ikke skjer i vanlig drift. |
