# SnowFinder – Produktbrief

**IBE160 Programmering med KI | Gruppe G18**

*Beslutningsgrunnlag for utvikling, testing og refleksjonsrapport*



## Executive Summary

SnowFinder er en webapplikasjon som hjelper norske skientusiaster med å
finne og sammenligne steder der værprognosen viser gode muligheter for
snø. I dag må brukeren ofte sjekke flere tjenester og selv tolke
temperatur, nedbør, vind og høyde. SnowFinder samler disse opplysningene
og presenterer dem i et interaktivt kart, en detaljvisning og en rangert
Topp 10-liste.

Prosjektets viktigste egenutviklede funksjon er **SnowScore**, en
forklarbar poengsum fra 0 til 100. Poengsummen beregnes med dokumenterte
regler for prognostisert nysnøpotensial, temperatur og sannsynlig
snøandel. Brukeren skal kunne se både totalsummen og hvilke
delberegninger som ligger bak resultatet.

SnowFinder skal bruke live prognosedata fra MET Norway, stedsdata fra
Kartverket og kartgrunnlag fra OpenStreetMap. Supabase brukes til sikker
innlogging og private favoritter. En avgrenset agentbasert
overvåkingsløsning skal kontrollere datakvalitet, registrere feil,
forsøke trygg ny henting og sørge for at brukeren aldri får oppdiktede
værverdier når en ekstern tjeneste ikke svarer.

Løsningen viser **prognostisert snøpotensial**. Den viser ikke målt
snødybde, garanterte løypeforhold eller skredsikkerhet.

## The Problem

Skientusiaster som ønsker å velge tursted, må i dag ofte oppsøke og
sammenligne flere kilder. De må manuelt vurdere om nedbør kommer som
regn eller snø, om temperaturen er gunstig, hvor mye det blåser, og om
flere aktuelle steder kan sammenlignes på samme tidspunkt.

Dette skaper tre konkrete problemer:

1. **Fragmentert informasjon:** relevante data ligger i flere tjenester.
2. **Krevende tolkning:** rå værdata gir ikke nødvendigvis et tydelig svar på hvilket sted som har best prognostisert snøpotensial.
3. **Lav sammenlignbarhet:** steder vurderes ofte med forskjellige prognoseperioder og kriterier.

SnowFinder skal redusere tiden og den manuelle vurderingen som kreves
for å finne aktuelle steder, samtidig som usikkerhet og datagrunnlag
kommuniseres tydelig.

## The Solution

Brukeren skal kunne:

- Søke etter et norsk stedsnavn eller velge en posisjon i kartet.
- Hente oppdatert værprognose for valgt sted.
- Se temperatur, nedbør, vind, høyde, prognoseperiode og tidspunkt for siste oppdatering.
- Se en SnowScore fra 0 til 100 med forklaring av alle delpoeng.
- Se en Topp 10-liste over et forhåndsdefinert utvalg steder, beregnet for samme prognoseperiode.
- Sammenligne to eller tre steder på samme datagrunnlag.
- Opprette bruker og lagre private favorittsteder.
- Få tydelig beskjed dersom data mangler, er gamle eller ikke kan hentes.

Applikasjonen skal være responsiv og fungere på både mobil og PC.

## Product Vision

SnowFinder skal gjøre det raskere og enklere å finne steder med gode
prognostiserte snøforhold, uten å skjule hvordan resultatet er beregnet.
Målet er ikke å erstatte offisielle værtjenester, men å gjøre relevante
data lettere å sammenligne og forstå.

På lengre sikt kan løsningen utvides med historikk, flere
prognosevinduer, flere turtyper og analyse av hvor godt tidligere
prognoser traff. Første versjon skal imidlertid prioritere en stabil og
testbar kjerne fremfor mange halvferdige funksjoner.

## What Makes This Different

SnowFinder skiller seg fra en vanlig værside ved å kombinere:

- Kartbasert utforskning av steder i Norge.
- En felles prognoseperiode for sammenligning.
- En forklarbar SnowScore med synlige delpoeng.
- Rangering og direkte sammenligning av steder.
- Automatisk kontroll av datakvalitet og tydelig feilhåndtering.
- Favoritter knyttet til en sikker brukerkonto.

Fordelen ligger ikke i unike værdata, men i hvordan dataene samles,
kvalitetssikres, forklares og presenteres.

## Target Users

### Primær målgruppe

Norske skientusiaster som vil bruke mindre tid på å lete gjennom flere
tjenester og raskere finne aktuelle steder med gode prognostiserte
snøforhold.

