# Tilbakemelding på PRD

| | |
|---|---|
| **Gruppe** | G18 – G18-bikila-dymbe-gela-james |
| **PRD vurdert** | `project-workspace/planning-artifacts/prd-G18-bikila-dymbe-gela-james-2026-09-27/prd.md` (status i frontmatter: draft, sist endret 2026-11-08, commit 3e19f27) |
| **Dato** | 2026-11-12 |
| **Type** | Formativ tilbakemelding, ikke karakter |

## 1. Samlet inntrykk

Dette er en sterk PRD med tydelig tese (en åpen, forklarbar SnowScore som brukeren kan stole på), ærlig scope og krav som stort sett kan bli testtilfeller. Risikoen ligger i form, ikke substans: etter flere endringsrunder er kravteksten full av versjonsmerknader og implementasjonsdetaljer, så UX, arkitektur og stories må lete etter hva som faktisk gjelder nå.

## 2. Dette fungerer godt

- **Demomodus som testbart krav (FR-30).** «Samme fixtures gir alltid samme demodatasett», fast demoklokke og «alle tilstander er med» gjør kjørbarhet og dataalder deterministisk testbare. Dette følger direkte opp det mest sentrale punktet i briefen-tilbakemeldingen.
- **Fasittabeller og verifiseringsnivå.** FR-14, FR-17 og FR-20 har fasit med forventede treff, og suksessmålene i §9 er delt i A (CI), B (manuelt) og C (brukertest). Det går tydelig fram hva som er verifisert. SM-C2 («andel Må ha-tester som fjernes eller svekkes … skal være null») er en ekte motmetrikk.
- **Ærlig avgrensning.** Snøvarsel og tilbakemelding er merket «Ikke i v1» med ID-ene beholdt og begrunnelse, §5 er konkret, og NFR-7 sier åpent at selve kartlaget er unntatt fra full WCAG AA, mens listevisningen (FR-13) må oppfylle den. Siden appen er deterministisk og uten språkmodell (§5), er det riktig at PRD-en ikke har krav om KI-kontroll i produktet.

## 3. Oversikt per dimensjon

| Dimensjon | Vurdering | Kort begrunnelse |
|---|---|---|
| Beslutningsklarhet | god | Valg og begrunnelser er synlige, men NFR-1 har to tall (2 s og foreslått 500 ms) uten vedtak. |
| Substans | sterk | Personaene driver krav (UJ-3 gir FR-13, UJ-4 gir FR-32), NFR-ene har tall, ingen boilerplate. |
| Strategisk sammenheng | god | Tesen «tillit» går igjen, men de målene som tester tillit (SM-3, SM-4) hører til en brukertest som er «Bør ha». |
| Testbarhet | god | De fleste Må ha-FR-er har målbare konsekvenser. FR-22, 24, 25 mangler dem, og noen terskler er udefinert. |
| Scope og avgrensning | sterk | Må ha / Bør ha / Ikke i v1 er eksplisitt, få åpne punkter, antakelser merket. |
| Brukbarhet for neste fase | god | ID-ene holder, men versjonsstøy, glossarhull og lenker som ikke løser seg gjør uthenting tungt. |
| Formtilpasning | sterk | Forbrukerprodukt med reiser, glossar og FR-er nestet under funksjoner passer. |

## 4. Viktigste forbedringer

### 4.1 Versjonshistorikk ligger inni kravene
- **Alvorlighet:** høy
- **Hvor:** §0 (v2–v6) og f.eks. FR-5: «*(v4, 2026-10-22)* «Gyldige data» betyr … (funnet i revisjonen 2026-10-09)»
- **Problem og hvorfor det betyr noe:** PRD-en er ca. 7 000 ord, og mange FR-er bærer datostemplede lag. Den som skal lage stories eller tester, må selv avgjøre hva som gjelder. §0 lister bare v2 og v3, mens v4–v6 dukker opp først inne i kravene.
- **Forslag:** Flytt historikk og «funnet i revisjonen» til en egen endringslogg (eller sprint-change-proposal-ene dere allerede har). Skriv kravene i presens, for eksempel FR-5: «Systemet publiserer en ny batch bare når minst 95 % av stedene har en poengsum. Et sted med ‹ufullstendige data› teller ikke som gyldig.»

### 4.2 FR-2 beskriver mekanisme, ikke krav
- **Alvorlighet:** medium
- **Hvor:** FR-2: «jobben startes hvert 10. minutt og henter bare når siste publisering … er minst 50 minutter gammel», «timer … rundt 55 minutter»
- **Problem og hvorfor det betyr noe:** Planlegging av GitHub Actions hører hjemme i arkitekturen. Når mekanismen står i kravet, må PRD-en endres hver gang løsningen justeres, og den testbare kjernen drukner.
- **Forslag:**
  > FR-2: Systemet henter værdata for alle steder minst én gang i timen. *Konsekvenser:* (1) I normal drift er publisert data under 90 minutter gammel (NFR-3). (2) Hver kilde får høyst 10 kall i sekundet, med identifiserende User-Agent. (3) En avbrutt kjøring publiserer ingenting (FR-5).

  Det samme gjelder filbaner og Zod/Node-detaljer i FR-1, FR-3 og FR-7. Behold dem i arkitekturen og henvis til AD-nummer.

