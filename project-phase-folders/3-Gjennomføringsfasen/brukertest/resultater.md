# Resultater fra brukertesten

*Målene står i
[brukertestplanen i EXPERIENCE.md](../../2-Planleggingsfasen/SnowFinder-EXPERIENCE.md#brukertestplan-steg-8c-2026-10-28)
og PRD §9.3.*

> **Status 2026-11-19:** spørreskjemaet (SUS og fritekst) er ført inn for alle seks deltakerne.
> Oppgavene O1–O5, tiden på O1, enhet og Safari-sjekken står i observasjonsskjemaene og er ikke ført
> inn ennå. Feltene som mangler, er merket «–».

**Gjennomført:** 6 deltakere (D1–D6), 17.–19.11 etter tidsplanen. Datoen per deltaker føres inn fra
observasjonsskjemaene. Det var minst fem deltakere, så den minimale testen for SM-3 trengtes ikke.

**Testledere:** Joseph og Aksel, etter rollene i [README](README.md#roller)

## Deltakerne

| Bakgrunn | Svar |
|---|---|
| Hvor ofte på ski | Hver uke eller oftere: 2 · Omtrent én gang i måneden: 1 · Noen ganger: 1 · Aldri: 2 |
| Sjekker været før skitur | Alltid: 4 · Som regel: 1 · Aldri: 1 |

To av seks går aldri på ski. Det trekker ned svaret på «vil bruke ofte» (S1), men ikke resten av
SUS-skjemaet.

## Oppgavene

Utfall: **U** = uten hjelp, **H** = med hjelp, **G** = ga opp.

| Deltaker | Enhet | O1 tid | O1 | O2 | O3 | O4 | O5 | SUS |
|---|---|---|---|---|---|---|---|---|
| D1 | – | – | – | – | – | – | – | 87,5 |
| D2 | – | – | – | – | – | – | – | 87,5 |
| D3 | – | – | – | – | – | – | – | 87,5 |
| D4 | – | – | – | – | – | – | – | 92,5 |
| D5 | – | – | – | – | – | – | – | 85,0 |
| D6 | – | – | – | – | – | – | – | 92,5 |

## SUS per påstand

Snitt for de seks deltakerne, på skalaen 1–5. For oddetallene er høyt bra, for partallene er lavt bra.

| # | Påstand | Snitt |
|---|---|---|
| S1 | Jeg tror jeg vil bruke SnowFinder ofte. | 2,7 |
| S2 | Jeg syntes SnowFinder var unødvendig komplisert. | 1,0 |
| S3 | Jeg syntes SnowFinder var lett å bruke. | 5,0 |
| S4 | Jeg tror jeg ville trengt hjelp fra en teknisk person for å bruke SnowFinder. | 1,0 |
| S5 | Jeg syntes funksjonene i SnowFinder hang godt sammen. | 4,0 |
| S6 | Jeg syntes det var for mye som ikke stemte overens i SnowFinder. | 1,8 |
| S7 | Jeg tror de fleste vil lære seg SnowFinder raskt. | 4,7 |
| S8 | Jeg syntes SnowFinder var tungvint å bruke. | 1,0 |
| S9 | Jeg følte meg trygg da jeg brukte SnowFinder. | 5,0 |
| S10 | Jeg måtte lære meg mye før jeg kom i gang med SnowFinder. | 1,0 |

Svakest er S1 (bruke ofte). Ellers er S6 den eneste med et klart negativt svar: D6 ga 4.

## Mot målene

| Mål | Krav | Resultat | Nådd? |
|---|---|---|---|
| SM-2, oppgave 1 | Minst 4 av 5 på under 2 minutter uten hjelp | – | – |
| Oppgave 2 | Minst 4 av 5 uten hjelp | – | – |
| SM-3, oppgave 3 (Må ha) | Minst 4 av 5 (minimal test: minst 2 av 3) | – | – |
| Oppgave 4 | Minst 4 av 5 uten hjelp | – | – |
| SM-4, oppgave 5 | Minst 4 av 5 uten å bli fortalt det | – | – |
| SUS | Snitt minst 68 | 88,75 (85,0–92,5, n = 6) | Ja |
| Alle oppgaver | Minst 80 % fullført uten hjelp | – | – |
| Safari | Sliderne virker som i CI | – | – |

## Funn

Fra fritekstsvarene i spørreskjemaet. Funn fra observasjonsskjemaene legges til når oppgavene er ført inn.

Prioritet: **kritisk** (hindrer en oppgave, rettes før kodefrys 28.11 som `fix`-PR), **viktig**
(gjør oppgaven tung, rettes hvis det er tid), **senere** (skrives inn i sluttrapporten som videre
arbeid).

| # | Funn | Oppgave | Hvor mange av deltakerne | Prioritet | Oppfølging (PR eller «videre arbeid») |
|---|---|---|---|---|---|
| 1 | Tilbakepilen på stedssiden er vanskelig å se | – | 1 av 6 (D6) | viktig | «Tilbake» ble flyttet øverst på stedssiden i PR #113, merget 18.11 kl. 21:08:24 UTC (22:08 norsk tid). Sjekk «Dato og tid» i D6s observasjonsskjema mot dette tidspunktet for å se om D6 testet før eller etter |
| 2 | Ønsker værmelding for de neste dagene på stedssiden | – | 2 av 6 (D1, D2) | senere | Videre arbeid. Prognosen i v1 går 24–48 timer fram |
| 3 | Et sted kan få SnowScore 0 selv om det ligger snø fra en uke siden | – | 1 av 6 (D2) | senere | SnowScore måler nysnø, ikke snødybde. Forklares i sluttrapporten, og snødybde blir videre arbeid |
| 4 | «Litt mange filter» | – | 1 av 6 (D2) | senere | Videre arbeid. Hurtigvalgene finnes allerede |
| 5 | Ønsker en app-versjon | – | 1 av 6 (D6) | senere | Videre arbeid (PWA er v2) |

Ingen av deltakerne oppga noe som var vanskelig utenom funn 1. Fem av seks skrev «ingenting».

## Sitater

- «Hvis jeg kunne se værmeldingen for de neste tre dagene når jeg trykker på et sted, for eksempel Trysil.» (D1)
- «Huske på at det kan ligge snø og ha gode snøforhold selv om det ikke har kommet nysnø.» (D2)
- «Tilbakepilen er ikke lett synlig» (D6)
- «Jeg står ikke på ski, men hadde brukt den hvis jeg gjorde det.» (D5)

## Konklusjon

*Foreløpig, bare fra spørreskjemaet.* SUS-målet er godt nådd: snittet er 88,75, og laveste deltaker
har 85,0. Alle seks synes SnowFinder er lett å bruke og føler seg trygge på den. Det svakeste er om de
vil bruke den ofte, og fritekstsvarene peker på hvorfor: de vil ha en prognose for flere dager og et
mål på snøen som ligger, ikke bare nysnøen. Begge er videre arbeid. SM-2, SM-3 og SM-4 vurderes når
oppgavene fra observasjonsskjemaene er ført inn.