### Sekundær målgruppe

- Studenter og familier som planlegger en helge- eller dagstur.
- Brukere med begrenset erfaring i å tolke detaljerte værdata.
- Erfarne brukere som ønsker en rask rangering før de undersøker et sted nærmere.

## Scope for Version 1

### In scope

1. Interaktivt kart over Norge.
2. Stedsøk og valg av posisjon i kartet.
3. Live prognosedata fra MET Norway.
4. Steds- og koordinatdata fra Kartverket.
5. SnowScore med totalsum, delpoeng og forklaring.
6. Topp 10-liste basert på samme prognosevindu.
7. Sammenligning av to eller tre steder.
8. Supabase-innlogging og private favoritter.
9. Agentbasert validering, feillogging og trygg ny henting av værdata.
10. Responsivt design, feilmeldinger og tilgjengelighet.
11. Automatiserte tester og dokumentert kvalitetssikring.

### Out of scope

- Skredvarsling eller anbefaling om at et område er trygt.
- Målt snødybde eller garanti for faktiske løypeforhold.
- Kjøp, salg, booking eller betaling.
- Sosialt nettverk, chat mellom brukere eller åpne brukerinnlegg.
- En generativ værchat som kan finne på svar.
- Kontinuerlig oppdatering hvert sekund.
- Full dekning av alle steder i Norge i Topp 10-beregningen.

## Data Sources and Processing

| **Kilde**     | **Bruk**                                        | **Viktig avgrensning**                                        |
|---------------|-------------------------------------------------|---------------------------------------------------------------|
| MET Norway    | Temperatur, nedbør, vind og værprognose         | Prognosedata, ikke observerte snøforhold                      |
| Kartverket    | Stedsnavn, søk og koordinater                   | Bruksvilkår og teknisk grensesnitt skal dokumenteres          |
| OpenStreetMap | Kartgrunnlag                                    | Kildehenvisning skal vises i kartet                           |
| Supabase      | Innlogging, favoritter og nødvendige systemdata | Passord håndteres av Supabase Auth, ikke av egen databasekode |
| Brukeren      | Søketekst, valgt sted og favoritter             | Bare nødvendige personopplysninger lagres                     |

Eksterne data skal hentes gjennom et eget service- eller backendlag.
Dette laget skal validere svar, standardisere enheter, mellomlagre siste
gyldige resultat og hindre at API-detaljer spres gjennom
brukergrensesnittet.

## SnowScore

SnowScore skal være en deterministisk og testbar beregning. Samme
inndata skal alltid gi samme resultat.

| **Komponent**                | **Maksimalt bidrag** | **Formål**                                                                          |
|------------------------------|----------------------|-------------------------------------------------------------------------------------|
| Prognostisert nysnøpotensial | 60 poeng             | Vurderer nedbørsmengde sammen med temperatur og værtype                             |
| Kulde                        | 25 poeng             | Gir poeng når temperaturen er egnet for at nedbør kan komme og bli liggende som snø |
| Sannsynlig snøandel          | 15 poeng             | Vurderer hvor stor del av nedbøren som sannsynligvis kommer som snø                 |
| **Totalt**                   | **100 poeng**        | Samlet og sammenlignbar vurdering                                                   |

Før implementering skal gruppen fastsette og dokumentere:

- Nøyaktige terskler og intervaller.
- Hvordan temperatur gjennom prognoseperioden vektes.
- Hvordan nedbør omregnes til et forsiktig estimat for snøpotensial.
- Hvordan vind påvirker presentasjonen, selv om vind ikke inngår direkte i poengsummen.
- Hvordan manglende eller usikre data påvirker resultatet.

SnowScore skal aldri beregnes som om manglende verdier var null. Dersom
nødvendige data mangler, skal resultatet merkes som ufullstendig eller
ikke tilgjengelig.

## AI Agents and Automated Operations

Agentene skal støtte drift, testing og feilsøking. De skal ikke erstatte
autoritative værdata eller ta skjulte beslutninger på vegne av brukeren.

### 1. Data Retrieval Agent

- Henter prognosedata når brukeren velger et sted.
- Oppdaterer Topp 10-data etter en planlagt tidsplan.
- Bruker en kontrollert ny-hentingsstrategi dersom en ekstern tjeneste midlertidig feiler.
- Respekterer leverandørenes begrensninger, mellomlagring og bruksvilkår.

### 2. Data Validation Agent

