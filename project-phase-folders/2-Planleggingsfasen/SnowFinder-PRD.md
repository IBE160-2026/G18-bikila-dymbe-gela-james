---
title: SnowFinder
created: 2026-09-27
updated: 2026-10-07
status: draft
---

# PRD: SnowFinder

**IBE160 Programmering med KI | Gruppe G18**

## 0. Formål med dokumentet

Denne PRD-en oversetter den rettede produktbriefen
([SnowFinder-Produktbrief.md](../1-Oppstartsfasen/SnowFinder-Produktbrief.md)) til presise,
testbare krav for Sally (UX), Winston (arkitekt, oppdaterer
[SnowFinder-Arkitektur.md](SnowFinder-Arkitektur.md)) og Amelia (utvikler). Den bygger på briefen
og på Marys rettelser (begrunnelser i
`project-workspace/planning-artifacts/.memlog.md`) — den gjentar dem ikke, men presiserer dem til
funksjonelle krav (FR) med akseptansekriterier, ikke-funksjonelle krav (NFR) og en eksplisitt
MVP-avgrensning. Ordlisten i §3 er bindende vokabular for resten av dokumentet og for alt som
bygger videre på det (UX-spesifikasjon, arkitektur, epics/stories).

**Merknad om prosess:** Denne PRD-en er skrevet i én sammenhengende agent-økt (John, PM-agenten)
rett etter Marys brief-rettelser, ikke gjennom flere runder brukersamtale. Der noe er antatt
fremfor bekreftet med gruppa, er det merket `[ASSUMPTION]` inline og samlet i §9 — dette er
Fast-path-modus, ikke Coaching-modus.

**v2 (2026-10-07):** Oppdatert etter faglærers tilbakemelding på produktbriefen (2026-10-06),
gjennom en godkjent endringsrunde
([sprint-change-proposal-2026-10-07.md](../../project-workspace/planning-artifacts/sprint-change-proposal-2026-10-07.md)).
- Ny Må ha: lokal demomodus (FR-30), så sensor kan kjøre appen uten gruppas tjenester.
- Pipelinens robusthetsmaskineri er flyttet til Bør ha (FR-2, FR-6, NFR-6).
- Nye datakvalitetskrav (NFR-DQ1–3).
- Fasittabeller for skivindu og filter (FR-14, FR-17, FR-20).
- Suksessmålene i §9 er delt etter hvordan de verifiseres.

**v3 (2026-10-07), forenkling:** En andre godkjent endringsrunde
([sprint-change-proposal-2026-10-07-forenkling.md](../../project-workspace/planning-artifacts/sprint-change-proposal-2026-10-07-forenkling.md))
fjerner de delene faglæreren pekte på som mest kompliserte:
- **Ingen database.** Pipelinen er et Node-script (`npm run data`) som publiserer én JSON-datafil,
  og appen filtrerer i nettleseren.
- **Snøvarsel** (FR-18/19, UJ-2) og **tilbakemelding** (FR-27/28/29) er flyttet til «Ikke i v1».
- Det finnes ingen skriving fra brukere, ingen hemmeligheter og ingen lagrede identifikatorer.

FR-ID-ene er stabile og nummereres aldri om.

## 1. Visjon

SnowFinder svarer på ett spørsmål et fragmentert utvalg værtjenester ikke svarer på i dag: «Hvor
i Norge oppfylles kravene mine akkurat nå?» I stedet for at brukeren selv skal sjekke flere
kilder og tolke rådata, viser SnowFinder et fargelagt Norgeskart der hvert sted har én
forklarbar poengsum — **SnowScore** — og lar brukeren filtrere direkte på egne krav («minst 15 mm
nysnø, vind under 6 m/s»). Kjernen er tillit: formelen er åpen og etterprøvbar, dataalderen vises
alltid, og tjenesten er ærlig om at den viser prognoser og modellerte forhold — aldri en garanti
for føre eller sikkerhet. For skientusiaster og turgåere blir SnowFinder det første stedet de
sjekker før de bestemmer seg for hvor de skal denne helgen.

## 2. Målgruppe

### 2.1 Jobber brukeren skal løse (JTBD)

- **Funksjonelt:** «Finn steder der forholdene mine (nysnø, vind, temperatur) er oppfylt, uten å
  sjekke flere tjenester manuelt.»
- **Funksjonelt** *(ikke dekket i v1, kommer med snøvarsel)*: «Vit når et sted jeg følger med på
  faktisk får de forholdene jeg venter på, uten å måtte sjekke selv hver dag.»
- **Emosjonelt:** «Stol på tallet jeg ser — vis meg hvorfor, ikke bare hva.»
- **Kontekstuelt:** «Bestem raskt, ofte fra mobil rett før en tur, med treg eller ingen dekning
  underveis (data må være ferskt *før* jeg drar).»

### 2.2 Ikke-brukere i v1

- Brukere som trenger skredfarevurdering eller løypestatus i sanntid — SnowFinder lenker videre
  til Varsom.no for dette, men erstatter det aldri (se §5 Ikke-mål).
- Brukere som ønsker konto, lagrede profiler på tvers av enheter, eller sosiale funksjoner —
  bevisst utelatt i v1 (se produktbriefens begrunnelse: enklere løsning, mindre angrepsflate).
- Brukere utenfor Norge / steder utenfor stedskatalogen (~300 steder i v1).

### 2.3 Sentrale brukerreiser

- **UJ-1. Sena planlegger helgetur til et skisted med nok nysnø.**
  - **Person + kontekst:** Sena er skientusiast og vil bestemme hvor hun skal kjøre i helgen.
  - **Inngangstilstand:** Ingen innlogging (krever ikke konto). Åpner SnowFinder på mobil
    torsdag kveld.
  - **Sti:** (1) Åpner Norgeskartet, ser fargede punkter. (2) Åpner filteret, setter minimum
    15 mm nysnø neste 24 t og maks vind 6 m/s. (3) Kartet oppdaterer antall treff live mens hun
    justerer glidebryterne. (4) Trykker på et blått punkt i Trøndelag. (5) Stedssiden viser
    SnowScore 82, delpoeng, og (når Bør ha-funksjonen FR-17 er bygget) beste skivindu lørdag
    kl. 10–14.
  - **Klimaks:** Hun ser akkurat hvorfor stedet scorer høyt (delpoengene), ikke bare tallet, og
    stoler på det.
  - **Oppløsning:** Hun bestemmer seg for stedet og deler lenken (filterverdier er i URL-en) med
    kjøreselskapet.
  - **Edge case:** Ingen steder oppfyller kravet — appen foreslår hvilket krav hun bør lempe
    (f.eks. «Ingen treff. Prøv vind under 8 m/s i stedet»), i stedet for en tom liste uten
    forklaring.

