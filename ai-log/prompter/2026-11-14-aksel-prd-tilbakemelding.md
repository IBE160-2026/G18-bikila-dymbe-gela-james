# 2026-11-14: PRD-en revidert etter faglærers tilbakemelding

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-prd` (oppdatering)
**Fase:** Gjennomføring
**Resultat:** `SnowFinder-PRD.md` og kopien `prd.md` (like) i fire commits: endringslogg og presens,
beslutning 1–6, ordliste og termer, mekaniske funn og status `final`. Nytt endringsforslag
`sprint-change-proposal-2026-11-14-prd-tilbakemelding.md`.

## Prompter

### 1
> Faglærer har gitt formativ tilbakemelding på PRD-en vår:
> @project-workspace/planning-artifacts/prd-G18-bikila-dymbe-gela-james-2026-09-27/tilbakemelding-prd-2026-11-12.md
>
> PRD-en det gjelder:
> @project-workspace/planning-artifacts/prd-G18-bikila-dymbe-gela-james-2026-09-27/prd.md
>
> Oppgave: Revider prd.md slik at den svarer på tilbakemeldingen. Gjør det i denne rekkefølgen:
>
> 1. LES OG PLANLEGG FØRST
>    Les hele tilbakemeldingen og hele PRD-en. Lag en plan som går gjennom hvert punkt i §4, §5 og §6 og sier hva du vil endre og hvor (seksjon/krav-ID). Ikke endre noe før jeg har godkjent planen.
>
> 2. BESLUTNINGER SOM ER VÅRE, IKKE DINE
>    Ikke finn på verdier for disse. Still meg spørsmålene samlet, med 2–3 alternativer og en anbefaling for hvert:
>    - Hvilken PRD som er kilde til sannhet (prd.md, project-phase-folders/2-Planleggingsfasen/SnowFinder-PRD.md eller SnowFinder-PRD-og-SRS.html). Sjekk først hvordan de skiller seg fra hverandre.
>    - NFR-1/SM-1: 2 s eller 500 ms, og hvordan det måles.
>    - Grensene for SnowScore-etikettene i FR-13 og fargetrinnene i FR-12.
>    - Om NFR-3 skal være 90 minutter eller noe mykere, og begrunnelsen for brukeren.
>    - Definisjonen av «dagslystime» og kilden til den.
>    - Om en minimal brukertest for SM-3 skal bli Må ha.
>
> 3. ENDRINGER DU KAN GJØRE ETTER GODKJENT PLAN
>    - 4.1: Flytt versjonsmerknader, datostempler og «funnet i revisjonen» ut av kravene til en egen endringslogg (CHANGELOG-seksjon nederst eller egen fil, foreslå hva som passer). Skriv kravene om til presens. Ikke endre betydningen av noe krav.
>    - 4.2: Skriv FR-2 om til et testbart krav (se forslaget i tilbakemeldingen). Flytt mekanisme (cron/timer, filbaner, Zod/Node) fra FR-1, FR-2, FR-3 og FR-7 til arkitekturdokumentet og henvis til AD-nummer. Si fra hvis AD-nummeret ikke finnes.
>    - 4.3: Utvid ordlisten (Stedsside, Forklaringsside, Utforsk, Kvalitetsrapport, Demomodus, Dataprogram) og bruk termene likt («dataprogram», ikke «pipeline»; velg ett av vilkår/krav/kriterium).
>    - 4.5: Gi FR-22, FR-24 og FR-25 hver en testbar «Konsekvenser»-linje.
>    - §5 mekaniske funn: riktig seksjonshenvisning til antakelser (§11), rydd antakelsesindeksen, fiks interne lenker som ikke løser seg, sorter FR-32 og §10 riktig, og flytt kritiske begrunnelser fra .memlog.md inn i PRD-en.
>    - §6: Lukk §10 spørsmål 4 med en kort begrunnelse.
>
> 4. REGLER
>    - Behold alle krav-ID-er (FR-, NFR-, SM-, UJ-). Ikke renummerer.
>    - Ikke slett eller svekk Må ha-krav (jf. SM-C2).
>    - Oppdater frontmatter (dato, status) og §0.
>    - Skriv på norsk, samme stil som resten av dokumentet.
>
> 5. TIL SLUTT
>    Gi meg en tabell: tilbakemeldingspunkt → hva som ble endret → hvor. List også det som står igjen. Ikke commit. Jeg ser gjennom diffen selv først.

**Svar:** Claude fant at fila heter `tilbakemelding-prd.md`, laget en worktree på
`docs/prd-revisjon-tilbakemelding` (så flettingen for PR #83 ikke ble berørt), sammenlignet de tre
dokumentene (de to md-kopiene er like) og la fram en plan per punkt og seks beslutningsspørsmål
med anbefaling.

### 2
> 1A 2A 3A 4A 5A 6A. Planen er godkjent, med disse tilleggene:
>
> 1. Verifiser før du skriver: bekreft med sitat fra koden at src/lib/scoreTier.ts har grensene 70/45/20 og at shared/sol.ts bruker solhøyde > 0° ved timens start. Stemmer det ikke, stopp og si fra før du endrer noe.
>
> 2. 4A svekker NFR-3 fra 90 min til 3 t. Skriv det eksplisitt i sprint-change-proposal-en og i §12 som en bevisst svekkelse, med begrunnelse, slik at det ikke strider mot SM-C2.
>
> 3. Del arbeidet i separate commits, og la hver commit oppdatere både prd.md og SnowFinder-PRD.md, så kopiene alltid er like:
>    (a) 4.1 endringslogg + omskriving til presens
>    (b) beslutning 2–6
>    (c) ordliste og termer (4.3)
>    (d) mekaniske funn i §5 og lukking av §10 spørsmål 4
>
> 4. I sluttrapporten: vis gammel og ny tekst side om side for hvert krav som er skrevet om, og merk alt som er fjernet og ikke bare flyttet til §12. Ta også med en tabell: tilbakemeldingspunkt → endring → hvor.
>
> 5. Ja til sprint-change-proposal-2026-11-14-prd-tilbakemelding.md i samme PR. Skriv at beslutning 1–6 ble tatt av Aksel 2026-11-14 på grunn av tidsfristen, og at gruppen kan ta dem opp igjen ved behov.
>
> 6. Status i frontmatter: final, updated: 2026-11-14.
>
> 7. Merge PR-en når lint, typecheck, tester og build er grønne. Hvis noe feiler, stopp og si fra. Ikke merge da.
>
> PR #83: push når E2E er grønn, slik vi avtalte. Hold den atskilt fra PRD-arbeidet.

**Svar:** Grensene i `scoreTier.ts` stemte. `erDagslystime` i `shared/sol.ts` sjekker timens
start **eller** en halvtime senere, så Claude stoppet og spurte før noen endring.

### 3
> 5A′. Fortsett med commitene (a)–(d).

**Svar:** PRD-en beskriver dagslystimen slik koden gjør. Commitene (a)–(d) ble laget, med
endringsforslaget og memloggen i (b), og ID-sjekken viste at alle krav-ID-er er beholdt (SM-16 er
ny).
