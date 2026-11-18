# 2026-11-18: gjennomgang av nettsiden og utsatt kodefrys

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-party-mode` med Sally, John, Mary, Winston og Amelia
**Fase:** Gjennomføring
**Resultat:** En liste over forbedringer av nettsiden, sortert etter hva som rekkes. Kodefrysen er
flyttet til 2026-11-28, leveringen til 2026-12-02, og sluttrapporten skrives etter leveringen.
Endret i milepælene, fremdriftsplanen og aktivitetsdiagrammet.

## Prompter

### 1
> hei

**Svar (kort):** Hilsen.

### 2
> gi meg en status

**Svar (kort):** Alle v1-stories er ferdige, og M1 er nådd. Brukertesten (17.–19. november) har
ingen resultater ennå. Sluttrapporten er ikke startet, og fremdriftsplanen ble sist oppdatert
15. november.
**Hva vi gjorde med det:** brukt.

### 3
> gi meg tilbakemeldinger fra bård på prd

**Svar (kort):** Et sammendrag av faglærers tilbakemelding fra 2026-11-12 (`tilbakemelding-prd.md`),
og hvordan hvert punkt ble rettet i PR #99 og #100. De to refleksjonsspørsmålene er ikke besvart
ennå. De kan tas i sluttrapporten.
**Hva vi gjorde med det:** brukt.

### 4
> kan du agentene til å gi meg en oversikt over hva som kan forbedres med nettsiden slik at den ser
> profesjonell ut. ønsker at dette skal være en svært brukervennlig side som mange personer ønsker å
> benytte seg av daglig. https://snowfinder-seven.vercel.app/

**Svar (kort):** Claude tok skjermbilder av den publiserte siden med Playwright, på PC og iPhone.
Agentene fant flere problemer:
- Forsiden svarer ikke på «hvor er det best i dag?».
- Kartet mangler tegnforklaring.
- Tidspunktet for siste oppdatering vises bare på stedssiden.
- Lange stedsnavn brytes midt i ordet.
- Søkefeltet har ingen plassholder.
- Tallene har for mange desimaler, og nysnø vises i både cm og mm.
- SnowScore «0 · Lite» står ved siden av et skivindu på fredag, uten forklaring.

John sorterte forslagene etter kodefrysen. Rettingene kan tas nå. «Best akkurat nå» må gå via
`bmad-correct-course`. Favoritter, «nær meg», minikart og PWA er v2.
**Hva vi gjorde med det:** brukt som grunnlag for rettingene. Sallys ønske om favoritter i v1 ble avvist på grunn av fristen.

### 5
> kondefrysen utsettes med 1 uke

**Svar (kort):** Claude påpekte at 28. november kommer etter leveringen 25. november, og spurte hva som
gjelder. Aksel svarte at leveringen også flyttes, og at omfanget er rettinger pluss «Best akkurat nå».
**Hva vi gjorde med det:** brukt.

### 6
> 2. desember levering. deretter skriver vi sluttrapport

**Svar (kort):** Milepælene, fremdriftsplanen (med tidslinjen) og aktivitetsdiagrammet er oppdatert.
Ny rekkefølge: kodefrys 28.11, generalprøve 1.12, levering 2.12, deretter sluttrapport. Datoene står
som forslag fra Aksel, fordi gruppa og faglærer må bekrefte dem.
**Hva vi gjorde med det:** brukt.