- **UJ-2. Aksel følger opp et favorittsted uten å sjekke manuelt hver dag.** *(Ikke i v1 fra
  v3: snøvarsel er tatt ut. Reisen beholdes som referanse for neste versjon.)*
  - **Person + kontekst:** Aksel er skientusiast med et fast favorittsted han vil ha pudder på.
  - **Inngangstilstand:** Ingen konto. Har allerede besøkt stedssiden for Oppdal én gang.
  - **Sti:** (1) Trykker «Varsle meg» på stedssiden. (2) Setter terskel: minst 15 mm nysnø.
    (3) Bekrefter — ingen navn, e-post eller passord kreves, bare en enhets-registrering via en
    Edge Function. (4) To dager senere: push-varsel på mobilen når pipelinen har publisert data
    som oppfyller terskelen.
  - **Klimaks:** Varselet kommer akkurat når kravet er oppfylt, ikke før og ikke duplisert.
  - **Oppløsning:** Han trykker på varselet, havner rett på stedssiden, og kan melde seg av med
    ett trykk derfra.
  - **Edge case:** Terskelen oppfylles flere døgn på rad — han får maks ett varsel per regel per
    døgn, ikke ett per pipeline-kjøring (hver time).

- **UJ-3. Kelly, som bruker skjermleser, finner et sted uten å bruke kartet.**
  - **Person + kontekst:** Kelly er turentusiast og bruker skjermleser og tastatur, ikke mus/touch.
  - **Inngangstilstand:** Ingen konto. Navigerer med tastatur fra forsiden.
  - **Sti:** (1) Tabber til «Vis som liste» (alternativ til det visuelle kartet). (2) Får en
    tastaturnavigerbar, sorterbar liste over steder med SnowScore vist som tall og tekst (ikke
    bare farge). (3) Setter samme filter som i UJ-1 via ordinære skjemafelt. (4) Velger et sted
    fra listen med Enter.
  - **Klimaks:** Hun får nøyaktig samme informasjon og samme filtreringsmulighet som
    kart-brukeren, uten å være avhengig av et visuelt, museavhengig kart.
  - **Oppløsning:** Havner på samme stedsside som i UJ-1 — resten av opplevelsen er identisk.
  - **Edge case:** Realiserer WCAG 2.1 AA-kravet fra §7.4; se Marys begrunnelse i memloggen for
    hvorfor selve kartlaget er unntatt mens listevisningen må være fullt AA-kompatibel.

## 3. Ordliste

- **SnowScore** — Forklarbar poengsum 0–100 for snøpotensial på et sted og tidsvindu, beregnet av
  den delte modulen `shared/snowscore.ts` (arkitektur AD-6). Består av delpoengene A
  (Nysnøpotensial), B (Kuldebonus) og C (Snøandel).
- **Sted (Location)** — Én rad i stedskatalogen: navn, koordinater, høyde, stedstype
  (skisted/fjelltopp/by).
- **Stedskatalog** — Den kuraterte listen av ~300 steder i v1, bygget offline fra OpenStreetMap
  og Kartverket (arkitektur AD-5). Read-only i produksjon.
- **Beste skivindu** — De fire sammenhengende timene med lavest snittvind og minst skydekke i et
  48-timers vindu, beregnet blant dagslystimer, eller — i mørketid — blant alle timer (Marys
  rettelse, se memlogg).
- **Vilkår (filterkrav)** — Én bruker-satt grense i filteret (f.eks. «min. 15 mm nysnø»). Flere
  vilkår kombineres med OG, aldri ELLER.
- **Snøvarsel (alert rule)** *(Ikke i v1 fra v3)* — En brukers registrerte terskel for ett sted,
  som trigger maks ett push-varsel per regel per døgn.
- **Datafil** *(v3)* — Den publiserte JSON-filen med alle steder, poengsummer og kvalitetsrapport,
  som appen leser. Erstatter databasetabellene fra v1/v2.
- **Publisert batch** — Resultatet av én pipeline-kjøring, gjort synlig for klienten kun hvis
  minst 95 % av stedene fikk gyldige data (arkitektur AD-2).
- **Ufullstendige data** — Tilstanden når mer enn 10 % av timesverdiene for et sted mangler; vises
  i stedet for en poengsum (ikke som SnowScore 0, som ville feiltolkes som «ingen snø»).
- **Datakilde-nedetid** — Tilstanden når MET eller NVE ikke svarer; pipelinen fortsetter å
  publisere siste gyldige data, aldri en feilverdi.

## 4. Funksjoner

### 4.1 Stedskatalog og datapipeline

**Beskrivelse:** Det usynlige fundamentet: en offline-bygget stedskatalog og en pipeline som
henter, validerer, poengsetter og publiserer værdata hver time. Realiserer ingen UJ direkte, men
er forutsetningen for alle andre funksjoner (uten ferske, gyldige data er kartet tomt).

#### FR-1: Stedskatalog-bygging *(Må ha)*

Utvikler kan kjøre et frittstående skript (`scripts/build-catalog/`) som produserer en
katalogfil med ~300 steder fra OpenStreetMap og Kartverket. Filen versjoneres i repoet.
*(v3: en fil i stedet for en databasemigrering.)*

**Konsekvenser (testbare):**
- Skriptet er ikke en del av kjøretidskoden. Verken appen eller dataprogrammet importerer det
  (arkitektur AD-5).
- Hvert sted har navn, koordinater (4 desimaler), høyde og stedstype. Katalogfilen valideres mot
  et skjema før den kan aksepteres.

#### FR-2: Timesbasert henting fra MET og NVE *(Må ha)*

Systemet henter værdata for alle steder i katalogen hver time via en planlagt jobb. *(v3)* Selve
hentingen er et Node-script (`npm run data`) som også kan kjøres lokalt uten nøkler. Den planlagte
jobben er en GitHub Actions-jobb.

**Konsekvenser (testbare):**
- Forespørsler bruker identifiserende User-Agent og begrenset samtidighet. *(v3)* Hvert sted
  hentes én gang per time, i takt med hvor ofte MET oppdaterer prognosen. Kjøringen lagrer ingen
  tilstand mellom timene, så `If-Modified-Since`/`Expires` brukes ikke.
- Én kjøring henter alle ~300 steder, med begrenset samtidighet. En avbrutt kjøring publiserer
  ingenting (FR-5) og kjøres på nytt ved neste time.

