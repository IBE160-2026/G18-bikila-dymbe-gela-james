# 2026-10-22: Rettinger i dataprogrammet etter revisjonen

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5). `bmad-build` (oneshot) med Blind Hunter-gjennomgang i en underagent, én PR per feil.
**Fase:** Gjennomføring
**Resultat:** Retting 1: [`spec-fix-terskel-poengsum.md`](../../project-workspace/implementation-artifacts/spec-fix-terskel-poengsum.md) (PR #43). Retting 2: [`spec-fix-met-hastighet.md`](../../project-workspace/implementation-artifacts/spec-fix-met-hastighet.md) (PR #44). Retting 3: [`spec-fix-gamle-nve-verdier.md`](../../project-workspace/implementation-artifacts/spec-fix-gamle-nve-verdier.md).

## Prompter

### 1
> last inn siste endringer

**Svar (kort):** `main` var allerede oppdatert (PR #42 var siste merge).

### 2
> hva er det vi mangler nå?

**Svar (kort):** Claude listet det som gjenstår: Epic 3 (filter), Story 1.11 (timesjobb og publisering), 1.6 og 4.2, tre feil i dataprogrammet fra revisjonen 9. oktober, åpne tiltak fra retrospektiven (A6–A9), Sallys steg 8c og avslutningsfasen.

### 3
> gjør rettingene
>
> (limte inn de tre feilene fra svaret: en kjøring der alle stedene er ufullstendige kan erstatte gode data; ingen grense for hvor ofte MET kalles; dataprogrammet kan bruke gamle NVE-verdier)

**Svar (kort):** Claude fant årsakene i koden og spurte om én ting: hvilken regel som skal stoppe en kjøring der stedene mangler poengsum. Alternativene var: minst 95 % med poengsum (anbefalt), en egen terskel på 50 %, eller bare stopp når ingen har poengsum.

**Valg:** «Minst 95 % med poengsum». Aksel ga også lov til å merge egne PR-er i økten når alle sjekkene på GitHub er grønne.

**Hva vi gjorde med det:**
- **Retting 1:** Terskelen teller steder med poengsum. Rapportfeltet `andelGyldige` beholder betydningen, så datakvalitetspanelet og demodataene er uendret. Brief, PRD, arkitektur, epics, datakatalog og README er oppdatert.
- **Retting 2:** Hver kilde får høyst 10 kall i sekundet (ett kall per 100 ms), halvparten av det MET tillater uten avtale. PRD (FR-2), arkitektur og README er oppdatert.
- **Retting 3:** En NVE-verdi brukes bare når dagen den gjelder, er stemplet mindre enn 24 timer før kjøringen. Claude sjekket med ett ekte kall at NVE svarer for hele perioden, så regelen slår ikke til i vanlig drift. PRD (FR-6a) og datakatalogen er oppdatert.
- **Ustabile tester lokalt:** En stoppet testkjøring etterlot en vitest-prosess i evig løkke, som Claude avsluttet. Maskinen var også tregere utover kvelden. Demotestene fikk en tidsgrense på 15 s, og tidstestene fra retting 2 sjekker nå det totale spennet i stedet for hvert enkelt kall.

### 4
> ok gå videre

**Svar (kort):** Claude tok neste punkt i planen, tiltak A8 fra retrospektiven for Epic 2, i dispatch-ruten med alle tre gjennomgangslagene (som A9 krever for UI med tilgjengelighet).

**Hva vi gjorde med det:**
- **A8:** «SnowFinder» er markert som gjeldende side bare på kartet, ikke på listen. Menyen ☰ lukkes når brukeren går fra «Fant ikke siden» til kartet. Spec: [`spec-a8-toppnav-avvik.md`](../../project-workspace/implementation-artifacts/spec-a8-toppnav-avvik.md).
- **A7:** `Formel` er én komponent, kortstilen ligger i en delt `.kort`, og tallisten heter `.tall-liste`. `App.css` deles ikke opp nå, fordi rekkefølgen styrer kaskaden. Beregnet stil er sammenlignet før og etter og er lik. Spec: [`spec-a7-delt-kortstil.md`](../../project-workspace/implementation-artifacts/spec-a7-delt-kortstil.md).

### 5
> ok gå videre til story 3.1

**Svar (kort):** Claude bygde Story 3.1 med `bmad-build` i dispatch-ruten og spurte først om fire valg. Alle fire anbefalinger ble valgt:
- **Temperatur** er en maksgrense.
- **Sliderne** står som standard i ytterpunktet, som betyr «Alle», så ingenting skjules før brukeren endrer noe.
- **Et sted som mangler verdien** skjules når kravet er aktivt.
- **Bunn-arket på mobil** åpnes med en knapp, ikke ved å dra.

Spec-en ble større enn anbefalt (omtrent 2 800 tokens). Aksel valgte å beholde den samlet.

**Hva vi gjorde med det:**
- **Filterlogikk og fasittabell:** `shared/filter.ts` og fasittabellen `tests/golden/filter.json` låser reglene.
- **Panelet:** sidepanel fra 768 px og bunn-ark under, med tre slidere og «Nullstill».
- **Null treff:** gir en forklaring og en vei tilbake.
- **Kartet:** beholder zoom og utsnitt når filteret endres.
- Spec: [`spec-3-1-filtrer-nysno-vind-temperatur.md`](../../project-workspace/implementation-artifacts/spec-3-1-filtrer-nysno-vind-temperatur.md).
