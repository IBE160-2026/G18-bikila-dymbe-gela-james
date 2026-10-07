# Review av PRD v2 (SnowFinder)

Gjennomgått: `prd.md` (v2, 2026-10-07) mot endringsforslaget P1–P9, faglærers tilbakemelding og PRD-rubrikken. PRD-en er ikke endret.

## Samlet vurdering

v2 dekker alle ni punkter P1–P9 og faglærers tre «neste steg», og de gamle påstandene (køstyrt gjenopptak, kretsbryter som Må ha) er borte fra Må ha. De alvorligste svakhetene er tre.
- Demomodus (FR-30) er ikke forenlig med reglene for datafriskhet (FR-16/NFR-3).
- Den andre kopien av PRD-en (`project-phase-folders/2-Planleggingsfasen/SnowFinder-PRD.md`) mangler v2 helt.
- Det er en hengende henvisning til `NFR-QA`, og flere Bør ha-ting ligger inne i Må ha-flyten.

## 1. Avstemming

### 1.1 Endringsforslaget P1–P9

| # | Dekket? | PRD-sted | Merknad |
|---|---|---|---|
| P1 FR-30 demomodus, ny §4.7 | Ja | §4.7 FR-30, §6.1 | Alle seks konsekvenser fra forslaget er med. Se funn H1 (tid) og M3 (Bør ha-funksjoner i demomodus). |
| P2 FR-2 forenklet | Ja | FR-2 | Køstyrte puljer er merket Bør ha. |
| P3 FR-6 delt | Ja | FR-6a/6b | Overskriften på FR-6 har ingen prioritetsmerking, men det går fram av 6a/6b. |
| P4 NFR-DQ1–3 | Delvis | §7.2b | Teksten er med. DQ1 mangler en testbar konsekvens og hvor ordboken ligger (M2). |
| P5 NFR-6 Bør ha | Ja | NFR-6 | Se M5 om overlapp mellom `api_incidents` i FR-3 og NFR-6. |
| P6 fasit for skivindu og filter | Ja | FR-17, FR-20, FR-14 | Se M1 og M6 om hva fasittabellen testes mot. |
| P7 §9 delt i tre | Ja | §9.1–9.3 | SM-9/10/11 er nye. Se M4 om merking av Bør ha. |
| P8 §6 MVP-omfang og halvveis-regel | Ja | §6.1, §6.2 | Se M7. |
| P9 åpent spørsmål 3 lukket | Ja | §10 punkt 3 | Nummereringen i §10 er i uorden (L2). |

«Begge kopier» i P1–P9 er **ikke** oppfylt. Se H2.

### 1.2 Faglærers tilbakemelding (PRD-relevante punkter)

| Punkt | Dekket? | PRD-sted |
|---|---|---|
| Neste steg 1: lokal kjøring med demodata, `.env.example`, test fra rent klon | Delvis | FR-30 og §9.2 «Kjørbarhet». «Test tidlig» er ikke et krav i PRD. Kjørbarhet har ingen ID og ingen bestått-terskel (M8). |
| Neste steg 2: forenkle pipeline, flytte varsel og tilbakemelding | Ja | FR-2, FR-6a/b, NFR-6, §6.2 (halvveis-regel). |
| Neste steg 2: merk stories som Må ha | Utenfor PRD (epics) | PRD merker FR-ene. Mangler på overskriften til FR-6. |
| Neste steg 3: del suksesskriteriene | Ja | §9. |
| Neste steg 3: fasit for skivindu | Ja | FR-17. |
| Neste steg 3: fasit for filter | Ja | FR-20/FR-14. |
| Forslag 1: demomodus som Må ha | Ja | FR-30, §6.1. |
| Forslag 2: én jobb, robusthet til Bør ha | Delvis | FR-5 beholder «samtidige kjøringer blokkeres» i Må ha (M7b). |
| Forslag 3: utsett varsel og tilbakemelding | Ja | §6.2. |
| Brief 1.3: funksjonelle kriterier for kjerneflyten, merk Bør ha | Delvis | SM-9 er med. SM-ene er ikke merket Må ha/Bør ha (M4). |
| Ryddighet 7: gjeldende kopi | Nei | Se H2. |
| Brief: «What makes this different» (yr.no, Skiinfo) | Utenfor PRD | Gjelder briefen. §1 Visjon nevner ikke konkurrenter (L1). |
| Ingeniørnivå: Story 2.5, analyse mot NVE | Nei | PRD har ingen FR eller SM som story 2.5 kan realisere (M9). |

## 2. Funn etter alvorlighet

### Høy