#### FR-3: Skjemavalidering av rådata *(Må ha)*

Systemet validerer hvert API-svar mot et strengt skjema (Zod) før det brukes videre i pipelinen.

**Konsekvenser (testbare):**
- Et ugyldig svar (feil felt, feil type, manglende felt) avvises og registreres i kjøringens
  kvalitetsrapport (NFR-DQ2) med sted, kilde og årsak. Det rettes aldri automatisk og kommer aldri
  med i den publiserte datafilen.
- Kontraktstester kjører samme validering mot opptatte, ekte MET/NVE-svar (`tests/contract/`) og
  fanger opp brytende API-endringer før de treffer produksjon.

#### FR-4: SnowScore- og skivindu-beregning *(Må ha; skivindu-delen er Bør ha)*

Systemet beregner SnowScore (§4.2) for hvert sted for hvert nytt datasett, og skriver resultatet
i kjøringens minne (`RunContext`, arkitektur AD-2). *(v2)* Beregning av beste skivindu legges til i samme steg når Bør
ha-funksjonen FR-17 bygges.

**Konsekvenser (testbare):**
- Mangler mer enn 10 % av timene i vinduet for et sted, settes stedet til «ufullstendige data»
  i stedet for en tallverdi (aldri en lav/feil poengsum som ser ut som et reelt resultat).

#### FR-5: Atomisk publisering med kvalitetsterskel *(Må ha)*

Systemet publiserer en ny batch bare når minst 95 % av stedene i katalogen fikk gyldige data i
denne kjøringen; ellers beholdes forrige gyldige batch uendret.

**Konsekvenser (testbare):**
- Simulert nedetid hos én datakilde som fører til at andelen gyldige steder faller under 95 %,
  medfører at klienten fortsatt viser forrige batch — ikke delvise eller tomme data.
- Publisering er idempotent: samme input gir samme resultat ved gjentatt kjøring, og samtidige
  kjøringer blokkeres (arkitektur AD-2). *(v3)* Publiseringen skriver hele den nye datafilen
  først og bytter den inn i én operasjon, så appen aldri ser en halv fil. Den planlagte jobben
  tillater bare én kjøring om gangen.

#### FR-6: Robusthet mot datakilde-nedetid *(delt i v2: FR-6a Må ha, FR-6b Bør ha)*

Systemet håndterer at MET eller NVE ikke svarer, uten at brukeropplevelsen bryter sammen.

**FR-6a — Siste gyldige data *(Må ha)*. Konsekvenser (testbare):**
- Når en datakilde feiler, publiseres ingen ny batch, og klienten viser forrige gyldige batch
  (følger av FR-5). Verifiseres ved å simulere nedetid i test (NFR-4).
- Feilen registreres i kjøringens kvalitetsrapport (NFR-DQ2).
- *(v3)* Et sted som feiler i en kjøring som likevel publiseres (inntil 5 % av stedene), vises
  som «ufullstendige data» uten poengsum. Datafilen bærer aldri verdier fra en tidligere kjøring.

**FR-6b — Nye forsøk ved feil *(Bør ha)*. Konsekvenser (testbare):**
- Et feilende kall prøves på nytt et fast antall ganger med økende ventetid.
- *(v3)* Kretsbryteren er fjernet. Den gir bare mening med tilstand mellom kjøringer, og den
  finnes ikke lenger.

### 4.2 SnowScore og forklaringsside

**Beskrivelse:** Kjernen brukeren skal stole på. Én åpen, etterprøvbar formel og en side som
forklarer den steg for steg, slik at «hvorfor scorer dette stedet 82?» alltid har et konkret svar.
Realiserer UJ-1 (klimaks: forstå delpoengene) og UJ-3 (tallet vises som tekst, ikke bare farge).

#### FR-7: Delt SnowScore-modul *(Må ha)*

Systemet beregner SnowScore med formelen fra briefen (§«SnowScore», rettet av Mary): A
(Nysnøpotensial) + B (Kuldebonus, null uten nedbør) + C (Snøandel), alle fra samme
`shared/snowscore.ts`-modul brukt av både pipeline og forklaringssidens kalkulator (AD-6).

**Konsekvenser (testbare):**
- Egenskapsbaserte tester (minst 1000 tilfeldige inndata i CI, se SM-6 i §9.1): poengsummen er
  alltid mellom 0 og 100; mer nysnø gir aldri lavere A; lavere snittemperatur gir aldri lavere B;
  ingen nedbør (P < 0,5 mm) gir alltid B = 0 og C = 0; samme inndata gir alltid samme resultat.
- Appen og dataprogrammet importerer samme modul (`shared/snowscore.ts`). Det finnes ingen
  annen kopi av formelen, så en egen parity-test trengs ikke. *(v3: begge kjører på Node og i
  nettleseren, ikke lenger i Deno.)*

#### FR-8: Forklaringsside — kort fortalt og steg for steg *(Må ha)*

Systemet viser en side som forklarer hva SnowScore måler og hvordan den beregnes, med formelen
og én illustrasjon per delpoeng.

**Konsekvenser (testbare):**
- Siden er tilgjengelig fra hver SnowScore-visning i løsningen (lenket, ikke bare fra
  toppmenyen).
- *(v2)* Siden har et panel «Datakvalitet» som viser siste kjørings kvalitetsrapport i
  klartekst (tidspunkt, andel gyldige steder, antall avviste svar). I demomodus vises
  demodatasettets byggeinformasjon i stedet (NFR-DQ2).
- Innholdet er versjonert: hver endring i formelparametere (som Marys nevner-endring 6→16) får en
  ny rad i endringsloggen på siden, med begrunnelse.

#### FR-9: Regneeksempel *(Må ha)*

Siden viser et komplett, utledet regneeksempel fra rådata (nedbør og temperatur time for time)
til ferdig poengsum, slik Mary rettet det (6-timers tabell, se briefen).

**Konsekvenser (testbare):**
- Eksemplet viser eksplisitt S, P og T̄ utledet fra timesverdiene — ikke bare sluttsvaret.
- *(v2)* Eksempelets inndata og forventede svar (58) kjøres som fasittest mot
  `shared/snowscore.ts` (SM-10). Siden og testen bruker samme tabell, så de kan ikke sprike.

#### FR-10: «Prøv selv»-kalkulator *(Bør ha)*

Brukeren kan justere nedbør og temperatur på forklaringssiden og se poengsummen og delpoengene
endre seg umiddelbart.

