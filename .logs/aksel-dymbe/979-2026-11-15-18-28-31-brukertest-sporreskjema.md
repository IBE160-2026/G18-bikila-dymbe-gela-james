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

## 2026-11-15 kl. 20:54 — Aksel Dymbe

### Oppgave
Aksel ba om lenker til skjemaet for Teams, en melding til gruppa og en Excel-fil han kan fylle inn svarene i og laste opp til Claude.

### Plan
- Lage arbeidsboka med openpyxl, med formler for SUS og et sammendrag mot målene.
- Sjekke formlene på en testkopi.
- Legge den tomme malen i `brukertest/` via en docs-PR.

### Resultat
- `brukertest/brukertest-svar.xlsx` har tre ark:
  - Veiledning, med en fiktiv eksempelrad;
  - Svar, med én rad for hver av D1–D6, nedtrekkslister, validering av SUS-svarene og SUS-poengene regnet ut med formler;
  - Sammendrag, som viser Ja/Nei for SM-2, SM-3 (med regelen for minimal test), SM-4 og SM-16.
- Formlene er sjekket med Python-pakken `formulas` på fem fiktive deltakere, mot tall regnet ut for hånd:
  - SUS 75,0;
  - 22 av 25 oppgaver (88 %) uten hjelp;
  - SM-2 1 av 5 «Nei».

  Den tomme malen gir tomme felt uten feil.
- README-en for brukertesten lenker til malen og sier at den utfylte kopien skal lagres utenfor repoet.
- Meldingen til Teams er skrevet, men Aksel sender den selv.

### Åpne punkter
- Når testene er ferdige, laster Aksel opp den utfylte Excel-fila. Claude fører resultatene inn i `resultater.md` og i sluttrapporten §4.

## 2026-11-15 kl. 21:10 — Aksel Dymbe

### Oppgave
Aksel ba om spørreskjemaet for deltakerne som en Excel-fil, og om en PR med den.

### Plan
- Lage arket med openpyxl, med de samme spørsmålene som i `spørreskjema.md` og uten poengutregning.

### Resultat
- Ny fil `brukertest/spørreskjema.xlsx`. Deltakeren fyller ut gule felt og velger svar fra nedtrekkslister. SUS-svarene er tall fra 1 til 5. Arket får plass på én utskrevet side.
- README-en for brukertesten lenker til fila. KI-loggen og promptene er oppdatert.

### Åpne punkter
Ingen nye.