**H1. Demomodus mot datafriskhet (§4.7 FR-30 mot FR-16, NFR-3, §3).**
- Demodata bygges reproduserbart fra faste fixtures, så tidsstemplene er faste.
- FR-16 og NFR-3 måler alder mot «nå»: over 3 timer er «utdatert», og over 12 timer fjernes stedet fra kart og filter.
- Resultat: allerede noen timer etter bygging er alle demosteder fjernet fra kartet. Kravet om «ett sted med utdaterte data» kan heller ikke gjøres deterministisk.
- *Fix:* Definer en demoklokke. Enten fryses «nå» i demomodus til tidspunktet fixtures ble hentet, eller `demo:data` setter tidsstempler relativt til byggetidspunktet og legger til en forskyvning. Skriv forskyvningen inn i FR-30 og i testen for reproduserbarhet.

**H2. Den andre PRD-kopien mangler v2 (hele dokumentet, §0).**
- `project-phase-folders/2-Planleggingsfasen/SnowFinder-PRD.md` har null forekomster av FR-30 og skiller seg fra denne filen.
- P1–P9 gjelder «begge kopier», og faglærer (punkt 7) ba om at gjeldende kopi er tydelig og at kopiene ikke sprikker.
- PRD-en sier heller ikke selv hvilken kopi som gjelder.
- De relative lenkene i §0 stemmer bare fra kopien i `2-Planleggingsfasen/`. Fra denne filen peker de feil. Eksempel: `../1-Oppstartsfasen/...` og `../../project-workspace/planning-artifacts/sprint-change-...`.
- *Fix:* Synk kopiene, legg inn en linje øverst om hvilken som gjelder, og rett lenkene eller bruk repo-relative stier.

**H3. Hengende henvisning `NFR-QA` (FR-7 linje 227, FR-19 linje 369).**
- `NFR-QA i §7` finnes ikke. §7 har ingen QA-NFR, bare §6.1 «reelle QA-minimumet».
- Både egenskapstestene (1000 inndata) og sikkerhetstestene av avmelding peker dit.
- *Fix:* Innfør `NFR-QA` i §7 (testminimum i CI: egenskapstester, kontraktstester, fasit, E2E-røyktest, axe), eller pek på §6.1 og SM-6.

**H4. Bør ha-funksjoner i Må ha-flyten (UJ-1, FR-4, FR-30, SM-10).**
- UJ-1 steg 5 viser «beste skivindu lørdag kl. 10–14». Beste skivindu er Bør ha (FR-17, utenfor MVP §6.2), så UJ-1 kan ikke gjennomføres som skrevet i MVP.
- FR-4 (Må ha) krever at pipelinen beregner «beste skivindu», mens FR-17 er Bør ha.
- FR-30 (Må ha) krever demosted «i mørketid», men stedssiden (FR-16, Må ha) har ingen skivinduvisning der tilstanden kan sees.
- SM-10 (CI, blokkerer merge) validerer FR-17 (Bør ha) og dermed en funksjon som kan utsettes.
- *Fix:* Velg en retning.
  - **Alternativ A:** Hold skivindu som Bør ha. Fjern det fra UJ-1 og FR-4, og marker mørketid-demosted og FR-17 som «når FR-17 er bygget».
  - **Alternativ B:** Flytt FR-17 til Må ha. Det motsier P3/P6 og forslagets strategi om omfanget, så det krever founder-/gruppeavklaring.

**H5. Fasittabellen for filter testes mot to ulike implementasjoner (FR-20, NFR-1).**
- FR-20 krever en «parameterisert databasefunksjon» (SQL, for NFR-1) og samtidig at fasittabellen testes «mot samme filterlogikk … både i demomodus og mot databasen».
- Forslaget (P6/A1) sier at filterfunksjonen er felles i `shared/`. Det er en TypeScript-funksjon, ikke SQL.
- Å teste mot databasen krever dessuten Supabase i CI, mens SM-9/demo-argumentet bygger på at CI ikke trenger det. SM-10 sier ikke hvilken av variantene det gjelder.
- *Fix:* Presiser at det er to implementasjoner (felles TS-funksjon for demo, SQL-funksjon for Supabase) som begge må gi fasitresultatet. Avgjør om DB-varianten er CI-blokkerende (krever Supabase CLI i CI) eller Bør ha, og skriv det inn i SM-10.

### Middels