**Konsekvenser (testbare):**
- Kalkulatoren importerer `shared/snowscore.ts` direkte — den inneholder aldri en egen kopi av
  formelen (AD-6; hindrer at kalkulator og pipeline kan sprike).

#### FR-11: Datakilder og begrensninger-seksjon *(Må ha)*

Siden lister datakildene (MET, NVE) med lisens, og forklarer eksplisitt at SnowScore er en
prognose/modell, ikke en målt eller garantert verdi.

**Konsekvenser (testbare):**
- Teksten nevner eksplisitt at tjenesten ikke er en skredfarevurdering, med lenke til Varsom.no
  for fjellområder (jf. Ethical Considerations i briefen).

### 4.3 Norgeskart og tilgjengelig listevisning

**Beskrivelse:** Forsiden. To likeverdige måter å utforske katalogen på: et visuelt kart for de
fleste, og en tastaturnavigerbar listevisning som gir identisk informasjon og funksjonalitet uten
å kreve mus, touch eller fargesyn. Realiserer UJ-1 (kart) og UJ-3 (liste).

#### FR-12: Interaktivt Norgeskart *(Må ha)*

Systemet viser et kart over Norge (Leaflet med Kartverkets topografiske bakgrunnskart, uten
nøkkel) der hvert sted i katalogen er fargelagt etter sin gjeldende SnowScore.
*(v4, 2026-10-08: bakgrunnskartet er endret fra OpenStreetMap til Kartverket topo, se
sprint-change-proposal-2026-10-08-kartverket.md.)*

**Konsekvenser (testbare):**
- Fargeskalaen går fra grått (lavt snøpotensial) til sterkt blått (høyt), med minst fire trinn.
- Et trykk/klikk på et sted åpner stedssiden for det stedet.

#### FR-13: Tilgjengelig listevisning *(Må ha)*

Systemet tilbyr en listevisning av samme steder og samme filtermuligheter som kartet, som et
fullverdig alternativ — ikke en nedskalert reserveløsning.

**Konsekvenser (testbare):**
- Hvert listeelement viser SnowScore som tall og som tekstetikett (f.eks. «82 – Svært godt»),
  aldri kun som farge.
- Hele listen er nåbar og betjenbar med tastatur alene (Tab/Enter/piltaster), verifisert med
  automatisert tilgjengelighetstest (axe/Playwright) i CI.
- Listen kan sorteres på SnowScore, avstand (hvis posisjon er delt) og navn.

#### FR-14: Antall-treff og null-treff-veiledning *(Må ha)*

Både kart og liste viser levende antall treff mens filteret justeres, og foreslår hvilket
kriterium som bør lempes ved null treff.

**Konsekvenser (testbare):**
- Ved null treff identifiserer systemet hvilket enkeltkriterium som, hvis fjernet, ville gitt
  flest nye treff, og foreslår nettopp det (jf. UJ-1 edge case).
- *(v2)* Fasittabellen for filter (definert i FR-20) inneholder også forventet forslag ved
  null treff.

#### FR-15: Hurtigvalg *(Bør ha)*

Brukeren kan trykke forhåndsdefinerte snarveier («Pudderdag», «Sol etter snøfall») som fyller
inn filteret med ett trykk.

**Konsekvenser (testbare):**
- Hvert hurtigvalg tilsvarer en dokumentert, fast kombinasjon av filterverdier (ikke en skjult
  heuristikk som er vanskelig å etterprøve).

### 4.4 Stedsside

**Beskrivelse:** Detaljvisningen for ett sted: full poengsum med delpoeng, rådata, og beste
skivindu. Realiserer klimakset i UJ-1.

#### FR-16: Stedsside med full poengsum og rådata *(Må ha)*

Hvert sted har en egen side med unik, delbar adresse (URL) som viser SnowScore med delpoeng
(A/B/C), temperatur, nysnø, vind, skydekke, høyde og datakildens tidsstempel.

**Konsekvenser (testbare):**
- URL-en er stabil og delbar uten server-side sesjon (ingen konto kreves for å åpne den).
- Data eldre enn tre timer merkes «utdatert» i grensesnittet (jf. brief); steder med data eldre
  enn tolv timer vises ikke i kart eller filter (NFR-3 i §7).

#### FR-17: Beste skivindu *(Bør ha)*

Stedssiden viser de fire beste sammenhengende timene i et 48-timers vindu, med mørketid-fallback
(Marys rettelse: uten dagslystimer i vinduet, brukes alle timer, med tydelig UI-merking).

**Konsekvenser (testbare):**
- Kommer det nysnø i perioden, velges vinduet kun blant timer etter at snøfallet har stoppet.
- I mørketid vises teksten «Mørketid – vindu vist uten dagslys» i stedet for at funksjonen
  returnerer tomt eller feiler.
- *(v2)* En fasittabell med minst fire tilfeller viser inndata time for time og forventet
  vindu. Tilfellene er:
  1. en vanlig dag;
  2. snøfall som slutter midt i 48-timersvinduet;
  3. for få sammenhengende dagslystimer;
  4. mørketid.

  Tabellen brukes både i dokumentasjonen og som test mot samme funksjon som pipelinen.

#### FR-18: Snøvarsel — registrering *(Ikke i v1 fra v3)*

*v3: Tatt ut av v1, fordi det krever Web Push, en server for registrering og lagring av
push-abonnement. Faglæreren pekte ut nettopp dette som vanskelig å sette opp og umulig for
sensor å teste. Kravet står som referanse for neste versjon.*

Brukeren kan følge et sted med en egendefinert terskel og motta push-varsel når kravet oppfylles,
uten brukerkonto. Realiserer UJ-2.

**Konsekvenser (testbare):**
- Registrering skjer via en Edge Function som validerer terskelen og begrenser antall regler
  per enhet (rate-limit, se NFR-5).
- Kun `supabase/functions/follow/` skriver til `alert_rules` (AD-1 — ingen annen funksjon skriver
  dit).

#### FR-19: Snøvarsel — utsendelse og avmelding *(Ikke i v1 fra v3, se FR-18)*

Etter hver publisering evaluerer pipelinen varselregler mot de nye dataene og sender push-varsel,
maks én gang per regel per døgn.

**Konsekvenser (testbare):**
- To påfølgende publiseringer samme døgn som begge oppfyller terskelen, utløser kun ett varsel
  (deduplisert via `alert_dispatch_log`, AD-1).
- Hvert varsel har avmelding med ett klikk, og avmelding sletter regelen (ikke bare deaktiverer
  den) — verifisert med sikkerhetstest (Bør ha-testdybde, se §6.2).