### 4.3 Begreper og terskler som testene trenger, er ikke definert
- **Alvorlighet:** medium
- **Hvor:** FR-13: «82 – Svært godt»; FR-12: «minst fire trinn»; FR-17: «dagslystimer»; FR-32 bruker «Utforsk»; §3 Ordliste
- **Problem og hvorfor det betyr noe:** Tekstetikett og fargetrinn kan ikke testes uten grenser (hvilken poengsum gir «Svært godt»?). Ordlisten mangler også Stedsside, Forklaringsside, Utforsk, Kvalitetsrapport, Demomodus og Dataprogram, og teksten veksler mellom «pipeline» og «dataprogram» og mellom «vilkår», «krav» og «kriterium».
- **Forslag:** Legg inn en liten tabell i FR-13: «0–24 Lavt, 25–49 …» (egne grenser), og definer «dagslystime» med kilde. Utvid ordlisten og bruk termene likt.

### 4.4 Uavklart ytelseskrav og en avveining som ikke er synlig
- **Alvorlighet:** medium
- **Hvor:** NFR-1 og SM-1 («Forslaget venter på vedtak»); NFR-3 «under 90 minutter»
- **Problem og hvorfor det betyr noe:** Filtreringen skjer i nettleseren over ~300 steder, så 2 s er trivielt og 500 ms er en annen test. Dessuten ser det ut til at 90-minuttersmålet er det som driver den kompliserte timerlogikken i FR-2, midt i en PRD som ellers er forenklet. Avveiningen står ikke i PRD-en.
- **Forslag:** Vedta ett tall for NFR-1 og si hvordan det måles. Skriv én setning om hvorfor 90 minutter er nødvendig for brukeren, eller vurder et mykere mål (f.eks. «under 3 timer», som allerede er grensen for «utdatert»).

### 4.5 Bør ha-krav uten konsekvenser, og tillitsmålet er valgfritt
- **Alvorlighet:** lav
- **Hvor:** FR-22, FR-24, FR-25 (ingen «Konsekvenser»); §6.2 og §9.3 (brukertesten er «Bør ha-dybde»)
- **Problem og hvorfor det betyr noe:** Hvis disse bygges, vet ikke utvikleren når de er ferdige. Visjonen handler om tillit, men det eneste som måler om brukerne forstår og stoler på SnowScore, er en test som kan hoppes over.
- **Forslag:** Gi hvert krav én testbar linje, f.eks. FR-24: «Valg av ‹skisted› viser bare steder med stedstype skisted; antall treff stemmer med katalogen.» Vurder en minimal brukertest (to–tre personer) som Må ha for SM-3.

## 5. Mekaniske funn

- §0 sier antakelser er «samlet i §9», men de står i §11. §9 er Suksessmål.
- Antakelsesindeksen (§11) har en oppføring for FR-30 («20–30 steder») uten tilsvarende `[ASSUMPTION]` inline. Den utgåtte oppføringen for §6.2 bør fjernes.
- Interne lenker i §0 (`../1-Oppstartsfasen/…`, `SnowFinder-Arkitektur.md`, `../../project-workspace/…`) løser seg ikke fra denne filens plassering, bare fra kopien i `project-phase-folders/`.
- Rekkefølge: FR-32 står etter FR-15, FR-26 er en ren krysshenvisning, og §10 har rekkefølgen 1, 2, 3, 6, 4, 5. ID-ene er ellers unike og komplette (FR-1–32, SM-1–15).
- Begrunnelser henviser til `.memlog.md` («Marys rettelse, se memlogg»). Kritiske begrunnelser bør stå i PRD-en.

## 6. Før dere går videre

**Må avklares før UX, arkitektur og epics:**
- Hvilken PRD som er gjeldende. Det finnes to filer (`prd.md` her og `project-phase-folders/2-Planleggingsfasen/SnowFinder-PRD.md`), og PRD-en viser dessuten til et tredje dokument, `SnowFinder-PRD-og-SRS.html`, med egne krav-ID-er (SRS-N-01). Jeg har bare vurdert `prd.md`. Velg én kilde til sannhet.
- NFR-1 (2 s eller 500 ms) og grensene for SnowScore-etikettene (4.3).

**Kan vente:** §10 spørsmål 4 (5 000 samtidige brukere) har liten praktisk betydning for statiske filer og kan lukkes. Sorteringsdetaljer og rydding av versjonsmerknader kan tas i en vanlig redigeringsrunde.

**Oppfølging av briefen-tilbakemeldingen: ja.** Lokal demomodus er et Må ha-krav (FR-30), pipelinen er forenklet, snøvarsel og tilbakemelding er flyttet ut, suksessmålene er delt etter verifisering, og fasittabeller finnes for skivindu og filter.

## 7. Refleksjonsspørsmål

1. §0 sier PRD-en ble skrevet «i én sammenhengende agent-økt … ikke gjennom flere runder brukersamtale». Hvilke krav har dere siden endret eller strøket etter egne vurderinger, og hvordan sjekket dere at endringene ikke ødela andre krav?
2. FR-2 har vokst fra «hent hver time» til en kjede av cron og timere. Når mente dere at kompleksiteten ikke lenger sto i forhold til nytten av 90-minuttersmålet, og hvem bestemte det?

_Vurdert mot kvalitetsrubrikken i bmad-prd. Dette er veiledning, ikke sensur._
