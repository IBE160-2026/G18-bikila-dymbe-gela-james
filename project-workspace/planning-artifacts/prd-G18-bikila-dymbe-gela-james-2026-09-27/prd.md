---
title: SnowFinder
created: 2026-09-27
updated: 2026-09-27
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
- **Funksjonelt:** «Vit når et sted jeg følger med på faktisk får de forholdene jeg venter på,
  uten å måtte sjekke selv hver dag.»
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
    SnowScore 82, delpoeng, og beste skivindu lørdag kl. 10–14.
  - **Klimaks:** Hun ser akkurat hvorfor stedet scorer høyt (delpoengene), ikke bare tallet, og
    stoler på det.
  - **Oppløsning:** Hun bestemmer seg for stedet og deler lenken (filterverdier er i URL-en) med
    kjøreselskapet.
  - **Edge case:** Ingen steder oppfyller kravet — appen foreslår hvilket krav hun bør lempe
    (f.eks. «Ingen treff. Prøv vind under 8 m/s i stedet»), i stedet for en tom liste uten
    forklaring.

- **UJ-2. Aksel følger opp et favorittsted uten å sjekke manuelt hver dag.**
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
- **Snøvarsel (alert rule)** — En brukers registrerte terskel for ett sted, lagret i
  `alert_rules`, som trigger maks ett push-varsel per regel per døgn.
- **Publisert batch** — Resultatet av én pipeline-kjøring, gjort synlig for klienten kun hvis
  minst 95 % av stedene fikk gyldige data (arkitektur AD-2/AD-3).
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
migrasjonsfil med ~300 steder fra OpenStreetMap og Kartverket.

**Konsekvenser (testbare):**
- Skriptet er ikke en del av kjøretids-koden (`src/` eller `supabase/functions/` importerer det
  aldri — arkitektur AD-5).
- Hvert sted har navn, koordinater (4 desimaler), høyde og stedstype før migrasjonen kan
  aksepteres.

#### FR-2: Timesbasert henting fra MET og NVE *(Må ha)*

Systemet henter værdata for alle steder i katalogen hver time via en planlagt jobb.

**Konsekvenser (testbare):**
- Forespørsler bruker identifiserende User-Agent og respekterer `If-Modified-Since`/`Expires`
  fra MET — ingen ny henting før `Expires` er passert for et gitt sted.
- En avbrutt kjøring (f.eks. Supabase-tidsavbrudd) fortsetter der den slapp ved neste forsøk,
  fremfor å starte helt på nytt.

#### FR-3: Skjemavalidering av rådata *(Må ha)*

Systemet validerer hvert API-svar mot et strengt skjema (Zod) før det brukes videre i pipelinen.

**Konsekvenser (testbare):**
- Et ugyldig svar (feil felt, feil type, manglende felt) avvises og logges til
  `api_incidents` — det rettes aldri automatisk og propagerer aldri til `conditions`.
- Kontraktstester kjører samme validering mot opptatte, ekte MET/NVE-svar (`tests/contract/`) og
  fanger opp brytende API-endringer før de treffer produksjon.

#### FR-4: SnowScore- og skivindu-beregning *(Må ha)*

Systemet beregner SnowScore (§4.2) og beste skivindu for hvert sted for hvert nytt datasett, og
skriver resultatet til en staging-tabell.

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
  kjøringer for samme batch blokkeres (arkitektur AD-2).

#### FR-6: Robusthet mot datakilde-nedetid *(Må ha)*

Systemet håndterer at MET eller NVE ikke svarer, uten at brukeropplevelsen bryter sammen.

**Konsekvenser (testbare):**
- Eksponentiell ventetid med tilfeldig variasjon og fast maksimum ved feilende kall.
- En kretsbryter per datakilde åpner etter et definert antall påfølgende feil og stopper videre
  forsøk i en avkjølingsperiode, i stedet for å hamre løs på en nede tjeneste.
- Et åpnet kretsbryter-tilfelle skriver til `api_incidents` og varsler gruppen (ikke bare en
  logglinje ingen leser) — se NFR-6 i §7.

### 4.2 SnowScore og forklaringsside

**Beskrivelse:** Kjernen brukeren skal stole på. Én åpen, etterprøvbar formel og en side som
forklarer den steg for steg, slik at «hvorfor scorer dette stedet 82?» alltid har et konkret svar.
Realiserer UJ-1 (klimaks: forstå delpoengene) og UJ-3 (tallet vises som tekst, ikke bare farge).

#### FR-7: Delt SnowScore-modul *(Må ha)*

