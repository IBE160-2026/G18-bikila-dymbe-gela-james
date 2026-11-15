# Brukertest

Materiell for å gjennomføre brukertesten. Hva vi måler og hvorfor, står i
[brukertestplanen i EXPERIENCE.md](../../2-Planleggingsfasen/SnowFinder-EXPERIENCE.md#brukertestplan-steg-8c-2026-10-28):
fem oppgaver, SUS-skjemaet og målene for SM-2, SM-3 og SM-4 fra PRD §9.3. Ved uenighet gjelder
EXPERIENCE.md. Mappen her sier bare hvordan og når vi gjennomfører testen.

| Fil | Brukes til |
|---|---|
| [`testmanus.md`](testmanus.md) | Det testlederen leser opp, ordrett, og reglene for når hen kan hjelpe |
| [`observasjonsskjema.md`](observasjonsskjema.md) | Ett ark per deltaker, fylles ut av den som tar notater |
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

## Sjekkliste før hver test

1. Hent siste `main`: `git pull`, så `npm ci`.
2. Bygg og start demomodus: `npm run build:demo`, så `npm run preview`. Åpne adressen som vises
   (vanligvis `http://localhost:4173`). Demomodus viser alltid de samme 24 stedene fra
   `public/data/demo.json`, så fasiten i manuset stemmer.
3. Åpne appen på Utforsk, uten filter i adressen. Lukk andre faner, og tøm historikken hvis den
   avslører adresser med filter.
4. Deltaker på egen telefon eller Mac: bruk samme nettverk og maskinens IP-adresse
   (`npm run preview -- --host`), eller la deltakeren bruke testmaskinen.
5. Teams med skjermdeling: deltakeren deler skjermen, og testlederen ser på uten å styre.
6. Ha et tomt observasjonsskjema og en klokke klar.

## Etter testen

- Fyll ut [`resultater.md`](resultater.md) og lag en `docs/`-PR med den.
- Kritiske funn blir `fix`-PR-er med review. Resten skrives inn i sluttrapporten som videre arbeid.
- Sett UX-dokumentene (DESIGN.md og EXPERIENCE.md) til `final` via `bmad-ux`.
