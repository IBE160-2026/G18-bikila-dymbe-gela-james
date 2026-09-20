# Produktbrief: SnowFinder

**Emne:** IBE160 – Programmering med KI
**Gruppe:** G18
**Status:** Arbeidsutkast. Opprinnelig basert på «Produktbrief_SnowFinder.pdf» fra 09.09.2026, og nå omstrukturert etter emnets produktbrief-mal (`docs/maler/BMAD_Product_Brief_Student_Template.pdf`, BMAD Method v6.11.0). Dokumentet er ikke godkjent av gruppen eller faglærer, og flere seksjoner inneholder åpne punkter som må avklares før implementering låses.

## Executive Summary

For norske skientusiaster lager vi SnowFinder, en webapplikasjon som hjelper dem å finne og sammenligne steder i Norge der værprognosen viser gode muligheter for snø – fordi de i dag må sjekke flere kilder manuelt og selv veie sammen temperatur, nedbør og høyde for hvert enkelt sted.

Brukeren søker etter et sted eller velger en lokasjon i et interaktivt kart, og får temperatur, nedbør, beregnet nysnø, vind og høyde samlet i én oversikt. En forklarbar SnowScore fra 0 til 100 gjør det mulig å sammenligne flere steder innenfor samme prognoseperiode, uten at brukeren selv må tolke rådataene.

Løsningen viser **prognostisert snøpotensial** – ikke målt snødybde, faktiske løypeforhold eller en vurdering av skredsikkerhet. Omfang, prognosevindu og hvilke funksjoner som inngår i første versjon, er foreløpig ikke låst av gruppen (se «Scope» og «Beslutninger som gjenstår»).

## The Problem

Skientusiaster som vil planlegge en tur, må i dag selv oppsøke og sammenligne flere kilder (f.eks. værtjenester, kartverk og skiforum) for å vurdere hvilket sted som har best forhold. Det krever at brukeren manuelt tolker og veier sammen flere værparametere – temperatur, nedbør, vind og høyde – per kandidatsted, uten noen samlet og forklart poengsum å sammenligne på tvers av steder.

Konsekvensen er at valget av tursted blir tidkrevende og i stor grad avhengig av brukerens egen erfaring med å tolke værdata. Hvor stor denne kostnaden faktisk er for målgruppen (tidsbruk, antall kilder de i dag bruker, hvor ofte de bommer på forholdene), er ikke dokumentert og bør valideres med faktiske brukere.

## The Solution

SnowFinder samler de relevante værparameterne for et gitt sted i én oversikt, og oversetter dem til en forklarbar SnowScore som kan brukes til å sammenligne flere steder innenfor samme prognoseperiode. Brukeren skal kunne:

- Søke etter eller velge en lokasjon i et interaktivt kart over Norge.
- Se værprognose (temperatur, nedbør, beregnet nysnø, vind, høyde) og SnowScore for valgt sted, med forklaring av hvordan poengsummen er beregnet.
- Se en rangert oversikt over et avgrenset utvalg steder, samt en detaljvisning med tidspunkt for siste oppdatering.
- (Foreslått, ikke bestemt) Logge inn med e-post for å lagre private favorittsteder, og stille enkle spørsmål til en regelbasert værchat som forklarer værdataene.

Hvordan SnowScore beregnes, hvilke datakilder som brukes, og hvordan innlogging/database løses teknisk, er beskrevet i støttenotatet nedenfor og hører hjemme i videre krav- og arkitekturarbeid (PRD/arkitektur), ikke som en låst del av denne briefen.

## What Makes This Different

Alternativet i dag er at brukeren selv går til værtjenester og eventuelt kart/skiforum, og manuelt sammenligner flere steder og værparametere. Det tolereres fordi det er «godt nok» og gratis, men det krever tid og værfaglig skjønn av brukeren selv.

