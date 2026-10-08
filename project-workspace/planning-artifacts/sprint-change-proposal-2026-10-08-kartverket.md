# Sprint Change Proposal: Kartverket som bakgrunnskart

**Dato:** 2026-10-08 · **Utløst av:** Story 1.7 · **Besluttet av:** Aksel · **Omfang:** Minor

## 1. Problem

FR-12 i PRD-en og produktbriefen sier at kartet bruker «Leaflet/OpenStreetMap». Da Story 1.7 ble bygd, valgte Aksel Kartverkets topografiske kart som bakgrunn: `cache.kartverket.no`, CC BY 4.0, uten nøkkel. Det har høydekurver, som er nyttig for skifolk. Koden og planene beskrev dermed forskjellige ting.

## 2. Konsekvenser

- **Epics og stories:** ingen endring. FR-12 og Story 1.7 nevner ikke hvor kartflisene kommer fra.
- **PRD:** FR-12 må endres.
- **Produktbrief:** kildetabellen og teknologitabellen må endres.
- **Arkitektur:** AD-5 sier at appen ikke kaller OSM eller Kartverket ved kjøring. Det gjelder katalogdata, men teksten må presiseres, fordi bakgrunnskartet hentes fra Kartverket ved kjøring.
- **UX:** ingen endring. DESIGN.md snakker om «bakgrunnskart-tiles» uten å nevne kilden.
- **Teknisk:** ingen endring, siden koden allerede bruker Kartverket. Ingen nøkkel, konto eller ny avhengighet.

## 3. Anbefalt vei

Direkte justering av dokumentene. Det tar minutter og har ingen risiko. Ingen kode og ingen stories endres.

## 4. Endringer (begge kopier av hvert dokument)

**PRD, FR-12**
- Før: «Systemet viser et kart over Norge (Leaflet/OpenStreetMap) der …»
- Etter: «Systemet viser et kart over Norge (Leaflet med Kartverkets topografiske bakgrunnskart, uten nøkkel) der …», pluss en v4-merknad om endringen.

**Produktbrief, kildetabellen**
- Før: «Kartverket | Stedsnavn, koordinater og høyde» og «OpenStreetMap | Skianlegg og kartgrunnlag»
- Etter: «Kartverket | Stedsnavn, koordinater og høyde, og topografisk bakgrunnskart» og «OpenStreetMap | Skianlegg (stedskatalogen)»

**Produktbrief, teknologitabellen**
- Før: «Kart | Leaflet og OpenStreetMap»
- Etter: «Kart | Leaflet med Kartverkets topografiske kart (endret fra OpenStreetMap 2026-10-08)»

**Arkitektur, AD-5 (Prevents)**
- Før: «the app or the data program calling OSM or Kartverket at run time»
- Etter: «… calling OSM or Kartverket for catalog data at run time (the app's only run-time map call is Kartverket's topo background tiles, decided 2026-10-08)»

## 5. Overlevering

Endringen er Minor og er gjort direkte på grenen `docs/kartverket-bakgrunnskart`. Den er ferdig når begge kopiene av hvert dokument er like og ingen planleggingsdokument nevner OpenStreetMap som bakgrunnskart.