### 4.5 Filter

**Beskrivelse:** Mekanismen som gjør «hvor oppfylles kravene mine nå?» besvarbart. Realiserer
UJ-1 og UJ-3.

#### FR-20: Flerkriteriefilter — nysnø, vind, temperatur *(Må ha)*

Brukeren kan sette minimumskrav til nysnø (mm/cm) og grenser for vind og temperatur, kombinert
med OG, og få tilbake bare steder som oppfyller alle valgte kriterier.

**Konsekvenser (testbare):**
- Svar på under 2 sekunder for 95 % av søk (NFR-1 i §7). *(v3)* Filtreringen skjer i nettleseren
  over de ~300 stedene i datafilen, med delt filterlogikk (`shared/filter.ts`).
- Nysnø-cm-anslaget bruker den faste omregningen 1 mm vannekvivalent ≈ 1 cm nysnø (Marys
  presisering), identisk med SnowScore-seksjonens forklaring.
- *(v2)* En fasittabell med et lite stedssett (5–8 steder) og flere filterkombinasjoner viser
  forventede treff og forventet forslag ved null treff. Tabellen kjøres som CI-blokkerende test
  mot den samme filterlogikken som appen bruker (SM-10). *(v3: det finnes bare én
  filterimplementasjon, så demo og ekte data kan ikke gi ulikt svar.)*

#### FR-21: Filterverdier i URL *(Må ha)*

Filterets tilstand lagres i nettadressen, slik at et søk kan deles med en enkel lenke og
gjenskapes ved åpning.

**Konsekvenser (testbare):**
- Å åpne en delt lenke gjenskaper nøyaktig samme filterinnstillinger og samme treffliste (gitt
  samme underliggende data).

#### FR-22: Solfilter *(Bør ha)*

Brukeren kan sette maks skydekke i dagslystimer.

#### FR-23: Avstandsfilter *(Bør ha)*

Brukeren kan sette maks avstand fra egen posisjon; posisjonen beregnes og brukes kun i
nettleseren og lagres aldri (jf. NFR-Privacy i §7).

**Konsekvenser (testbare):**
- Ingen posisjonsdata sendes til eller lagres på server — verifisert med nettverkstest
  (ingen posisjon i noen utgående forespørsel).

#### FR-24: Stedstypefilter *(Bør ha)*

Brukeren kan filtrere på stedstype (skisted, fjelltopp, by).

#### FR-25: Nysnø siste 24 t (målt, ikke prognose) *(Bør ha)*

Brukeren kan filtrere på NVE seNorge sitt modellerte nysnø for siste døgn, som et alternativ til
MET-prognosen for kommende 24/48 t.

#### FR-26: Null-treff-veiledning *(Må ha, dekket av FR-14)*

*(Kryssreferanse — se FR-14; ikke en separat implementasjon.)*

### 4.6 Tilbakemelding uten konto *(Ikke i v1 fra v3)*

*v3: Hele seksjonen er tatt ut av v1. Den krevde en server som tar imot innsendinger, Cloudflare
Turnstile, hastighetsbegrensning og sletterutiner, altså tre av de eksterne tjenestene faglæreren
pekte på. Uten den har løsningen ingen skriving fra brukere. Kravene står som referanse.*

**Beskrivelse:** Lavterskel kanal for feilmeldinger og forslag, uten at brukeren må oppgi
identifiserbar informasjon.

#### FR-27: Tilbakemeldingsskjema *(Ikke i v1 fra v3)*

Brukeren kan sende en tilbakemelding (kategori + fritekst, inntil 1000 tegn) uten innlogging,
navn eller e-post.

**Konsekvenser (testbare):**
- Skjemaet advarer brukeren mot å skrive personopplysninger i fritekstfeltet før innsending.

#### FR-28: Serversidevalidert, misbruksbeskyttet innsending *(Ikke i v1 fra v3)*

Innsendingen behandles av en Edge Function som verifiserer et Turnstile-token, validerer mot et
fast skjema, og begrenser antall innsendinger med en kortlevd, saltet hash.

**Konsekvenser (testbare):**
- Klienten har ingen direkte skrivetilgang til `feedback`-tabellen (kun Edge Function-en kan
  skrive, jf. AD-1); forsøk på direkte skriving fra klienten blokkeres av RLS.
- Fritekst behandles som utrygt innhold ved lagring og visning (ingen HTML/skript kan injiseres
  — sikkerhetstest i CI).

#### FR-29: Automatisk sletting *(Ikke i v1 fra v3)*

Tilbakemeldinger slettes automatisk etter tolv måneder, av samme sentrale rutine som eier all
TTL-sletting (`retention/cleanup.ts`, AD-7).

### 4.7 Kjøring, demodata og analyse *(v2)*

**Beskrivelse:** Gjør det mulig for en utenforstående, først og fremst sensor, å kjøre og
prøve SnowFinder fra et rent klon, uten nøkler, kontoer eller tilgang til gruppas tjenester.
Realiserer ingen brukerreise direkte, men er forutsetningen for at kjerneflyten (UJ-1, UJ-3)
kan prøves og testes uavhengig av drift.

#### FR-30: Lokal demomodus med ferdige data *(Må ha)*

En utenforstående kan klone repoet og starte SnowFinder med `npm ci && npm run dev`. Det
krever ikke nøkler eller nettverkskall til MET og NVE. Appen viser da et demodatasett.

**Konsekvenser (testbare):**
- **Samme program, to kilder (v3):** `npm run data:demo` kjører dataprogrammet på de lagrede
  MET- og NVE-svarene i `tests/contract/fixtures/`. `npm run data` kjører det mot de ekte
  tjenestene. Begge skriver samme type datafil, og appen leser den på samme måte. Demodatasettet
  (ca. 20–30 steder) er committet, så `npm run dev` virker uten at noe må kjøres først.
  - Demo har sin egen lille katalog, og fixtures dekker hvert sted i den. Da møter demokjøringen
    95 %-terskelen.
  - Terskelen teller bare avviste eller manglende svar. Steder med «ufullstendige data» teller
    som gyldige.
  - Demokjøringen er deterministisk: fast referansetidspunkt (det nyeste tidspunktet i
    fixtures), fast kjørings-ID og varighet 0. Ingen
  poengsum skrives for hånd.
