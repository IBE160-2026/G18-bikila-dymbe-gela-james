# Uavhengig gjennomgang: forenklingsrunden 2026-10-07

Omfang: produktbrief, PRD v3 og arkitektur v4, mot endringsforslaget
`sprint-change-proposal-2026-10-07-forenkling.md`. Produktbriefens to kopier er identiske.
Bare dette dokumentet er skrevet; ingen andre filer er endret.

**Dom:** Forenklingen er gjennomført nesten rent: Supabase, push, PWA og tilbakemelding er borte
fra v1 i alle tre dokumenter. Men den har gjort tre ting uavklart som v1 trenger (tilstand
mellom kjøringer, historikk, demo mot 95 %-terskelen), og noen få gamle rester står igjen.

## 1. Rester av fjernede deler i v1-tekst

Brief og arkitektur er rene. Treff i briefen (§Scope, §Product Vision) og arkitekturen
(§Deferred) står bare som «Ikke i v1» eller som begrunnelse. I PRD-en står disse igjen utenfor
«Ikke i v1»-seksjonene:

| Sted | Problem | Rettelse |
|---|---|---|
| PRD §2.1, andre funksjonelle JTBD | «Vit når et sted jeg følger med på faktisk får de forholdene…» beskriver snøvarsel som v1-jobb | Marker «Ikke i v1» som UJ-2, eller fjern |
| PRD FR-16 og NFR-3 (§7.2) | «fjernes fra kart/filter/**varsler**» | Fjern «varsler» |
| PRD §3 «Publisert batch» | Henviser til «AD-2/AD-3»; AD-3 er pensjonert | «AD-2» |
| PRD §8.3 | «gruppens IP/**nøkkel**» blokkeres; MET krever ingen nøkkel (NFR-5, AD-1) | «gruppens IP-adresse eller User-Agent» |
| PRD §11 (§6.2-linjen) | «Sikkerhetstester for feedback/varsel-skrivepath» finnes ikke lenger | Fjern linjen |
| PRD §6.1 | `.env.example` i Må ha, mens arkitekturen sier at ingen konfigurasjon trengs, bare et valgfritt User-Agent-kontaktfelt | Behold bare hvis den har innhold; ellers fjern |
| PRD FR-4 | «midlertidig **kjøringsfil**» motsier AD-2 («ingen stage skriver mellomfil») | «videre i `RunContext`» |
| DESIGN.md og EXPERIENCE.md | Står i spinens `sources`, og er etter overleveringen ikke oppdatert (Sally) | Allerede planlagt; ikke i denne runden |

## 2. Motsigelser mellom dokumentene

1. **Hosting.** Briefen og spinen sier GitHub Pages som fast teknologi. PRD §10 punkt 2 og spinens
   Stack-tabell kaller det en antagelse som må bekreftes. Velg én formulering. Forslag: «foreslått,
   bekreftes av gruppa» overalt, eller lås det.
2. **Kretsbryter.** Briefen sier bare «nye forsøk». PRD FR-6b legger til kretsbryter med
   «avkjølingsperiode». Spinen sier at FR-6b «ikke har tilstand mellom kjøringer». En avkjølingsperiode
   uten tilstand er bare en teller innen én kjøring, og da er den overflødig (se §4).
3. **Kjøringshistorikk.** PRD NFR-DQ2 krever «en kort historikk», og spinen gjør `runs.json` til Må ha.
   Briefen nevner bare «hver kjøring lagrer en kvalitetsrapport» og sier ikke hvor lenge.
   Må ha-nivået er ulikt i tre dokumenter.
4. **Varsling.** Briefen og PRD NFR-6 sier at GitHub «varsler gruppa» ved feilet jobb. GitHub varsler
   i praksis bare den som sist endret `cron`-linjen i workflow-filen (og bare etter egne
   varslingsinnstillinger), ikke hele gruppa.
5. **Node-versjon.** Spinen sier «Node 24 LTS» i Stack og «Node 24 or 26+» i Running Locally.
   Velg ett.
6. Mål, MoSCoW-lister og filnavn stemmer ellers (brief §Scope mot PRD §6, `latest.json`, `demo.json`,
   `data:demo`). Suksesskriteriene i briefen følger PRD §9 uten avvik.

## 3. Det forenklingen har ødelagt eller latt uavklart

1. **Tilstand mellom kjøringer (FR-2).** PRD krever `If-Modified-Since`/`Expires` mot MET: «ingen ny
   henting før `Expires` er passert for et gitt sted». Det trenger lagret `Expires` og `Last-Modified`
   per sted. En ny GitHub-runner hver time har ingen database og ingen fil fra forrige kjøring.
   Kravet kan ikke oppfylles slik spinen er tegnet. Velg: lagre dem i `runs.json`/en cache
   (mer tilstand), eller si at v1 henter alle steder hver time med identifiserende User-Agent og
   begrenset samtidighet, og stryk `If-Modified-Since`/`Expires` fra FR-2.
2. **Hva skjer med steder som feiler i en vellykket kjøring?** 95 %-regelen lar opptil 5 % ugyldige
   steder slippe gjennom. Før lå forrige verdi igjen i databasen med eldre tidsstempel, og
   3 t- og 12 t-reglene (NFR-3) virket per sted. Nå bygges datafilen på nytt hver time. Hverken PRD
   eller spin sier om et mislykket sted (a) utelates, (b) får forrige post med gammelt `source
   timestamp` (krever å lese forrige fil), eller (c) merkes «ufullstendig». Uten svar kan 12 t-regelen
   per sted ikke testes. Anbefalt: (a)/(c), så enkelt som mulig, og skriv det i AD-2.
3. **Mislykkede kjøringer blir ikke publisert.** AD-11 og SM-11 sier at også en mislykket kjøring
   skriver en rapport (`finally`). Men `data.yml` «deployer til Pages bare hvis publisert». En
   mislykket rapport når aldri `runs.json` på Pages, så historikken viser bare vellykkede kjøringer
   og SM-13 (ferskhet fra rapportene) blir skjev. Løs: la jobben alltid deploye `runs.json` (men bare
   bytte `latest.json` ved publisering), eller ta rapportene som workflow-artifacts/jobbsammendrag.
4. **Startproblem for `runs.json`.** Jobben «henter først publisert `runs.json`». Første kjøring,
   kjøring etter manuell Pages-feil og lokal `npm run data` har ingen slik fil. Spesifiser fallback
   (tom historikk), og at nedlastingsfeil ikke stopper kjøringen.
5. **Vanlig kode-deploy.** Bare `data.yml` (hver time) deployer til Pages. Hva deployer en merge til
   `main`? Hvis den bygger uten å hente siste `latest.json`, viser nettsiden `demo.json` i produksjon
   (`src/lib/data/` faller tilbake til demo når `latest.json` mangler). Spesifiser at deploy alltid
   henter publisert `latest.json` og `runs.json` først, og at produksjonsbygget **ikke** faller
   tilbake til demo ved nettverksfeil (bare ved 404 i lokal utvikling). Ellers kan en forbigående
   feil vise demodata som om de var ekte.
6. **Demo mot 95 %-terskelen.** FR-30 gir 20–30 demosteder og krever minst ett «ufullstendig» sted.
   Katalogen har ~300 steder. Kjører `data:demo` med hele katalogen, er bare ~25 av 300 gyldige og
   publisering stoppes. Med en egen demokatalog på 25 steder tåler terskelen bare ett ugyldig sted
   (1/25 = 4 %; to gir 92 %). Det er heller ikke definert om «ufullstendig» og «utdatert» teller som
   ugyldig. Definér: terskelen teller bare avviste svar, ikke «ufullstendig», og demo bruker en egen
   liten katalog.
7. **Reproduserbart demodatasett mot kvalitetsrapport.** FR-30 krever at samme fixtures gir
   samme fil (testet). NFR-DQ2 krever starttid og varighet, og AD-11 en kjørings-ID. Disse er ikke
   deterministiske. Spesifiser at `data:demo` bruker fast `referenceTime`, fast kjørings-ID og
   `durationMs: 0`.
8. **FR-31 har ingen datakilde.** Analysen «prognose mot NVE i etterkant, over en periode» trenger
   lagrede prognoser. `runs.json` har bare rapporter. Spinen skyver det til Story 2.5. Det er Bør ha,
   men holder FR-31 oppe i briefen og PRD. Enten flytt FR-31 til «Ikke i v1», eller beslutt nå at jobben
   lagrer et daglig kompakt snapshot som workflow-artifact.
9. **Pages og planlagte jobber.** GitHub slår av planlagte workflows i offentlige repoer etter 60 dagers
   inaktivitet, og `cron` kan bli forsinket. Ferskhetsmålet (<90 min) og risikotabellen i briefen nevner
   ingen av delene. Legg til som risiko, med tiltak (manuell `workflow_dispatch`, og at siste data
   vises med tydelig alder, som allerede er designet).

## 4. Fortsatt mer komplekst enn faglærers råd krever

Faglærers råd var å fjerne det som krever konto, nøkler og manuelt oppsett utenfor koden. Det er
gjort. Det som gjenstår er ikke nødvendig for å oppfylle Må ha:

- **`runs.json` med 48 rapporter og «last ned forrige, legg til, trim».** Dette er den eneste
  tilstanden mellom kjøringer og skaper punktene 3.3 og 3.4. Enklest: bare siste rapport i datafilen
  (Må ha). Historikk som Bør ha, via workflow-artifacts. Det oppfyller fortsatt NFR-DQ2 minus
  «historikk» (som PRD bør endres til «Bør ha»).
- **Kretsbryter (FR-6b).** Uten tilstand mellom kjøringer er den lite verdt. Behold «nye forsøk med
  ventetid» (Bør ha), fjern kretsbryteren.
- **To kopier av planleggingsdokumentene med CI-sjekk av likhet** (spin §Deferred). Hold én
  kilde (`project-phase-folders/`), og la `project-workspace/` peke dit.
- **Tre workflows (`ci.yml`, `e2e.yml`, `data.yml`).** `ci.yml` og `e2e.yml` kan være én jobb med to
  steg; to filer er ikke nødvendig før kjøretiden krever det.
- **`src/lib/snowscore.ts` som re-eksport av `shared/snowscore.ts`.** Importer `shared/` direkte.
- **AD-6 `[OPEN]` om Node-typestripping mot Vite.** Velg `tsx` nå, fjern det åpne spørsmålet, så
  Story 1.3 slipper å gjette. Det er ett dev-avhengighetsvalg, ikke ny infrastruktur.
- **`src/lib/clock.ts` med lint-regel mot `Date.now()`.** Forsvarlig for demoklokka (SM-15), men en
  lint-regel er mer enn en enkel konvensjon trenger. Behold klokka, dropp lint-regelen til den
  trengs.

## 5. Prioriterte funn

1. Spec: `If-Modified-Since`/`Expires` (PRD FR-2) kan ikke oppfylles uten tilstand (3.1).
2. Spec: mislykkede steder i en vellykket kjøring er udefinert, og 12 t-regelen per sted avhenger av det (3.2).
3. Spec: mislykkede kjøringer blir aldri synlige fordi deploy bare skjer ved publisering (3.3/3.4).
4. Spec: kode-deploy kan vise `demo.json` i produksjon (3.5).
5. Spec: demomodus mot 95 %-terskelen og mot reproduserbarhet (3.6/3.7).
6. PRD: rester av varsel, nøkkel og AD-3 (§1).
7. Forenkling: `runs.json`-historikk og kretsbryter (§4).
8. FR-31 mangler datakilde (3.8).

## Triage (2026-10-07)

| Funn | Avgjørelse |
|---|---|
| 1. `If-Modified-Since`/`Expires` uten tilstand | Rettet: kravet er fjernet. Hvert sted hentes én gang i timen (PRD FR-2, §8.3). |
| 2. Steder som feiler i en publisert kjøring | Rettet: de vises som «ufullstendige data». Filen bærer aldri gamle verdier (PRD FR-6a, AD-2). |
| 3. `runs.json` viser aldri feil | Rettet ved å forenkle: `runs.json` er fjernet. Rapporten ligger i datafilen eller i jobbloggen og som artifact (AD-11, NFR-DQ2). |
| 4. Produksjon kan vise demodata | Rettet: bygget i `data.yml` feiler uten `latest.json`, og all deploy går via `data.yml` (AD-10). |
| 5. Demo mot 95 %-terskelen og determinisme | Rettet: egen demokatalog, terskelen teller bare avviste svar, fast referansetid, fast kjørings-ID og varighet 0 (FR-30, AD-10). |
| 6. PRD-rester | Rettet: JTBD, «varsler», AD-3-referansen, IP/nøkkel, §11 og kjøringsfil. |
| 7. Mer forenkling | Rettet: historikkfilen og kretsbryteren er fjernet, og `tsx` er valgt (AD-6 er ikke lenger åpen). De to dokumentkopiene beholdes etter gruppas regel. |
| 8. FR-31 og varsling | Rettet: FR-31 er «Ikke i v1». Formuleringen om varsling er korrigert, og risikoen for at jobben slås av etter 60 dager er lagt i Deferred. |