SnowFinders foreslåtte fordel er at den samler parameterne og oversetter dem til én forklarbar, sammenlignbar poengsum (SnowScore) for flere steder på samme prognosegrunnlag – i stedet for at brukeren må gjøre denne sammenveiingen selv for hvert sted. Dette er foreløpig en antagelse: **det er ikke bekreftet av gruppen om dette oppleves som en reell fordel for målgruppen**, og SnowScore-vektingen er et skolemodell-designvalg, ikke en dokumentert bransjestandard (se støttenotat). Det finnes ingen kjent teknisk eller datamessig «moat» – fordelen ligger eventuelt i brukeropplevelsen (samlet, forklart sammenligning), ikke i unike data.

## Who This Serves

**Primær bruker i én setning:** Norske skientusiaster som vil bruke fritiden sin best mulig, men som i dag må sjekke flere kilder manuelt for å finne et sted med gode snøforhold innenfor en gitt tidsperiode.

Sekundære brukere og mer presise behov (f.eks. erfaringsnivå, om det gjelder lengre skiturer eller nærturer) er ikke beskrevet i kildematerialet og bør konkretiseres av gruppen.

## Success Criteria

Ikke fastsatt av gruppen ennå. Malen ber om målbare signaler i fire kategorier – disse må fylles inn før briefen kan regnes som komplett:

| Signal | Metrikk / bevis | Mål | Når målt |
| --- | --- | --- | --- |
| Brukerutfall (f.eks. raskere/tryggere valg av tursted) | *ikke fastsatt* | *ikke fastsatt* | *ikke fastsatt* |
| Adopsjon/atferd (f.eks. bruk av sammenligning/favoritter) | *ikke fastsatt* | *ikke fastsatt* | *ikke fastsatt* |
| Kvalitet/tillit (f.eks. at SnowScore oppleves forståelig og korrekt) | *ikke fastsatt* | *ikke fastsatt* | *ikke fastsatt* |
| Prosjekt/fag (hva som må vise seg for at prosjektet vurderes som vellykket i IBE160) | *ikke fastsatt* | *ikke fastsatt* | *ikke fastsatt* |

## Scope

Grov, foreslått avgrensning basert på hva som er nødvendig for å vise kjerneverdien (sammenlignbar snøvurdering) – **ikke endelig bestemt av gruppen**:

**IN – forslag til første versjon**
1. Interaktivt kart over Norge med søk og valg av lokasjon.
2. Værprognose for valgt sted (temperatur, nedbør, beregnet nysnø, vind, høyde).
3. Forklarbar SnowScore for valgt sted.
4. Rangert oversikt over et avgrenset utvalg steder, innenfor samme prognoseperiode.
5. Detaljvisning for valgt sted med tidspunkt for oppdatering.

**OUT – vurderes ikke nå**
1. E-postinnlogging og lagring av private favorittsteder.
2. Regelbasert værchat.
3. Kjøp/salg eller annen kommersiell funksjonalitet (uttrykkelig utenfor prosjektet).
4. Skredsikkerhetsvurdering eller presentasjon av data som målt (ikke prognostisert) snødybde.

Punkt 1–2 under «OUT» er eksplisitt nevnt som noe som skal avgrenses i beslutningspunktene under, og kan flyttes til v1 dersom gruppen bestemmer det.

## Vision

Dersom SnowFinder lykkes med å gjøre det raskere og enklere å sammenligne snøforhold på tvers av steder, kan løsningen over tid utvides til å dekke flere brukssituasjoner – f.eks. flere prognosevinduer og turtyper, historikk for å vurdere hvor treffsikre prognosene har vært, og et bredere sett med steder. Dette er et grunnlagsforslag, ikke en bekreftet retning, og bør videreutvikles av gruppen når kjerneverdien i første versjon er validert.

## Beslutninger som gjenstår