- **Reproduserbart:** samme fixtures gir alltid samme demodatasett, og det sjekkes av en test.
- **Fast demoklokke:** demodatasettet har et eget referansetidspunkt («demo-nå»). I demomodus
  regnes dataalder (FR-16, NFR-3) mot dette tidspunktet, ikke mot maskinens klokke. Da ser
  appen lik ut uansett når sensor starter den, og grensene på 3 og 12 timer kan testes
  deterministisk.
- **Alle tilstander er med:** demodatasettet har minst ett sted med «ufullstendige data» og ett
  med utdaterte data (eldre enn 3 timer mot demo-nå). Når Bør ha-funksjonen FR-17 er bygget,
  kommer ett sted i mørketid i tillegg.
- **Tydelig merket:** demomodus vises i grensesnittet («Demodata – ikke ekte prognoser»).
- **Testet i CI:** en E2E-røyktest kjører kart → filter → stedsside i demomodus.
- **README** beskriver to kjøremåter:
  - demodata, som anbefales for sensor;
  - ferske, ekte data med `npm run data`, som bare krever nettilgang.

#### FR-31: Vurdering av SnowScore mot målte forhold *(Ikke i v1 fra v3)*

*v3: Tatt ut av v1. Analysen trenger lagrede prognoser over tid, og uten database finnes de
ikke. Den kommer sammen med treffsikkerhetsmåleren i visjonen.*

Gruppen kan vurdere hvor godt SnowScore og MET-prognosen treffer, ved å sammenligne prognosert
nysnø med NVE seNorges modellerte nysnø i etterkant, for katalogens steder over en periode.

**Konsekvenser (testbare):**
- Analysen kjøres med et skript utenfor appen (`scripts/analysis/`). Den er ikke en del av
  kjøretidskoden og endrer ingen publiserte data.
- Resultatet er en kort, reproduserbar rapport med treffsikkerhet (f.eks. gjennomsnittlig avvik
  og andel steder der prognosen bommet med mer enn en gitt grense) og systematiske avvik etter
  stedstype og høyde. Den brukes i sluttrapporten og til eventuell kalibrering av formelen
  (versjonert på forklaringssiden, FR-8).

## 5. Ikke-mål (eksplisitt)

- SnowFinder er **ikke** en skredfarevurdering og gir aldri råd om ferdselssikkerhet — lenker til
  Varsom.no i stedet for å duplisere eller erstatte det.
- **Ingen brukerkontoer** i v1 — verken e-post/passord, sosial innlogging, eller lagrede profiler
  på tvers av enheter.
- **Ingen flerspråklighet** i v1 — norsk er eneste språk i grensesnittet.
- **Ingen webkameraer eller livevideo** i v1 (eksplisitt utsatt til v2, se Product Vision i
  briefen).
- **Ingen native app** i appbutikkene i v1, og *(v3)* ingen installerbar webapp (PWA). Den
  trengtes bare for push-varsler på iPhone.
- *(v3)* **Ingen database, ingen skriving fra brukere og ingen lagrede brukeropplysninger** i v1.
- **Ingen booking, kjøp eller betaling** noe sted i løsningen.
- **Ingen generativ KI-chat mot sluttbruker** — SnowScore er deterministisk, ikke en
  språkmodell-generert vurdering (jf. brief §AI-assisted Development: KI brukes i utvikling, ikke
  i produktet selv mot sluttbruker).
- **Ingen skala utover ~300–1500 steder** i v1 — nasjonal, ikke global, dekning.

## 6. MVP-omfang

### 6.1 I omfang (Må ha)

- Lokal demomodus med ferdige data, `.env.example` og en README som virker fra et rent klon
  (§4.7, FR-30)
- Stedskatalog og et enkelt dataprogram (én planlagt jobb) med validering, atomisk publisering
  av datafilen, siste gyldige data ved nedetid (FR-6a) og datakvalitet per kjøring (§4.1,
  NFR-DQ1–3)
- SnowScore-modul, forklaringsside (uten kalkulator), regneeksempel (§4.2, FR-7/8/9/11)
- Norgeskart **og** tilgjengelig listevisning som likeverdig alternativ (§4.3)
- Stedsside med full poengsum og rådata (§4.4, FR-16)
- Filter for nysnø, vind og temperatur, med URL-persistens og null-treff-veiledning (§4.5,
  FR-20/21/26)
- CI med det reelle QA-minimumet: egenskapsbaserte tester, kontraktstester, fasittabell for
  filter og én E2E-røyktest (kart → filter → stedsside) i demomodus

### 6.2 Utenfor MVP (Bør ha — bygges først når Må ha er ferdig og testet)

- Beste skivindu (FR-17), kalkulator på forklaringssiden (FR-10), hurtigvalg (FR-15), solfilter
  (FR-22), avstandsfilter (FR-23), stedstypefilter (FR-24), nysnø siste 24 t (FR-25)
- *(v2)* Nye forsøk ved feil (FR-6b)
- Den oppgavebaserte 5-persons brukertesten er «bør ha»-dybde (Marys skille), ikke en
  blokkerende del av en «må ha»-leveranse. *(v3: sikkerhetstestene for skriveendepunkter er borte,
  fordi det ikke finnes skriveendepunkter.)*

### 6.3 Ikke i v1 (Won't have)

Brukerkontoer, flere språk, webkameraer, app i appbutikkene, skredvarsling, målt snødybde,
booking, generativ værchat — se §5 for begrunnelse. *(v3)* I tillegg: snøvarsel (FR-18/19),
tilbakemelding (FR-27/28/29), analyse av treffsikkerhet (FR-31), installerbar webapp (PWA) og
database. Begrunnelsen står i §0.

## 7. Ikke-funksjonelle krav

### 7.1 Ytelse

- **NFR-1:** 95 % av filtersøk svarer på under 2 sekunder. Validerer FR-20.
- **NFR-2:** Norgeskartet er interaktivt (kan panneres/zoomes) innen 3 sekunder på mobil, målt
  på en representativ midtsegment-telefon over 4G. Validerer FR-12.

### 7.2 Datafriskhet og robusthet

- **NFR-3:** Publiserte data er normalt under 90 minutter gamle; data eldre enn tre timer
  merkes «utdatert», og steder med data eldre enn tolv timer fjernes fra kart og filter.
  Validerer FR-16.
- **NFR-4:** Tjenesten fungerer med siste gyldige data når én datakilde (MET eller NVE) er
  utilgjengelig — verifisert ved å simulere nedetid i test. Validerer FR-6a.

### 7.2b Datakvalitet og sporbarhet *(v2)*

- **NFR-DQ1 (datakontrakt):** Hvert MET- og NVE-svar valideres mot et Zod-skjema. Skjemaene er
  dokumentert som en dataordbok med felt, enhet, gyldig verdiområde og kilde, i én fil som
  arkitekturen angir. Validerer FR-3.