Systemet beregner SnowScore med formelen fra briefen (§«SnowScore», rettet av Mary): A
(Nysnøpotensial) + B (Kuldebonus, null uten nedbør) + C (Snøandel), alle fra samme
`shared/snowscore.ts`-modul brukt av både pipeline og forklaringssidens kalkulator (AD-6).

**Konsekvenser (testbare):**
- Egenskapsbaserte tester (minst 1000 tilfeldige inndata i CI, se NFR-QA i §7): poengsummen er
  alltid mellom 0 og 100; mer nysnø gir aldri lavere A; lavere snittemperatur gir aldri lavere B;
  ingen nedbør (P < 0,5 mm) gir alltid B = 0 og C = 0; samme inndata gir alltid samme resultat.
- En parity-test kjører et fast sett gyldige inndata gjennom både `src/lib/snowscore.ts` og
  `supabase/functions/pipeline/score.ts` og bekrefter identisk output.

#### FR-8: Forklaringsside — kort fortalt og steg for steg *(Må ha)*

Systemet viser en side som forklarer hva SnowScore måler og hvordan den beregnes, med formelen
og én illustrasjon per delpoeng.

**Konsekvenser (testbare):**
- Siden er tilgjengelig fra hver SnowScore-visning i løsningen (lenket, ikke bare fra
  toppmenyen).
- Innholdet er versjonert: hver endring i formelparametere (som Marys nevner-endring 6→16) får en
  ny rad i endringsloggen på siden, med begrunnelse.

#### FR-9: Regneeksempel *(Må ha)*

Siden viser et komplett, utledet regneeksempel fra rådata (nedbør og temperatur time for time)
til ferdig poengsum, slik Mary rettet det (6-timers tabell, se briefen).

**Konsekvenser (testbare):**
- Eksemplet viser eksplisitt S, P og T̄ utledet fra timesverdiene — ikke bare sluttsvaret.

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

Systemet viser et kart over Norge (Leaflet/OpenStreetMap) der hvert sted i katalogen er
fargelagt etter sin gjeldende SnowScore.

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

#### FR-15: Hurtigvalg *(Bør ha)*

Brukeren kan trykke forhåndsdefinerte snarveier («Pudderdag», «Sol etter snøfall») som fyller
inn filteret med ett trykk.

**Konsekvenser (testbare):**
- Hvert hurtigvalg tilsvarer en dokumentert, fast kombinasjon av filterverdier (ikke en skjult
  heuristikk som er vanskelig å etterprøve).

### 4.4 Stedsside

**Beskrivelse:** Detaljvisningen for ett sted: full poengsum med delpoeng, rådata, og beste
skivindu. Realiserer klimakset i UJ-1 og entry-punktet for UJ-2 (følg sted).

#### FR-16: Stedsside med full poengsum og rådata *(Må ha)*

Hvert sted har en egen side med unik, delbar adresse (URL) som viser SnowScore med delpoeng
(A/B/C), temperatur, nysnø, vind, skydekke, høyde og datakildens tidsstempel.

**Konsekvenser (testbare):**
- URL-en er stabil og delbar uten server-side sesjon (ingen konto kreves for å åpne den).
- Data eldre enn tre timer merkes «utdatert» i grensesnittet (jf. brief); steder med data eldre
  enn tolv timer vises ikke i kart, filter eller varsler (NFR-3 i §7).

#### FR-17: Beste skivindu *(Bør ha)*

Stedssiden viser de fire beste sammenhengende timene i et 48-timers vindu, med mørketid-fallback
(Marys rettelse: uten dagslystimer i vinduet, brukes alle timer, med tydelig UI-merking).

**Konsekvenser (testbare):**
- Kommer det nysnø i perioden, velges vinduet kun blant timer etter at snøfallet har stoppet.
- I mørketid vises teksten «Mørketid – vindu vist uten dagslys» i stedet for at funksjonen
  returnerer tomt eller feiler.

#### FR-18: Snøvarsel — registrering *(Bør ha)*

Brukeren kan følge et sted med en egendefinert terskel og motta push-varsel når kravet oppfylles,
uten brukerkonto. Realiserer UJ-2.

**Konsekvenser (testbare):**
- Registrering skjer via en Edge Function som validerer terskelen og begrenser antall regler
  per enhet (rate-limit, se NFR-5).
- Kun `supabase/functions/follow/` skriver til `alert_rules` (AD-1 — ingen annen funksjon skriver
  dit).

#### FR-19: Snøvarsel — utsendelse og avmelding *(Bør ha)*

Etter hver publisering evaluerer pipelinen varselregler mot de nye dataene og sender push-varsel,
maks én gang per regel per døgn.

