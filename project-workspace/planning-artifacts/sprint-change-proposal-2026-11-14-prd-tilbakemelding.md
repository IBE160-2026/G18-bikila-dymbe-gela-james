# Endringsforslag 2026-11-14: PRD-en etter faglærers tilbakemelding

**Status:** godkjent av Aksel 2026-11-14
**Modus:** samlet
**Omfang:** lite (direkte justering av PRD-en, ingen ny story og ingen kodeendring)

Beslutning 1–6 under ble tatt av Aksel 2026-11-14 på grunn av tidsfristen (levering
2026-11-25). Gruppa har ikke behandlet dem i et møte og kan ta dem opp igjen ved behov. En endring
går da via `bmad-correct-course`.

## 1. Problemet

Faglærer ga formativ tilbakemelding på PRD-en 2026-11-12
(`prd-G18-bikila-dymbe-gela-james-2026-09-27/tilbakemelding-prd.md`). Substansen ble vurdert som
sterk, men formen gjorde PRD-en tung å bruke:

- versjonshistorikk og datostempler inni kravene (4.1);
- mekanisme i stedet for krav i FR-2 (4.2);
- udefinerte begreper og terskler: poengnivåer, fargetrinn og dagslystime (4.3);
- to tall for NFR-1 og en usynlig avveining bak 90-minuttersmålet i NFR-3 (4.4);
- Bør ha-krav uten konsekvenser, og et tillitsmål (SM-3) som var valgfritt (4.5);
- uklart hvilket av tre dokumenter som gjelder (§6).

**Type:** retting av form og avklaring av åpne punkter. Tre av beslutningene endrer krav
(NFR-1, NFR-3, SM-3), og derfor går de via dette endringsforslaget.

## 2. Beslutningene

| # | Spørsmål | Valgt | Forkastet |
|---|---|---|---|
| 1 | Hvilken PRD er kilde til sannhet? | `SnowFinder-PRD.md` gjelder, og `prd.md` er speilkopi. SnowFinder-PRD-og-SRS.html er avledet og følger PRD-en ved konflikt. Poengnivåene og SM-16 fra SRS-en løftes inn i PRD-en. | SRS-teksten vinner (to ID-system å sjekke i hver story); slå SRS-en inn i PRD-en (for stort før levering). |
| 2 | NFR-1/SM-1 | 500 ms for 95 % av endringene i filteret eller søkefeltet, målt manuelt på mobilprofilen i NFR-2. | Beholde 2 s (tester ingenting reelt med ~300 steder); 500 ms målt automatisk i Playwright (ustabilt på delte CI-maskiner). |
| 3 | Poengnivåer og fargetrinn | 70–100 Svært godt, 45–69 Godt, 20–44 Middels, 0–19 Lite, ett fargetrinn per nivå. Slik gruppa vedtok 2026-10-08 og `src/lib/scoreTier.ts` har dem. | Nye grenser (krever kode- og testendring). |
| 4 | NFR-3 | Krav: under tre timer. Mål: rundt én time i normal drift (SM-13). | Beholde 90 minutter som krav; bare «under tre timer» uten mål. |
| 5 | Dagslystime | Solhøyde over 0° ved timens start eller en halvtime senere, på stedets koordinater, slik `shared/sol.ts` (`erDagslystime`) regner. | Bare timens start (krever kodeendring); borgerlig tussmørke, −6° (kodeendring); METs Sunrise-API (ny datakilde). |
| 6 | Minimal brukertest for SM-3 | SM-3 er Må ha. Gjennomføres ikke den fulle testen med fem, måles SM-3 med minst tre personer, og minst 2 av 3 skal klare det. SM-2, SM-4 og SM-16 forblir Bør ha. | Hele femperstesten som Må ha; ingen endring. |

Under 5 sto det i første plan «ved timens start». Kontrollen mot koden viste at
`erDagslystime` også sjekker en halvtime senere, så PRD-en beskriver det koden gjør.

## 3. Bevisst svekkelse av NFR-3

NFR-3 sa at publiserte data er «normalt under 90 minutter gamle». Nå er kravet «under tre timer»,
med rundt én time som mål. Det er en **bevisst svekkelse av et krav**, ikke av en test:

- **Hvorfor:** 90-minuttersmålet drev en kjede av timeplan hvert 10. minutt, aldersgrense og
  timer i FR-2 (endringsforslagene 2026-11-02 og 2026-11-04). Det sto ikke i forhold til nytten
  for brukeren, og faglærer spurte om akkurat denne avveiningen.
- **Hvorfor tre timer:** det er samme grense som merkingen «utdatert» (FR-16), så brukeren alltid
  får beskjed når kravet ikke holdes. Banneret «Viser siste kjente data» etter 90 minutter
  (SRS-F-34) er uendret og varsler fortsatt tidligere.
- **SM-C2:** ingen Må ha-test er fjernet eller svekket. SM-15 tester fortsatt grensene på 3 og
  12 timer, og dataprogrammet, timeren og testene er uendret.

## 4. Hva endringen berører

| Område | Endring |
|---|---|
| PRD (`SnowFinder-PRD.md` og `prd.md`) | Alt i denne PR-en. Se §12 Endringslogg i PRD-en. |
| Kode og tester | Ingen endring. |
| Arkitektur | Ingen endring. Mekanismen som er fjernet fra FR-2, står allerede i AD-2. |
| SnowFinder-PRD-og-SRS.html | **Gjenstår.** SRS-N-01 er nå vedtatt (fjern «forslag»). SRS-N-03, SM-13 og §7 må følge NFR-3 og beslutning 1. |
| Epics (`SnowFinder-Epics-og-Stories.md`) | **Gjenstår.** Kravinventaret sier «NFR-3: normalt < 90 min» og NFR-1 2 s. Tas i PR-en for funnene i epics. |
| EXPERIENCE.md, brukertestplanen | **Gjenstår.** Beskriv den minimale testen for SM-3 (minst tre personer). |
| README, DESIGN.md | Ingen endring. 90 minutter der gjelder banneret, ikke NFR-3. |

## 5. Godkjenning

Godkjent av Aksel 2026-11-14 («1A 2A 3A 4A 5A 6A. Planen er godkjent», og «5A′» etter kontrollen
mot koden).
