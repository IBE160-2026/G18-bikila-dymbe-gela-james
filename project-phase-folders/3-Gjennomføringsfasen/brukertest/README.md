# Brukertest

Materiell for å gjennomføre brukertesten. Hva vi måler og hvorfor, står i
[brukertestplanen i EXPERIENCE.md](../../2-Planleggingsfasen/SnowFinder-EXPERIENCE.md#brukertestplan-steg-8c-2026-10-28):
fem oppgaver, SUS-skjemaet og målene for SM-2, SM-3 og SM-4 fra PRD §9.3. Ved uenighet gjelder
EXPERIENCE.md. Mappen her sier bare hvordan og når vi gjennomfører testen.

| Fil | Brukes til |
|---|---|
| [`testmanus.md`](testmanus.md) | Det testlederen leser opp, ordrett, og reglene for når hen kan hjelpe |
| [`observasjonsskjema.md`](observasjonsskjema.md) | Ett ark per deltaker, fylles ut av den som tar notater |
| [`spørreskjema.md`](spørreskjema.md) | Ett ark per deltaker, fylles ut av deltakeren etter oppgavene: bakgrunn, SUS og to åpne spørsmål |
| [`brukertest-svar.xlsx`](brukertest-svar.xlsx) | Excel-mal for å registrere svarene: én rad per deltaker, SUS og sammendrag mot målene regnes ut automatisk. Lagre den utfylte kopien **utenfor repoet** (repoet er offentlig) |
| [`resultater.md`](resultater.md) | Samlet resultat, fylles ut etter siste test og brukes i sluttrapporten |

## Tidsplan *(forslag 2026-11-15)*

| Dato | Hva | Hvem |
|---|---|---|
| 15.–16.11 | Rekruttere 5–6 deltakere (én i reserve) og avtale tidspunkt, 20 minutter hver | Hele gruppa |
| 16.11 | Ingen nye stories etter dette. Det er denne versjonen av appen som testes | Hele gruppa |
| 17.–19.11 | Gjennomføre testene, gjerne 2–3 per kveld | Joseph og Aksel |
| 18.11 | Har vi under fem avtaler: gå over til den minimale testen for SM-3 (minst tre personer) | Joseph og Aksel |
| 19.–20.11 | Telle opp og fylle ut `resultater.md` | Joseph og Aksel |
| 20.–21.11 | Bygge kritiske rettinger som `fix`-PR-er med review | Fordeles etter testen |
| 21.11 | Kodefrys: siste retting er merget (M5) | Hele gruppa |
| 21.–23.11 | Funnene inn i sluttrapporten (F5) | Hele gruppa |

## Roller

- **Testleder** (Joseph eller Aksel): leser manuset, gir oppgavene og hjelper bare etter reglene.
- **Notattaker** (den andre): tar tiden, fyller ut observasjonsskjemaet og noterer sitater.
  Joseph og Aksel bytter roller mellom testene.
- **Rekruttering** (Sena og Kelly, sammen med de andre): finner deltakere, også noen utenfor
  studiet. Minst én bør ha iPhone med Safari, og helst én Mac med Safari.

## Deltakerliste

Bruk bare fornavn eller en kode (D1–D6) i repoet. Kontaktinformasjon skal ikke inn i repoet.

| Kode | Erfaring med ski og vær (lav/middels/høy) | Enhet og nettleser | Tidspunkt | Testleder | Gjennomført |
|---|---|---|---|---|---|
| D1 | | | | | |
| D2 | | | | | |
| D3 | | | | | |
| D4 | | | | | |
| D5 | | | | | |
| D6 (reserve) | | | | | |

## Slik får deltakerne tilgang til appen

Deltakerne kan ikke bare få en lenke. Den publiserte nettsiden viser ekte data, og der stemmer ikke
fasiten (Trysil, Gaustatoppen 58 og Kirkenes som utdatert). Testen må gå i demomodus, og den
finnes bare på maskinen til testlederen (`npm run preview` etter `npm run build:demo`). Testen er
også ledet: testlederen gir én oppgave om gangen, og notattakeren tar tiden. Det går derfor ikke an
å sende ut en lenke og la folk ta testen alene.

Velg én av disse tre måtene, i denne rekkefølgen:

1. **Fysisk, på testmaskinen (anbefalt).** Deltakeren bruker laptopen til testlederen. Det er
   enklest, og alle får samme skjerm. Spørreskjemaet er på papir.
2. **Fysisk, på deltakerens egen telefon.** Brukes når deltakeren har iPhone med Safari (se
   Safari-sjekken i manuset).
   - Testlederen kjører `npm run preview -- --host`, og deltakeren åpner adressen som vises
     (`http://<IP-en til maskinen>:4173`) på samme nettverk.
   - Blokkerer skolenettet (eduroam) trafikk mellom enheter, kobler laptopen seg til en mobil
     hotspot, og telefonen bruker samme hotspot.
3. **På Teams.**
   - Testlederen deler vinduet med appen og gir deltakeren kontroll (I Teams: «Gi kontroll»).
     Deltakeren styrer musa og tenker høyt.
   - Spørreskjemaet leses opp, og notattakeren krysser av, eller testlederen limer
     det inn i chatten. Svarene skrives aldri inn med navn.
   - Bruk dette bare når vi ikke får nok deltakere fysisk. Tiden i oppgave 1 blir litt
     lengre på grunn av forsinkelsen.

## Sjekkliste før hver test

1. Hent siste `main`: `git pull`, så `npm ci`.
2. Bygg og start demomodus: `npm run build:demo`, så `npm run preview`. Åpne adressen som vises
   (vanligvis `http://localhost:4173`). Demomodus viser alltid de samme 24 stedene fra
   `public/data/demo.json`, så fasiten i manuset stemmer.
3. Åpne appen på Utforsk, uten filter i adressen. Lukk andre faner, og tøm historikken hvis den
   avslører adresser med filter.
4. Deltaker på egen telefon eller Mac: se punkt 2 over.
5. Teams: testlederen deler appen og gir kontroll (se punkt 3 over). Deltakeren kan ikke åpne
   `localhost` hos seg selv.
6. Ha et tomt observasjonsskjema, et utskrevet [spørreskjema](spørreskjema.md) og en klokke klar.

## Etter testen

- Før svarene inn i en kopi av [`brukertest-svar.xlsx`](brukertest-svar.xlsx) utenfor repoet, og fyll ut [`resultater.md`](resultater.md) fra arket «Sammendrag». Lag en `docs/`-PR med `resultater.md`.
- Kritiske funn blir `fix`-PR-er med review. Resten skrives inn i sluttrapporten som videre arbeid.
- Sett UX-dokumentene (DESIGN.md og EXPERIENCE.md) til `final` via `bmad-ux`.