**Konsekvenser (testbare):**
- To påfølgende publiseringer samme døgn som begge oppfyller terskelen, utløser kun ett varsel
  (deduplisert via `alert_dispatch_log`, AD-1).
- Hvert varsel har avmelding med ett klikk, og avmelding sletter regelen (ikke bare deaktiverer
  den) — verifisert med sikkerhetstest (se NFR-QA i §7).

### 4.5 Filter

**Beskrivelse:** Mekanismen som gjør «hvor oppfylles kravene mine nå?» besvarbart. Realiserer
UJ-1 og UJ-3.

#### FR-20: Flerkriteriefilter — nysnø, vind, temperatur *(Må ha)*

Brukeren kan sette minimumskrav til nysnø (mm/cm) og grenser for vind og temperatur, kombinert
med OG, og få tilbake bare steder som oppfyller alle valgte kriterier.

**Konsekvenser (testbare):**
- Svar på under 2 sekunder for 95 % av søk (NFR-1 i §7), via en parameterisert
  databasefunksjon mot en forhåndsberegnet, indeksert tabell.
- Nysnø-cm-anslaget bruker den faste omregningen 1 mm vannekvivalent ≈ 1 cm nysnø (Marys
  presisering), identisk med SnowScore-seksjonens forklaring.

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

### 4.6 Tilbakemelding uten konto

**Beskrivelse:** Lavterskel kanal for feilmeldinger og forslag, uten at brukeren må oppgi
identifiserbar informasjon.

#### FR-27: Tilbakemeldingsskjema *(Bør ha)*

Brukeren kan sende en tilbakemelding (kategori + fritekst, inntil 1000 tegn) uten innlogging,
navn eller e-post.

**Konsekvenser (testbare):**
- Skjemaet advarer brukeren mot å skrive personopplysninger i fritekstfeltet før innsending.

#### FR-28: Serversidevalidert, misbruksbeskyttet innsending *(Bør ha)*

Innsendingen behandles av en Edge Function som verifiserer et Turnstile-token, validerer mot et
fast skjema, og begrenser antall innsendinger med en kortlevd, saltet hash.

**Konsekvenser (testbare):**
- Klienten har ingen direkte skrivetilgang til `feedback`-tabellen (kun Edge Function-en kan
  skrive, jf. AD-1); forsøk på direkte skriving fra klienten blokkeres av RLS.
- Fritekst behandles som utrygt innhold ved lagring og visning (ingen HTML/skript kan injiseres
  — sikkerhetstest i CI).

#### FR-29: Automatisk sletting *(Bør ha)*

Tilbakemeldinger slettes automatisk etter tolv måneder, av samme sentrale rutine som eier all
TTL-sletting (`retention/cleanup.ts`, AD-7).

## 5. Ikke-mål (eksplisitt)

- SnowFinder er **ikke** en skredfarevurdering og gir aldri råd om ferdselssikkerhet — lenker til
  Varsom.no i stedet for å duplisere eller erstatte det.
- **Ingen brukerkontoer** i v1 — verken e-post/passord, sosial innlogging, eller lagrede profiler
  på tvers av enheter.
- **Ingen flerspråklighet** i v1 — norsk er eneste språk i grensesnittet.
- **Ingen webkameraer eller livevideo** i v1 (eksplisitt utsatt til v2, se Product Vision i
  briefen).
- **Ingen native app** i appbutikkene i v1 — kun installerbar webapp (PWA).
- **Ingen booking, kjøp eller betaling** noe sted i løsningen.
- **Ingen generativ KI-chat mot sluttbruker** — SnowScore er deterministisk, ikke en
  språkmodell-generert vurdering (jf. brief §AI-assisted Development: KI brukes i utvikling, ikke
  i produktet selv mot sluttbruker).
- **Ingen skala utover ~300–1500 steder** i v1 — nasjonal, ikke global, dekning.

## 6. MVP-omfang

### 6.1 I omfang (Må ha)

- Stedskatalog og datapipeline med validering, robusthet og atomisk publisering (§4.1)
- SnowScore-modul, forklaringsside (uten kalkulator), regneeksempel (§4.2, FR-7/8/9/11)
- Norgeskart **og** tilgjengelig listevisning som likeverdig alternativ (§4.3)
- Stedsside med full poengsum og rådata (§4.4, FR-16)
- Filter for nysnø, vind og temperatur, med URL-persistens og null-treff-veiledning (§4.5,
  FR-20/21/26)
- Robust feilhåndtering (kretsbrytere, siste gyldige data) og CI med det reelle
  QA-minimumet Mary definerte: egenskapsbaserte tester, kontraktstester, én E2E-røyktest
  (kart → filter → stedsside)