- **M1. FR-14 og FR-20 refererer hverandre sirkulært.** FR-14: «dekkes av fasittabellen … (se FR-20)». FR-20 sier fasit «viser … forventet forslag ved null treff (FR-14)». Fasit-tabellen ligger bare i FR-20. *Fix:* Si det eksplisitt i FR-14 med én henvisning, og drop tilbakereferansen.
- **M2. NFR-DQ1 er ikke testbar.** «Dokumentert som en dataordbok» mangler sted, format og kontroll. *Fix:* Nevn filen (f.eks. `docs/data-dictionary.md`) og en test eller sjekk som feiler hvis Zod-skjema og ordbok spriker.
- **M3. Bør ha-funksjoner i demomodus er uavklart (FR-30, FR-18/19/27/28).** Hva skjer med «Varsle meg» og tilbakemeldingsskjemaet i demomodus? Porten i AD-10 har bare lesemetoder. *Fix:* Skriv at skrivefunksjoner er skjult eller deaktivert med forklaring i demomodus, og test det.
- **M4. Suksessmålene er ikke merket Må ha/Bør ha.** Faglærer ba om det. SM-10 (inkl. FR-17) og SM-C1 (FR-19) hører til Bør ha-funksjoner. *Fix:* Legg til en kolonne eller et merke per SM. SM-C1 og SM-C2 står under «brukertest (C)», men er ikke brukertestmål. Flytt dem til en egen overskrift «Mot-metrikker».
- **M5. To feillogger uten angitt forhold.** FR-3 skriver avvist svar til `api_incidents` (Må ha). NFR-DQ2 teller «avviste svar per kilde» i `pipeline_runs`. NFR-6 (Bør ha) sier at `api_incidents` skal brukes sammen med aktiv varsling. *Fix:* Skriv hvilken tabell som er kilden til hva, og at `api_incidents` er Må ha mens varslingen er Bør ha.
- **M6. FR-9 og FR-8 mangler testbare konsekvenser for v2.** SM-10 sier at regneeksempelet «passerer» som fasit, men FR-9 har bare en visningskonsekvens. FR-8 sier ingenting om panelet for datakvalitet som NFR-DQ2 krever. *Fix:* Legg til at regneeksempelet kjøres som test mot `shared/snowscore.ts`, og at forklaringssiden viser siste kjørings kvalitet.
- **M7. «Samtidige kjøringer blokkeres» og idempotens i FR-5 (Må ha).** Faglærer nevner nettopp dette som tungt. Det er rimelig å beholde siden det er en enkelt jobb, men det bør være et bevisst valg. *Fix:* Skriv en setning om hvorfor låsen er igjen, eller flytt den til Bør ha.
- **M8. «Kjørbarhet» i §9.2 mangler ID og bestått-terskel.** Faglærer ba om å teste tidlig. *Fix:* Gi den en SM-ID (f.eks. SM-12), legg til «første gang senest etter Story 1.10, deretter før hver innlevering» og en terskel (f.eks. oppstart under 10 minutter uten hjelp).
- **M9. Ingen krav bærer analyse-storyen (Story 2.5, E9).** Den kan ikke sitere en FR. *Fix:* Legg til en Bør ha-FR (eller et SM) for «vurdering av SnowScore mot NVEs modellerte nysnø», eller si at den er et prosjektleveranse utenfor produktkravene.
- **M10. Sammenblanding av NFR og SM i §9.2.** «NFR-2» og «NFR-3» står som punkter uten SM-ID mens SM-1 har ID. NFR-3 måles «over minst én uke i drift», uten at drift er definert. Utdatert-merkingen (3 t/12 t) har ingen automatisk test, selv om SM-4 hviler på den. *Fix:* Gi dem SM-ID-er og legg til en CI-test for 3 t/12 t-grensene (kan bruke demoklokken fra H1).

### Lav

- **L1.** Visjonen (§1) nevner ikke yr.no/Skiinfo. Rubrikken om «innovation theater» gir ikke utslag, men faglærer ba om en differensiering (briefen, B1). Vurder én setning i §1.
- **L2.** §10 er nummerert 1, 2, 3 (overstrøket), 6, 4, 5. *Fix:* Nummerer om til 1–5 eller flytt punkt 6 ned.
- **L3.** Ordlisten mangler «demomodus», «fasittabell», `pipeline_runs`, «Utforsk» (brukt i SM-9). Under «Datakilde-nedetid» står «pipelinen fortsetter å publisere siste gyldige data», som motsier FR-5/FR-6a (ingenting publiseres, klienten viser forrige batch).
- **L4.** §7.3 NFR-5 (Turnstile, hastighetsbegrensning) og NFR-Privacy gjelder bare Bør ha-funksjoner, men har ingen prioritet. Merk dem for å unngå at de leses som MVP-krav.
- **L5.** FR-30 gjelder «ingen nettverkskall til MET/NVE». Kartfliser fra OpenStreetMap trenger likevel nett. Si det i README-kravet og i røyktesten (stub fliser i CI).
- **L6.** FR-20 fasit bruker 5–8 steder, mens antagelsen i §11 sier at demosettet økes hvis fasittabellen trenger det. Avklar om fasitstedene er en delmengde av demosettet.
- **L7.** SM-7 sier «null kritiske brudd» (axe), mens NFR-7 krever AA «i sin helhet». Axe fanger ikke alt. Legg til en manuell sjekk eller skriv «automatisk del».
- **L8.** FR-ene lekker implementasjon (tabellnavn, filstier). Akseptabelt for denne PRD-en siden arkitekturen refereres, men notér det.