1. Avgrense funksjonene i første versjon, inkludert innlogging/favoritter og regelbasert værchat (se «Scope»).
2. Fastsette hvordan SnowScore og beregnet nysnø skal beregnes og forklares (se støttenotat).
3. Bestemme endelig prognosevindu slik at alle steder sammenlignes på samme grunnlag.
4. Velge hvilke steder som skal inngå i rangeringen.
5. Bestemme hvordan manglende, gamle eller usikre værdata skal vises.
6. Avklare hvilke funksjoner som eventuelt krever innlogging.
7. Beskrive og teste at en bruker ikke kan lese eller endre en annen brukers favoritter, dersom favoritter tas med.
8. Fylle inn suksesskriterier sammen med gruppen (se «Success Criteria»).
9. Vurdere og eventuelt utvide «What Makes This Different» og «Vision» sammen med gruppen – nåværende tekst er et forslag, ikke en bekreftet posisjon.

## Videre arbeid

Bruk briefen som grunnlag for BMADs analyse- og planleggingsarbeid (PRD, arkitektur). Oppdater dokumentet når gruppen tar beslutninger, slik at videre kravarbeid, design, arkitektur og implementering bygger på samme prosjektbeskrivelse.

---

## Støttenotat: teknisk og funksjonelt underlag (til PRD/arkitektur)

Dette notatet samler det tekniske og funksjonelle underlaget fra det opprinnelige forslaget. Det er ikke en del av selve produktbriefen etter malens struktur, men tas vare på her som grunnlag for videre krav- og arkitekturarbeid.

### Innlogging og database

Supabase er foreslått for brukerkontoer og database. E-postinnlogging skal støtte private favoritter, og tilgangsreglene skal sikre at brukere bare kan lese og endre sine egne favoritter. Det må avklares om innlogging bare skal kreves for favoritter, mens kart og prognoser er tilgjengelige uten innlogging.

### Data inn

| Kilde eller input | Planlagt bruk |
| --- | --- |
| MET Norway | Prognoser for blant annet temperatur, nedbør, værtype og vind. |
| Kartverket | Stedsnavn og koordinater. |
| OpenStreetMap/kartflistjeneste | Kartgrunnlag. Konkret flisleverandør og bruksvilkår må avklares. |
| Brukeren | Søketekst og valgt lokasjon, eventuelt posisjon fra brukerens enhet. |
| Supabase | Innloggings- og favorittdata. |

Tilgjengelighet, konkrete grensesnitt, bruksvilkår og hvilke data som faktisk kan hentes, må undersøkes i utviklingsarbeidet. Kilde til høydeopplysninger og metode for å beregne nysnø må også avklares.

### Data ut

Kart, sammenlignbar værprognose, SnowScore med forklaring, beregnet nysnø, temperatur, vind, høyde og oppdateringstidspunkt. I tillegg foreslås rangering av steder, detaljer for valgt sted, private favoritter og forklaringer fra en enkel regelbasert værchat, dersom disse tas med i omfanget. Manglende eller usikre opplysninger skal fremgå tydelig.

### Forslag til SnowScore

Grafen i den opprinnelige PDF-en viser følgende maksimale poengfordeling:

| Komponent | Maksimalt bidrag |
| --- | ---: |
| Nysnø | 60 poeng |
| Kulde | 25 poeng |
| Snøandel | 15 poeng |
| **Totalt** | **100 poeng** |

Vektene er et designvalg i skolemodellen, ikke en dokumentert standard for snøkvalitet. Beregningsregler, terskler, enheter og håndtering av manglende data må fastsettes og testes mot faktiske værdata og brukerforståelse.

**Kilde og bearbeiding:** «Produktbrief_SnowFinder.pdf», versjon sist endret 09.09.2026. Strukturen er lagt om til emnets produktbrief-mal (`docs/maler/BMAD_Product_Brief_Student_Template.pdf`) i denne versjonen. Ingen av de foreslåtte funksjonene er bekreftet implementert gjennom dette dokumentet.