### 6.2 Utenfor MVP (Bør ha — bygges først når Må ha er ferdig og testet)

- Beste skivindu (FR-17), kalkulator på forklaringssiden (FR-10), snøvarsel (FR-18/19),
  solfilter (FR-22), avstandsfilter (FR-23), nysnø siste 24 t (FR-25), tilbakemelding uten konto
  (FR-27/28/29)
- Full sikkerhetstestsuite og den oppgavebaserte 5-persons brukertesten — verdifulle mål, men
  regnes som «bør ha»-dybde (Marys skille), ikke en blokkerende del av en «må ha»-leveranse
  `[NOTE FOR PM: hvis tiden blir svært knapp, er sikkerhetstestene for feedback/varsel-skrivepath
  likevel høyt prioritert innad i «bør ha», siden de dekker faktiske skrivbare endepunkter.]`

### 6.3 Ikke i v1 (Won't have)

Brukerkontoer, flere språk, webkameraer, app i appbutikkene, skredvarsling, målt snødybde,
booking, generativ værchat — se §5 for begrunnelse.

## 7. Ikke-funksjonelle krav

### 7.1 Ytelse

- **NFR-1:** 95 % av filtersøk svarer på under 2 sekunder. Validerer FR-20.
- **NFR-2:** Norgeskartet er interaktivt (kan panneres/zoomes) innen 3 sekunder på mobil, målt
  på en representativ midtsegment-telefon over 4G. Validerer FR-12.

### 7.2 Datafriskhet og robusthet

- **NFR-3:** Publiserte data er normalt under 90 minutter gamle; data eldre enn tre timer
  merkes «utdatert», og steder med data eldre enn tolv timer fjernes fra kart/filter/varsler.
  Validerer FR-16.
- **NFR-4:** Tjenesten fungerer med siste gyldige data når én datakilde (MET eller NVE) er
  utilgjengelig — verifisert ved å simulere nedetid i test. Validerer FR-6.

### 7.3 Sikkerhet og personvern

- **NFR-5:** Alle skrivbare endepunkter (feedback, følg sted) er hastighetsbegrenset og
  Turnstile-beskyttet; hemmelige nøkler finnes kun på serversiden; Row Level Security gjelder
  alle tabeller; klienten har utelukkende lesetilgang (anon key) mot publiserte data (AD-1).
  Validerer FR-28.
- **NFR-6:** Mislykkede pipeline-jobber, avviste API-svar og utløste kretsbrytere logges til
  `api_incidents` **og** varsler gruppen aktivt (webhook/kanal) — logging alene er ikke
  tilstrekkelig (arkitektur, Consistency Conventions). Validerer FR-6.
- **NFR-Privacy:** Ingen brukerkonto kreves noe sted i løsningen. Posisjon brukes og beregnes
  kun i nettleseren og sendes aldri til server (FR-23). Push-abonnement, rate-limit-hash og
  IP-adresse er de eneste behandlede identifikatorene, og slettes etter definerte frister
  (avmelding, 24 t, 12 mnd., 7 døgn — jf. brief §Database and Privacy).

### 7.4 Tilgjengelighet (regulatorisk/kvalitetskrav)

- **NFR-7 (WCAG 2.1 AA — presisert av Mary):** Filter, stedssider, forklaringsside, skjema for
  tilbakemelding og snøvarsel oppfyller WCAG 2.1 AA i sin helhet. Den tilgjengelige
  listevisningen (FR-13) er et fullt AA-kompatibelt alternativ til kartet. Selve det visuelle
  Leaflet-kartlaget er eksplisitt unntatt fra full AA-etterlevelse (fargekontrast på kart-tiles
  og kompleks kartnavigasjon er ikke realistisk å gjøre fullt AA-kompatibelt innenfor
  prosjektets tidsramme) — begrunnelse i memloggen. Validerer FR-13.

### 7.5 Skalerbarhet (begrensning, ikke ambisjon for v1)