## 3. Rubrikken

| Dimensjon | Vurdering | Begrunnelse |
|---|---|---|
| Beslutningsklarhet | Sterk | Avvegningene er synlige (WCAG-unntak for kartet, 1000 mot 10 000 tester, halvveis-regel). v2 sier hva som ble gitt opp og hvorfor. |
| Substans mot teater | Sterk | NFR-ene har tall (2 s, 3 s, 90 min, 95 %). Tre brukerreiser med navngitte personer styrer faktiske krav. |
| Strategisk sammenheng | Tilstrekkelig | Tese og mot-metrikker finnes. Prioriteringen flytter vekt fra drift til kjørbarhet, men H4 viser at brukerreisene ikke er justert etter ny MVP. |
| Ferdig-klarhet | Tilstrekkelig | De fleste FR-er har testbare konsekvenser. Svake: NFR-DQ1, FR-8, FR-9, FR-14 (M1, M2, M6). H5 gjør fasiten tvetydig. |
| Ærlighet om omfang | Sterk | Ikke-mål, `[ASSUMPTION]` og halvveis-regel er eksplisitte. Antagelsesindeksen stemmer med de innebygde merkene. |
| Bruk nedstrøms | Tilstrekkelig | ID-ene er stabile, og FR-6a/6b har ingen hengende `FR-6`-henvisninger. Brudd: `NFR-QA`, SM-ene som står som NFR (M10), den utdaterte kopien og lenkene (H2, H3). |
| Formfit | Sterk | Forbrukerprodukt med tre navngitte brukerreiser, riktig form. |

## 4. Mekaniske merknader

- **Henvisninger til FR-6:** ingen hengende. NFR-4, NFR-6, SM-5, NFR-DQ2 peker riktig på 6a/6b.
- **FR-26:** «Må ha, dekket av FR-14» er ok som kryssreferanse.
- **SM-ID-er:** SM-1…SM-11 er unike. Rekkefølgen i §9.1 (9, 10, 11, 5, 6, 7, 8) er uvant, men ok. SM-C1/C2 er sitert riktig.
- **Fjernet atferd:** søk etter køstyrt gjenopptak og kretsbryter som Må ha gir bare Bør ha-treff (FR-2, FR-6b, §6.2). Den eneste rest-uoverensstemmelsen er ordlisten (L3).
- **Antagelsesindeks:** §7.5, SM-6, §6.2 og FR-30 er både innebygd og indeksert.
- **§0:** v2-sammendraget nevner ikke halvveis-regelen eller delingen i 6a/6b ved navn (6b står under «robusthetsmaskineri»). Legg gjerne til én linje.

## 5. Triage (John, 2026-10-07)

| Funn | Avgjørelse |
|---|---|
| H1 demoklokke | Rettet: fast «demo-nå» i FR-30, ny SM-15 tester 3 t/12 t-grensene |
| H2 andre kopi | Rettet ved synkronisering til `project-phase-folders/` før commit (planlagt siste steg) |
| H3 NFR-QA | Rettet: henviser til SM-6 og §6.2 |
| H4 skivindu i Må ha-flyt | Rettet: FR-17 forblir Bør ha (som i godkjent forslag); UJ-1, FR-4, FR-30 og SM-10 sier «når FR-17 er bygget» |
| H5 to filterimplementasjoner | Rettet i FR-20: begge skal gi fasit; delt logikk CI-blokkerende nå, DB-varianten når CI har lokal database; arkitekturen avgjør (AD-10, Winston) |
| M1–M10 | Rettet (M1 FR-14/20, M2 dataordbok-test, M3 skrivefunksjoner i demomodus, M4 merking og egen §9.4, M5 api_incidents vs pipeline_runs, M6 FR-8/FR-9, M7 begrunnet lås, M8 SM-14 med terskel, M9 ny FR-31, M10 SM-12/13) |
| Lave funn | Ikke behandlet enkeltvis; vurderes i neste PRD-runde |