- Kontrollerer at obligatoriske felt finnes.
- Kontrollerer enheter, tidsstempler og realistiske verdiområder.
- Avviser ugyldige eller ufullstendige svar før SnowScore beregnes.
- Sammenligner nye svar med forventet datastruktur og oppdager API-endringer.

### 3. Monitoring and Recovery Agent

- Registrerer tekniske feil uten å lagre unødvendige personopplysninger.
- Skiller mellom nettverksfeil, rate limits, valideringsfeil og programfeil.
- Forsøker trygg ny henting et begrenset antall ganger.
- Viser siste gyldige resultat med tydelig tidsstempel dersom dette er forsvarlig.
- Viser «Værdata er midlertidig utilgjengelige» dersom pålitelig informasjon ikke finnes.

### 4. Test and Quality Agent

- Kjører enhetstester, integrasjonstester og kodekontroll ved Pull Requests.
- Oppsummerer feil for gruppen, men endrer ikke produksjonskode uten menneskelig godkjenning.
- Kontrollerer at SnowScore alltid ligger mellom 0 og 100.
- Tester sentrale brukerreiser før en ny versjon publiseres.

### Sikkerhetsgrenser for agentene

- Agentene skal aldri konstruere eller gjette manglende værverdier.
- Agentene skal aldri skjule datakilde, oppdateringstid eller feilstatus.
- Nye kodeendringer skal godkjennes av et gruppemedlem gjennom Pull Request.
- Antall automatiske nye forsøk skal være begrenset for å unngå overbelastning av eksterne API-er.
- Kritiske feil skal logges og presenteres som feil, ikke kamufleres som vellykket respons.

«Øyeblikkelig oppdatering» betyr at grensesnittet oppdateres straks nye
validerte data er mottatt. Det betyr ikke at eksterne værdata endres
hvert sekund. Oppdateringsfrekvensen skal følge datakildenes
tilgjengelighet og bruksvilkår.

## Proposed Architecture

Teknisk flyt: Bruker og kart → React-frontend → API- og servicelag → MET
Norway og Kartverket → validering, cache og SnowScore. Supabase
håndterer innlogging og favoritter, mens overvåking og feillogg kan
utløse kontrollert ny henting.

### Foreslått teknologistack

| **Område**             | **Teknologi**                                                       |
|------------------------|---------------------------------------------------------------------|
| Frontend               | React, TypeScript og Vite                                           |
| Kart                   | Leaflet og OpenStreetMap                                            |
| Backend/service        | Node.js-baserte API-funksjoner eller tilsvarende serverless-løsning |
| Database og innlogging | Supabase og Row Level Security                                      |
| Testing                | Vitest og Playwright                                                |
| Kodekvalitet           | ESLint, TypeScript og formatkontroll                                |
| Versjonskontroll       | GitHub, branches og Pull Requests                                   |
| Automatisering         | GitHub Actions                                                      |

## Database and Privacy

Supabase skal brukes til autentisering og favoritter. Applikasjonen skal
ikke utvikle egen passordlagring.

Minimumstabeller:

- profiles: nødvendig profilinformasjon knyttet til autentisert bruker.
- favorites: bruker-ID, sted, koordinater og opprettelsestidspunkt.
- api_incidents: teknisk feiltype, tidspunkt og status uten unødvendige persondata.

Row Level Security skal sikre at:

- En bruker bare kan lese og endre sine egne favoritter.
- Ikke-innloggede brukere ikke får tilgang til private brukerdata.
- Tekniske logger ikke er tilgjengelige fra den vanlige klienten.

## Quality Assurance

### Automatiserte tester

- Enhetstester av alle SnowScore-regler og terskelverdier.
- Tester av minimumsverdi 0 og maksimumsverdi 100.
- Tester av manglende, ugyldige og gamle værdata.
- Integrasjonstester av datatransformasjon fra API-svar til visning.
- Tester av innlogging og private favoritter.
- End-to-end-test av søk, kartvalg, resultat og favorittlagring.

### Manuell kvalitetssikring

- Kontrollere et utvalg steder mot den opprinnelige prognosen hos MET Norway.
- Teste på mobil, nettbrett og PC.
- Teste med tastatur og kontrollere kontrast og lesbarhet.
- Gjennomføre brukertest med minst fem personer.
- Dokumentere feil, årsak, løsning og ny test.

## Success Criteria