- **NFR-8:** Arkitekturen skal tåle vekst fra ~300 til ~1500 steder i katalogen uten
  strukturelle endringer (kun datavolum), og fra prosjektets nåværende brukertall mot «noen
  tusen» samtidige lesere, gitt at frontend er skrivebeskyttet mot en forhåndsberegnet,
  indeksert tabell (samme mekanisme som gir NFR-1). `[ASSUMPTION: "noen tusen" tolkes som opptil
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

Pipelinen respekterer MET sine bruksvilkår (User-Agent, `Expires`, samtidighetsbegrensning) —
ikke bare for robusthet, men fordi gjentatt brudd kan føre til at gruppens IP/nøkkel
blokkeres, noe som ville stoppet hele tjenesten. Dette er en reell driftsrisiko, ikke bare en
kodekvalitetsdetalj.

## 9. Suksessmål

**Primære**
- **SM-1 (Ytelse):** 95 % av filtersøk under 2 sekunder. Validerer FR-20/NFR-1.
- **SM-2 (Nytte):** Minst 4 av 5 testbrukere fullfører oppgaven «finn et skisted som oppfyller
  et gitt krav» på under 2 minutter, uten hjelp fra testleder. Validerer FR-20/FR-12/FR-13.
- **SM-3 (Forklarbarhet):** Minst 4 av 5 testbrukere kan forklare en vist SnowScore etter å ha
  lest forklaringssiden. Validerer FR-8/FR-9.

**Sekundære**
- **SM-4 (Dataforståelse):** Minst 4 av 5 testbrukere skiller prognose fra faktiske forhold og
  oppdager utdaterte data uten å bli fortalt det på forhånd. Validerer FR-11/FR-16.
- **SM-5 (Robusthet):** Tjenesten fungerer med siste gyldige data når en datakilde simuleres
  nede, verifisert i test. Validerer FR-6/NFR-4.
- **SM-6 (Korrekthet):** Egenskapstestene for SnowScore passerer for minst 1000 tilfeldige
  inndata i CI (skalert ned fra briefens opprinnelige 10 000 for realistisk CI-kjøretid i et
  studentprosjekt — samme egenskaper testes, færre kjøringer).
  `[ASSUMPTION: 1000 er en praktisk avveining mellom testdekning og CI-kjøretid; kan skrus opp
  hvis CI-tiden tillater det.]` Validerer FR-7.
- **SM-7 (Tilgjengelighet):** Automatisert axe-sjekk i CI rapporterer null kritiske
  WCAG 2.1 AA-brudd på filter, stedsside, forklaringsside og listevisning. Validerer FR-13/NFR-7.
- **SM-8 (Sporbarhet):** 100 % av endringer i hovedgrenen kommer via godkjente Pull Requests
  (verifiserbart i git-historikk). Validerer prosesskravet i CONTRIBUTING.md.

**Mot-metrikker (skal ikke optimeres isolert)**
- **SM-C1:** Antall sendte snøvarsler skal *ikke* økes for sin egen del — et varsel som ikke
  fører til at brukeren faktisk drar eller handler, er støy, ikke suksess. Motvekt til SM-2/FR-19
  (motvirker en fremtidig fristelse til å varsle oftere «for engasjement»).
- **SM-C2:** Andel Må ha-tester som fjernes eller svekkes for å få CI grønn skal være null —
  «grønn CI» er ikke suksess hvis det oppnås ved å teste mindre. Motvekt til SM-6/SM-8.

## 10. Åpne spørsmål

1. **Push-leveranse:** Rå Web Push API eller en tredjepartstjeneste? Arkitekturen har dette som
   uavklart («Deferred») — avklares når FR-18/19 tas som story.
2. **Hosting:** Cloudflare Pages (arkitekturens antagelse, pga. Turnstile fra samme leverandør)
   eller Vercel? Bekreft med gruppa før første deploy.
3. **IBE160-vurderingskriterier:** Finnes det et eget kriteriedokument for emnet utover
   produktbriefens Definition of Done? Ikke funnet i repoet ved skrivetidspunktet — hvis det
   finnes, bør det krysjekkes mot §9 Suksessmål og §6 MVP-omfang.
4. **Skalatall for NFR-8:** Er «noen tusen brukere» en reell forventning for
   innleveringen/demoen, eller kun en arkitektonisk forsikring? Påvirker om lasttesting hører
   hjemme i Må ha-QA-minimumet.
5. **Varselfrekvens-grense:** Er «maks ett varsel per regel per døgn» riktig grense, eller bør
   brukeren selv kunne justere frekvens? Foreslått holdt fast (enklere, matcher SM-C1), men ikke
   eksplisitt bekreftet av gruppa utover det som allerede sto i briefen.

## 11. Antagelsesindeks

- §7.5 — «Noen tusen brukere» tolket som ~5000 samtidige i spissbelastning; ingen offisiell
  målsetting oppgitt.
- §9 SM-6 — Antall egenskapstest-kjøringer skalert fra 10 000 (brief) til 1000 (PRD) for
  realistisk CI-kjøretid; samme testede egenskaper.
- §6.2 — Sikkerhetstester for feedback/varsel-skrivepath foreslått prioritert høyt *innad* i
  «bør ha», selv om kategorien i seg selv ikke er blokkerende.
