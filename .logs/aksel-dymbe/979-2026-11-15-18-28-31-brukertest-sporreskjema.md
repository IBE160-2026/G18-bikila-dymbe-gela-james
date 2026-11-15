# Spørreskjema og tilgang til brukertesten

## 2026-11-15 kl. 18:28 — Aksel Dymbe

### Oppgave
Aksel spurte hvordan spørreskjemaet til deltakerne skal se ut, og ba om at det legges inn som en egen fil. Han spurte også hvordan deltakerne skal få tilgang til testen.

### Plan
- Lage et ark for deltakeren med de ti SUS-påstandene fra EXPERIENCE.md, uendret.
- Forklare i README for brukertesten hvordan deltakerne får tilgang til appen i demomodus.

### Resultat
- Ny fil `brukertest/spørreskjema.md`: deltakernummer, to bakgrunnsspørsmål, de ti SUS-påstandene, to åpne spørsmål og en tabell for poengsummen.
- I `brukertest/README.md`:
  - spørreskjemaet står i filtabellen;
  - ny seksjon «Slik får deltakerne tilgang til appen», med testmaskinen først, så egen telefon via `--host` eller hotspot, så Teams med «Gi kontroll»;
  - sjekklisten om Teams er rettet. Deltakeren kan ikke åpne `localhost`.
- `testmanus.md` del 4 lenker til spørreskjemaet.
- KI-loggen og promptene er oppdatert. Arbeidet ligger på greinen `docs/brukertest-sporreskjema`.

### Åpne punkter
- Skriv ut 6 eksemplarer av spørreskjemaet før 17.11.
- Sjekk før første test at `npm run preview -- --host` kan nås fra en telefon på skolenettet. Ellers: bruk hotspot.