- **NFR-DQ2 (kvalitet per kjøring):** Hver kjøring av dataprogrammet skriver én kvalitetsrapport
  med disse feltene. Rapporten for en publisert kjøring ligger i datafilen. Rapporten for en
  mislykket kjøring ligger i jobbloggen og som vedlegg (artifact) til kjøringen i GitHub Actions:
  - starttid og varighet;
  - antall steder og andel gyldige;
  - antall avviste svar per kilde;
  - antall steder med ufullstendige data;
  - om batchen ble publisert, og årsaken hvis den ikke ble det.

  Forklaringssiden viser kvaliteten til siste kjøring i klartekst. Validerer FR-5 og FR-6a.
- **NFR-DQ3 (sporbarhet):** Hver publisert verdi har kjørings-ID og kildens tidsstempel. Da kan
  enhver poengsum spores tilbake til kjøringen og rådataene den kom fra. Validerer FR-16.

### 7.3 Sikkerhet og personvern

- **NFR-5 *(omskrevet i v3)*:** Løsningen har ingen skrivbare endepunkter og ingen
  hemmeligheter. Appen er statiske filer som bare leser den publiserte datafilen (AD-1), og
  dataprogrammet bruker bare offentlige API-er uten nøkkel. Repoet inneholder ingen `.env` med
  ekte verdier.
- **NFR-6 *(forenklet i v3)*:** Mislykkede kjøringer og avviste API-svar står i
  kvalitetsrapporten (NFR-DQ2). En feilet planlagt kjøring vises som rød i Actions-fanen, og
  GitHub sender e-post til den som sist endret jobben. Gruppa sjekker Actions-fanen fast. Det
  trengs ingen egen varslingskanal.
- **NFR-Privacy *(forenklet i v3)*:** Ingen brukerkonto, ingen skjema og ingen lagring av
  brukeropplysninger. Posisjon brukes og beregnes bare i nettleseren og sendes aldri noe sted
  (FR-23). Den eneste identifikatoren er IP-adressen som vertstjenesten for statiske sider
  nødvendigvis ser.

### 7.4 Tilgjengelighet (regulatorisk/kvalitetskrav)

- **NFR-7 (WCAG 2.1 AA — presisert av Mary):** Filter, stedssider og forklaringsside oppfyller
  WCAG 2.1 AA i sin helhet. Den tilgjengelige
  listevisningen (FR-13) er et fullt AA-kompatibelt alternativ til kartet. Selve det visuelle
  Leaflet-kartlaget er eksplisitt unntatt fra full AA-etterlevelse (fargekontrast på kart-tiles
  og kompleks kartnavigasjon er ikke realistisk å gjøre fullt AA-kompatibelt innenfor
  prosjektets tidsramme) — begrunnelse i memloggen. Validerer FR-13.

### 7.5 Skalerbarhet (begrensning, ikke ambisjon for v1)

- **NFR-8:** Arkitekturen skal tåle vekst fra ~300 til ~1500 steder i katalogen uten
  strukturelle endringer (kun datavolum), og fra prosjektets nåværende brukertall mot «noen
  tusen» samtidige lesere. *(v3)* Appen og datafilen er statiske filer, så antall lesere er
  vertstjenestens ansvar. 1 500 steder gir fortsatt en datafil på under ett par megabyte. `[ASSUMPTION: "noen tusen" tolkes som opptil
  ca. 5000 samtidige aktive brukere i spissbelastning — ingen offisiell målsetting er oppgitt av
  gruppa eller emnet; bekreft eller juster tallet ved behov.]` Dette er en
  arkitektur-forsikring, ikke et lastkrav MVP-en må demonstrere med reell trafikk.

## 8. Krav og retningslinjer (Constraints and Guardrails)

### 8.1 Personvern

Se NFR-Privacy (§7.3). Dataminimering er et produktvalg, ikke bare en teknisk detalj: løsningen
er designet for å ikke *trenge* å samle inn mer enn den gjør.

### 8.2 Sikkerhet (safety)

SnowFinder viser prognostiserte og modellerte forhold, aldri en garanti for føre eller
skredsikkerhet. All tekst som kan tolkes som en sikkerhetsanbefaling unngås bevisst; stedssider
for fjellområder lenker til Varsom.no (jf. Ethical Considerations i briefen).

### 8.3 Kostnad og drift

Dataprogrammet respekterer MET sine bruksvilkår (identifiserende User-Agent, én henting per sted
per time, samtidighetsbegrensning) — ikke bare for robusthet, men fordi gjentatt brudd kan føre
til at User-Agenten eller IP-adressen blokkeres, noe som ville stoppet hele tjenesten. Dette er en reell driftsrisiko, ikke bare en
kodekvalitetsdetalj.

## 9. Suksessmål

*(v2) Suksessmålene er delt etter hvordan de verifiseres, slik at det går klart fram hva som
faktisk er verifisert:*
- **A:** automatisk i CI, og blokkerer merge;
- **B:** målt manuelt eller under demo, og rapportert med måledata;
- **C:** mål for den oppgavebaserte brukertesten med fem personer.

ID-ene er beholdt fra v1.

### 9.1 Verifiseres automatisk i CI (A)

- **SM-9 (Kjerneflyt, ny i v2):** En E2E-røyktest i demomodus åpner Utforsk, setter et filter
  og åpner en stedsside fra resultatet. Den passerer på hver PR. Validerer FR-12/FR-16/FR-20/FR-30.
- **SM-10 (Fasit, ny i v2):** Fasittabellene for SnowScore (regneeksempelet), beste skivindu
  og filter med null treff passerer. Validerer FR-9/FR-14/FR-17/FR-20. *Må ha for SnowScore og
  filter. Skivindu-tabellen kommer til når Bør ha-funksjonen FR-17 bygges.*
- **SM-15 (Dataalder, ny i v2):** En test med fast demoklokke bekrefter grensene: «utdatert»
  fra 3 timer, og fjernet fra kart, liste og filter etter 12 timer. Validerer FR-16/NFR-3.
  *Må ha.*
- **SM-11 (Datakvalitet, ny i v2):** En test av dataprogrammet bekrefter at hver kjøring, også en
  mislykket, skriver en komplett kvalitetsrapport, og at hver publisert verdi har kjørings-ID og
  kildetidspunkt. Validerer NFR-DQ2/DQ3.