| **Område**            | **Målbart kriterium**                                                              |
|-----------------------|------------------------------------------------------------------------------------|
| Kjernefunksjon        | Brukeren kan søke eller velge sted og få et gyldig, forklart resultat              |
| Sammenligning         | Alle steder i Topp 10 beregnes for samme prognoseperiode                           |
| Forklarbarhet         | Minst 4 av 5 testbrukere kan forklare hovedårsaken til en vist SnowScore           |
| Datakvalitet          | Applikasjonen viser aldri oppdiktede verdier ved manglende API-data                |
| Robusthet             | Kontrollerte tester av API-feil gir forståelig feilmelding og logget hendelse      |
| Sikkerhet             | Tester viser at en bruker ikke kan lese eller endre en annen brukers favoritter    |
| Testdekning           | All forretningskritisk beregningslogikk har automatiserte tester                   |
| Tilgjengelighet       | Kjernefunksjonene kan brukes på mobil og med tastaturnavigasjon                    |
| Prosjektgjennomføring | Alle vesentlige endringer kan spores til commits, branches og Pull Requests        |
| Faglig refleksjon     | Rapporten dokumenterer KI-bidrag, menneskelig kontroll, feil og etiske vurderinger |

## AI-assisted Development and Documentation

Claude Code eller en tilsvarende kodeagent kan brukes til å:

- Foreslå arkitektur og mappestruktur.
- Generere førsteutkast til komponenter og tester.
- Feilsøke API-integrasjoner.
- Analysere testfeil og foreslå rettelser.
- Forbedre dokumentasjon og kodekommentarer.

Gruppen skal dokumentere:

1. Hvilke oppgaver KI ble brukt til.
2. De viktigste instruksene eller promptene.
3. Hvilken kode KI foreslo.
4. Hvilke forslag gruppen endret eller avviste.
5. Hvordan koden ble testet og kvalitetssikret.
6. Hvem som godkjente og integrerte endringen.

KI-generert kode skal behandles som et forslag, ikke som automatisk
korrekt kode.

## Ethical and Technological Considerations

- SnowScore kan påvirke brukerens valg, men er ikke en sikkerhetsvurdering.
- Værprognoser inneholder usikkerhet som skal kommuniseres tydelig.
- Løsningen skal ikke formulere garantier om snø, løypekvalitet eller sikker ferdsel.
- Datakilder, beregningsmetode og oppdateringstid skal være synlige.
- Personopplysninger skal begrenses til det som er nødvendig.
- Automatiserte agenter skal ha avgrensede rettigheter, logging og menneskelig kontroll.
- Gruppen skal drøfte både fordelene og risikoen ved KI-generert kode i refleksjonsrapporten.

## Development Process

Prosjektet gjennomføres iterativt:

1. Låse krav, SnowScore-regler og datakilder.
2. Lage teknisk arkitektur og datamodell.
3. Bygge kart, søk og grunnleggende værvisning.
4. Implementere og teste SnowScore.
5. Bygge Topp 10 og sammenligning.
6. Legge til Supabase-innlogging og favoritter.
7. Implementere overvåking, trygg ny henting og feillogging.
8. Gjennomføre automatiserte og manuelle tester.
9. Brukerteste, forbedre og dokumentere.
10. Ferdigstille refleksjonsrapport og individuell bidragsdokumentasjon.

Hvert gruppemedlem arbeider på egen branch. Vesentlige endringer
integreres gjennom Pull Requests med minst én menneskelig gjennomgang.

## Deliverables

- Kjørbar SnowFinder-applikasjon.
- Kildekode i GitHub med forståelig mappestruktur og commit-historikk.
- Oppdatert produktbrief, krav og arkitektur.
- Dokumentert SnowScore-algoritme.
- Automatiserte tester og testresultater.
- KI-logg med sentrale prompts, vurderinger og endringer.
- Refleksjonsrapport om prosess, kvalitet, etikk og teknologi.
- Kort demonstrasjon av normal drift og håndtering av API-feil.

## Definition of Done

SnowFinder regnes som ferdig når:

- Alle funksjoner i «In scope» er implementert eller eksplisitt omprioritert og dokumentert.
- Kjerneflyten fungerer på mobil og PC.
- SnowScore er forklart, testet og reproduserbar.
- Feil i eksterne tjenester håndteres uten oppdiktede data.
- Supabase-regler og private favoritter er testet.
- Automatiserte tester kjører uten kritiske feil.
- Datakilder og oppdateringstid vises tydelig.
- Vesentlige KI-bidrag og menneskelig kvalitetssikring er dokumentert.
- Gruppen kan forklare både hvordan løsningen virker og hvilke begrensninger den har.

