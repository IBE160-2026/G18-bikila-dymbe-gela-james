# 2026-11-02: UX-forbedring, plan og steg 1 destinasjonskort (Story 1.8b)

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5) i VS Code, `bmad-ux` (Sally, oppdatering) og `bmad-build` (Amelia, oneshot) med gjennomgang
**Fase:** Gjennomføring
**Resultat:** Prioritert plan i sju steg for UX-forbedringen, der steg 1–5 er valgt. Steg 1 er bygget: resultatlisten som destinasjonskort.

## Prompter

### 1
> gi meg link til siden så kan jeg se endringene

**Svar (kort):** Lenken til forhåndsvisningen av PR #82, som krever innlogging på Vercel.

### 2
> gjør noen endringer:

Innlimt bestilling, ordrett:

> Gjennomfør en profesjonell UX/UI-forbedring av SnowFinder.
>
> **Mål:** Hev brukeropplevelsen og det visuelle designet fra dagens nivå til et moderne, intuitivt produkt.
>
> Prioriter følgende:
>
> 1. **Kart:** Innfør markørgruppering ved lav zoom og tydeligere SnowScore-farger. Bevar Leaflet og eksisterende kartfunksjonalitet.
> 2. **Resultatliste:** Lag kompakte, responsive destinasjonskort med tydelig SnowScore, nysnø, vind og temperatur. Gjør det enkelt å sammenligne destinasjoner.
> 3. **Filter:** Organiser filtrene bedre, vis aktive filterverdier og reduser tekstmengden. Behold eksisterende filterlogikk.
> 4. **Vind:** Vis tydelige advarsler ved kraftig vind, men endre ikke SnowScore-formelen uten særskilt godkjenning.
> 5. **SnowScore-dokumentasjon:** Lag en visuelt bedre oversikt med poengfordeling og utvidbare forklaringer. Behold formler, regneeksempler, datakilder og endringslogg.
> 6. **Mobil:** Sørg for at kart, filtre, lister og detaljer fungerer godt på små skjermer.
> 7. **Kvalitet:** Kontroller kontrast, tilgjengelighet, lastetilstander, feilmeldinger og datakildehenvisninger.
>
> **Viktige begrensninger:**
> - Ikke endre SnowScore-beregningene, datakilder, API-kontrakter eller datastrukturer.
> - Ikke fjern eksisterende funksjonalitet.
> - Ikke innfør nye betalte tjenester.
> - Bruk eksisterende teknologistakk og designkomponenter der det er praktisk.
> - Kjør relevante tester og byggkontroller.
> - Lag en oversikt over endringene før de merges til main.
> - Bevar kildehenvisninger og nødvendige sikkerhetsopplysninger.
>
> Start med å undersøke prosjektstrukturen, eksisterende komponenter og tester. Lag en prioritert implementeringsplan før du gjennomfører endringene.

**Svar (kort):** Claude undersøkte koden og la fram en plan i sju steg.
- Markørgruppering opphever beslutningen «Ingen klynging» fra 8. oktober og krever en ny avhengighet.
- Vindvarsel er en ny funksjon.
- Begge krever derfor en kravendring.

### 3 (valg)
> Spørsmål: Hvilke steg? Svar: «1–5 (Recommended)». Vindgrense: «Ikke aktuelt». Levering: «Én PR per steg (Recommended)».

**Hva vi gjorde med det:** Vindvarsel og markørgruppering er ikke tatt med. Steg 1 ble planlagt i detalj.

### 4 (valg)
> Spørsmål: Godkjenner du planen for steg 1? Svar: «Godkjenn og bygg (Recommended)»

**Svar (kort):** Sally oppdaterte «Listerad» i DESIGN.md og EXPERIENCE.md. Amelia bygde kortene med tester.

### 5
> En ekstra anbefaling: Be Claude om ikke å pushe eller merge til main uten godkjenning. Ettersom Vercel automatisk publiserer fra main, vil dette redusere risikoen for at uferdige endringer havner på SnowFinder-nettsiden.

**Svar (kort):** Claude lagret dette som en fast regel i minnet sitt: ingen push eller merge til `main` uten Aksels godkjenning av akkurat den handlingen.