- **SM-5 (Robusthet):** Tjenesten fungerer med siste gyldige data når en datakilde simuleres
  nede, verifisert i test. Validerer FR-6a/NFR-4.
- **SM-6 (Korrekthet):** Egenskapstestene for SnowScore passerer for minst 1000 tilfeldige
  inndata i CI (skalert ned fra briefens opprinnelige 10 000 for realistisk CI-kjøretid i et
  studentprosjekt — samme egenskaper testes, færre kjøringer).
  `[ASSUMPTION: 1000 er en praktisk avveining mellom testdekning og CI-kjøretid; kan skrus opp
  hvis CI-tiden tillater det.]` Validerer FR-7.
- **SM-7 (Tilgjengelighet):** Automatisert axe-sjekk i CI rapporterer null kritiske
  WCAG 2.1 AA-brudd på filter, stedsside, forklaringsside og listevisning. Validerer FR-13/NFR-7.
- **SM-8 (Sporbarhet):** 100 % av endringer i hovedgrenen kommer via Pull Requests (verifiserbart
  i git-historikken). *(v3: krav om godkjenning fra et annet gruppemedlem er fjernet etter gruppas
  beslutning 2026-10-07.)* Validerer prosesskravet i AGENTS.md.

### 9.2 Måles manuelt eller under demo (B)

- **SM-1 (Ytelse):** 95 % av filtersøk under 2 sekunder. Validerer FR-20/NFR-1.
- **SM-12 (Kartlasting, ny ID i v2):** Kartet er interaktivt innen 3 sekunder på en mobil over
  4G. Validerer NFR-2.
- **SM-13 (Ferskhet, ny ID i v2):** Publiserte data er normalt under 90 minutter gamle. Det
  måles fra Actions-historikken (tidspunkt for vellykkede kjøringer) over minst én uke med den
  planlagte jobben i gang. Validerer NFR-3.
- **SM-14 (Kjørbarhet, ny i v2):** Et gruppemedlem som ikke har satt opp prosjektet før, starter
  appen i demomodus fra et rent klon kun etter README, på under 10 minutter og uten hjelp.
  Det gjøres første gang senest rett etter Story 1.10, og deretter før hver innlevering. Hvert
  steg som mangler eller er uklart, noteres og rettes. Validerer FR-30.

*Merking:* SM-1, SM-12 og SM-14 er Må ha. SM-13 krever drift i prodmiljøet og rapporteres når
det finnes.

Måleresultatene føres i sluttrapporten med dato, enhet og metode. De er ikke CI-blokkerende,
fordi de avhenger av nettverk og maskinvare.

### 9.3 Mål for brukertesten (C)

- **SM-2 (Nytte):** Minst 4 av 5 testbrukere fullfører oppgaven «finn et skisted som oppfyller
  et gitt krav» på under 2 minutter, uten hjelp fra testleder. Validerer FR-20/FR-12/FR-13.
- **SM-3 (Forklarbarhet):** Minst 4 av 5 testbrukere kan forklare en vist SnowScore etter å ha
  lest forklaringssiden. Validerer FR-8/FR-9.
- **SM-4 (Dataforståelse):** Minst 4 av 5 testbrukere skiller prognose fra faktiske forhold og
  oppdager utdaterte data uten å bli fortalt det på forhånd. Validerer FR-11/FR-16.

Brukertestplanen (oppgaver, måling og SUS-skjema) ligger i EXPERIENCE.md. Selve brukertesten
med fem personer er Bør ha-dybde (§6.2), men oppgavene er Må ha-flyten (UJ-1, UJ-3), så
testen kan gjennomføres så snart Må ha er ferdig.

### 9.4 Mot-metrikker (skal ikke optimeres isolert)
- **SM-C1** *(gjelder først når snøvarsel kommer, etter v1)*: Antall sendte snøvarsler skal
  *ikke* økes for sin egen del — et varsel som ikke fører til at brukeren faktisk drar eller
  handler, er støy, ikke suksess. Motvekt til SM-2/FR-19.
- **SM-C2:** Andel Må ha-tester som fjernes eller svekkes for å få CI grønn skal være null —
  «grønn CI» er ikke suksess hvis det oppnås ved å teste mindre. Motvekt til SM-6/SM-8.

## 10. Åpne spørsmål

1. ~~**Push-leveranse:**~~ *Utgår i v3,* fordi snøvarsel ikke er med i v1.
2. **Hosting:** *(v3)* GitHub Pages foreslås, fordi den planlagte jobben og CI allerede ligger i
   GitHub Actions, og ingen ekstra konto trengs. Bekreft med gruppa. GitHub Actions og Pages må
   slås på i repoet av en administrator.
3. ~~**IBE160-vurderingskriterier:**~~ *Lukket i v2.* Sensorveiledningen for del 1 og
   faglærers tilbakemelding (2026-10-06) er nå kjent og krysjekket mot §6 og §9, gjennom
   endringsrunden 2026-10-07.
6. *(v2)* **Kursets skjermkrav:** Emnet ber om wireframes for pålogging, profil, innsjekking,
   sosial feed og arrangementer, men v1 har bevisst ingen kontoer eller sosiale funksjoner (§5).
   Det foreslås å koble hvert punkt til nærmeste skjerm i SnowFinder, med begrunnelse i
   EXPERIENCE.md. *(v3: koblingen må gjøres på nytt, fordi snøvarsel og tilbakemelding er tatt
   ut.)* Gruppa og faglærer må bekrefte. Endres produktet, går det gjennom
   `bmad-correct-course`.
4. **Skalatall for NFR-8:** Er «noen tusen brukere» en reell forventning for
   innleveringen/demoen, eller kun en arkitektonisk forsikring? Påvirker om lasttesting hører
   hjemme i Må ha-QA-minimumet.
5. ~~**Varselfrekvens-grense:**~~ *Utgår i v3* sammen med snøvarsel.

## 11. Antagelsesindeks

- §7.5 — «Noen tusen brukere» tolket som ~5000 samtidige i spissbelastning; ingen offisiell
  målsetting oppgitt.
- §9 SM-6 — Antall egenskapstest-kjøringer skalert fra 10 000 (brief) til 1000 (PRD) for
  realistisk CI-kjøretid; samme testede egenskaper.
- §6.2 — *(utgår i v3: det finnes ingen skriveendepunkter å sikkerhetsteste.)*
- §4.7 FR-30 *(v2)* — Demodatasettet på ca. 20–30 steder antas å være nok til å vise alle
  tilstander og gi meningsfulle filtertreff. Det økes hvis fasittabellen for filter trenger flere
  steder.
