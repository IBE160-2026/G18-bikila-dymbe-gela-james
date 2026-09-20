# Produktbrief: SnowFinder

**Emne:** IBE160 – Programmering med KI  
**Gruppe:** G18  
**Status:** Arbeidsutkast basert på «Produktbrief_SnowFinder.pdf» fra 09.09.2026. Markdown-versjonen er språklig bearbeidet og strukturert for videre arbeid i prosjektets repository. Den dokumenterer ikke godkjenning fra gruppen eller faglærer. Innhold og struktur må kontrolleres mot emnets produktbrief-mal.

## 1. Prosjektidé og målgruppe

SnowFinder er en webapplikasjon som hjelper skientusiaster med å finne og sammenligne norske steder der værprognosen viser gode muligheter for snø.

Brukeren søker etter et sted eller velger en lokasjon direkte i et interaktivt kart. Appen samler temperatur, nedbør, beregnet nysnø, vind og høyde i én oversikt. En forklarbar SnowScore fra 0 til 100 gjør det mulig å sammenligne steder innenfor samme prognoseperiode.

Løsningen viser **prognostisert snøpotensial**. Den skal ikke presentere dette som målt snødybde, faktiske løypeforhold eller en vurdering av skredsikkerhet.

## 2. Foreslåtte funksjoner

- Interaktivt kart over Norge med søk etter sted og valg av lokasjon i kartet.
- Værprognose for valgt sted med temperatur, nedbør, beregnet nysnø, vind og høyde.
- SnowScore med en forståelig forklaring av beregningen.
- Rangert oversikt over et avgrenset utvalg steder.
- Detaljvisning for valgt sted og tidspunkt for oppdatering.
- E-postinnlogging og lagring av private favorittsteder.
- Enkel, regelbasert værchat som forklarer værdataene.

Briefen foreslår en sammenligningsperiode på **24 timer**. Endelig prognosevindu og omfanget av første versjon skal avklares før implementeringen låses.

## 3. Innlogging og database

Supabase er foreslått for brukerkontoer og database. E-postinnlogging skal støtte private favoritter, og tilgangsreglene skal sikre at brukere bare kan lese og endre sine egne favoritter.

Det må avklares om innlogging bare skal kreves for favoritter, mens kart og prognoser er tilgjengelige uten innlogging. Prosjektet omfatter ikke kjøp eller salg over nettet.

## 4. Data inn

| Kilde eller input | Planlagt bruk |
| --- | --- |
| MET Norway | Prognoser for blant annet temperatur, nedbør, værtype og vind. |
| Kartverket | Stedsnavn og koordinater. |
| OpenStreetMap/kartflistjeneste | Kartgrunnlag. Konkret flisleverandør og bruksvilkår må avklares. |
| Brukeren | Søketekst og valgt lokasjon, eventuelt posisjon fra brukerens enhet. |
| Supabase | Innloggings- og favorittdata. |

Dette er planlagte datakilder fra prosjektforslaget. Tilgjengelighet, konkrete grensesnitt, bruksvilkår og hvilke data som faktisk kan hentes, må undersøkes i utviklingsarbeidet. Kilde til høydeopplysninger og metode for å beregne nysnø må også avklares.

## 5. Data ut

Appen skal etter forslaget vise et interaktivt kart, en sammenlignbar værprognose, SnowScore med forklaring, beregnet nysnø, temperatur, vind, høyde og oppdateringstidspunkt.

I tillegg foreslås rangering av steder, detaljer for valgt sted, private favoritter og forklaringer fra en enkel regelbasert værchat. Manglende eller usikre opplysninger skal fremgå tydelig.

## 6. Forslag til SnowScore

Grafen i den opprinnelige PDF-en viser følgende maksimale poengfordeling:

| Komponent | Maksimalt bidrag |
| --- | ---: |
| Nysnø | 60 poeng |
| Kulde | 25 poeng |
| Snøandel | 15 poeng |
| **Totalt** | **100 poeng** |

Vektene er et designvalg i skolemodellen. De er ikke en dokumentert standard for snøkvalitet. Beregningsregler, terskler, enheter og håndtering av manglende data må fastsettes og testes mot faktiske værdata og brukerforståelse.

## 7. Beslutninger som gjenstår

1. Avgrense funksjonene i første versjon, inkludert rangering og regelbasert værchat.
2. Fastsette hvordan SnowScore og beregnet nysnø skal beregnes og forklares.
3. Bestemme endelig prognosevindu slik at alle steder sammenlignes på samme grunnlag.
4. Velge hvilke steder som skal inngå i rangeringen.
5. Bestemme hvordan manglende, gamle eller usikre værdata skal vises.
6. Avklare hvilke funksjoner som krever innlogging.
7. Beskrive og teste at en bruker ikke kan lese eller endre en annen brukers favoritter.
8. Kontrollere briefen mot emnets mal og avklare prosjektvalgene i gruppen.

## 8. Videre arbeid

Bruk briefen som grunnlag for BMADs analyse- og planleggingsarbeid. Oppdater dokumentet når gruppen tar beslutninger, slik at videre kravarbeid, design, arkitektur og implementering bygger på samme prosjektbeskrivelse.

**Kilde og bearbeiding:** «Produktbrief_SnowFinder.pdf», versjon sist endret 09.09.2026. Gruppemerking, status, tabellstruktur og presiseringer om avklaringer er lagt til i denne Markdown-versjonen. Ingen av de foreslåtte funksjonene er bekreftet implementert gjennom dette dokumentet.
